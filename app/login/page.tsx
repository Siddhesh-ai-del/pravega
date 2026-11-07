import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import {
  getSession,
  serializeSession,
  SESSION_COOKIE,
  sessionCookieOptions,
  type Role,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

const roleLabel: Record<string, string> = {
  student: "STUDENT",
  officer: "T&P OFFICER",
  recruiter: "RECRUITER",
};

async function signInAs(formData: FormData) {
  "use server";
  const userId = String(formData.get("userId") ?? "");
  const user = await db.select().from(schema.users).where(eq(schema.users.id, userId)).then((r) => r[0]);
  if (!user) return;
  const session = {
    userId: user.id,
    role: user.role as Role,
    name: user.name,
    tenantId: user.tenantId,
  };
  const jar = await cookies();
  jar.set(SESSION_COOKIE, serializeSession(session), sessionCookieOptions);
  redirect(session.role === "student" ? "/student" : session.role === "officer" ? "/officer" : "/recruiter");
}

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "student" ? "/student" : session.role === "officer" ? "/officer" : "/recruiter");
  }
  const personas = await db.select().from(schema.users).where(eq(schema.users.tenantId, "vpcoe")).orderBy(schema.users.role).limit(9);

  return (
    <main className="min-h-screen grid md:grid-cols-[1fr_460px]">
      {/* left: identity panel — black, concrete text, specimen labels */}
      <section className="relative flex flex-col justify-between bg-secondary text-secondary-foreground p-8 md:p-12 border-r-4 border-border overflow-hidden">
        {/* dot grid */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #B5B1A8 1px, transparent 1px)", backgroundSize: "24px 24px" }} aria-hidden="true" />

        <div className="relative z-10">
          <p className="case-number" style={{ color: "var(--concrete-dark)" }}>
            VPPCOE &amp; VA — TRAINING &amp; PLACEMENT CELL
          </p>
          <h1 className="display-xl" style={{ color: "var(--concrete)", marginTop: "16px" }}>
            PRAVEGA<span style={{ color: "var(--spot)" }}>.</span>
          </h1>
          <p className="body-lg" style={{ color: "var(--concrete)", marginTop: "12px", maxWidth: "46ch" }}>
            Placements don&apos;t run on claims. Ours run on evidence — visible, explainable, auditable.
          </p>
          <p className="body-sm" style={{ color: "var(--concrete-dark)", marginTop: "8px", maxWidth: "52ch" }}>
            One profile. One trail. Every decision explained. Skills move from claimed to verified
            only against evidence. AI proposes; humans dispose.
          </p>
        </div>

        {/* specimen ledger rows */}
        <div className="relative z-10" style={{ borderTop: "3px solid var(--concrete-dark)", paddingTop: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--concrete-dark)" }}>
            <span className="case-number" style={{ color: "var(--concrete-dark)" }}>CASE EV-r-1029</span>
            <span className="case-number" style={{ color: "var(--spot)" }}>VERIFIED · SQL</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--concrete-dark)" }}>
            <span className="case-number" style={{ color: "var(--concrete-dark)" }}>RULE nimbus-be v3</span>
            <span className="case-number" style={{ color: "var(--spot)" }}>2 STUDENTS BLOCKED</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
            <span className="case-number" style={{ color: "var(--concrete-dark)" }}>AGENT agr-2</span>
            <span className="case-number" style={{ color: "var(--spot)" }}>AWAITING HUMAN DECISION</span>
          </div>
        </div>
      </section>

      {/* right: pick a seeded persona */}
      <section className="flex flex-col justify-center p-8" style={{ background: "var(--concrete)" }}>
        <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "8px" }}>SIGN IN · DEMO PERSONAS</p>
        <h2 className="display-sm" style={{ marginBottom: "4px" }}>CHOOSE WHO YOU ARE</h2>
        <p className="body-sm" style={{ color: "var(--muted-text)", marginBottom: "16px" }}>
          Seeded accounts. No passwords — this is a judged prototype with mock data.
        </p>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
          {personas.map((u) => (
            <li key={u.id}>
              <form action={signInAs}>
                <input type="hidden" name="userId" value={u.id} />
                <button
                  type="submit"
                  className="brutal-card"
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", cursor: "pointer", border: "3px solid var(--border)", background: "var(--card)", textAlign: "left" }}
                >
                  <span style={{
                    width: "36px", height: "36px",
                    background: "var(--ink)", color: "var(--concrete)",
                    display: "grid", placeItems: "center",
                    fontSize: "12px", fontWeight: 900,
                    border: "2px solid var(--border)",
                    flexShrink: 0,
                  }}>
                    {u.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontWeight: 700, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.02em" }}>{u.name}</span>
                    <span className="mono" style={{ display: "block", fontSize: "10px", color: "var(--muted-text)" }}>{u.email}</span>
                  </span>
                  <span className="brutal-chip">{roleLabel[u.role] ?? u.role}</span>
                </button>
              </form>
            </li>
          ))}
        </ul>
        <p className="case-number" style={{ color: "var(--muted-text)", marginTop: "16px" }}>
          Data isolation enforced per tenant in every query. This card is the only credential surface in demo mode.
        </p>
      </section>
    </main>
  );
}
