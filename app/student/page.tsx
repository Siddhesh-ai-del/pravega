import { redirect } from "next/navigation";
import { eq, asc, desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/shell/app-shell";
import Link from "next/link";


const stateStyle: Record<string, string> = {
  verified: "text-ledger border-ledger/40 bg-green-wash",
  claimed: "text-amber border-amber/40 bg-amber-wash",
  expired: "text-red border-red/40 bg-red-wash",
};

const kindLabel: Record<string, string> = {
  github_repo: "REPO",
  test: "TEST",
  certificate: "CERT",
  project: "PROJ",
  attestation: "ATTEST",
  practice: "PRACTICE",
};

export default async function StudentLedgerPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "student") redirect("/officer");

  const [profile] = await db
    .select()
    .from(schema.studentProfiles)
    .where(eq(schema.studentProfiles.userId, session.userId));

  const skills = await db
    .select({
      id: schema.studentSkills.id,
      skillId: schema.skills.id,
      name: schema.skills.name,
      state: schema.studentSkills.state,
      confidence: schema.studentSkills.confidence,
      verifiedAt: schema.studentSkills.verifiedAt,
      expiresAt: schema.studentSkills.expiresAt,
      claimedAt: schema.studentSkills.claimedAt,
      demandShare: schema.skills.demandShare,
    })
    .from(schema.studentSkills)
    .innerJoin(schema.skills, eq(schema.skills.id, schema.studentSkills.skillId))
    .where(eq(schema.studentSkills.userId, session.userId))
    .orderBy(asc(schema.skills.demandShare));

  const verifiedCount = skills.filter((s) => s.state === "verified").length;

  const evs = await db
    .select()
    .from(schema.evidence)
    .where(eq(schema.evidence.userId, session.userId))
    .orderBy(desc(schema.evidence.createdAt));

  return (
    <AppShell session={session}>
      <header className="border-b border-line px-4 md:px-8 py-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">My verified profile</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Skill ledger — {session.name.split(" ")[0]} <span className="text-muted font-normal">· {profile?.branch ?? "Engineering"} · Final year · CGPA {profile?.cgpa}</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-mono text-3xl font-semibold leading-none">{verifiedCount}<span className="text-muted text-base">/{skills.length}</span></p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted mt-1">Verified skills</p>
          </div>
          <Link
            href="/student/verify"
            className="inline-flex items-center gap-2 bg-probe text-white px-4 py-2 text-[13px] font-medium hover:bg-[#2a2cac] transition-colors"
          >
            Verify from GitHub →
          </Link>
        </div>
      </header>

      <div className="grid md:grid-cols-[1fr_360px] gap-0">
        {/* ledger table */}
        <section aria-label="Skill ledger" className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-[13px]">
            <thead>
              <tr className="text-left font-mono text-[10px] uppercase tracking-[0.15em] text-muted border-b border-line">
                <th className="px-4 md:px-8 py-2 font-medium">Skill</th>
                <th className="px-4 py-2 font-medium">State</th>
                <th className="px-4 py-2 font-medium">Confidence</th>
                <th className="px-4 py-2 font-medium">Expires</th>
                <th className="px-4 py-2 font-medium text-right">JD demand</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[...skills].sort((a, b) => b.demandShare - a.demandShare).map((s) => (
                <tr key={s.id} className="ledger-row align-middle">
                  <td className="px-4 md:px-8 py-3 font-medium">{s.name}
                    <span className="block font-mono text-[10px] text-muted font-normal">ESCO</span></td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider ${stateStyle[s.state]}`}>
                      <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                      {s.state}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono">{s.confidence}</span>
                    <span className="text-muted">/100</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px]">
                    {s.expiresAt ? new Date(s.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[12px]">{s.demandShare}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-4 md:px-8 pt-3 pb-4 font-mono text-[10px] text-muted">
            States per verified-trust protocol: <b>claimed</b> = self-declared · <b>verified</b> = evidence-gated (expiry tracked) · <b>expired</b> = must refresh evidence
          </p>
        </section>

        {/* evidence packets rail */}
        <aside className="border-t md:border-t-0 md:border-l border-line p-4 md:p-5">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Evidence packets</h2>
          <div className="mt-3 grid gap-4">
            {evs.map((e) => (
              <figure key={e.id} className="receipt p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] tracking-[0.18em] text-probe border border-line px-1.5 py-0.5">
                    {kindLabel[e.kind] ?? e.kind.toUpperCase()}
                  </span>
                  <figcaption className="font-mono text-[10px] text-muted truncate">{e.id}</figcaption>
                </div>
                <blockquote className="pt-2 text-[13px] font-medium leading-snug">{e.title}</blockquote>
                <dl className="pt-2 font-mono text-[11px] leading-5 text-[#2e3138]">
                  {Object.entries(e.refs as Record<string, unknown>).slice(0, 4).map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <dt className="text-muted min-w-[88px]">{k}:</dt>
                      <dd className="truncate">{typeof v === "object" ? JSON.stringify(v) : String(v)}</dd>
                    </div>
                  ))}
                </dl>
              </figure>
            ))}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
