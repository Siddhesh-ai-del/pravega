import * as React from "react";
import { cn } from "@/lib/utils";

export function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
}: {
  className?: string;
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}) {
  return (
    <div
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        "shrink-0 bg-[var(--m-line)]",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
    />
  );
}
