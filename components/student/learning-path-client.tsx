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
          setFlash("EVIDENCE ARTIFACT CREATED — THIS TASK NOW COUNTS TOWARD VERIFICATION.");
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
      <header className="construction-line" style={{ padding: "20px 24px" }}>
        <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "4px" }}>GAP-CLOSING PATH · {gapSkill.toUpperCase()}</p>
        <h1 className="display-md" style={{ marginBottom: "4px" }}>CLOSE THE GAP, KEEP THE EVIDENCE</h1>
        <div style={{ display: "flex", alignItems: "baseline", gap: "16px", marginTop: "8px" }}>
          <span className="display-lg" style={{ color: "var(--spot)" }}>{doneCount}</span>
          <span className="display-lg" style={{ color: "var(--muted-text)", fontSize: "32px" }}>/{tasks.length}</span>
          <span className="case-number" style={{ color: "var(--muted-text)" }}>TASKS DONE · {pct}%</span>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 0 }}>
        <aside style={{ borderRight: "4px solid var(--border)", padding: "16px", background: "var(--concrete-dark)" }}>
          <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "12px" }}>WHY THIS PATH (EXPLAINABLE)</p>
          <div className="brutal-card" style={{ padding: "0" }}>
            {[
              ["SOURCE", reason.source ?? "mock drive"],
              ["MACHINE TEST SIGNAL", reason.machineNote ?? "JOIN grouping incomplete"],
              ["JD DEMAND SIGNAL", reason.jdSignal ?? "SQL in 61% of recent backend JDs"],
            ].map(([k, v], i) => (
              <div key={k} style={{ padding: "10px 12px", borderBottom: i < 2 ? "2px solid var(--border)" : "none" }}>
                <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "4px" }}>{k}</p>
                <p className="body-sm" style={{ fontWeight: 600 }}>{v}</p>
              </div>
            ))}
          </div>
          <p className="body-sm" style={{ color: "var(--muted-text)", marginTop: "12px", fontSize: "11px" }}>
            No hidden model decided this. Every input above is inspectable; if any is wrong, say so — that&apos;s the appeal path.
          </p>
          <div style={{ height: "6px", background: "var(--muted)", marginTop: "12px", overflow: "hidden" }}>
            <div style={{ height: "100%", background: "var(--primary)", width: `${pct}%`, transition: "width 0.3s" }} />
          </div>
          <p className="case-number" style={{ color: "var(--muted-text)", marginTop: "4px" }}>PATH CLOSES WHEN THE PROJECT ARTIFACT PRODUCES VERIFIABLE EVIDENCE</p>
          {flash && (
            <div style={{ marginTop: "12px", border: "3px solid var(--primary)", background: "var(--primary)", color: "var(--primary-foreground)", padding: "8px 12px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {flash}
            </div>
          )}
          <Link href="/student" className="btn-brutal-ghost" style={{ marginTop: "12px", display: "inline-block", fontSize: "11px" }}>
            ← BACK TO MY LEDGER
          </Link>
        </aside>

        <ol style={{ listStyle: "none", padding: "16px 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {tasks.map((t, i) => (
            <li key={t.id} className="brutal-card" style={{ padding: "14px", display: "flex", alignItems: "flex-start", gap: "12px", opacity: t.done ? 0.6 : 1 }}>
              <input
                id={t.id}
                type="checkbox"
                checked={t.done}
                disabled={busy === t.id}
                onChange={() => toggle(t.id)}
                style={{ marginTop: "3px", width: "18px", height: "18px", accentColor: "var(--spot)", cursor: "pointer" }}
              />
              <label htmlFor={t.id} style={{ flex: 1, cursor: "pointer" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "4px" }}>
                  <span className="case-number" style={{ color: "var(--muted-text)" }}>TASK {i + 1} · {t.kind.toUpperCase()}</span>
                  {t.producesEvidence && (
                    <span className="brutal-chip" style={{ fontSize: "8px" }}>PRODUCES EVIDENCE</span>
                  )}
                </div>
                <span style={{ fontSize: "13px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.02em", textDecoration: t.done ? "line-through" : "none" }}>
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
