import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { recordFairnessReview } from "@/lib/actions/fairness";

type Segment = { shortlistRate: number; applicants: number };

export default async function FairnessPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "officer") redirect("/student");

  const [report] = await db.select().from(schema.fairnessReports).orderBy(desc(schema.fairnessReports.createdAt)).limit(1);
  const segments = (report?.segments ?? {}) as Record<string, Record<string, Segment>>;
  const findings = (report?.findings ?? []) as Array<{ segment: string; ratio: number; benchmark: number; flag: string }>;

  return (
    <AppShell session={session}>
      <header className="construction-line" style={{ padding: "20px 24px" }}>
        <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "4px" }}>FAIRNESS · FOUR-FIFTHS RULE</p>
        <h1 className="display-md" style={{ marginBottom: "4px" }}>SHORTLIST PARITY SCAN</h1>
        <p className="body-sm" style={{ color: "var(--muted-text)", maxWidth: "68ch" }}>
          Adverse-impact screen per drive. Any segment below 80% of the reference rate is flagged for human review — the system never disqualifies by itself.
        </p>
      </header>
      <div style={{ padding: "16px 24px", maxWidth: "920px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {!report && <p className="body-md" style={{ color: "var(--muted-text)" }}>No fairness reports yet.</p>}
        {report && (
          <>
            <div className="brutal-card" style={{ padding: "0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "3px solid var(--border)", background: "var(--secondary)", color: "var(--secondary-foreground)" }}>
                <div>
                  <h2 className="display-sm" style={{ fontSize: "14px", color: "var(--concrete)" }}>ZEN FINANCIAL — QA ENGINEER</h2>
                  <p className="case-number" style={{ color: "var(--concrete-dark)" }}>REPORT {report.id} · DRIVE {report.driveId}</p>
                </div>
                <span className="brutal-chip" style={{ background: "var(--destructive)", color: "var(--destructive-foreground)" }}>1 FLAG OPEN</span>
              </div>
              <table className="brutal-table">
                <thead><tr><th>SEGMENT</th><th>GROUP</th><th>APPLICANTS</th><th>SHORTLIST RATE</th></tr></thead>
                <tbody>
                  {Object.entries(segments).flatMap(([segment, groups]) =>
                    Object.entries(groups).map(([group, seg]) => (
                      <tr key={`${segment}-${group}`}>
                        <td className="case-number" style={{ color: "var(--muted-text)" }}>{segment.toUpperCase()}</td>
                        <td style={{ fontWeight: 600 }}>{group}</td>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}>{seg.applicants}</td>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, textAlign: "center" }}>{seg.shortlistRate}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {findings.map((f, i) => (
              <div key={i} className="brutal-card" style={{ padding: "14px", borderLeft: "6px solid var(--spot)" }}>
                <p className="case-number" style={{ color: "var(--spot)", marginBottom: "4px" }}>FLAG {i + 1} · {f.segment.toUpperCase()}</p>
                <p className="body-sm" style={{ marginBottom: "6px" }}>{f.flag}</p>
                <p className="case-number" style={{ color: "var(--muted-text)" }}>FOUR-FIFTHS BENCHMARK: RATIO ≥ {f.benchmark} · MEASURED {f.ratio}</p>
                <form action={recordFairnessReview} style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                  <input type="hidden" name="reportId" value={report.id} />
                  <select name="outcome" className="brutal-input" style={{ fontSize: "11px" }} defaultValue="needs-discussion">
                    <option value="needs-discussion">NEEDS DISCUSSION AT T&P</option>
                    <option value="escalated">ESCALATE TO EMPLOYER + DPO</option>
                    <option value="logged-ok">LOGGED, EXPLAINABLE, NO ACTION</option>
                  </select>
                  <button type="submit" className="btn-brutal-outline" style={{ fontSize: "10px", padding: "6px 12px" }}>RECORD REVIEW OUTCOME</button>
                </form>
              </div>
            ))}
            <p className="case-number" style={{ color: "var(--muted-text)" }}>THE REVIEW OUTCOME IS WRITTEN TO THE APPEND-ONLY AUDIT TRAIL. MODEL NEVER AUTO-REJECTS A CANDIDATE SEGMENT.</p>
          </>
        )}
      </div>
    </AppShell>
  );
}
