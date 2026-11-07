"use client";

import { Toaster as SonnerToaster, type ToasterProps } from "sonner";
import { inter } from "@/app/design-lab/monochrome/fonts";

// Rendered in a body-level portal (outside .mono-scope) → literal graphite.
export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            `${inter.className} mono-portal !rounded-[6px] !border !border-[#3a3a40] !bg-[#1a1a1d] !text-[#ededea] !shadow-none`,
          title: "!text-[12px] !font-medium",
          description: "!text-[11px] !text-[#a6a6a2]",
          icon: "!text-[#a78bfa]",
        },
      }}
      {...props}
    />
  );
}
