import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { decideAgentAction } from "@/lib/actions/agent";

const kindLabel: Record<string, string> = {
  interview_questions: "INTERVIEW SET",
  eligibility_sweep: "ELIGIBILITY SWEEP",
  schedule_draft: "SCHEDULE DRAFT",
  forecast: "FORECAST",
};

function DraftBody({ kind, detail }: { kind: string; detail: Record<string, unknown> }) {
  const draft = (detail as { draft?: unknown }).draft;
  if (kind === "interview_questions" && Array.isArray(draft)) {
    return (
      <ol className="list-none">
        {(draft as string[]).map((q: string, i: number) => (
          <li key={i} className="border-b border-dashed border-line py-1.5 text-[13px]">
            <span className="font-mono text-[10px] text-probe">Q{i + 1} </span>{q}
          </li>
        ))}
      </ol>
    );
  }
  if (kind === "eligibility_sweep" && draft && typeof draft === "object") {
    const d = draft as { eligible: string[]; blocked: Array<{ id: string; clause: string; note: string }>; ruleVersion: number };
    return (
      <div className="text-[13px]">
        <p><b>{d.eligible.length} eligible</b> · rule <b>v{d.ruleVersion}</b></p>
        <ul className="mt-1">
          {d.blocked.map((b) => (
            <li key={b.id} className="border-t border-dashed border-line py-1">
              <span className="font-mono text-[11px] text-red">{b.id}</span> — {b.note}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (kind === "schedule_draft" && draft && typeof draft === "object") {
    const d = draft as { slots: string[]; clash: string; suggestion: string };
    return (
      <div className="text-[13px]">
        <ul className="font-mono">
          {(d.slots as string[]).map((s) => <li key={s} className="py-0.5">→ {s}</li>)}
        </ul>
        <p className="mt-1 border border-amber/40 bg-amber-wash px-2 py-1 text-amber"><b>clash:</b> {d.clash}</p>
        <p className="mt-1"><b>suggestion:</b> {d.suggestion}</p>
      </div>
    );
  }
  return <pre className="text-[11px] overflow-x-auto">{JSON.stringify(detail, null, 2)}</pre>;
}

export default async function OfficerQueuePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "officer") redirect("/student");

  const runs = await db.select().from(schema.agentRuns).where(eq(schema.agentRuns.tenantId, session.tenantId)).orderBy(desc(schema.agentRuns.createdAt));
  const pending = runs.filter((r) => r.status === "pending");
  const decided = runs.filter((r) => r.status !== "pending");

  return (
    <AppShell session={session}>
      <header className="border-b border-line px-4 md:px-8 py-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">AI drafts · human decides</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Decision queue</h1>
          <p className="mt-1 text-[13px] text-muted">Agents propose. You dispose. Every decision writes to the audit trail.</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-3xl font-semibold leading-none">{pending.length}<span className="text-base text-muted"> pending</span></p>
        </div>
      </header>

      <div className="p-4 md:p-6 grid gap-4 content-start max-w-[920px]">
        {pending.length === 0 && <p className="text-muted">Queue is clear. Outstanding agent drafts will appear here.</p>}

        {pending.map((run) => {
          const detail = run.detail as { draft?: unknown; rationale?: string; confidence?: number };
          return (
            <article key={run.id} className="border border-line bg-panel">
              <div className="flex items-center justify-between border-b border-line px-4 py-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-probe border border-probe/30 px-2 py-0.5">{kindLabel[run.kind] ?? run.kind}</span>
                <span className="font-mono text-[10px] text-muted">{run.id} · conf {Math.round(((detail.confidence ?? 0) as number) * 100)}%</span>
              </div>
              <div className="px-4 pt-3">
                <h2 className="font-semibold">{run.subject}</h2>
                {detail.rationale && <p className="mt-0.5 text-[11px] text-muted font-mono">why: {detail.rationale}</p>}
                <div className="mt-2"><DraftBody kind={run.kind} detail={detail} /></div>
              </div>
              {/* The defense-in-depth gate: three decisions, one mandatory reason */}
              <div className="border-t border-line px-4 py-3 flex flex-wrap items-center gap-2">
                <form action={decideAgentAction}>
                  <input type="hidden" name="agentRunId" value={run.id} />
                  <input type="hidden" name="decision" value="approve" />
                  <button type="submit" className="border border-ledger bg-green-wash text-ledger px-4 py-1.5 text-[12px] font-medium hover:bg-[#e2f1e8]">Approve</button>
                </form>
                <form action={decideAgentAction} className="flex items-center gap-2 flex-1 min-w-[220px]">
                  <input type="hidden" name="agentRunId" value={run.id} />
                  <input type="hidden" name="decision" value="override" />
                  <input name="reason" required minLength={8} placeholder="why are you overriding? (required, ≥8 chars)" aria-label="Override reason" className="flex-1 border border-line px-2 py-1.5 text-[12px]" />
                  <button type="submit" className="border border-red text-red px-3 py-1.5 text-[12px] font-medium hover:bg-red-wash">Override</button>
                </form>
                <form action={decideAgentAction}>
                  <input type="hidden" name="agentRunId" value={run.id} />
                  <input type="hidden" name="decision" value="defer" />
                  <button type="submit" className="border border-line text-muted px-4 py-1.5 text-[12px] hover:bg-panel-2">Defer</button>
                </form>
              </div>
            </article>
          );
        })}

        {decided.length > 0 && (
          <section className="mt-2">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Decided</h2>
            <ul className="mt-1 border border-line bg-panel divide-y divide-line">
              {decided.map((run) => (
                <li key={run.id} className="flex items-center justify-between gap-3 px-3 py-2 text-[12px]">
                  <span className="truncate"><span className="font-mono text-[10px] text-muted">{run.id}</span> {run.subject}</span>
                  <span className={`font-mono text-[10px] uppercase shrink-0 px-2 py-0.5 border ${
                    run.status === "approved" ? "text-ledger border-ledger/40" :
                    run.status === "overridden" ? "text-red border-red/40" : "text-muted border-line"
                  }`}>{run.status}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </AppShell>
  );
}
