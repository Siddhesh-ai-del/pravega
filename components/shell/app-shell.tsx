import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, type Session } from "@/lib/auth";
import { NavRail, MobileNav } from "./nav";

async function signOut() {
  "use server";
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/login");
}

const roleLabel: Record<Session["role"], string> = {
  student: "Student",
  officer: "T&P Officer",
  recruiter: "Recruiter",
  admin: "Admin",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export async function AppShell({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  return (
    <div className="m-dotgrid min-h-screen md:grid md:grid-cols-[236px_1fr]">
      {/* rail */}
      <aside className="hidden md:flex md:flex-col border-r border-line bg-panel">
        <div className="border-b border-line px-5 py-5">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Pravega home">
            <span
              aria-hidden
              className="grid h-8 w-8 shrink-0 place-items-center rounded-[6px] bg-ink"
            >
              <svg width="15" height="15" viewBox="0 0 13 13" fill="none">
                <path
                  d="M2.2 6.9 5.2 9.7 10.8 3.3"
                  stroke="var(--paper)"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>
              <span className="block text-[20px] font-semibold leading-none tracking-[-0.02em] text-ink">
                Pravega<span className="text-ledger">.</span>
              </span>
              <span className="mt-1 block font-mono text-[7px] uppercase tracking-[0.3em] text-muted">
                Verifying Ledger
              </span>
            </span>
          </Link>
        </div>
        <div className="p-3">
          <p className="px-3 pb-1.5 font-mono text-[8px] uppercase tracking-[0.28em] text-muted">
            {roleLabel[session.role]}
          </p>
          <NavRail role={session.role} />
        </div>
        <div className="mt-auto border-t border-line p-4">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="grid h-9 w-9 place-items-center rounded-full border border-line-strong text-[10px] font-semibold text-ink"
            >
              {initials(session.name)}
            </span>
            <span className="min-w-0">
              <span className="block text-[12px] font-medium leading-tight text-ink">
                {session.name}
              </span>
              <span className="mt-0.5 block font-mono text-[8px] uppercase tracking-[0.18em] text-muted">
                tenant · {session.tenantId}
              </span>
            </span>
          </div>
          <form action={signOut} className="mt-3">
            <button
              type="submit"
              className="text-[11px] text-muted underline underline-offset-2 hover:text-ink transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* mobile top bar */}
      <header className="md:hidden sticky top-0 z-20 flex items-center justify-between border-b border-line bg-panel/95 backdrop-blur px-4 py-2.5">
        <Link href="/" className="flex items-baseline gap-2" aria-label="Pravega home">
          <span className="text-[18px] font-semibold tracking-[-0.02em] text-ink">
            Pravega<span className="text-ledger">.</span>
          </span>
          <span className="font-mono text-[8px] uppercase tracking-[0.24em] text-muted">
            Verifying Ledger
          </span>
        </Link>
        <form action={signOut}>
          <button type="submit" className="text-[11px] text-muted underline underline-offset-2 hover:text-ink">
            Sign out
          </button>
        </form>
      </header>

      {/* mobile nav — the rail is desktop-only; this restores 375px navigation */}
      <MobileNav role={session.role} />

      {/* content */}
      <main className="min-w-0">{children}</main>
    </div>
  );
}
