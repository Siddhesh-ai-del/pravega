import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";

export default async function AuditTrailPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "officer") redirect("/student");

  const rows = await db.select().from(schema.auditLog).where(eq(schema.auditLog.tenantId, session.tenantId)).orderBy(desc(schema.auditLog.id)).limit(60);
  const usersList = await db.select().from(schema.users);
  const nameOf = Object.fromEntries(usersList.map((u) => [u.id, u.name]));

  return (
    <AppShell session={session}>
      <header className="border-b border-line px-4 md:px-8 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Append-only</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">The trail never lies</h1>
        <p className="mt-1 text-[13px] text-muted max-w-[62ch]">Every action on this platform writes one row here — verifications, eligibility decisions, agent approvals, overrides and appeals. There is no update path, and no delete tool exists in the app.</p>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-[12px]">
          <thead className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted text-left">
            <tr className="border-b border-line">
              <th className="px-4 md:px-8 py-2">#</th><th className="px-4 py-2">Time</th><th className="px-4 py-2">Action</th><th className="px-4 py-2">Actor</th><th className="px-4 py-2">Target</th><th className="px-4 py-2">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id} className="ledger-row align-top">
                <td className="px-4 md:px-8 py-2 font-mono text-muted">{r.id}</td>
                <td className="px-4 py-2 font-mono whitespace-nowrap">{new Date(r.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" })}</td>
                <td className="px-4 py-2 font-mono">{r.action}</td>
                <td className="px-4 py-2">{nameOf[r.actorId] ?? r.actorId}</td>
                <td className="px-4 py-2 font-mono">{r.targetType}:{r.targetId}</td>
                <td className="px-4 py-2 font-mono text-[10px] text-[#2e3138] max-w-[420px]"><span className="line-clamp-2">{JSON.stringify(r.detail)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
