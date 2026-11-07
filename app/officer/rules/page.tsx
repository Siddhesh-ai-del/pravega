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
      <header className="construction-line" style={{ padding: "20px 24px" }}>
        <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "4px" }}>VERSIONED ELIGIBILITY</p>
        <h1 className="display-md" style={{ marginBottom: "4px" }}>RULES ARE CODE, NOT SHEETS</h1>
        <p className="body-sm" style={{ color: "var(--muted-text)", maxWidth: "72ch" }}>
          Every decision records the exact rule version and failed clauses. If a policy changes, the rule increments its version — old decisions stay explainable forever.
        </p>
      </header>
      <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 0 }}>
        <aside style={{ borderRight: "4px solid var(--border)", padding: "16px", background: "var(--concrete-dark)" }}>
          {rules.map((rule) => (
            <div key={rule.id} className="brutal-card" style={{ padding: "0", marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "3px solid var(--border)", background: "var(--secondary)", color: "var(--secondary-foreground)" }}>
                <div>
                  <h2 className="display-sm" style={{ fontSize: "14px", color: "var(--concrete)" }}>{rule.name}</h2>
                  <p className="case-number" style={{ color: "var(--concrete-dark)" }}>{rule.id}</p>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <span className="brutal-chip" style={{ background: "var(--concrete)", color: "var(--ink)" }}>V{rule.version}</span>
                  <span className="brutal-chip">ACTIVE</span>
                </div>
              </div>
              <table className="brutal-table">
                <thead><tr><th>CLAUSE</th><th>CHECK</th></tr></thead>
                <tbody>
                  {(rule.clauses as unknown as Clause[]).map((c) => (
                    <tr key={c.id}>
                      <td className="case-number" style={{ color: "var(--muted-text)" }}>{c.id}</td>
                      <td style={{ fontSize: "11px", fontWeight: 600 }}>{c.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          <p className="case-number" style={{ color: "var(--muted-text)" }}>CLAUSE GRAMMAR IS DELIBERATELY DUMB — NO EVAL(), NO HIDDEN DSLS. NAAC REPORTS WILL CITE RULE VERSIONS, NOT RECOLLECTIONS.</p>
        </aside>
        <section style={{ padding: "16px 24px" }}>
          <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "8px" }}>COHORT SWEEP — RULE V3</p>
          <div className="brutal-card" style={{ padding: "0", overflow: "auto" }}>
            <table className="brutal-table">
              <thead>
                <tr>
                  <th>STUDENT</th><th>BRANCH</th><th>CGPA</th><th>BACKLOGS</th><th>LATEST V3 DECISION</th><th></th>
                </tr>
              </thead>
              <tbody>
                {students.map((p) => {
                  const d = latest.get(p.userId);
                  return (
                    <tr key={p.userId}>
                      <td style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "11px" }}>{nameOf[p.userId] ?? p.userId}</td>
                      <td style={{ fontSize: "11px" }}>{p.branch === "Computer Engineering" ? "CSE" : p.branch}</td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{p.cgpa}</td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, textAlign: "center" }}>{p.activeBacklogs}</td>
                      <td>
                        {d ? (
                          d.passed
                            ? <span className="brutal-chip" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>PASS</span>
                            : <span className="brutal-chip" style={{ background: "var(--destructive)", color: "var(--destructive-foreground)" }}>BLOCKED · {(d.failedClauses as { id: string }[]).map((c) => c.id).join(",")}</span>
                        ) : <span className="case-number" style={{ color: "var(--muted-text)" }}>—</span>}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <form action={runEligibilitySweep}>
                          <input type="hidden" name="studentId" value={p.userId} />
                          <input type="hidden" name="ruleId" value="rule-nimbus-be" />
                          <button type="submit" className="btn-brutal-outline" style={{ fontSize: "9px", padding: "4px 8px" }}>RUN CHECK</button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="case-number" style={{ color: "var(--muted-text)", marginTop: "8px" }}>EVERY CHECK WRITES AN APPEND-ONLY AUDIT ROW (ACTOR, RULE ID + VERSION, FAILED CLAUSE IDS).</p>
        </section>
      </div>
    </AppShell>
  );
}
