"use client";

import { ShieldCheck, FileDown, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/monochrome/button";
import { jetbrainsMono } from "@/app/design-lab/monochrome/fonts";

// Fairness certificate + ledger invariant + export. Client: export fires a toast.
export function MonoLedgerRail() {
  return (
    <>
      <div
        id="rail-fairness"
        className="scroll-mt-4 rounded-[8px] border border-[var(--m-line)] bg-[var(--m-panel)] p-4"
      >
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-[6px] border border-[var(--m-line-strong)] text-[var(--m-ink)]"
          >
            <ShieldCheck size={15} strokeWidth={1.5} />
          </span>
          <div>
            <p className="text-[12px] font-semibold text-[var(--m-ink)]">Fairness passed</p>
            <p className={`${jetbrainsMono.className} mt-0.5 text-[8px] uppercase tracking-[0.16em] text-[var(--m-ink-dim)]`}>
              parity 0.91 · χ² p = 0.44 · n = 7
            </p>
          </div>
        </div>
        <p className="mt-2.5 text-[10px] leading-snug text-[var(--m-ink-dim)]">
          No cohort skew across the 7 shortlisted candidates. Overrides require a written reason
          and surface at the weekly audit review.
        </p>
      </div>

      <div
        id="rail-ledger"
        className="scroll-mt-4 rounded-[8px] border border-[var(--m-line)] bg-[var(--m-panel)] p-4"
      >
        <h2 className={`${jetbrainsMono.className} text-[8px] uppercase tracking-[0.28em] text-[var(--m-ink-faint)]`}>
          Ledger invariant
        </h2>
        <p className="mt-2 text-[10px] leading-relaxed text-[var(--m-ink-dim)]">
          Approves are one-way. The trail is append-only and SHA-chained — reversals are new
          entries, never edits. Exports carry the NAAC / NIRF verification seal.
        </p>
        <Button
          variant="invert"
          size="md"
          className="mt-3 w-full"
          onClick={() =>
            toast("Audit pack queued · demo", {
              description: "NAAC / NIRF sealed export · append-only proof included",
            })
          }
        >
          <FileDown size={13} strokeWidth={2} aria-hidden />
          Export audit pack
        </Button>
        <p className={`${jetbrainsMono.className} mt-2 flex items-center gap-1.5 text-[7px] uppercase tracking-[0.2em] text-[var(--m-ink-faint)]`}>
          <Lock size={9} strokeWidth={1.5} aria-hidden />
          SHA-chained · countersigned weekly
        </p>
      </div>
    </>
  );
}
