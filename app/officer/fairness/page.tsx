import { desc, eq } from "drizzle-orm";
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
      <header className="m-dotgrid border-b border-line px-4 pb-5 pt-5 md:px-8 md:pt-6">
        <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted">Fairness · four-fifths rule</p>
        <h1 className="mt-2 max-w-[20ch] text-[32px] font-semibold leading-[1.08] tracking-[-0.03em] text-ink md:text-[38px]">Shortlist parity scan</h1>
        <p className="mt-1 text-[13px] text-muted max-w-[68ch]">Adverse-impact screen per drive. Any segment below <b>80% of the reference rate</b> is flagged for human review — the system never disqualifies by itself. Review decision is recorded, not hidden.</p>
      </header>

      <div className="p-4 md:p-6 max-w-[920px] grid gap-5">
        {!report && <p className="text-muted">No fairness reports yet. Run a sweep from the Decision Queue.</p>}
        {report && (
          <>
            <div className="border border-line bg-panel">
              <div className="flex items-center justify-between border-b border-line px-4 py-2">
                <div>
                  <h2 className="font-semibold">Zen Financial — QA Engineer</h2>
                  <p className="font-mono text-[10px] text-muted">report {report.id} · drive {report.driveId}</p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-red border border-red/40 bg-red-wash px-2 py-0.5">1 flag open</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-[13px]">
                  <thead className="font-mono text-[10px] uppercase text-muted text-left">
                    <tr className="border-b border-line"><th className="px-4 py-1.5">Segment</th><th className="px-4 py-1.5">Group</th><th className="px-4 py-1.5">Applicants</th><th className="px-4 py-1.5">Shortlist rate</th></tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {Object.entries(segments).flatMap(([segment, groups]) =>
                      Object.entries(groups).map(([group, seg]) => (
                        <tr key={`${segment}-${group}`}>
                          <td className="px-4 py-2 font-mono text-[11px] text-muted uppercase">{segment}</td>
                          <td className="px-4 py-2">{group}</td>
                          <td className="px-4 py-2 font-mono">{seg.applicants}</td>
                          <td className="px-4 py-2 font-mono">{seg.shortlistRate}%</td>
                      </tr>
                    )),
                  )}
                </tbody>
                </table>
              </div>
            </div>

            {findings.map((f, i) => (
              <div key={i} className="border border-red/40 bg-red-wash p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-red">Flag {i + 1} · {f.segment}</p>
                <p className="mt-1 text-[13px]">{f.flag}</p>
                <p className="mt-2 font-mono text-[10px] text-muted">four-fifths benchmark: ratio ≥ {f.benchmark} · measured {f.ratio}</p>
                <form action={recordFairnessReview} className="mt-3 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="reportId" value={report.id} />
                  <select name="outcome" className="border border-line bg-panel px-2 py-1.5 text-[12px]" defaultValue="needs-discussion">
                    <option value="needs-discussion">Needs discussion at T&amp;P</option>
                    <option value="escalated">Escalate to employer + DPO</option>
                    <option value="logged-ok">Logged, explainable, no action</option>
                  </select>
                  <button type="submit" className="border border-red text-red px-3 py-1.5 text-[12px] font-medium hover:bg-red-wash">Record review outcome</button>
                </form>
              </div>
            ))}

            <p className="font-mono text-[10px] text-muted">The review outcome is written to the append-only audit trail. Model never auto-rejects a candidate segment.</p>
          </>
        )}
      </div>
    </AppShell>
  );
}
