import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { recordAppeal } from "@/lib/actions/eligibility";
import { evaluateEligibility, cgpaToPercent, type Clause } from "@/lib/eligibility";

export default async function StudentDrivesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "student") redirect("/officer");

  const drives = await db.select().from(schema.drives).where(eq(schema.drives.tenantId, session.tenantId));
  const [profile] = await db.select().from(schema.studentProfiles).where(eq(schema.studentProfiles.userId, session.userId));
  const skills = await db.select().from(schema.studentSkills).where(eq(schema.studentSkills.userId, session.userId));
  const [nimbusRule] = await db.select().from(schema.eligibilityRules).where(eq(schema.eligibilityRules.id, "rule-nimbus-be"));
  const skillsMap = Object.fromEntries(skills.map((s) => [s.skillId, s.state]));

  const verdict = profile && nimbusRule
    ? evaluateEligibility(nimbusRule.version, nimbusRule.clauses as unknown as Clause[], {
        cgpaPercent: cgpaToPercent(profile.cgpa),
        activeBacklogs: profile.activeBacklogs,
        skills: skillsMap,
      })
    : null;

  return (
    <AppShell session={session}>
      <header className="border-b border-line px-4 md:px-8 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">My drives &amp; eligibility</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Where you stand, and why</h1>
      </header>
      <div className="p-4 md:p-6 grid gap-4 max-w-[880px]">
        {drives.map((d) => {
          const isNimbus = d.id === "drv-nimbus";
          const v = isNimbus ? verdict : null;
          return (
            <article key={d.id} className="border border-line bg-panel">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-2.5">
                <div>
                  <h2 className="font-semibold">{d.company} — {d.role}</h2>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                    {d.status} · JD skills: {(d.jdSkills as string[]).join(", ")} · {d.scheduledAt ? new Date(d.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "TBD"}
                  </p>
                </div>
                {isNimbus && v && (
                  <span className={`font-mono text-[11px] uppercase tracking-wider px-2 py-1 border ${v.passed ? "text-ledger border-ledger/40 bg-green-wash" : "text-red border-red/40 bg-red-wash"}`}>
                    {v.passed ? "Eligible · rule v3" : `Blocked · rule v${nimbusRule?.version}`}
                  </span>
                )}
              </div>
              {isNimbus && v && (
                <div className="px-4 py-3 text-[13px]">
                  {v.passed ? (
                    <p>All clauses pass against <b>Nimbus Tech — Backend Dev v3</b>. Your SQL evidence (verified, expires Sep 2027) satisfies clause <b>c3</b>.</p>
                  ) : (
                    <div>
                      <p className="text-red">Blocked by:</p>
                      <ul className="mt-1 list-disc pl-5">
                        {v.failedClauses.map((c) => <li key={c.id}><b>{c.id}</b> — {c.label}</li>)}
                      </ul>
                      <p className="mt-2 text-muted">Decision is recorded with rule version <b>{nimbusRule?.version}</b>. If you believe this is wrong, appeal — the T&amp;P cell reviews with the evidence chain in front of them.</p>
                      <form action={recordAppeal} className="mt-2 flex gap-2">
                        <input type="hidden" name="driveId" value={d.id} />
                        <input name="reason" defaultValue="eligibility review request" className="flex-1 border border-line px-3 py-1.5 text-[12px]" aria-label="Appeal reason" />
                        <button type="submit" className="border border-probe text-probe px-3 py-1.5 text-[12px] hover:bg-panel-2">File appeal</button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
