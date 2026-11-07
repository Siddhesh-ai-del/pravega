"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import { jetbrainsMono } from "@/app/design-lab/monochrome/fonts";

// Portal → body → literal graphite (outside .mono-scope).
export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      `${jetbrainsMono.className} z-50 max-w-[16rem] rounded-[6px] border border-[#3a3a40] bg-[#1a1a1d] px-2.5 py-1.5 text-[10px] leading-snug text-[#ededea]`,
      className,
    )}
    {...props}
  />
));
TooltipContent.displayName = "TooltipContent";
