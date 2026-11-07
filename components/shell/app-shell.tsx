import Link from "next/link";
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
  student: "STUDENT",
  officer: "T&P OFFICER",
  recruiter: "RECRUITER",
  admin: "ADMIN",
};

export async function AppShell({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      {/* rail — black, heavy left border */}
      <aside className="hidden md:flex md:flex-col bg-secondary text-secondary-foreground border-r-4 border-border">
        <div className="border-b-4 border-border px-4 py-4">
          <Link href="/" className="block" aria-label="Pravega home">
            <span className="case-number" style={{ color: "var(--concrete-dark)" }}>
              VERIFYING LEDGER
            </span>
            <span className="display-md" style={{ color: "var(--concrete)", marginTop: "4px", display: "block" }}>
              PRAVEGA<span style={{ color: "var(--spot)" }}>.</span>
            </span>
          </Link>
        </div>
        <div className="p-3 flex-1">
          <p className="case-number" style={{ color: "var(--concrete-dark)", marginBottom: "8px", paddingLeft: "12px" }}>
            {roleLabel[session.role]}
          </p>
          <NavRail role={session.role} />
        </div>
        <div className="border-t-4 border-border p-4 bg-secondary">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "32px", height: "32px",
              background: "var(--concrete)", color: "var(--ink)",
              display: "grid", placeItems: "center",
              fontSize: "11px", fontWeight: 900,
              border: "2px solid var(--border)",
            }}>
              {session.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </div>
            <div>
              <p style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {session.name}
              </p>
              <p className="case-number" style={{ color: "var(--concrete-dark)", marginTop: "2px" }}>
                TENANT: VPCOE
              </p>
            </div>
          </div>
          <form action={signOut} className="mt-3">
            <button type="submit" className="btn-brutal-ghost" style={{ color: "var(--concrete)", fontSize: "10px" }}>
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* mobile top bar */}
      <header className="md:hidden sticky top-0 z-20 flex items-center justify-between bg-secondary text-secondary-foreground border-b-4 border-border px-4 py-2">
        <Link href="/" className="display-sm" style={{ color: "var(--concrete)" }}>
          PRAVEGA<span style={{ color: "var(--spot)" }}>.</span>
        </Link>
        <form action={signOut}>
          <button type="submit" className="btn-brutal-ghost" style={{ color: "var(--concrete)", fontSize: "10px" }}>
            Sign out
          </button>
        </form>
      </header>

      {/* content */}
      <main className="min-w-0 bg-background relative z-10">
        {/* marquee ticker */}
        <div className="brutalist-ticker">
          <span>APPEND-ONLY · NO DELETE PATH · TENANT: VPCOE · 1,204 AUDIT ENTRIES · </span>
          <span>APPEND-ONLY · NO DELETE PATH · TENANT: VPCOE · 1,204 AUDIT ENTRIES · </span>
          <span>APPEND-ONLY · NO DELETE PATH · TENANT: VPCOE · 1,204 AUDIT ENTRIES · </span>
        </div>
        {children}
      </main>
    </div>
  );
}
