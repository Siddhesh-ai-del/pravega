"use server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

export async function toggleConsent(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "student") return;
  const key = String(formData.get("key") ?? "");
  const granted = String(formData.get("granted") ?? "true") === "true";

  const [profile] = await db.select().from(schema.studentProfiles).where(eq(schema.studentProfiles.userId, session.userId));
  if (!profile) return;
  const consents = { ...(profile.consents as Record<string, unknown>), [key]: granted, updatedAt: new Date().toISOString() };
  await db.update(schema.studentProfiles).set({ consents }).where(eq(schema.studentProfiles.userId, session.userId));
  await recordAudit({
    tenantId: session.tenantId,
    actorId: session.userId,
    action: granted ? "consent.granted" : "consent.revoked",
    targetType: "consent",
    targetId: key,
    detail: { scope: "recruiter_read" },
  });
  revalidatePath("/student/consent");
}

export async function sendMailNow(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "officer") return;
  const mailId = Number(formData.get("mailId") ?? 0);
  await db.update(schema.mailQueue).set({ status: "sent" }).where(eq(schema.mailQueue.id, mailId));
  await recordAudit({
    tenantId: session.tenantId,
    actorId: session.userId,
    action: "mail.queued_sent",
    targetType: "mail",
    targetId: String(mailId),
    detail: { note: "demo — no real email was dispatched" },
  });
  revalidatePath("/officer/mail");
}
