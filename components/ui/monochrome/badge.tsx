import * as React from "react";
import { cn } from "@/lib/utils";

// Mono outline chip — hairline border, mono caps. No fill colour; the one
// accent variant exists ONLY for post-seal verified state.
export function Badge({
  className,
  accent = false,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { accent?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[4px] border px-2 py-[3px] font-mono text-[9px] font-medium uppercase leading-none tracking-[0.18em]",
        accent
          ? "border-[var(--m-accent)] text-[var(--m-accent)]"
          : "border-[var(--m-line-strong)] text-[var(--m-ink-dim)]",
        className,
      )}
      {...props}
    />
  );
}
