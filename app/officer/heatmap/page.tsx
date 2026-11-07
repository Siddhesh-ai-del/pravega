import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";

export default async function HeatmapPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "officer") redirect("/student");

  const signals = await db.select({ branch: schema.cohortSignals.branch, skillId: schema.cohortSignals.skillId, weakShare: schema.cohortSignals.weakShare, placementRate: schema.cohortSignals.placementRate }).from(schema.cohortSignals).where(eq(schema.cohortSignals.tenantId, session.tenantId));
  const skillNames: Record<string, string> = { sql: "SQL", docker: "DOCKER", git: "GIT" };
  const skillOrder = ["git", "sql", "docker"];
  const branches = [...new Set(signals.map((s) => s.branch))];
  const rateOf = (b: string) => signals.find((s) => s.branch === b)?.placementRate ?? 0;
  const cell = (b: string, s: string) => signals.find((x) => x.branch === b && x.skillId === s);
  const heatClass = (v: number) => (v >= 70 ? "heat-5" : v >= 50 ? "heat-4" : v >= 30 ? "heat-3" : v >= 15 ? "heat-2" : "heat-1");

  return (
    <AppShell session={session}>
      <header className="construction-line" style={{ padding: "20px 24px" }}>
        <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "4px" }}>COHORT ANALYTICS · NAAC-READY</p>
        <h1 className="display-md" style={{ marginBottom: "4px" }}>THE BATCH, AT A GLANCE</h1>
        <p className="body-sm" style={{ color: "var(--muted-text)" }}>Share of students weak per skill, measured from mock drives + verified evidence, not self-declaration.</p>
      </header>
      <div style={{ padding: "16px 24px", maxWidth: "1000px" }}>
        <div className="brutal-card" style={{ padding: "0", overflow: "auto" }}>
          <table className="brutal-table">
            <thead>
              <tr>
                <th>BRANCH</th>
                {skillOrder.map((s) => <th key={s}>{skillNames[s]}</th>)}
                <th>PLACEMENT</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => (
                <tr key={b}>
                  <td style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "11px" }}>{b.replace("Engineering", "E")}</td>
                  {skillOrder.map((s) => {
                    const c = cell(b, s);
                    const v = c?.weakShare ?? 0;
                    return <td key={s} className={heatClass(v)} style={{ textAlign: "center", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{v}%</td>;
                  })}
                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, textAlign: "center" }}>{rateOf(b)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
          <div className="brutal-card" style={{ padding: "12px", borderLeft: "6px solid var(--spot)" }}>
            <p className="case-number" style={{ color: "var(--spot)", marginBottom: "4px" }}>SIGNAL</p>
            <p className="body-sm" style={{ fontWeight: 600 }}>SQL is the bottleneck for backend roles. 60% of CSE batch weak; both must-fix drives on the calendar test SQL.</p>
          </div>
          <div className="brutal-card" style={{ padding: "12px", borderLeft: "6px solid var(--ink)" }}>
            <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "4px" }}>RECOMMENDED ACTION</p>
            <p className="body-sm" style={{ fontWeight: 600 }}>Book one SQL workshop before Nov 6 drive and gate Nimbus eligibility sweep re-run on attendance.</p>
          </div>
        </div>
        <a href="/api/export/accreditation" className="btn-brutal-outline" style={{ marginTop: "16px", display: "inline-flex", fontSize: "10px" }}>
          EXPORT NAAC OUTCOMES (CSV) ↓
        </a>
        <p className="case-number" style={{ color: "var(--muted-text)", marginTop: "12px" }}>NAAC/NIRF EXPORT: ACCREDITATION SUITE WRITES THESE EXACT NUMBERS TO THE REPORT TEMPLATE — NO MANUAL COLLATION.</p>
      </div>
    </AppShell>
  );
}
