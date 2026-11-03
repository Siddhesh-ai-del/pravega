import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, type Session } from "@/lib/auth";
import { NavRail } from "./nav";

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

export async function AppShell({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[232px_1fr]">
      {/* rail */}
      <aside className="hidden md:flex md:flex-col border-r border-line bg-panel">
        <div className="border-b border-line px-4 py-4">
          <a href="/" className="block" aria-label="Pravega home">
            <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              VPPCOE · T&amp;P Cell
            </span>
            <span className="mt-1 block text-xl font-semibold leading-none">
              Pravega<span className="text-ledger">.</span>
            </span>
          </a>
        </div>
        <div className="p-3">
          <p className="px-3 pb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            {roleLabel[session.role]}
          </p>
          <NavRail role={session.role} />
        </div>
        <div className="mt-auto border-t border-line p-4">
          <p className="text-[12px] font-medium leading-tight">{session.name}</p>
          <p className="font-mono text-[10px] text-muted mt-0.5">tenant: vpcoe</p>
          <form action={signOut} className="mt-3">
            <button type="submit" className="text-[12px] text-muted underline underline-offset-2 hover:text-ink">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* mobile top bar */}
      <header className="md:hidden sticky top-0 z-20 flex items-center justify-between border-b border-line bg-panel px-4 py-2">
        <a href="/" className="font-semibold">
          Pravega<span className="text-ledger">.</span>
        </a>
        <form action={signOut}>
          <button type="submit" className="text-[12px] text-muted underline underline-offset-2">
            Sign out
          </button>
        </form>
      </header>

      {/* content */}
      <main className="min-w-0">{children}</main>
    </div>
  );
}
