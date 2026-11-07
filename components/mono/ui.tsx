// Shared monochrome primitives for the product UI ("The Quiet Ledger" skin).
// Server-safe. Product pages compose these; the design-lab keeps its own copies.
import type { ReactNode } from "react";

export function MonoEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted">
      {children}
    </p>
  );
}

/** Hairline-separated KPI strip. No boxes — rules carry the structure. */
export function KpiStrip({
  items,
}: {
  items: { label: string; value: string | number; hint?: string }[];
}) {
  return (
    <dl className="grid grid-cols-2 border-y border-line md:grid-cols-4 md:divide-x md:divide-line">
      {items.map((k) => (
        <div key={k.label} className="px-4 py-3 first:pl-0 md:px-5">
          <dt className="font-mono text-[8px] uppercase leading-tight tracking-[0.22em] text-muted">
            {k.label}
          </dt>
          <dd className="mt-1.5 text-[24px] leading-none font-semibold tracking-[-0.02em] text-ink tabular-nums">
            {k.value}
          </dd>
          {k.hint && (
            <dd className="mt-1 font-mono text-[8px] text-muted">{k.hint}</dd>
          )}
        </div>
      ))}
    </dl>
  );
}

/** Segmented confidence meter — five mono bars, ink on graphite. */
export function SegmentMeter({
  value,
  label,
}: {
  /** 0–1 */
  value: number;
  label?: string;
}) {
  const filled = Math.max(0, Math.min(5, Math.round(value * 5)));
  return (
    <span className="flex items-center gap-2" aria-label={label ?? `Confidence ${Math.round(value * 100)} percent`}>
      <span className="flex gap-[3px]" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-1.5 w-4 rounded-[2px] ${i < filled ? "bg-ink" : "bg-panel-3"}`}
          />
        ))}
      </span>
      <span className="font-mono text-[10px] font-semibold text-ink tabular-nums">
        {Math.round(value * 100)}
      </span>
    </span>
  );
}

/** Kind chip — hairline outline, mono caps. Never filled with colour. */
export function KindChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[4px] border border-line-strong px-2 py-[3px] font-mono text-[8px] font-medium uppercase leading-none tracking-[0.2em] text-muted">
      {children}
    </span>
  );
}

/** Ledger stamp chip — violet ONLY for sealed/verified states. */
export function SealChip({
  tone,
  children,
}: {
  tone: "sealed" | "overridden" | "deferred";
  children: ReactNode;
}) {
  const cls =
    tone === "sealed"
      ? "border-ledger text-ledger"
      : tone === "overridden"
        ? "border-red text-red"
        : "border-line-strong text-muted";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-[4px] border px-2 py-1 font-mono text-[8px] font-semibold uppercase leading-none tracking-[0.2em] ${cls}`}
    >
      {children}
    </span>
  );
}

/** Rail panel with mono heading. */
export function RailPanel({
  id,
  title,
  right,
  children,
}: {
  id?: string;
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      id={id}
      className="scroll-mt-4 rounded-[8px] border border-line bg-panel p-4"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-mono text-[8px] uppercase tracking-[0.28em] text-muted">
          {title}
        </h2>
        {right && (
          <span className="font-mono text-[8px] text-muted">{right}</span>
        )}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

/** Dot-grid texture wrapper for hero zones (login, queue header). */
export function DotGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`m-dotgrid ${className}`}>{children}</div>;
}
