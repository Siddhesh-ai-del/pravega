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
      <header className="border-b border-line px-4 md:px-8 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Bulk mailing · logged, not blasted</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Drafts, previews, audit</h1>
        <p className="mt-1 text-[13px] text-muted">Mail never leaves without an explicit send. Every queued and sent mail is written to the audit trail.</p>
      </header>
      <div className="p-4 md:p-6 max-w-[880px] grid gap-4">
        {mails.map((m) => (
          <article key={m.id} className="border border-line bg-panel p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-2">
              <p className="font-semibold">To: {m.toEmail}</p>
              <span className={`font-mono text-[10px] uppercase px-2 py-0.5 border ${m.status === "sent" ? "text-ledger border-ledger/40 bg-green-wash" : "text-amber border-amber/40 bg-amber-wash"}`}>{m.status}</span>
            </div>
            <p className="mt-2 font-mono text-[10px] uppercase text-muted">template: {m.template}</p>
            <pre className="mt-1 overflow-x-auto bg-panel-2 p-2 text-[11px]">{JSON.stringify(m.detail, null, 2)}</pre>
            {m.status === "queued" && (
              <form action={sendMailNow} className="mt-2">
                <input type="hidden" name="mailId" value={m.id} />
                <button type="submit" className="border border-probe text-probe px-3 py-1.5 text-[12px] font-medium hover:bg-panel-2">Send (demo — logged, not dispatched)</button>
              </form>
            )}
          </article>
        ))}
        {mails.length === 0 && <p className="text-muted">Mail queue is empty.</p>}
      </div>
    </AppShell>
  );
}
