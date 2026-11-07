import { and, asc, count, desc, eq } from "drizzle-orm";
import { Check, FileDown, ShieldCheck, TriangleAlert } from "lucide-react";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { decideAgentAction } from "@/lib/actions/agent";
import { KpiStrip, KindChip, MonoEyebrow, RailPanel, SealChip, SegmentMeter } from "@/components/mono/ui";

const kindLabel: Record<string, string> = {
  interview_questions: "Interview Set",
  eligibility_sweep: "Eligibility Sweep",
  schedule_draft: "Schedule Draft",
  forecast: "Forecast",
};

const caseNo = (i: number) => `PVG-2026-${String(114 + i).padStart(4, "0")}`;

function age(from: Date) {
  const mins = Math.max(0, Math.floor((Date.now() - from.getTime()) / 60000));
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  return `${h}h ${String(mins % 60).padStart(2, "0")}m`;
}

function DraftBody({ kind, detail }: { kind: string; detail: Record<string, unknown> }) {
  const draft = (detail as { draft?: unknown }).draft;
  if (kind === "interview_questions" && Array.isArray(draft)) {
    return (
      <ol className="divide-y divide-line border-y border-line">
        {(draft as string[]).map((q: string, i: number) => (
          <li key={i} className="flex items-baseline gap-3 py-2 text-[12px] leading-snug text-ink">
            <span className="font-mono text-[8px] text-muted">Q{i + 1}</span>
            {q}
          </li>
        ))}
      </ol>
    );
  }
  if (kind === "eligibility_sweep" && draft && typeof draft === "object") {
    const d = draft as { eligible: string[]; blocked: Array<{ id: string; clause: string; note: string }>; ruleVersion: number };
    return (
      <div className="text-[12px]">
        <p className="text-ink"><span className="font-semibold text-ink">{d.eligible.length} eligible</span> <span className="text-muted">· rule v{d.ruleVersion}</span></p>
        <ul className="mt-1.5">
          {d.blocked.map((b) => (
            <li key={b.id} className="flex items-baseline gap-2 border-t border-line py-1.5">
              <span aria-hidden className="font-mono text-[10px] text-red">×</span>
              <span className="font-mono text-[10px] text-red">{b.id} — {b.note}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (kind === "schedule_draft" && draft && typeof draft === "object") {
    const d = draft as { slots: string[]; clash: string; suggestion: string };
    return (
      <div className="text-[12px]">
        <ul className="font-mono text-[11px] text-muted">
          {(d.slots as string[]).map((s) => <li key={s} className="py-0.5">→ {s}</li>)}
        </ul>
        <p className="mt-2 rounded-[6px] border border-line bg-panel-2 px-3 py-2 text-[10px] text-amber">
          <span className="mr-1 font-mono text-[8px] uppercase tracking-[0.18em] text-muted">clash</span>
          {d.clash}
        </p>
        <p className="mt-1.5 px-3 text-[10px] text-ink">
          <span className="mr-1 font-mono text-[8px] uppercase tracking-[0.18em] text-muted">remedy</span>
          {d.suggestion}
        </p>
      </div>
    );
  }
  return <pre className="overflow-x-auto font-mono text-[11px] text-muted">{JSON.stringify(detail, null, 2)}</pre>;
}

export default async function OfficerQueuePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "officer") redirect("/student");
  const T = session.tenantId;

  const [runs, verifiedAgg, blocksAgg, auditAgg, signals, latestFairness] = await Promise.all([
    db.select().from(schema.agentRuns).where(eq(schema.agentRuns.tenantId, T)).orderBy(asc(schema.agentRuns.createdAt)),
    db.select({ n: count() }).from(schema.studentSkills).where(and(eq(schema.studentSkills.tenantId, T), eq(schema.studentSkills.state, "verified"))),
    db.select({ n: count() }).from(schema.eligibilityDecisions).where(and(eq(schema.eligibilityDecisions.tenantId, T), eq(schema.eligibilityDecisions.passed, false))),
    db.select({ n: count() }).from(schema.auditLog).where(eq(schema.auditLog.tenantId, T)),
    db.select().from(schema.cohortSignals).where(eq(schema.cohortSignals.tenantId, T)),
    db.select().from(schema.fairnessReports).where(eq(schema.fairnessReports.tenantId, T)).orderBy(desc(schema.fairnessReports.createdAt)).limit(1),
  ]);

  const pending = runs.filter((r) => r.status === "pending");
  const decided = runs.filter((r) => r.status !== "pending");
  const oldest = pending[0]?.createdAt ? age(pending[0].createdAt) : "—";
  const fairness = latestFairness[0];
  const fairnessFlagged = Boolean(fairness && Array.isArray(fairness.findings) && fairness.findings.length > 0);
  const sqlSignals = signals.filter((s) => s.skillId === "sql");

  return (
    <AppShell session={session}>
      {/* ── header ─────────────────────────────────────────────── */}
      <header className="m-dotgrid border-b border-line px-4 pb-5 pt-5 md:px-8 md:pt-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <MonoEyebrow>◈ Nimbus Tech — Backend Dev drive</MonoEyebrow>
            <h1 className="mt-2 text-[32px] font-semibold leading-none tracking-[-0.03em] text-ink md:text-[38px]">
              Decision Queue
            </h1>
            <p className="mt-2 max-w-[52ch] text-[12px] leading-snug text-muted">
              Agents propose. You dispose. Every sign-off appends to the ledger —
              appended, never edited.
            </p>
          </div>

          {/* pending / oldest cluster */}
          <div
            className="flex items-center gap-5 rounded-[8px] border border-line bg-panel px-5 py-3"
            aria-label="Queue summary"
          >
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[0.24em] text-muted">Pending</p>
              <p className="mt-1 text-[26px] leading-none font-semibold tabular-nums text-ink">
                {pending.length}
              </p>
            </div>
            <div aria-hidden className="h-9 w-px bg-line" />
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[0.24em] text-muted">Oldest</p>
              <p className="mt-1 text-[26px] leading-none font-semibold tabular-nums text-ink">{oldest}</p>
            </div>
          </div>
        </div>

        {/* KPI strip — hairline rules, no boxes */}
        <div className="mt-4">
          <KpiStrip
            items={[
              { label: "Verified skills", value: verifiedAgg[0]?.n ?? 0, hint: "evidence-gated" },
              { label: "Approvals pending", value: pending.length, hint: "agent drafts" },
              { label: "Eligibility blocks", value: blocksAgg[0]?.n ?? 0, hint: "rule v3 · failed" },
              { label: "Audit entries", value: auditAgg[0]?.n ?? 0, hint: "append-only" },
            ]}
          />
        </div>
      </header>

      {/* ── main grid ───────────────────────────────────────────── */}
      <div className="grid gap-4 p-4 md:p-6 xl:grid-cols-12">
        {/* queue column */}
        <section aria-label="Agent proposals" className="min-w-0 space-y-3 xl:col-span-8">
          {pending.length === 0 && (
            <p className="rounded-[8px] border border-line bg-panel p-6 text-[12px] text-muted">
              Queue is clear. Outstanding agent drafts will appear here.
            </p>
          )}

          {pending.map((run, idx) => {
            const detail = run.detail as { draft?: unknown; rationale?: string; confidence?: number; draftDetail?: unknown };
            const conf = Math.round(((detail.confidence ?? 0) as number) * 100);
            return (
              <article
                key={run.id}
                className="rounded-[8px] border border-line bg-panel transition-colors hover:border-line-strong"
              >
                {/* card head */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <KindChip>{kindLabel[run.kind] ?? run.kind}</KindChip>
                    <span className="truncate font-mono text-[9px] text-muted">
                      {caseNo(idx)} · {run.id}
                    </span>
                  </div>
                  <SegmentMeter value={conf / 100} />
                </div>

                {/* body */}
                <div className="px-4 py-3.5">
                  <h2 className="text-[15px] font-semibold leading-snug tracking-[-0.01em] text-ink">
                    {run.subject}
                  </h2>
                  {detail.rationale && (
                    <p className="mt-1 text-[11px] leading-snug text-muted">
                      <span className="mr-1 font-mono text-[8px] uppercase tracking-[0.18em] text-muted">why</span>
                      {detail.rationale}
                    </p>
                  )}
                  <div className="mt-3"><DraftBody kind={run.kind} detail={detail} /></div>
                </div>

                {/* actions */}
                <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3">
                  <form action={decideAgentAction}>
                    <input type="hidden" name="agentRunId" value={run.id} />
                    <input type="hidden" name="decision" value="approve" />
                    <button
                      type="submit"
                      className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-[6px] bg-probe px-4 text-[12.5px] font-medium text-paper transition-colors hover:bg-white sm:w-auto"
                    >
                      <Check size={13} strokeWidth={3} aria-hidden />
                      Approve &amp; seal
                    </button>
                  </form>
                  <form action={decideAgentAction} className="flex w-full flex-1 items-center gap-2 sm:min-w-[240px]">
                    <input type="hidden" name="agentRunId" value={run.id} />
                    <input type="hidden" name="decision" value="override" />
                    <input
                      name="reason"
                      required
                      minLength={8}
                      placeholder="Why are you overriding? (min 8, logged)"
                      aria-label="Override reason"
                      className="h-9 min-w-0 flex-1 rounded-[6px] border border-line bg-panel-3 px-3 text-[12px] text-ink outline-none transition-colors placeholder:text-muted focus:border-ledger"
                    />
                    <button
                      type="submit"
                      className="h-9 shrink-0 rounded-[6px] border border-red px-3 text-[12px] font-medium text-red transition-colors hover:bg-red-wash sm:px-4"
                    >
                      Override
                    </button>
                  </form>
                  <form action={decideAgentAction}>
                    <input type="hidden" name="agentRunId" value={run.id} />
                    <input type="hidden" name="decision" value="defer" />
                    <button
                      type="submit"
                      className="h-9 rounded-[6px] px-3 text-[12px] text-muted transition-colors hover:bg-panel-2 hover:text-ink"
                    >
                      Defer
                    </button>
                  </form>
                </div>
              </article>
            );
          })}

          {/* decided — the register */}
          {decided.length > 0 && (
            <section aria-label="Decided" className="pt-2">
              <h2 className="font-mono text-[8px] uppercase tracking-[0.28em] text-muted">Decided · The Register</h2>
              <ul className="mt-2 overflow-hidden rounded-[8px] border border-line">
                {decided.map((run) => (
                  <li key={run.id} className="flex items-center justify-between gap-3 border-b border-line bg-panel px-4 py-2.5 text-[12px] last:border-b-0">
                    <span className="min-w-0 truncate text-ink">
                      <span className="mr-2 font-mono text-[9px] text-muted">{run.id}</span>
                      {run.subject}
                    </span>
                    <SealChip tone={run.status === "approved" ? "sealed" : run.status === "overridden" ? "overridden" : "deferred"}>
                      {run.status}
                    </SealChip>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="hidden items-center gap-3 px-1 font-mono text-[8px] uppercase tracking-[0.2em] text-muted md:flex">
            <kbd className="rounded-[4px] border border-line-strong px-1.5 py-0.5">↑↓</kbd> navigate
            <kbd className="rounded-[4px] border border-line-strong px-1.5 py-0.5">A</kbd> approve
            <kbd className="rounded-[4px] border border-line-strong px-1.5 py-0.5">O</kbd> override
            <kbd className="rounded-[4px] border border-line-strong px-1.5 py-0.5">D</kbd> defer
            <kbd className="rounded-[4px] border border-line-strong px-1.5 py-0.5">⌘K</kbd> palette
          </p>
        </section>

        {/* right rail */}
        <aside aria-label="Evidence and fairness" className="space-y-4 xl:col-span-4">
          {/* cohort heat — real signals only */}
          <RailPanel title="Cohort heat · SQL" right="live signals">
            <ul className="space-y-2">
              {sqlSignals.map((s) => (
                <li key={s.id} className="flex items-center gap-3">
                  <span className="w-24 truncate text-[10px] text-muted">{s.branch.replace(" Engineering", "")}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-panel-3" role="img" aria-label={`${s.branch}: ${s.weakShare}% weak in SQL`}>
                    <span
                      className={`block h-full rounded-full ${s.weakShare >= 50 ? "bg-ink" : "bg-line-strong"}`}
                      style={{ width: `${s.weakShare}%` }}
                    />
                  </span>
                  <span className="w-8 text-right font-mono text-[9px] text-muted tabular-nums">{s.weakShare}%</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-line pt-2 text-[10px] leading-snug text-muted">
              SQL is the bottleneck for backend roles — <span className="font-semibold text-ink">60% of CSE weak</span>; both mock-fix drives on the calendar test SQL.
            </p>
          </RailPanel>

          {/* fairness — honest state from the latest report */}
          <RailPanel title="Fairness · Latest sweep" right={fairness ? fairness.driveId : "none"}>
            {fairnessFlagged ? (
              <div className="flex items-start gap-2.5">
                <TriangleAlert size={16} strokeWidth={1.5} aria-hidden className="mt-0.5 shrink-0 text-amber" />
                <div>
                  <p className="text-[12px] font-semibold text-amber">Human review required</p>
                  <p className="mt-1 text-[10px] leading-snug text-muted">
                    {(fairness!.findings as unknown[]).length} flagged finding(s) in the latest
                    fairness report. Parity must be reviewed and countersigned before this drive
                    proceeds.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2.5">
                <ShieldCheck size={16} strokeWidth={1.5} aria-hidden className="mt-0.5 shrink-0 text-ledger" />
                <div>
                  <p className="text-[12px] font-semibold text-ink">No skew detected</p>
                  <p className="mt-1 text-[10px] leading-snug text-muted">
                    No segment breached the 0.8 parity benchmark in the latest report.
                  </p>
                </div>
              </div>
            )}
          </RailPanel>

          {/* ledger invariant + export */}
          <RailPanel title="Ledger invariant">
            <p className="text-[10px] leading-relaxed text-muted">
              Approves are one-way. The trail is append-only and SHA-chained — reversals are new
              entries, never edits. Exports carry the NAAC / NIRF verification seal.
            </p>
            <a
              href="/api/export/accreditation"
              className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-[6px] bg-probe text-[12.5px] font-medium text-paper transition-colors hover:bg-white"
            >
              <FileDown size={13} strokeWidth={2} aria-hidden />
              Export audit pack ↓
            </a>
          </RailPanel>
        </aside>
      </div>
    </AppShell>
  );
}
