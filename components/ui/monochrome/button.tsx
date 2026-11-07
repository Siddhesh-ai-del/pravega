import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Direction 06 — "The Quiet Ledger". Single-hue graphite + one violet accent.
// Buttons: Approve = INVERTED NEUTRAL, never violet. Violet is reserved for
// verified/approved state semantics and the focus ring.
const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-[6px] text-[12.5px] font-medium transition-colors outline-none disabled:pointer-events-none disabled:opacity-45 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        invert:
          "bg-[var(--m-invert-bg)] text-[var(--m-invert-ink)] hover:bg-white",
        outline:
          "border border-[var(--m-line-strong)] text-[var(--m-ink)] hover:bg-[var(--m-panel-2)]",
        ghost:
          "text-[var(--m-ink-dim)] hover:text-[var(--m-ink)] hover:bg-[var(--m-panel-2)]",
        subtle:
          "border border-[var(--m-line)] bg-[var(--m-panel-2)] text-[var(--m-ink)] hover:border-[var(--m-line-strong)]",
      },
      size: {
        sm: "h-7 px-3 text-[11.5px]",
        md: "h-9 px-4",
      },
    },
    defaultVariants: { variant: "invert", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type = "button", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
