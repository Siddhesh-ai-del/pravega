"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/auth";

const NAV: Record<Role, { href: string; label: string }[]> = {
  student: [
    { href: "/student", label: "My Ledger" },
    { href: "/student/mock-drive", label: "Mock Drive" },
    { href: "/student/learning-path", label: "Learning Path" },
    { href: "/student/drives", label: "My Drives" },
    { href: "/student/consent", label: "My Privacy" },
  ],
  officer: [
    { href: "/officer", label: "Decision Queue" },
    { href: "/officer/heatmap", label: "Cohort Heatmap" },
    { href: "/officer/rules", label: "Eligibility Rules" },
    { href: "/officer/fairness", label: "Fairness Check" },
    { href: "/officer/mail", label: "Mail Queue" },
    { href: "/officer/audit", label: "Audit Trail" },
  ],
  recruiter: [{ href: "/recruiter", label: "Talent Search" }],
  admin: [{ href: "/officer", label: "Decision Queue" }],
};

export function MobileNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = NAV[role] ?? [];
  return (
    <nav
      aria-label="Main"
      className="md:hidden flex items-center gap-2 overflow-x-auto border-b border-line bg-panel px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {items.map((item) => {
        const topLevel = item.href === "/student" || item.href === "/officer" || item.href === "/recruiter";
        const active = topLevel ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] transition-colors ${
              active
                ? "border-ink bg-ink font-semibold text-paper"
                : "border-line text-muted"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function NavRail({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = NAV[role] ?? [];
  return (
    <nav aria-label="Main" className="grid gap-0.5">
      {items.map((item) => {
        const topLevel = item.href === "/student" || item.href === "/officer" || item.href === "/recruiter";
        const active = topLevel ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2.5 rounded-[6px] px-3 py-2 text-[13px] leading-snug transition-colors ${
              active
                ? "bg-ink font-semibold text-paper"
                : "text-muted hover:bg-panel-2 hover:text-ink"
            }`}
          >
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${active ? "bg-paper" : "bg-line-strong"}`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
