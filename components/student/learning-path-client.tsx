"use client";
import { useState } from "react";
import Link from "next/link";

type Task = { id: string; title: string; kind: string; producesEvidence: boolean; done: boolean };

export function LearningPathClient({
  pathId,
  gapSkill,
  reason,
  initialTasks,
  name,
}: {
  pathId: string;
  gapSkill: string;
  reason: { source?: string; machineNote?: string; jdSignal?: string };
  initialTasks: Task[];
  name: string;
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const doneCount = tasks.filter((t) => t.done).length;
  const pct = Math.round((doneCount / tasks.length) * 100);

  async function toggle(taskId: string) {
    setBusy(taskId);
    try {
      const res = await fetch("/api/learning-path/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pathId, taskId }),
      });
      const data = await res.json();
      if (res.ok) {
        setTasks(data.tasks);
        if (data.evidenceCreated) {
          setFlash("Evidence artifact created — this task now counts toward verification.");
        } else {
          setFlash(null);
        }
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <header className="border-b border-line px-4 md:px-8 py-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Gap-closing path · {gapSkill}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Close the gap, keep the evidence</h1>
        </div>
        <div className="text-right">
          <p className="font-mono text-3xl font-semibold leading-none">{doneCount}<span className="text-base text-muted">/{tasks.length}</span></p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted mt-1">tasks done · {pct}%</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-[380px_1fr]">
        {/* why panel */}
        <aside className="border-b lg:border-b-0 lg:border-r border-line p-4 md:p-6">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Why this path (explainable)</h2>
          <div className="mt-3 border border-line bg-panel">
            {[
              ["Source", reason.source ?? "mock drive"],
              ["Machine test signal", reason.machineNote ?? "JOIN grouping incomplete"],
              ["JD demand signal", reason.jdSignal ?? "SQL in 61% of recent backend JDs"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3 border-b last:border-b-0 border-line px-3 py-2 text-[13px]">
                <span className="text-muted min-w-[140px] font-mono text-[11px] uppercase tracking-wide pt-0.5">{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-muted">
            No hidden model decided this. Every input above is inspectable; if any is wrong,
            say so — that&apos;s the appeal path.
          </p>
          <div className="mt-4 h-2 w-full bg-panel-2 overflow-hidden">
            <div className="h-full bg-ledger transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 font-mono text-[10px] text-muted">path closes when the project artifact produces verifiable evidence</p>
          {flash && (
            <p role="status" className="mt-3 border border-ledger/40 bg-green-wash px-3 py-2 text-[12px] text-ledger">
              {flash}
            </p>
          )}
          <Link href="/student" className="mt-4 inline-block text-[13px] text-probe underline underline-offset-2">
            Back to my ledger →
          </Link>
        </aside>

        {/* tasks */}
        <ol className="p-4 md:p-6 grid gap-3 content-start">
          {tasks.map((t, i) => (
            <li key={t.id} className={`flex items-start gap-3 border bg-panel p-4 ${t.done ? "border-ledger/40" : "border-line"}`}>
              <input
                id={t.id}
                type="checkbox"
                className="mt-1 accent-[var(--ledger)]"
                checked={t.done}
                disabled={busy === t.id}
                onChange={() => toggle(t.id)}
              />
              <label htmlFor={t.id} className="flex-1 cursor-pointer">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">TASK {i + 1} · {t.kind}</span>
                  {t.producesEvidence && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-probe border border-probe/30 bg-panel-2 px-1.5 py-0.5">
                      produces evidence
                    </span>
                  )}
                </span>
                <span className={`mt-1 block text-[14px] leading-snug ${t.done ? "line-through text-muted" : ""}`}>
                  {t.title}
                </span>
              </label>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
