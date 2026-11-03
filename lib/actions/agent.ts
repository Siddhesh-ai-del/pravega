"use server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

export async function decideAgentAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "officer") return;

  const agentRunId = String(formData.get("agentRunId") ?? "");
  const decision = String(formData.get("decision") ?? ""); // approve | override | defer
  const reason = String(formData.get("reason") ?? "").trim();

  if (!agentRunId || !["approve", "override", "defer"].includes(decision)) return;
  if (decision === "override" && reason.length < 8) {
    // reason is mandatory and meaningful on an override — this is the governance promise
    return;
  }

  const [run] = await db.select().from(schema.agentRuns).where(eq(schema.agentRuns.id, agentRunId));
  if (!run || run.status !== "pending") return;

  const status = decision === "approve" ? "approved" : decision === "override" ? "overridden" : "deferred";
  await db
    .update(schema.agentRuns)
    .set({ status, decidedBy: session.userId, decidedReason: reason || null, decidedAt: new Date() })
    .where(eq(schema.agentRuns.id, agentRunId));

  await recordAudit({
    tenantId: session.tenantId,
    actorId: session.userId,
    action: `agent.${status}`,
    targetType: "agent_run",
    targetId: agentRunId,
    detail: { kind: run.kind, subject: run.subject, reason: reason || null },
  });

  revalidatePath("/officer");
}
