"use server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { evaluateEligibility, cgpaToPercent, type Clause } from "@/lib/eligibility";

export async function runEligibilitySweep(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "officer") return;

  const studentId = String(formData.get("studentId") ?? "");
  const ruleId = String(formData.get("ruleId") ?? "");

  const [rule] = await db.select().from(schema.eligibilityRules).where(eq(schema.eligibilityRules.id, ruleId));
  const [profile] = await db.select().from(schema.studentProfiles).where(eq(schema.studentProfiles.userId, studentId));
  if (!rule || !profile) return;

  const skills = await db
    .select({ skillId: schema.studentSkills.skillId, state: schema.studentSkills.state })
    .from(schema.studentSkills)
    .where(eq(schema.studentSkills.userId, studentId));
  const skillsMap = Object.fromEntries(skills.map((s) => [s.skillId, s.state]));

  const result = evaluateEligibility(rule.version, rule.clauses as unknown as Clause[], {
    cgpaPercent: cgpaToPercent(profile.cgpa),
    activeBacklogs: profile.activeBacklogs,
    skills: skillsMap,
  });

  const decisionId = `dec-${randomUUID().slice(0, 8)}`;
  await db.insert(schema.eligibilityDecisions).values({
    id: decisionId,
    tenantId: session.tenantId,
    studentId,
    ruleId: rule.id,
    ruleVersion: rule.version,
    passed: result.passed,
    failedClauses: result.failedClauses.map((c) => ({ id: c.id, label: c.label })),
    createdAt: new Date(),
  });

  await recordAudit({
    tenantId: session.tenantId,
    actorId: session.userId,
    action: result.passed ? "eligibility.passed" : "eligibility.blocked",
    targetType: "student",
    targetId: studentId,
    detail: { rule: rule.id, ruleVersion: rule.version, decisionId, failed: result.failedClauses.map((c) => c.id) },
  });

  revalidatePath("/officer/rules");
}

export async function recordAppeal(formData: FormData) {
  const session = await getSession();
  if (!session) return;
  const driveId = String(formData.get("driveId") ?? "");
  const reason = String(formData.get("reason") ?? "eligibility review");
  await recordAudit({
    tenantId: session.tenantId,
    actorId: session.userId,
    action: "eligibility.appeal",
    targetType: "drive",
    targetId: driveId,
    detail: { reason, studentId: session.userId },
  });
  revalidatePath("/student/drives");
}
