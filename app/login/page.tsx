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
      <section className="relative flex flex-col justify-between border-b md:border-b-0 md:border-r border-line bg-[#14161c] p-6 md:p-10 text-[#f6f6f2]">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#a9a69d]">
            VPPCOE &amp; VA — Training &amp; Placement Cell
          </p>
          <h1 className="mt-4 text-4xl md:text-5xl font-semibold leading-[1.05] tracking-tight">
            Pravega<span className="text-[#8fd0a8]">.</span>
          </h1>
          <p className="mt-3 max-w-[46ch] text-[15px] text-[#d7d5cd]">
            One profile. One trail. Every decision explained. Skills move from
            <span className="text-white"> claimed </span>
            to <span className="text-[#8fd0a8]">verified</span> only against evidence.
          </p>
        </div>

        <div className="mt-10 grid gap-3 font-mono text-[11px] text-[#b9b7ae]">
          <div className="flex items-center justify-between border-t border-[#2b2e38] pt-3">
            <span>CASE EV-r-1029</span>
            <span className="text-[#8fd0a8]">VERIFIED · SQL</span>
          </div>
          <div className="flex items-center justify-between border-t border-[#2b2e38] pt-3">
            <span>RULE nimbus-be v3</span>
            <span className="text-[#f3c969]">2 students blocked</span>
          </div>
          <div className="flex items-center justify-between border-t border-[#2b2e38] pt-3">
            <span>AGENT agr-2</span>
            <span className="text-[#f0a0a0]">AWAITING HUMAN DECISION</span>
          </div>
        </div>
      </section>

      {/* right: pick a seeded persona */}
      <section className="flex flex-col justify-center p-6 md:p-8">
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
                  className="w-full flex items-center gap-3 border border-line bg-panel px-3 py-2.5 text-left hover:bg-panel-2 transition-colors"
                >
                  <span className="grid place-items-center w-8 h-8 rounded-sm bg-[#14161c] text-[#f6f6f2] font-mono text-[11px]">
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
