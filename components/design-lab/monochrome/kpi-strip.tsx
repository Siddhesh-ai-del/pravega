import { SAMPLE } from "@/lib/design-lab/data";
import { jetbrainsMono } from "@/app/design-lab/monochrome/fonts";

// Hairline-separated KPI strip. No boxes — rules carry the structure.
export function MonoKpiStrip() {
  const s = SAMPLE;
  return (
    <dl className="grid grid-cols-2 border-y border-[var(--m-line)] md:grid-cols-4 md:divide-x md:divide-[var(--m-line)]">
      {s.kpis.map((k) => (
        <div key={k.label} className="px-4 py-3 first:pl-0 md:px-5">
          <dt
            className={`${jetbrainsMono.className} text-[8px] uppercase leading-tight tracking-[0.22em] text-[var(--m-ink-faint)]`}
          >
            {k.label}
          </dt>
          <dd className="mt-1.5 text-[24px] leading-none font-semibold tracking-[-0.02em] text-[var(--m-ink)] tabular-nums">
            {k.value}
          </dd>
          <dd
            className={`${jetbrainsMono.className} mt-1 text-[8px] ${
              k.up === true ? "text-[var(--m-ink)]" : "text-[var(--m-ink-dim)]"
            }`}
          >
            {k.delta}
          </dd>
        </div>
      ))}
    </dl>
  );
}
