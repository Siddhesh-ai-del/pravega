import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { sendMailNow } from "@/lib/actions/consent";

export default async function MailQueuePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "officer") redirect("/student");

  const mails = await db.select().from(schema.mailQueue).where(eq(schema.mailQueue.tenantId, session.tenantId)).orderBy(desc(schema.mailQueue.createdAt));

  return (
    <AppShell session={session}>
      <header className="construction-line" style={{ padding: "20px 24px" }}>
        <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "4px" }}>BULK MAILING · LOGGED, NOT BLASTED</p>
        <h1 className="display-md" style={{ marginBottom: "4px" }}>DRAFTS, PREVIEWS, AUDIT</h1>
        <p className="body-sm" style={{ color: "var(--muted-text)" }}>Mail never leaves without an explicit send. Every queued and sent mail is written to the audit trail.</p>
      </header>
      <div style={{ padding: "16px 24px", maxWidth: "880px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {mails.map((m) => (
          <div key={m.id} className="brutal-card" style={{ padding: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: "8px", borderBottom: "2px solid var(--border)", marginBottom: "8px" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase" }}>TO: {m.toEmail}</p>
              <span className="brutal-chip" style={{ background: m.status === "sent" ? "var(--primary)" : "var(--muted)", color: m.status === "sent" ? "var(--primary-foreground)" : "var(--ink)" }}>
                {m.status.toUpperCase()}
              </span>
            </div>
            <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "4px" }}>TEMPLATE: {m.template}</p>
            <pre style={{ background: "var(--concrete-dark)", padding: "8px", fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", overflow: "auto", border: "2px solid var(--border)" }}>{JSON.stringify(m.detail, null, 2)}</pre>
            {m.status === "queued" && (
              <form action={sendMailNow} style={{ marginTop: "8px" }}>
                <input type="hidden" name="mailId" value={m.id} />
                <button type="submit" className="btn-brutal-outline" style={{ fontSize: "10px", padding: "6px 12px" }}>SEND (DEMO — LOGGED, NOT DISPATCHED)</button>
              </form>
            )}
          </div>
        ))}
        {mails.length === 0 && <p className="body-md" style={{ color: "var(--muted-text)" }}>Mail queue is empty.</p>}
      </div>
    </AppShell>
  );
}
