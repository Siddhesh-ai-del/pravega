import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { runEligibilitySweep } from "@/lib/actions/eligibility";
import type { Clause } from "@/lib/eligibility";

export default async function OfficerRulesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "officer") redirect("/student");

  const rules = await db.select().from(schema.eligibilityRules).where(eq(schema.eligibilityRules.tenantId, session.tenantId));
  const students = await db.select().from(schema.studentProfiles);
  const usersList = await db.select().from(schema.users).where(eq(schema.users.role, "student"));
  const nameOf = Object.fromEntries(usersList.map((u) => [u.id, u.name]));
  const decisions = await db.select().from(schema.eligibilityDecisions).orderBy(desc(schema.eligibilityDecisions.createdAt));
  const latest = new Map<string, (typeof decisions)[number]>();
  for (const d of decisions) if (!latest.has(d.studentId)) latest.set(d.studentId, d);

  return (
    <AppShell session={session}>
      <header className="border-b border-line px-4 md:px-8 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Versioned eligibility</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Rules are code, not sheets</h1>
        <p className="mt-1 text-[13px] text-muted max-w-[72ch]">
          Every decision records the exact rule <b>version</b> and failed clauses. If a policy
          changes, the rule increments its version — old decisions stay explainable forever.
        </p>
      </header>

      <div className="grid lg:grid-cols-[420px_1fr]">
        <aside className="border-b lg:border-b-0 lg:border-r border-line p-4 md:p-6">
          {rules.map((rule) => (
            <div key={rule.id} className="border border-line bg-panel">
              <div className="flex items-center justify-between border-b border-line px-3 py-2">
                <div>
                  <h2 className="font-semibold text-[14px]">{rule.name}</h2>
                  <p className="font-mono text-[10px] text-muted">{rule.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] px-2 py-0.5 border border-probe/40 text-probe">v{rule.version}</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 border border-ledger/40 text-ledger bg-green-wash">ACTIVE</span>
                </div>
              </div>
              <table className="w-full text-[12px]">
                <thead className="font-mono text-[10px] uppercase text-muted">
                  <tr className="text-left"><th className="px-3 py-1.5">Clause</th><th className="px-3 py-1.5">Check</th></tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {(rule.clauses as unknown as Clause[]).map((c) => (
                    <tr key={c.id}>
                      <td className="px-3 py-2 font-mono text-[11px] text-muted">{c.id}</td>
                      <td className="px-3 py-2">{c.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          <p className="mt-3 font-mono text-[10px] text-muted">
            Clause grammar is deliberately dumb — no eval(), no hidden DSLs.
            NAAC reports will cite rule versions, not recollections.
          </p>
        </aside>

        {/* cohort sweep */}
        <section className="p-4 md:p-6">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Cohort sweep — rule v3</h2>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[640px] text-[13px]">
              <thead className="font-mono text-[10px] uppercase text-muted text-left">
                <tr className="border-b border-line">
                  <th className="py-1.5">Student</th><th className="py-1.5">Branch</th><th className="py-1.5">CGPA</th><th className="py-1.5">Backlogs</th><th className="py-1.5">Latest v3 decision</th><th />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {students.map((p) => {
                  const d = latest.get(p.userId);
                  return (
                    <tr key={p.userId} className="ledger-row align-middle">
                      <td className="py-2.5 font-medium">{nameOf[p.userId] ?? p.userId}</td>
                      <td className="py-2.5">{p.branch === "Computer Engineering" ? "CSE" : p.branch}</td>
                      <td className="py-2.5 font-mono">{p.cgpa}</td>
                      <td className="py-2.5 font-mono">{p.activeBacklogs}</td>
                      <td className="py-2.5">
                        {d ? (
                          d.passed
                            ? <span className="font-mono text-[11px] uppercase text-ledger border border-ledger/40 bg-green-wash px-2 py-0.5">Pass</span>
                            : <span className="font-mono text-[11px] uppercase text-red border border-red/40 bg-red-wash px-2 py-0.5">Blocked · {(d.failedClauses as { id: string }[]).map((c) => c.id).join(",")}</span>
                        ) : <span className="text-muted">—</span>}
                      </td>
                      <td className="py-2.5 text-right">
                        <form action={runEligibilitySweep}>
                          <input type="hidden" name="studentId" value={p.userId} />
                          <input type="hidden" name="ruleId" value="rule-nimbus-be" />
                          <button type="submit" className="font-mono text-[10px] uppercase border border-line px-2 py-1 hover:border-probe hover:text-probe">
                            Run check
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[12px] text-muted">
            Every check writes an <b>append-only audit row</b> (actor, rule id + version, failed clause ids).
          </p>
        </section>
      </div>
    </AppShell>
  );
}
