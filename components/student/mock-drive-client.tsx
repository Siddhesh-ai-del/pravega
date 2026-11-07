"use client";
import { useMemo, useState } from "react";
import Link from "next/link";

type Round = { round: string; score: number; max: number; weakTopics: string[]; note: string };

const LIVE_SQL = {
  question: "Find departments where the average salary of employees hired after 2022 is above 60,000, ordered by that average descending. Which SQL is correct?",
  options: [
    { id: "a", text: "SELECT dept_id, AVG(salary) FROM employees WHERE hired_at > '2022-01-01' GROUP BY dept_id HAVING AVG(salary) > 60000 ORDER BY 2 DESC", correct: true },
    { id: "b", text: "SELECT dept_id, AVG(salary) FROM employees WHERE hired_at > '2022-01-01' ORDER BY 2 DESC", correct: false, why: "Missing GROUP BY — AVG collapses to one row; ORDER BY 2 has nothing stable to order." },
    { id: "c", text: "SELECT dept_id, AVG(salary) FROM employees GROUP BY dept_id WHERE hired_at > '2022-01-01' HAVING AVG(salary) > 60000 ORDER BY 2 DESC", correct: false, why: "WHERE cannot appear after GROUP BY in written order — parsing error." },
  ],
};

const pics: Record<string, string> = {
  aptitude: "ROUND 1 · APTITUDE",
  machine: "ROUND 2 · MACHINE TEST",
  interview: "ROUND 3 · INTERVIEW",
};

export function MockDriveClient({
  name,
  targetRole,
  run,
  pathId,
}: {
  name: string;
  targetRole: string;
  run: { id: string; totalScore: number; totalMax: number; rounds: Round[] } | null;
  pathId: string | null;
}) {
  const [liveAnswer, setLiveAnswer] = useState<string | null>(null);
  const pct = run ? Math.round((run.totalScore / run.totalMax) * 100) : 0;
  const picked = LIVE_SQL.options.find((o) => o.id === liveAnswer);
  const sqlVerdict = useMemo(() => (liveAnswer === null ? null : picked?.correct ? "LIVE GATE: PASS" : "LIVE GATE: FAIL"), [liveAnswer, picked]);

  return (
    <>
      <header className="construction-line" style={{ padding: "20px 24px" }}>
        <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "4px" }}>MOCK DRIVE · {targetRole.toUpperCase()}</p>
        <h1 className="display-md" style={{ marginBottom: "4px" }}>DRIVE REPLAY — EVIDENCE OF THE GAP</h1>
        <div style={{ display: "flex", alignItems: "baseline", gap: "16px", marginTop: "8px" }}>
          <span className="display-lg" style={{ color: "var(--spot)" }}>{pct}</span>
          <span className="case-number" style={{ color: "var(--muted-text)" }}>% COMPOSITE (REPLAY)</span>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 0 }}>
        <section style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {run?.rounds.map((r) => (
            <div key={r.round} className="brutal-card" style={{ padding: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                <span className="case-number" style={{ color: "var(--ink)" }}>{pics[r.round] ?? r.round.toUpperCase()}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: "16px" }}>
                  {r.score}<span style={{ color: "var(--muted-text)", fontSize: "12px" }}>/{r.max}</span>
                </span>
              </div>
              <p className="body-sm" style={{ color: "var(--ink)", marginBottom: "6px" }}>{r.note}</p>
              {r.weakTopics.length > 0 && (
                <p className="case-number" style={{ color: "var(--spot)" }}>WEAK: {r.weakTopics.join(" · ")}</p>
              )}
            </div>
          ))}

          {/* Live gate */}
          <fieldset style={{ border: "4px solid var(--border)", background: "var(--card)", padding: "14px", margin: 0 }}>
            <legend className="case-number" style={{ padding: "0 8px", color: "var(--spot)" }}>LIVE GATE · SQL</legend>
            <p className="body-sm" style={{ fontWeight: 600, marginBottom: "10px" }}>{LIVE_SQL.question}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {LIVE_SQL.options.map((o) => {
                const selected = liveAnswer === o.id;
                const stateStyle = liveAnswer === null
                  ? { border: "3px solid var(--border)", background: "var(--card)" }
                  : o.correct
                    ? { border: "3px solid var(--primary)", background: "var(--primary)", color: "var(--primary-foreground)" }
                    : selected
                      ? { border: "3px solid var(--destructive)", background: "var(--destructive)", color: "var(--destructive-foreground)" }
                      : { border: "3px solid var(--border)", background: "var(--muted)", opacity: 0.6 };
                return (
                  <label key={o.id} style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "8px", cursor: "pointer", ...stateStyle }}>
                    <input type="radio" name="livesql" checked={selected} onChange={() => setLiveAnswer(o.id)} style={{ marginTop: "3px", accentColor: "var(--spot)" }} />
                    <span className="mono" style={{ fontSize: "11px", lineHeight: "1.4", wordBreak: "break-all" }}>{o.text}</span>
                  </label>
                );
              })}
            </div>
            {sqlVerdict && (
              <div style={{ marginTop: "10px", border: `3px solid ${picked?.correct ? "var(--primary)" : "var(--destructive)"}`, background: picked?.correct ? "var(--primary)" : "var(--destructive)", color: picked?.correct ? "var(--primary-foreground)" : "var(--destructive-foreground)", padding: "8px 12px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                <b>{sqlVerdict}</b> — {picked?.correct
                  ? "Correct. Note the WHERE-before-GROUP-BY ordering and HAVING vs WHERE for aggregates."
                  : picked?.why}
              </div>
            )}
          </fieldset>
        </section>

        <aside style={{ borderLeft: "4px solid var(--border)", padding: "16px", background: "var(--concrete-dark)" }}>
          <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "12px" }}>GAP REPORT</p>
          <p className="body-sm" style={{ marginBottom: "12px" }}>
            {name}, the machine test marks show <b>SQL weakness (12/20)</b>, echoing your report note.
            Nimbus&apos; backend JD asks for SQL; the cohort is <b>60% weak</b> here.
          </p>
          <div className="brutal-card" style={{ padding: "0" }}>
            {[
              ["APTITUDE", 21, 30, "profit-loss, clocks"],
              ["MACHINE TEST", 12, 20, "sql: joins, grouping"],
              ["INTERVIEW", 17, 30, "databases, REST"],
            ].map(([label, s, max, weak], i) => (
              <div key={String(label)} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: i < 2 ? "2px solid var(--border)" : "none", fontSize: "11px" }}>
                <span style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{String(label)}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--muted-text)" }}>
                  {s}/{max} <span style={{ color: "var(--spot)" }}>→ {String(weak)}</span>
                </span>
              </div>
            ))}
          </div>
          <Link href="/student/learning-path" className="btn-brutal-primary" style={{ marginTop: "16px", display: "block", textAlign: "center" }}>
            GENERATE MY GAP-CLOSING PATH →
          </Link>
          <p className="case-number" style={{ color: "var(--muted-text)", marginTop: "12px" }}>
            Replay from mdr-r-1 · live gate {sqlVerdict === "LIVE GATE: PASS" ? "confirmed knowledge" : "confirms the weak spot"}.
            {pathId ? ` Active path: ${pathId}` : ""}
          </p>
        </aside>
      </div>
    </>
  );
}
