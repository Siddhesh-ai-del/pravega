import { MonoSidebar } from "@/components/design-lab/monochrome/sidebar";
import { MonoTopBar } from "@/components/design-lab/monochrome/topbar";
import { MonoKpiStrip } from "@/components/design-lab/monochrome/kpi-strip";
import { MonoDecisionQueue } from "@/components/design-lab/monochrome/decision-queue";
import { MonoHeatmap } from "@/components/design-lab/monochrome/heatmap";
import { MonoLedgerRail } from "@/components/design-lab/monochrome/ledger-rail";
import { SAMPLE } from "@/lib/design-lab/data";
import { jetbrainsMono } from "./fonts";

export default function QuietLedgerDemo() {
  const s = SAMPLE;
  return (
    <div className="m-dotgrid flex min-h-screen">
      <MonoSidebar />

      <div className="min-w-0 flex-1">
        <MonoTopBar />

        <main className="px-4 pb-8 pt-4 md:px-7 md:pt-5">
          {/* title row */}
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[var(--m-line)] pb-4">
            <div>
              <p
                className={`${jetbrainsMono.className} text-[9px] uppercase tracking-[0.32em] text-[var(--m-ink-dim)]`}
              >
                ◈ Nimbus Tech — Backend Dev drive
              </p>
              <h1 className="mt-2 text-[32px] font-semibold leading-none tracking-[-0.03em] text-[var(--m-ink)] md:text-[38px]">
                Decision Queue
              </h1>
              <p className="mt-2 max-w-[52ch] text-[12px] leading-snug text-[var(--m-ink-dim)]">
                Agents propose. You dispose. Every sign-off appends to the ledger —
                appended, never edited.
              </p>
            </div>

            <div
              className="flex items-center gap-5 rounded-[8px] border border-[var(--m-line)] bg-[var(--m-panel)] px-5 py-3"
              aria-label="Queue summary"
            >
              <div>
                <p className={`${jetbrainsMono.className} text-[8px] uppercase tracking-[0.24em] text-[var(--m-ink-faint)]`}>
                  Pending
                </p>
                <p className="mt-1 text-[26px] leading-none font-semibold tabular-nums text-[var(--m-ink)]">
                  {s.pending}
                </p>
              </div>
              <div aria-hidden className="h-9 w-px bg-[var(--m-line)]" />
              <div>
                <p className={`${jetbrainsMono.className} text-[8px] uppercase tracking-[0.24em] text-[var(--m-ink-faint)]`}>
                  Oldest
                </p>
                <p className="mt-1 text-[26px] leading-none font-semibold tabular-nums text-[var(--m-ink)]">
                  2h<span className="text-[15px]"> 41m</span>
                </p>
              </div>
            </div>
          </div>

          {/* KPI strip */}
          <div className="mt-4">
            <MonoKpiStrip />
          </div>

          {/* main grid */}
          <div className="mt-5 grid gap-4 xl:grid-cols-12">
            <div className="xl:col-span-8">
              <MonoDecisionQueue />
            </div>

            <aside aria-label="Evidence and fairness" className="space-y-4 xl:col-span-4">
              <MonoHeatmap />
              <MonoLedgerRail />
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
