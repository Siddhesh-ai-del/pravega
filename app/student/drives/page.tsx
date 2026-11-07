import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { recordAppeal } from "@/lib/actions/eligibility";
import { evaluateEligibility, cgpaToPercent, type Clause } from "@/lib/eligibility";

export default async function StudentDrivesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "student") redirect("/officer");

  const drives = await db.select().from(schema.drives).where(eq(schema.drives.tenantId, session.tenantId));
  const [profile] = await db.select().from(schema.studentProfiles).where(eq(schema.studentProfiles.userId, session.userId));
  const skills = await db.select().from(schema.studentSkills).where(eq(schema.studentSkills.userId, session.userId));
  const [nimbusRule] = await db.select().from(schema.eligibilityRules).where(eq(schema.eligibilityRules.id, "rule-nimbus-be"));
  const skillsMap = Object.fromEntries(skills.map((s) => [s.skillId, s.state]));

  const verdict = profile && nimbusRule
    ? evaluateEligibility(nimbusRule.version, nimbusRule.clauses as unknown as Clause[], {
        cgpaPercent: cgpaToPercent(profile.cgpa),
        activeBacklogs: profile.activeBacklogs,
        skills: skillsMap,
      })
    : null;

  return (
    <AppShell session={session}>
      <header className="construction-line" style={{ padding: "20px 24px" }}>
        <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "4px" }}>MY DRIVES &amp; ELIGIBILITY</p>
        <h1 className="display-md" style={{ marginBottom: "4px" }}>WHERE YOU STAND, AND WHY</h1>
      </header>
      <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: "12px", maxWidth: "880px" }}>
        {drives.map((d) => {
          const isNimbus = d.id === "drv-nimbus";
          const v = isNimbus ? verdict : null;
          return (
            <div key={d.id} className="brutal-card" style={{ padding: "16px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "10px", paddingBottom: "10px", borderBottom: "2px solid var(--border)" }}>
                <div>
                  <h2 className="display-sm" style={{ fontSize: "18px", marginBottom: "2px" }}>{d.company} — {d.role}</h2>
                  <p className="case-number" style={{ color: "var(--muted-text)" }}>
                    {d.status.toUpperCase()} · JD: {(d.jdSkills as string[]).join(", ").toUpperCase()} · {d.scheduledAt ? new Date(d.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "TBD"}
                  </p>
                </div>
                {isNimbus && v && (
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                    padding: "4px 10px", border: "3px solid var(--border)",
                    background: v.passed ? "var(--primary)" : "var(--destructive)",
                    color: v.passed ? "var(--primary-foreground)" : "var(--destructive-foreground)",
                  }}>
                    {v.passed ? "ELIGIBLE · RULE V3" : `BLOCKED · RULE V${nimbusRule?.version}`}
                  </span>
                )}
              </div>
              {isNimbus && v && (
                <div style={{ fontSize: "12px" }}>
                  {v.passed ? (
                    <p>All clauses pass against <b>Nimbus Tech — Backend Dev v3</b>. Your SQL evidence (verified, expires Sep 2027) satisfies clause <b>c3</b>.</p>
                  ) : (
                    <div>
                      <p style={{ color: "var(--destructive)", fontWeight: 700, textTransform: "uppercase", fontSize: "11px", marginBottom: "6px" }}>Blocked by:</p>
                      <ul style={{ paddingLeft: "16px", marginBottom: "8px" }}>
                        {v.failedClauses.map((c) => <li key={c.id} style={{ marginBottom: "2px" }}><b>{c.id}</b> — {c.label}</li>)}
                      </ul>
                      <p style={{ color: "var(--muted-text)", fontSize: "11px", marginBottom: "8px" }}>
                        Decision recorded with rule version <b>{nimbusRule?.version}</b>. If you believe this is wrong, appeal.
                      </p>
                      <form action={recordAppeal} style={{ display: "flex", gap: "8px" }}>
                        <input type="hidden" name="driveId" value={d.id} />
                        <input name="reason" defaultValue="eligibility review request" className="brutal-input" style={{ flex: 1, fontSize: "11px" }} aria-label="Appeal reason" />
                        <button type="submit" className="btn-brutal-outline" style={{ fontSize: "10px", padding: "6px 12px" }}>FILE APPEAL</button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
