"use client";

import { Search, Slash } from "lucide-react";
import { SAMPLE } from "@/lib/design-lab/data";
import { jetbrainsMono } from "@/app/design-lab/monochrome/fonts";

// Client top bar. The ⌘K affordance dispatches a palette toggle that the queue
// listens for (keeps palette state inside the interactive queue boundary).
export function MonoTopBar() {
  const s = SAMPLE;
  const togglePalette = () => window.dispatchEvent(new CustomEvent("pravega:toggle-palette"));
  return (
    <>
      <header className="flex items-center justify-between gap-3 border-b border-[var(--m-line)] px-4 py-2.5 md:px-7">
        <p className={`${jetbrainsMono.className} min-w-0 truncate text-[10px] text-[var(--m-ink-faint)]`}>
          <span className="text-[var(--m-ink-dim)]">placement</span> / nimbus-tech /{" "}
          <span className="text-[var(--m-ink)]">decision-queue</span>
        </p>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={togglePalette}
            aria-label="Open command palette (Control K)"
            className="flex h-8 w-40 items-center gap-2 rounded-[6px] border border-[var(--m-line)] bg-[var(--m-panel-2)] px-2.5 text-left text-[11px] text-[var(--m-ink-dim)] transition-colors hover:border-[var(--m-line-strong)] hover:text-[var(--m-ink)] sm:w-56"
          >
            <Search size={12} strokeWidth={1.5} aria-hidden />
            <span className="hidden truncate sm:inline">Search cases, students, rules…</span>
            <kbd
              className={`${jetbrainsMono.className} ml-auto rounded-[4px] border border-[var(--m-line-strong)] px-1.5 py-0.5 text-[9px] text-[var(--m-ink-dim)]`}
            >
              ⌘K
            </kbd>
          </button>

          <span className="flex items-center gap-1.5 rounded-full border border-[var(--m-line)] py-1 pl-2 pr-2.5">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--m-accent)]" />
            <span className={`${jetbrainsMono.className} text-[8px] uppercase tracking-[0.2em] text-[var(--m-ink-dim)]`}>
              Live
            </span>
          </span>

          <span className={`${jetbrainsMono.className} hidden text-[9px] text-[var(--m-ink-faint)] lg:inline`}>
            2026-11-04 · 09:40 IST
          </span>
        </div>
      </header>

      {/* mobile nav — horizontal scroll, same five destinations */}
      <div className="flex md:hidden items-center gap-2 overflow-x-auto border-b border-[var(--m-line)] px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {s.nav.map((item) => (
          <a
            key={item.label}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] ${
              item.active
                ? "border-[var(--m-invert-bg)] bg-[var(--m-invert-bg)] font-semibold text-[var(--m-invert-ink)]"
                : "border-[var(--m-line)] text-[var(--m-ink-dim)]"
            }`}
          >
            {item.active && <Slash size={9} strokeWidth={2.5} aria-hidden />}
            {item.label}
          </a>
        ))}
      </div>
    </>
  );
}
