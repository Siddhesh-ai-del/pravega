import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-8 w-full rounded-[6px] border border-[var(--m-line)] bg-[var(--m-panel-3)] px-3 text-[12px] text-[var(--m-ink)] outline-none transition-colors placeholder:text-[var(--m-ink-faint)] hover:border-[var(--m-line-strong)] focus:border-[var(--m-accent)]",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
