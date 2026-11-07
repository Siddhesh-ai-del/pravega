import {
  Layers,
  Grid3x3,
  SlidersHorizontal,
  Scale,
  ListChecks,
  LogOut,
} from "lucide-react";
import { SAMPLE } from "@/lib/design-lab/data";
import { jetbrainsMono } from "@/app/design-lab/monochrome/fonts";

const navIcons: Record<string, React.ReactNode> = {
  "Decision Queue": <Layers size={15} strokeWidth={1.5} aria-hidden />,
  "Cohort Heatmap": <Grid3x3 size={15} strokeWidth={1.5} aria-hidden />,
  "Eligibility Rules": <SlidersHorizontal size={15} strokeWidth={1.5} aria-hidden />,
  "Fairness Check": <Scale size={15} strokeWidth={1.5} aria-hidden />,
  "Audit Trail": <ListChecks size={15} strokeWidth={1.5} aria-hidden />,
};

// Static (server) sidebar. Pure presentation; no interactivity needed here.
export function MonoSidebar() {
  const s = SAMPLE;
  return (
    <aside className="hidden md:flex w-[236px] shrink-0 flex-col border-r border-[var(--m-line)] bg-[var(--m-panel)]">
      {/* lockup */}
      <div className="border-b border-[var(--m-line)] px-5 pb-5 pt-6">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-[6px] bg-[var(--m-invert-bg)]"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path
                d="M2.2 6.9 5.2 9.7 10.8 3.3"
                stroke="var(--m-invert-ink)"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <p className="text-[16px] font-semibold leading-none tracking-[-0.02em] text-[var(--m-ink)]">
              Pravega<span className="text-[var(--m-ink-dim)]">.</span>
            </p>
            <p
              className={`${jetbrainsMono.className} mt-1 text-[8px] uppercase leading-tight tracking-[0.26em] text-[var(--m-ink-faint)]`}
            >
              Verifying ledger
            </p>
          </div>
        </div>
      </div>

      {/* nav */}
      <nav aria-label="Main" className="px-3 py-4">
        <p
          className={`${jetbrainsMono.className} px-2 text-[8px] uppercase tracking-[0.28em] text-[var(--m-ink-faint)]`}
        >
          Console
        </p>
        <ul className="mt-2 space-y-0.5">
          {s.nav.map((item) => {
            const active = item.active;
            return (
              <li key={item.label}>
                <a
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2.5 rounded-[6px] px-2.5 py-[7px] text-[13px] transition-colors ${
                    active
                      ? "bg-[var(--m-invert-bg)] font-semibold text-[var(--m-invert-ink)]"
                      : "text-[var(--m-ink-dim)] hover:bg-[var(--m-panel-2)] hover:text-[var(--m-ink)]"
                  }`}
                >
                  <span className={active ? "text-[var(--m-invert-ink)]" : "text-[var(--m-ink-faint)]"}>
                    {navIcons[item.label]}
                  </span>
                  {item.label}
                  {active && (
                    <span
                      className={`${jetbrainsMono.className} ml-auto rounded-[4px] border border-[var(--m-invert-ink)]/20 px-1.5 py-0.5 text-[9px] font-semibold tabular-nums`}
                    >
                      03
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* footer identity */}
      <div className="mt-auto border-t border-[var(--m-line)] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-full border border-[var(--m-line-strong)] text-[10px] font-semibold text-[var(--m-ink)]"
          >
            AD
          </span>
          <div className="min-w-0">
            <p className="text-[12px] font-medium leading-tight text-[var(--m-ink)]">
              Anjali Deshmukh
            </p>
            <p
              className={`${jetbrainsMono.className} mt-0.5 text-[8px] uppercase tracking-[0.2em] text-[var(--m-ink-faint)]`}
            >
              T&amp;P Officer · Signatory
            </p>
          </div>
        </div>
        <button
          type="button"
          className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-[var(--m-ink-faint)] underline-offset-4 transition-colors hover:text-[var(--m-ink)] hover:underline"
        >
          <LogOut size={11} strokeWidth={1.5} aria-hidden />
          Sign out
        </button>
      </div>
    </aside>
  );
}
