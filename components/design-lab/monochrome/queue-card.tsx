"use client";

import * as React from "react";
import { Check, X, CalendarClock, ClipboardCheck, Sparkles, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/monochrome/badge";
import { Button } from "@/components/ui/monochrome/button";
import { Input } from "@/components/ui/monochrome/input";
import { Separator } from "@/components/ui/monochrome/separator";
import { jetbrainsMono } from "@/app/design-lab/monochrome/fonts";
import { SAMPLE } from "@/lib/design-lab/data";

type QueueItem = (typeof SAMPLE.queue)[number];

export type SealMode = "approved" | "overridden" | "deferred" | null;
export type SealState = { mode: Exclude<SealMode, null>; ledgerNo?: number } | null;

const kindMeta: Record<string, { label: string; icon: React.ReactNode }> = {
  "agr-1": { label: "Interview set", icon: <Sparkles size={12} strokeWidth={1.5} aria-hidden /> },
  "agr-2": { label: "Eligibility sweep", icon: <ClipboardCheck size={12} strokeWidth={1.5} aria-hidden /> },
  "agr-3": { label: "Schedule draft", icon: <CalendarClock size={12} strokeWidth={1.5} aria-hidden /> },
};

export function QueueCard({
  item,
  active,
  sealed,
  overriding,
  reason,
  onSelect,
  onApprove,
  onBeginOverride,
  onReasonChange,
  onConfirmOverride,
  onCancelOverride,
  onDefer,
}: {
  item: QueueItem;
  active: boolean;
  sealed: SealState;
  overriding: boolean;
  reason: string;
  onSelect: () => void;
  onApprove: () => void;
  onBeginOverride: () => void;
  onReasonChange: (v: string) => void;
  onConfirmOverride: () => void;
  onCancelOverride: () => void;
  onDefer: () => void;
}) {
  const meta = kindMeta[item.id];
  const conf = item.conf;
  const segs = [0, 1, 2, 3, 4].map((i) => i < Math.max(3, Math.min(5, Math.round(conf / 20))));
  const isSealed = sealed !== null;
  const reasonValid = reason.trim().length >= 8;

  return (
    <article
      aria-current={active ? "true" : undefined}
      onFocus={onSelect}
      data-card={item.id}
      className={`rounded-[8px] border bg-[var(--m-panel)] transition-colors ${
        active ? "border-[var(--m-line-strong)]" : "border-[var(--m-line)]"
      } ${sealed?.mode === "deferred" ? "opacity-55" : ""}`}
    >
      {/* card head */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--m-line)] px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className={`${active && !isSealed ? "text-[var(--m-ink)]" : "text-[var(--m-ink-faint)]"}`}
          >
            <ChevronRight size={13} strokeWidth={2} />
          </span>
          <Badge className="border-[var(--m-line-strong)]">
            <span className="text-[var(--m-ink-dim)]">{meta?.icon}</span>
            {meta?.label}
          </Badge>
          <span className={`${jetbrainsMono.className} truncate text-[9px] text-[var(--m-ink-faint)]`}>
            PVG-2026-{item.caseNo.slice(-4)} · {item.id}
          </span>
        </div>

        <div className="flex items-center gap-2" aria-label={`Confidence ${conf} percent`}>
          <span className={`${jetbrainsMono.className} text-[8px] uppercase text-[var(--m-ink-faint)]`}>
            conf
          </span>
          <span className="flex gap-[3px]" aria-hidden>
            {segs.map((on, i) => (
              <span
                key={i}
                className={`h-1.5 w-4 rounded-[2px] ${on ? "bg-[var(--m-ink)]" : "bg-[var(--m-panel-3)]"}`}
              />
            ))}
          </span>
          <span className={`${jetbrainsMono.className} text-[10px] font-semibold text-[var(--m-ink)] tabular-nums`}>
            {conf}
          </span>
        </div>
      </div>

      {/* body */}
      <div className="px-4 py-3.5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-[15px] font-semibold leading-snug tracking-[-0.01em] text-[var(--m-ink)]">
            {item.title}
          </h3>
          {isSealed && (
            <span
              className={`m-stamp ${jetbrainsMono.className} inline-flex shrink-0 items-center gap-1.5 rounded-[4px] border border-[var(--m-accent)] px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.2em] text-[var(--m-accent)]`}
            >
              {sealed.mode === "approved" && "Verified"}
              {sealed.mode === "overridden" && "Overridden · Logged"}
              {sealed.mode === "deferred" && "Deferred"}
              {sealed.ledgerNo !== undefined && (
                <span className="opacity-80">· #{sealed.ledgerNo}</span>
              )}
            </span>
          )}
        </div>

        <p className="mt-1 text-[11px] leading-snug text-[var(--m-ink-dim)]">
          <span className={`${jetbrainsMono.className} mr-1 text-[8px] uppercase tracking-[0.18em] text-[var(--m-ink-faint)]`}>
            why
          </span>
          {item.why}
        </p>

        {/* agr-1 — interview set */}
        {"lines" in item && item.lines && (
          <ol className="mt-3 divide-y divide-[var(--m-line)] border-y border-[var(--m-line)]">
            {item.lines.map((q, i) => (
              <li key={i} className="flex items-baseline gap-3 py-2 text-[12px] leading-snug text-[var(--m-ink)]">
                <span className={`${jetbrainsMono.className} text-[8px] text-[var(--m-ink-faint)]`}>
                  Q{i + 1}
                </span>
                {q}
              </li>
            ))}
          </ol>
        )}

        {/* agr-2 — barred candidates */}
        {"blocked" in item && item.blocked && (
          <ul className="mt-2 border-t border-[var(--m-line)]">
            {item.blocked.map((b) => (
              <li
                key={b}
                className="flex items-baseline gap-2 border-b border-[var(--m-line)] py-1.5 text-[10px]"
              >
                <X size={10} strokeWidth={2.5} aria-hidden className="translate-y-[1px] text-[var(--m-danger)]" />
                <span className={`${jetbrainsMono.className} text-[var(--m-danger)]`}>{b}</span>
              </li>
            ))}
          </ul>
        )}

        {/* agr-3 — clash + remedy */}
        {"clash" in item && item.clash && (
          <div className="mt-2">
            <p className={`rounded-[6px] border border-[var(--m-line)] bg-[var(--m-panel-2)] px-3 py-2 text-[10px] text-[var(--m-danger)]`}>
              <span className={`${jetbrainsMono.className} mr-1 text-[8px] uppercase tracking-[0.18em] text-[var(--m-ink-faint)]`}>
                clash
              </span>
              {item.clash}
            </p>
            {"suggestion" in item && item.suggestion && (
              <p className="mt-1.5 px-3 text-[10px] text-[var(--m-ink)]">
                <span className={`${jetbrainsMono.className} mr-1 text-[8px] uppercase tracking-[0.18em] text-[var(--m-ink-faint)]`}>
                  remedy
                </span>
                {item.suggestion}
              </p>
            )}
          </div>
        )}

        <Separator className="my-3 opacity-60" />

        {/* actions / override editor */}
        {!isSealed && !overriding && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="invert" size="md" onClick={onApprove} aria-label={`Approve ${meta?.label}`}>
              <Check size={13} strokeWidth={2.5} aria-hidden />
              Approve &amp; seal
            </Button>
            <Button variant="outline" size="md" onClick={onBeginOverride}>
              Override…
            </Button>
            <Button variant="ghost" size="md" onClick={onDefer}>
              Defer 24h
            </Button>
            <span
              className={`${jetbrainsMono.className} ml-auto hidden text-[8px] uppercase tracking-[0.2em] text-[var(--m-ink-faint)] lg:block`}
            >
              council 3/3
            </span>
          </div>
        )}

        {!isSealed && overriding && (
          <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (reasonValid) onConfirmOverride();
            }}
          >
            <Input
              autoFocus
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Why are you overriding? (min 8 chars, logged)"
              aria-label="Override reason"
              aria-invalid={reason.length > 0 && !reasonValid}
              aria-describedby={`override-hint-${item.id}`}
              className="max-w-xs"
            />
            <Button type="submit" variant="invert" size="md" disabled={!reasonValid}>
              Seal override
            </Button>
            <Button type="button" variant="ghost" size="md" onClick={onCancelOverride}>
              Cancel
            </Button>
            <p id={`override-hint-${item.id}`} className={`${jetbrainsMono.className} w-full text-[8px] uppercase tracking-[0.16em] text-[var(--m-ink-faint)]`}>
              {reason.trim().length}/8+ chars — every override is written to the audit ledger
            </p>
          </form>
        )}

        {isSealed && (
          <p className={`${jetbrainsMono.className} text-[9px] uppercase tracking-[0.2em] text-[var(--m-ink-faint)]`}>
            {sealed.mode === "approved" && "Sealed — written to ledger · no further action"}
            {sealed.mode === "overridden" && "Override sealed — reason countersigned at weekly review"}
            {sealed.mode === "deferred" && "Deferred — re-queues in 24h"}
          </p>
        )}
      </div>
    </article>
  );
}
