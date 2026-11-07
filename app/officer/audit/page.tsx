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
      <header className="construction-line" style={{ padding: "20px 24px" }}>
        <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "4px" }}>APPEND-ONLY</p>
        <h1 className="display-md" style={{ marginBottom: "4px" }}>THE TRAIL NEVER LIES</h1>
        <p className="body-sm" style={{ color: "var(--muted-text)", maxWidth: "62ch" }}>
          Every action on this platform writes one row here — verifications, eligibility decisions, agent approvals, overrides and appeals. There is no update path, and no delete tool exists in the app.
        </p>
      </header>
      <div style={{ overflowX: "auto" }}>
        <table className="brutal-table">
          <thead>
            <tr>
              <th>#</th><th>TIME</th><th>ACTION</th><th>ACTOR</th><th>TARGET</th><th>DETAIL</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="case-number" style={{ color: "var(--muted-text)" }}>{r.id}</td>
                <td className="mono" style={{ fontSize: "10px", whiteSpace: "nowrap" }}>{new Date(r.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" })}</td>
                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", fontWeight: 700 }}>{r.action}</td>
                <td style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>{nameOf[r.actorId] ?? r.actorId}</td>
                <td className="case-number" style={{ color: "var(--muted-text)" }}>{r.targetType}:{r.targetId}</td>
                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--muted-text)", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{JSON.stringify(r.detail)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
