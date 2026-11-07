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


const roleLabel: Record<string, string> = {
  student: "Student",
  officer: "T&P Officer",
  recruiter: "Recruiter",
};

async function signInAs(formData: FormData) {
  "use server";
  const userId = String(formData.get("userId") ?? "");
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, userId) });
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
    <main className="min-h-screen grid md:grid-cols-[1fr_420px]">
      {/* left: is it a landing? No — it's the identity panel of the registry */}
      <section className="relative flex flex-col justify-between border-b md:border-b-0 md:border-r border-line m-dotgrid bg-[#101014] p-6 md:p-10 text-ink">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted">
            ◈ VPPCOE &amp; VA — Training &amp; Placement Cell
          </p>
          <div className="mt-5 flex items-center gap-4">
            <span
              aria-hidden
              className="grid h-16 w-16 shrink-0 place-items-center rounded-[10px] bg-ink"
            >
              <svg width="34" height="34" viewBox="0 0 13 13" fill="none">
                <path
                  d="M2.2 6.9 5.2 9.7 10.8 3.3"
                  stroke="var(--paper)"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h1 className="text-6xl md:text-7xl font-semibold leading-none tracking-[-0.03em]">
              Pravega<span className="text-ledger">.</span>
            </h1>
          </div>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.4em] text-muted">
            The Verifying Ledger
          </p>
          <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-muted">
            One profile. One trail. Every decision explained. Skills move from
            <span className="text-ink"> claimed </span>
            to <span className="text-ledger">verified</span> only against evidence.
          </p>
        </div>

        <div className="mt-10 grid gap-3 font-mono text-[11px] text-muted">
          <div className="flex items-center justify-between border-t border-line pt-3">
            <span>CASE EV-r-1029</span>
            <span className="text-ledger">VERIFIED · SQL</span>
          </div>
          <div className="flex items-center justify-between border-t border-line pt-3">
            <span>RULE nimbus-be v3</span>
            <span className="text-amber">2 students blocked</span>
          </div>
          <div className="flex items-center justify-between border-t border-line pt-3">
            <span>AGENT agr-2</span>
            <span className="text-red">AWAITING HUMAN DECISION</span>
          </div>
        </div>
      </section>

      {/* right: pick a seeded persona */}
      <section className="m-dotgrid flex flex-col justify-center p-6 md:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          Sign in · demo personas
        </p>
        <h2 className="mt-2 text-lg font-semibold">Choose who you are</h2>
        <p className="mt-1 text-[13px] text-muted">
          Seeded accounts. No passwords — this is a judged prototype with mock data.
        </p>
        <ul className="mt-5 grid gap-2">
          {personas.map((u) => (
            <li key={u.id}>
              <form action={signInAs}>
                <input type="hidden" name="userId" value={u.id} />
                <button
                  type="submit"
                  className="group w-full flex items-center gap-3 rounded-[8px] border border-line bg-panel px-3 py-2.5 text-left transition-all hover:border-line-strong hover:bg-panel-2"
                >
                  <span className="grid place-items-center w-8 h-8 rounded-sm border border-line-strong bg-panel-2 text-ink font-mono text-[11px]">
                    {u.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium leading-tight">{u.name}</span>
                    <span className="block text-[11px] text-muted">{u.email}</span>
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-probe border border-line px-1.5 py-0.5">
                    {roleLabel[u.role] ?? u.role}
                  </span>
                </button>
              </form>
            </li>
          ))}
        </ul>
        <p className="mt-4 font-mono text-[10px] text-muted">
          Data isolation is enforced per tenant in every query; this card is the only
          credential surface in demo mode.
        </p>
      </section>
    </main>
  );
}
