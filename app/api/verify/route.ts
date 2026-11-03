import { z } from "zod";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { recordAudit } from "@/lib/audit";
import { getSession } from "@/lib/auth";
import { analyzeRepo } from "@/lib/analyzer";

export const runtime = "nodejs";

const BodySchema = z.object({
  repoUri: z.string().trim().min(9).max(200),
  skillId: z.enum(["py", "sql", "react", "docker", "git", "node"]).default("py"),
});

// naive per-user rate limiter for the verify endpoint (demo GitHub API calls)
const buckets = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 10;
const WINDOW_MS = 60_000;

function rateLimit(userId: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(userId);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (bucket.count >= LIMIT) return false;
  bucket.count += 1;
  return true;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return Response.json({ error: "Sign in as a student" }, { status: 401 });
  }
  if (!rateLimit(session.userId)) {
    return Response.json({ error: "Verification rate limit reached — try again in a minute." }, { status: 429 });
  }
  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "repoUri must be a github.com URL (9–200 chars); skillId must be a known skill." }, { status: 400 });
  }
  const { repoUri, skillId } = parsed.data;

  const findings = await analyzeRepo(repoUri, skillId);

  if (findings.verdict === "verified") {
    const now = new Date();
    const expires = new Date(now.getTime() + 365 * 86_400_000);
    const mine = await db
      .select()
      .from(schema.studentSkills)
      .where(eq(schema.studentSkills.userId, session.userId));
    const row = mine.find((r) => r.skillId === skillId);
    if (row) {
      await db
        .update(schema.studentSkills)
        .set({ state: "verified", confidence: 85, verifiedAt: now, expiresAt: expires })
        .where(eq(schema.studentSkills.id, row.id));
    } else {
      await db.insert(schema.studentSkills).values({
        tenantId: session.tenantId,
        userId: session.userId,
        skillId,
        state: "verified",
        confidence: 85,
        claimedAt: now,
        verifiedAt: now,
        expiresAt: expires,
      });
    }

    const evidenceId = `ev-${randomUUID().slice(0, 8)}`;
    await db.insert(schema.evidence).values({
      id: evidenceId,
      tenantId: session.tenantId,
      userId: session.userId,
      skillId,
      kind: "github_repo",
      title: `${findings.repoName} (verified ${new Date().toLocaleDateString("en-IN")})`,
      uri: findings.repoUri,
      refs: {
        languageShare: findings.languageShare,
        commitsLastYear: findings.commitsLastYear,
        lastCommitDays: findings.lastCommitDays,
        mode: findings.mode,
      },
      createdAt: now,
      validUntil: expires,
    });

    await db.insert(schema.repoAnalyses).values({
      id: `ra-${randomUUID().slice(0, 8)}`,
      userId: session.userId,
      skillId,
      repoUri: findings.repoUri,
      findings: {
        languageShare: findings.languageShare,
        commitsLastYear: findings.commitsLastYear,
        lastCommitDays: findings.lastCommitDays,
        reasons: findings.reasons,
      },
      verdict: "verified",
      mode: findings.mode,
      createdAt: now,
    });

    await recordAudit({
      tenantId: session.tenantId,
      actorId: session.userId,
      action: "skill.verified",
      targetType: "skill",
      targetId: skillId,
      detail: { evidenceId, repo: findings.repoName, mode: findings.mode },
    });

    return Response.json({ findings, evidenceId });
  }

  await recordAudit({
    tenantId: session.tenantId,
    actorId: session.userId,
    action: "skill.verification_rejected",
    targetType: "skill",
    targetId: skillId,
    detail: { repo: findings.repoName, reasons: findings.reasons, mode: findings.mode },
  });

  return Response.json({ findings });
}
