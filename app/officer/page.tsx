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
      <ol style={{ listStyle: "none" }}>
        {(draft as string[]).map((q: string, i: number) => (
          <li key={i} style={{ borderBottom: "1px dashed var(--border)", padding: "6px 0", fontSize: "12px" }}>
            <span className="case-number" style={{ color: "var(--spot)", marginRight: "6px" }}>Q{i + 1}</span>{q}
          </li>
        ))}
      </ol>
    );
  }
  if (kind === "eligibility_sweep" && draft && typeof draft === "object") {
    const d = draft as { eligible: string[]; blocked: Array<{ id: string; clause: string; note: string }>; ruleVersion: number };
    return (
      <div style={{ fontSize: "12px" }}>
        <p style={{ fontWeight: 700, marginBottom: "4px" }}>{d.eligible.length} ELIGIBLE · RULE V{d.ruleVersion}</p>
        {d.blocked.map((b) => (
          <div key={b.id} style={{ borderTop: "1px dashed var(--border)", padding: "4px 0", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--muted-text)" }}>
            {b.id} — {b.note}
          </div>
        ))}
      </div>
    );
  }
  if (kind === "schedule_draft" && draft && typeof draft === "object") {
    const d = draft as { slots: string[]; clash: string; suggestion: string };
    return (
      <div style={{ fontSize: "12px" }}>
        <ul style={{ listStyle: "none", marginBottom: "6px" }}>
          {(d.slots as string[]).map((s) => <li key={s} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", padding: "2px 0" }}>→ {s}</li>)}
        </ul>
        <div style={{ borderLeft: "4px solid var(--spot)", paddingLeft: "8px", fontSize: "11px", color: "var(--muted-text)", marginBottom: "4px" }}>CLASH: {d.clash}</div>
        <p style={{ fontSize: "11px", fontWeight: 600 }}>SUGGESTION: {d.suggestion}</p>
      </div>
    );
  }
  return <pre style={{ fontSize: "10px", overflow: "auto" }}>{JSON.stringify(detail, null, 2)}</pre>;
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
      <header className="construction-line" style={{ padding: "20px 24px" }}>
        <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "4px" }}>AI DRAFTS · HUMAN DECIDES</p>
        <h1 className="display-md" style={{ marginBottom: "4px" }}>DECISION QUEUE</h1>
        <p className="body-sm" style={{ color: "var(--muted-text)" }}>Agents propose. You dispose. Every decision appends to the ledger.</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "8px" }}>
          <span className="display-lg" style={{ color: "var(--spot)" }}>{pending.length}</span>
          <span className="case-number" style={{ color: "var(--muted-text)" }}>PENDING</span>
        </div>
      </header>

      <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: "12px", maxWidth: "920px" }}>
        {pending.length === 0 && (
          <div className="brutal-card" style={{ padding: "20px", textAlign: "center" }}>
            <p className="body-md" style={{ color: "var(--muted-text)" }}>Queue is clear. Outstanding agent drafts will appear here.</p>
          </div>
        )}

        {pending.map((run) => {
          const detail = run.detail as { draft?: unknown; rationale?: string; confidence?: number };
          return (
            <div key={run.id} className="brutal-card" style={{ padding: "0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "3px solid var(--border)", background: "var(--secondary)", color: "var(--secondary-foreground)" }}>
                <span className="brutal-chip" style={{ background: "var(--concrete)", color: "var(--ink)", border: "2px solid var(--border)" }}>{kindLabel[run.kind] ?? run.kind}</span>
                <span className="case-number" style={{ color: "var(--concrete-dark)" }}>{run.id} · CONF {Math.round(((detail.confidence ?? 0) as number) * 100)}%</span>
              </div>
              <div style={{ padding: "12px 14px" }}>
                <h2 className="display-sm" style={{ fontSize: "16px", marginBottom: "2px" }}>{run.subject}</h2>
                {detail.rationale && <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "8px" }}>WHY: {detail.rationale}</p>}
                <DraftBody kind={run.kind} detail={detail} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", padding: "10px 14px", borderTop: "3px solid var(--border)", background: "var(--concrete-dark)" }}>
                <form action={decideAgentAction}>
                  <input type="hidden" name="agentRunId" value={run.id} />
                  <input type="hidden" name="decision" value="approve" />
                  <button type="submit" className="btn-brutal-primary" style={{ fontSize: "10px", padding: "6px 12px" }}>✓ APPROVE</button>
                </form>
                <form action={decideAgentAction} style={{ display: "flex", gap: "6px", flex: 1, minWidth: "200px" }}>
                  <input type="hidden" name="agentRunId" value={run.id} />
                  <input type="hidden" name="decision" value="override" />
                  <input name="reason" required minLength={8} placeholder="WHY ARE YOU OVERRIDING? (≥8 CHARS)" className="brutal-input" style={{ flex: 1, fontSize: "10px", textTransform: "uppercase" }} aria-label="Override reason" />
                  <button type="submit" className="btn-brutal-outline" style={{ fontSize: "10px", padding: "6px 12px", background: "var(--destructive)", color: "var(--destructive-foreground)", borderColor: "var(--border)" }}>OVERRIDE</button>
                </form>
                <form action={decideAgentAction}>
                  <input type="hidden" name="agentRunId" value={run.id} />
                  <input type="hidden" name="decision" value="defer" />
                  <button type="submit" className="btn-brutal-ghost" style={{ fontSize: "10px" }}>DEFER</button>
                </form>
              </div>
            </div>
          );
        })}

        {decided.length > 0 && (
          <div>
            <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "8px" }}>DECIDED</p>
            <div className="brutal-card" style={{ padding: "0" }}>
              {decided.map((run, i) => (
                <div key={run.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "8px 14px", borderBottom: i < decided.length - 1 ? "2px solid var(--border)" : "none", fontSize: "11px" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <span className="case-number" style={{ color: "var(--muted-text)", marginRight: "8px" }}>{run.id}</span>
                    {run.subject}
                  </span>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                    padding: "2px 8px", border: "2px solid var(--border)",
                    background: run.status === "approved" ? "var(--primary)" : run.status === "overridden" ? "var(--destructive)" : "var(--muted)",
                    color: run.status === "approved" ? "var(--primary-foreground)" : run.status === "overridden" ? "var(--destructive-foreground)" : "var(--ink)",
                  }}>
                    {run.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
