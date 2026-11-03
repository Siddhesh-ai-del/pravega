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

const pics: Record<string, { label: string; tint: string }> = {
  aptitude: { label: "Round 1 · Aptitude", tint: "border-l-4 border-l-probe" },
  machine: { label: "Round 2 · Machine Test", tint: "border-l-4 border-l-amber" },
  interview: { label: "Round 3 · Interview", tint: "border-l-4 border-l-ledger" },
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
      <header className="border-b border-line px-4 md:px-8 py-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Mock Drive · {targetRole}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Drive replay — evidence of the gap</h1>
        </div>
        <div className="text-right">
          <p className="font-mono text-3xl font-semibold leading-none">{pct}<span className="text-base text-muted">%</span></p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted mt-1">composite (replay)</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_420px] gap-0">
        <section className="p-4 md:p-6 grid gap-4 content-start">
          {run?.rounds.map((r) => (
            <article key={r.round} className={`border border-line bg-panel p-4 ${pics[r.round]?.tint ?? ""}`}>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-semibold">{pics[r.round]?.label ?? r.round}</h2>
                <p className="font-mono">{r.score}<span className="text-muted">/{r.max}</span></p>
              </div>
              <p className="mt-2 text-[13px] text-[#2e3138]">{r.note}</p>
              {r.weakTopics.length > 0 && (
                <p className="mt-2 font-mono text-[11px] text-amber">
                  weak: {r.weakTopics.join(" · ")}
                </p>
              )}
            </article>
          ))}

          {/* Live gate */}
          <fieldset className="border-2 border-probe/40 bg-panel p-4">
            <legend className="px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-probe">Live gate · SQL</legend>
            <p className="text-[13px] font-medium">{LIVE_SQL.question}</p>
            <div className="mt-3 grid gap-2">
              {LIVE_SQL.options.map((o) => {
                const selected = liveAnswer === o.id;
                const state = liveAnswer === null
                  ? "border-line hover:border-probe"
                  : o.correct
                    ? "border-ledger bg-green-wash"
                    : selected
                      ? "border-red bg-red-wash"
                      : "border-line opacity-70";
                return (
                  <label key={o.id} className={`flex items-start gap-2 border p-2 text-[12px] cursor-pointer font-mono leading-snug ${state}`}>
                    <input type="radio" name="livesql" className="mt-0.5 accent-[var(--probe)]" checked={selected} onChange={() => setLiveAnswer(o.id)} />
                    <span className="whitespace-pre-wrap">{o.text}</span>
                  </label>
                );
              })}
            </div>
            {sqlVerdict && (
              <div role="status" className={`mt-2 border px-3 py-2 text-[12px] ${picked?.correct ? "border-ledger bg-green-wash text-ledger" : "border-red bg-red-wash text-red"}`}>
                <b>{sqlVerdict}</b> — {picked?.correct
                  ? "Correct. Note the WHERE-before-GROUP-BY ordering and HAVING vs WHERE for aggregates."
                  : picked?.why}
              </div>
            )}
          </fieldset>
        </section>

        {/* gap report rail */}
        <aside className="border-t lg:border-t-0 lg:border-l border-line p-4 md:p-6">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Gap report</h2>
          <p className="mt-2 text-[14px] leading-snug">
            {name}, the machine test marks show <b>SQL weakness (12/20)</b>, echoing your report note.
            Nimbus&apos; backend JD asks for SQL; the cohort is <b>60% weak</b> here.
          </p>
          <div className="mt-4 border border-line">
            {[
              ["Aptitude", 21, 30, "profit-loss, clocks"],
              ["Machine Test", 12, 20, "sql: joins, grouping"],
              ["Interview", 17, 30, "databases, REST"],
            ].map(([label, s, max, weak]) => (
              <div key={String(label)} className="flex items-center justify-between border-b last:border-b-0 border-line px-3 py-2 text-[12px]">
                <span>{String(label)}</span>
                <span className="font-mono text-muted">{s}/{max} <span className="text-amber">→ {String(weak)}</span></span>
              </div>
            ))}
          </div>
          <Link
            href="/student/learning-path"
            className="mt-4 block bg-probe text-white text-center px-4 py-2.5 text-[13px] font-medium hover:bg-[#2a2cac]"
          >
            Generate my gap-closing path →
          </Link>
          <p className="mt-3 font-mono text-[10px] text-muted">
            Replay from mdr-r-1 · live gate {sqlVerdict === "LIVE GATE: PASS" ? "confirmed knowledge" : "confirms the weak spot"}.
            {pathId ? ` Active path: ${pathId}` : ""}
          </p>
        </aside>
      </div>
    </>
  );
}
