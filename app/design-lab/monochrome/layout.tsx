import type { Metadata } from "next";
import { inter } from "./fonts";

export const metadata: Metadata = {
  title: "Pravega — The Quiet Ledger (Direction 06)",
  description:
    "Monochromatic graphite registry, hairline rules, one violet reserved for the verified seal.",
};

export default function MonochromeLayout({ children }: { children: React.ReactNode }) {
  // .mono-scope carries the graphite token set (app/globals.css); Inter sets
  // the UI face for the whole subtree. Product tokens stay untouched.
  return <div className={`mono-scope ${inter.className} min-h-screen`}>{children}</div>;
}
