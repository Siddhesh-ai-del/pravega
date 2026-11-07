import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";

export default async function HeatmapPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "officer") redirect("/student");

  const signals = await db
    .select({
      branch: schema.cohortSignals.branch,
      skillId: schema.cohortSignals.skillId,
      weakShare: schema.cohortSignals.weakShare,
      placementRate: schema.cohortSignals.placementRate,
    })
    .from(schema.cohortSignals)
    .where(eq(schema.cohortSignals.tenantId, session.tenantId));

  const skillNames: Record<string, string> = { sql: "SQL", docker: "Docker", git: "Git" };
  const skillOrder = ["git", "sql", "docker"];
  const branches = [...new Set(signals.map((s) => s.branch))];
  const rateOf = (b: string) => signals.find((s) => s.branch === b)?.placementRate ?? 0;
  const cell = (b: string, s: string) => signals.find((x) => x.branch === b && x.skillId === s);
  const heatClass = (v: number) => (v >= 70 ? "heat-5" : v >= 50 ? "heat-4" : v >= 30 ? "heat-3" : v >= 15 ? "heat-2" : "heat-1");

  return (
    <AppShell session={session}>
      <header className="m-dotgrid border-b border-line px-4 pb-5 pt-5 md:px-8 md:pt-6">
        <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted">Cohort analytics · NAAC-ready</p>
        <h1 className="mt-2 max-w-[20ch] text-[32px] font-semibold leading-[1.08] tracking-[-0.03em] text-ink md:text-[38px]">The batch, at a glance</h1>
        <p className="mt-1 text-[13px] text-muted">Share of students weak per skill, measured from mock drives + verified evidence, not self-declaration.</p>
      </header>

      <div className="p-4 md:p-6 max-w-[1000px]">
        <div className="overflow-x-auto border border-line bg-panel">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-2 font-mono text-[10px] uppercase text-muted">Branch</th>
                {skillOrder.map((s) => (
                  <th key={s} className="px-4 py-2 font-mono text-[10px] uppercase text-muted">{skillNames[s]}</th>
                ))}
                <th className="px-4 py-2 font-mono text-[10px] uppercase text-muted">Placement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {branches.map((b) => (
                <tr key={b}>
                  <td className="px-4 py-2 font-medium text-[13px]">{b.replace("Engineering", "E")}</td>
                  {skillOrder.map((s) => {
                    const c = cell(b, s);
                    const v = c?.weakShare ?? 0;
                    return (
                      <td key={s} className="p-1">
                        <div className={`${heatClass(v)} h-12 flex items-center justify-center font-mono text-sm font-semibold border border-line/20`}>
                          {v}%
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-4 py-2 font-mono text-[13px]">{rateOf(b)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <a href="/api/export/accreditation" className="mt-3 inline-flex items-center gap-2 rounded-[6px] bg-probe px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-paper hover:bg-white">
          Export NAAC outcomes (CSV) ↓
        </a>
        <div className="mt-4 grid md:grid-cols-2 gap-3">
          <div className="border border-amber/40 bg-amber-wash p-3 text-[13px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber">Signal</p>
            <p className="mt-1"><b>SQL is the bottleneck for backend roles.</b> 60% of CSE batch weak; both must-fix drives on the calendar (Nimbus, Zen Financial) test SQL.</p>
          </div>
          <div className="border border-line bg-panel p-3 text-[13px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-probe">Recommended action</p>
            <p className="mt-1">Book <b>one SQL workshop before Nov 6 drive</b> and gate Nimbus eligibility sweep re-run on attendance.</p>
          </div>
        </div>

        <p className="mt-4 font-mono text-[10px] text-muted">NAAC/NIRF export: Accreditation suite writes these exact numbers to the report template — no manual collation.</p>
      </div>
    </AppShell>
  );
}
