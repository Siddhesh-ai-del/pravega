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

export function NavRail({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = NAV[role] ?? [];
  return (
    <nav aria-label="Main" className="grid gap-1">
      {items.map((item) => {
        const topLevel = item.href === "/student" || item.href === "/officer" || item.href === "/recruiter";
        const active = topLevel ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-2 border-l-2 px-3 py-2 text-[13px] leading-snug transition-colors ${
              active
                ? "border-probe bg-panel-2 font-medium text-ink"
                : "border-transparent text-muted hover:text-ink hover:bg-panel-2"
            }`}
          >
            <span
              aria-hidden
              className={`font-mono text-[10px] ${active ? "text-probe" : "text-line-strong group-hover:text-muted"}`}
            >
              ▍
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
