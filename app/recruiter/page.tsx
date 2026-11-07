import { desc, eq, inArray, ne } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";

export default async function RecruiterPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "recruiter") redirect("/student");

  const { q } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();

  const skills = await db.select().from(schema.skills);
  const matchedSkills = query ? skills.filter((s) => s.name.toLowerCase().includes(query)).map((s) => s.id) : [];

  const verifiedRows = matchedSkills.length
    ? await db.select().from(schema.studentSkills).where(inArray(schema.studentSkills.skillId, matchedSkills))
    : await db.select().from(schema.studentSkills).where(ne(schema.studentSkills.state, "claimed"));

  const byStudent = new Map<string, typeof verifiedRows>();
  for (const row of verifiedRows.filter((r) => r.state === "verified")) {
    const list = byStudent.get(row.userId) ?? [];
    list.push(row);
    byStudent.set(row.userId, list);
  }

  const studentIds = [...byStudent.keys()];
  const usersList = studentIds.length
    ? await db.select().from(schema.users).where(inArray(schema.users.id, studentIds))
    : [];
  const profiles = studentIds.length
    ? await db.select().from(schema.studentProfiles).where(inArray(schema.studentProfiles.userId, studentIds))
    : [];
  const evs = studentIds.length
    ? await db.select().from(schema.evidence).where(inArray(schema.evidence.userId, studentIds)).orderBy(desc(schema.evidence.createdAt))
    : [];

  const userOf = Object.fromEntries(usersList.map((u) => [u.id, u]));
  const profileOf = Object.fromEntries(profiles.map((p) => [p.userId, p]));
  const skillName = Object.fromEntries(skills.map((s) => [s.id, s.name]));

  return (
    <AppShell session={session}>
      <header className="m-dotgrid border-b border-line px-4 pb-5 pt-5 md:px-8 md:pt-6">
        <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted">Talent discovery · evidence-first</p>
        <h1 className="mt-2 max-w-[20ch] text-[32px] font-semibold leading-[1.08] tracking-[-0.03em] text-ink md:text-[38px]">Search verified skills, read the receipts</h1>
        <p className="mt-1 text-[13px] text-muted">Every match shows <b>why</b> — linked evidence, confidence, expiry. No composite scores, no black boxes.</p>
        <form className="mt-3 flex max-w-[520px] gap-2" action="/recruiter">
          <input name="q" defaultValue={query} placeholder="try: python · sql · react" aria-label="Search verified skills" className="flex-1 border border-line bg-panel px-3 py-2 text-[13px] font-mono" />
          <button type="submit" className="bg-probe text-paper px-4 py-2 text-[13px]">Search</button>
        </form>
      </header>

      <div className="p-4 md:p-6 grid gap-4 max-w-[920px]">
        <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted">
          {query ? `Verified matches for “${query}”` : "All verified candidates"} · {byStudent.size}
        </p>
        {byStudent.size === 0 && <p className="text-muted text-[14px]">No verified matches. Skills stay “claimed” until evidence lands — that’s the point.</p>}
        {[...byStudent.entries()].map(([studentId, rows]) => {
          const u = userOf[studentId];
          const p = profileOf[studentId];
          const mine = evs.filter((e) => e.userId === studentId);
          return (
            <article key={studentId} className="border border-line bg-panel">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-2.5">
                <div>
                  <h2 className="font-semibold">{u?.name}</h2>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{p?.branch} · CGPA {p?.cgpa} · target {p?.targetRole}</p>
                </div>
                <span className="font-mono text-[10px] uppercase text-ledger border border-ledger/40 bg-green-wash px-2 py-0.5">evidence on file</span>
              </div>
              <ul className="divide-y divide-line">
                {rows.map((r) => {
                  const related = mine.filter((e) => e.skillId === r.skillId);
                  return (
                    <li key={r.id} className="px-4 py-2">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-[13px]"><b>{skillName[r.skillId] ?? r.skillId}</b> — verified<span className="text-muted"> · confidence {r.confidence}</span></p>
                        <p className="font-mono text-[10px] text-muted">verified {r.verifiedAt ? new Date(r.verifiedAt).toLocaleDateString("en-IN") : "?"} · expires {r.expiresAt ? new Date(r.expiresAt).toLocaleDateString("en-IN") : "?"}</p>
                      </div>
                      {related.length > 0 && (
                        <ul className="mt-1 font-mono text-[10px] text-muted">
                          {related.map((e) => (
                            <li key={e.id}>↳ {e.kind.replace("_", " ")} — {e.title} <span className="text-muted">({e.id})</span></li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </article>
          );
        })}
        <p className="font-mono text-[10px] text-muted">DPDPA note: you see evidence titles + skills only after the student granted recruiter access. No hidden scores are computed on your behalf.</p>
      </div>
    </AppShell>
  );
}
