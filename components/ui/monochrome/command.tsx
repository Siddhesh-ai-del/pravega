"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "@/lib/utils";
import { inter, jetbrainsMono } from "@/app/design-lab/monochrome/fonts";

// NOTE: Radix portals mount on <body> — outside .mono-scope — so this file
// uses literal graphite values instead of the scoped CSS variables.
const C = {
  panel2: "#1a1a1d",
  panel3: "#202024",
  line: "#26262a",
  lineStrong: "#3a3a40",
  ink: "#ededea",
  inkDim: "#a6a6a2",
  inkFaint: "#6e6e6a",
} as const;

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-[8px] text-[#ededea]",
      className,
    )}
    style={{ background: C.panel2 }}
    {...props}
  />
));
Command.displayName = "Command";

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b border-[#26262a] px-3">
    <span aria-hidden className="mr-2 font-mono text-[11px] text-[#a6a6a2]">⌘</span>
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-12 w-full bg-transparent text-[13px] text-[#ededea] outline-none placeholder:text-[#6e6e6a] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = "CommandInput";

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-80 overflow-y-auto overflow-x-hidden p-2", className)}
    {...props}
  />
));
CommandList.displayName = "CommandList";

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-[#a6a6a2]"
    {...props}
  />
));
CommandEmpty.displayName = "CommandEmpty";

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[8px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.24em] [&_[cmdk-group-heading]]:text-[#6e6e6a]",
      className,
    )}
    {...props}
  />
));
CommandGroup.displayName = "CommandGroup";

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "flex cursor-pointer select-none items-center gap-2.5 rounded-[6px] px-2 py-2 text-[12px] text-[#a6a6a2] outline-none data-[selected=true]:bg-[#202024] data-[selected=true]:text-[#ededea] data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-35",
      className,
    )}
    {...props}
  />
));
CommandItem.displayName = "CommandItem";

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(`${jetbrainsMono.className} ml-auto text-[10px] text-[#6e6e6a]`, className)}
    {...props}
  />
);
CommandShortcut.displayName = "CommandShortcut";

function CommandDialog({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> & { className?: string }) {
  return (
    <DialogPrimitive.Root {...props}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/65" />
        <DialogPrimitive.Content
          className={cn(
            `${inter.className} mono-portal fixed left-1/2 top-[18%] z-50 w-[min(560px,92vw)] -translate-x-1/2 overflow-hidden rounded-[8px] border border-[#3a3a40] shadow-none`,
            className,
          )}
          style={{ background: C.panel2 }}
        >
          <DialogPrimitive.Title className="sr-only">Command palette</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Run an action on the decision queue
          </DialogPrimitive.Description>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
};
