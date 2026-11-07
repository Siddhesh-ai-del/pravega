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
      <header className="m-dotgrid border-b border-line px-4 pb-5 pt-5 md:px-8 md:pt-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted">
            ◈ My verified profile
          </p>
          <h1 className="mt-2 text-[32px] font-semibold leading-[1.05] tracking-[-0.03em] text-ink md:text-[38px]">
            Skill ledger — {session.name.split(" ")[0]}
            <span className="mt-1 block text-[15px] font-normal text-muted md:inline md:text-[20px]">
              {" "}· {profile?.branch ?? "Engineering"} · Final year · CGPA {profile?.cgpa}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="text-[44px] font-semibold leading-none tracking-[-0.02em] text-ink tabular-nums">
              {verifiedCount}<span className="text-muted">/{skills.length}</span>
            </p>
            <p className="mt-1.5 font-mono text-[8px] uppercase tracking-[0.24em] text-muted">Verified skills</p>
          </div>
          <Link
            href="/student/verify"
            className="inline-flex h-11 items-center gap-2 rounded-[6px] bg-probe px-5 text-[13px] font-medium text-paper transition-colors hover:bg-white"
          >
            Verify from GitHub →
          </Link>
        </div>
      </header>

      <div className="grid md:grid-cols-[1fr_360px] gap-0">
        {/* ledger table */}
        <section aria-label="Skill ledger" className="overflow-x-auto">
          {skills.length === 0 && (
            <div className="m-8 rounded-[8px] border border-dashed border-line-strong p-6">
              <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted">Empty register</p>
              <p className="mt-2 text-[16px] font-semibold text-ink">No skills on file yet.</p>
              <p className="mt-1 max-w-[52ch] text-[12px] leading-snug text-muted">
                Nothing self-declared, nothing verified — which is allowed. When you claim a
                skill, attach evidence in the same breath: a repo, a test, an attestation.
              </p>
              <Link
                href="/student/verify"
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-[6px] bg-probe px-5 text-[13px] font-medium text-paper transition-colors hover:bg-white"
              >
                Verify from GitHub →
              </Link>
            </div>
          )}
          {skills.length > 0 && (
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
          )}
          <p className="px-4 md:px-8 pt-3 pb-4 font-mono text-[10px] text-muted">
            States per verified-trust protocol: <b>claimed</b> = self-declared · <b>verified</b> = evidence-gated (expiry tracked) · <b>expired</b> = must refresh evidence
          </p>
        </section>

        {/* evidence packets rail */}
        <aside className="border-t md:border-t-0 md:border-l border-line p-4 md:p-5">
          <h2 className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted">Evidence packets</h2>
          <div className="mt-3 grid gap-4">
            {evs.length === 0 && (
              <div className="rounded-[8px] border border-dashed border-line-strong p-4">
                <p className="text-[12px] font-medium text-ink">No receipts yet.</p>
                <p className="mt-1 text-[11px] text-muted">
                  Verify a skill from your GitHub and this rail fills with
                  tamper-evident packets — repo reads, test scores, attestations.
                </p>
                <Link
                  href="/student/verify"
                  className="mt-3 inline-flex h-9 items-center gap-2 rounded-[6px] bg-probe px-4 text-[12px] font-medium text-paper transition-colors hover:bg-white"
                >
                  Verify from GitHub →
                </Link>
              </div>
            )}
            {evs.map((e) => (
              <figure key={e.id} className="receipt p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] tracking-[0.18em] text-probe border border-line px-1.5 py-0.5">
                    {kindLabel[e.kind] ?? e.kind.toUpperCase()}
                  </span>
                  <figcaption className="font-mono text-[10px] text-muted truncate">{e.id}</figcaption>
                </div>
                <blockquote className="pt-2 text-[13px] font-medium leading-snug">{e.title}</blockquote>
                <dl className="pt-2 font-mono text-[11px] leading-5 text-muted">
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
