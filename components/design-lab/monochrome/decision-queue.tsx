"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Check,
  FileDown,
  Flame,
  ListChecks,
  ShieldCheck,
  PenLine,
} from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/monochrome/command";
import { Toaster } from "@/components/ui/monochrome/sonner";
import { QueueCard, type SealState } from "./queue-card";
import { jetbrainsMono } from "@/app/design-lab/monochrome/fonts";
import { SAMPLE } from "@/lib/design-lab/data";

// Client boundary: owns selection state, seal flow, ⌘K palette, toasts.
export function MonoDecisionQueue() {
  const s = SAMPLE;
  const items = s.queue;
  const [active, setActive] = React.useState(0);
  const [sealed, setSealed] = React.useState<Record<string, SealState>>({});
  const [overridingId, setOverridingId] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState("");
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const ledgerCounter = React.useRef(1205);

  const activeItem = items[active];
  const firstSealable = items.findIndex((i) => !sealed[i.id]);

  const seal = React.useCallback(
    (id: string, mode: "approved" | "overridden") => {
      setSealed((prev) => ({
        ...prev,
        [id]: { mode, ledgerNo: ledgerCounter.current++ },
      }));
      setOverridingId(null);
      setReason("");
      toast(
        mode === "approved"
          ? "Sealed → audit ledger · demo"
          : "Override sealed → ledger · reason logged · demo",
        { description: `Case PVG-2026 · ${id} · appended, never edited` },
      );
    },
    [],
  );

  const defer = React.useCallback((id: string) => {
    setSealed((prev) => ({ ...prev, [id]: { mode: "deferred" } }));
    toast("Deferred · re-queues +24h · demo", {
      description: `Case PVG-2026 · ${id} · no ledger entry written`,
    });
  }, []);

  const exportPack = React.useCallback(() => {
    toast("Audit pack queued · demo", {
      description: "NAAC / NIRF sealed export · append-only proof included",
    });
  }, []);

  const scrollTo = React.useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const beginOverride = React.useCallback((id: string) => {
    setOverridingId(id);
    setReason("");
  }, []);

  // ── palette toggle from the top bar ─────────────────────────────────────
  React.useEffect(() => {
    const toggle = () => setPaletteOpen((v) => !v);
    window.addEventListener("pravega:toggle-palette", toggle);
    return () => window.removeEventListener("pravega:toggle-palette", toggle);
  }, []);

  // ── keyboard: ↑↓ navigate · A approve · O override · D defer · ⌘K palette ──
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement | null;
      const inField =
        target &&
        (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable);

      if (mod && (e.key === "k" || e.key === "K" || e.key === "p" || e.key === "P")) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }
      if (inField || e.altKey) return;

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => {
          const delta = e.key === "ArrowDown" ? 1 : -1;
          return (i + delta + items.length) % items.length;
        });
        return;
      }
      const id = items[active]?.id;
      if (!id || sealed[id]) return;
      const k = e.key.toLowerCase();
      if (k === "a") {
        e.preventDefault();
        seal(id, "approved");
      } else if (k === "o") {
        e.preventDefault();
        beginOverride(id);
      } else if (k === "d") {
        e.preventDefault();
        defer(id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, items, sealed, seal, defer, beginOverride]);

  return (
    <section aria-label="Decision queue proposals" className="min-w-0 space-y-3">
      {items.map((item, i) => {
        const state = sealed[item.id] ?? null;
        return (
          <QueueCard
            key={item.id}
            item={item}
            active={i === active}
            sealed={state}
            overriding={overridingId === item.id}
            reason={overridingId === item.id ? reason : ""}
            onSelect={() => setActive(i)}
            onApprove={() => seal(item.id, "approved")}
            onBeginOverride={() => beginOverride(item.id)}
            onReasonChange={setReason}
            onConfirmOverride={() => {
              if (reason.trim().length >= 8) seal(item.id, "overridden");
            }}
            onCancelOverride={() => {
              setOverridingId(null);
              setReason("");
            }}
            onDefer={() => defer(item.id)}
          />
        );
      })}

      <p
        className={`${jetbrainsMono.className} hidden items-center gap-3 px-1 text-[8px] uppercase tracking-[0.2em] text-[var(--m-ink-faint)] md:flex`}
      >
        <kbd className="rounded-[4px] border border-[var(--m-line-strong)] px-1.5 py-0.5">↑↓</kbd> navigate
        <kbd className="rounded-[4px] border border-[var(--m-line-strong)] px-1.5 py-0.5">A</kbd> approve
        <kbd className="rounded-[4px] border border-[var(--m-line-strong)] px-1.5 py-0.5">O</kbd> override
        <kbd className="rounded-[4px] border border-[var(--m-line-strong)] px-1.5 py-0.5">D</kbd> defer
        <kbd className="rounded-[4px] border border-[var(--m-line-strong)] px-1.5 py-0.5">⌘K</kbd> palette
      </p>

      {/* ⌘K command palette */}
      <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <Command label="Decision queue command palette">
          <CommandInput placeholder="Type a command — approve, override, export…" />
          <CommandList>
            <CommandEmpty>No matching command</CommandEmpty>
            <CommandGroup heading="Seal a proposal">
              {items.map((item) => (
                <CommandItem
                  key={`approve-${item.id}`}
                  disabled={Boolean(sealed[item.id])}
                  onSelect={() => {
                    setPaletteOpen(false);
                    seal(item.id, "approved");
                  }}
                >
                  <Check size={13} strokeWidth={2} aria-hidden className="text-[var(--m-ink-dim)]" />
                  Approve {item.id} — {item.kind.toLowerCase()}
                  <CommandShortcut>seal</CommandShortcut>
                </CommandItem>
              ))}
              {items.map((item) => (
                <CommandItem
                  key={`override-${item.id}`}
                  disabled={Boolean(sealed[item.id])}
                  onSelect={() => {
                    setPaletteOpen(false);
                    beginOverride(item.id);
                  }}
                >
                  <PenLine size={13} strokeWidth={1.5} aria-hidden className="text-[var(--m-ink-dim)]" />
                  Override {item.id} with reason…
                  <CommandShortcut>reason</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Navigate">
              <CommandItem onSelect={() => { setPaletteOpen(false); scrollTo("rail-heat"); }}>
                <Flame size={13} strokeWidth={1.5} aria-hidden className="text-[var(--m-ink-dim)]" />
                Jump to cohort heatmap
                <CommandShortcut>rail</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => { setPaletteOpen(false); scrollTo("rail-fairness"); }}>
                <ShieldCheck size={13} strokeWidth={1.5} aria-hidden className="text-[var(--m-ink-dim)]" />
                Jump to fairness certificate
                <CommandShortcut>rail</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => { setPaletteOpen(false); scrollTo("rail-ledger"); }}>
                <ListChecks size={13} strokeWidth={1.5} aria-hidden className="text-[var(--m-ink-dim)]" />
                Jump to ledger invariant
                <CommandShortcut>rail</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Export">
              <CommandItem onSelect={() => { setPaletteOpen(false); exportPack(); }}>
                <FileDown size={13} strokeWidth={1.5} aria-hidden className="text-[var(--m-ink-dim)]" />
                Export audit pack
                <CommandShortcut>NAAC</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>

      <Toaster />
      <span className="sr-only" aria-live="polite">
        {sealed[activeItem?.id ?? ""] ? "Card sealed" : ""}
      </span>
      {firstSealable === -1 && (
        <p className={`${jetbrainsMono.className} px-1 text-[9px] uppercase tracking-[0.2em] text-[var(--m-accent)]`}>
          All three proposals sealed · queue clear
        </p>
      )}
    </section>
  );
}
