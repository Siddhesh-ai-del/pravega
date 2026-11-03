"use server";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

export async function recordFairnessReview(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "officer") return;
  const reportId = String(formData.get("reportId") ?? "");
  const outcome = String(formData.get("outcome") ?? "needs-discussion");
  await recordAudit({
    tenantId: session.tenantId,
    actorId: session.userId,
    action: "fairness.review_recorded",
    targetType: "fairness_report",
    targetId: reportId,
    detail: { outcome },
  });
  revalidatePath("/officer/fairness");
}
