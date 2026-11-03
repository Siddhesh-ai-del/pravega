import { auditLog } from "@/db/schema";

type AuditInput = {
  tenantId: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  detail?: Record<string, unknown>;
};

/**
 * Append-only audit write. Every demo-path action goes through this.
 * (Append-only is enforced at the schema level by never exposing
 * update/delete paths for audit_log anywhere in the app code.)
 */
export async function recordAudit(input: AuditInput) {
  const { db } = await import("@/db");
  await db.insert(auditLog).values({
    tenantId: input.tenantId,
    actorId: input.actorId,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    detail: input.detail ?? {},
    createdAt: new Date(),
  });
}
