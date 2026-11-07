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
      <header className="construction-line" style={{ padding: "20px 24px" }}>
        <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "4px" }}>TALENT DISCOVERY · EVIDENCE-FIRST</p>
        <h1 className="display-md" style={{ marginBottom: "4px" }}>SEARCH VERIFIED SKILLS, READ THE RECEIPTS</h1>
        <p className="body-sm" style={{ color: "var(--muted-text)", maxWidth: "62ch" }}>
          Every match shows <b>why</b> — linked evidence, confidence, expiry. No composite scores, no black boxes.
        </p>
        <form style={{ display: "flex", gap: "8px", marginTop: "12px", maxWidth: "520px" }} action="/recruiter">
          <input name="q" defaultValue={query} placeholder="try: python · sql · react" aria-label="Search verified skills" className="brutal-input" style={{ flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }} />
          <button type="submit" className="btn-brutal-primary" style={{ fontSize: "10px", padding: "8px 16px" }}>SEARCH</button>
        </form>
      </header>
      <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: "12px", maxWidth: "920px" }}>
        <p className="case-number" style={{ color: "var(--muted-text)" }}>
          {query ? `VERIFIED MATCHES FOR "${query.toUpperCase()}"` : "ALL VERIFIED CANDIDATES"} · {byStudent.size}
        </p>
        {byStudent.size === 0 && <p className="body-md" style={{ color: "var(--muted-text)" }}>No verified matches. Skills stay &ldquo;claimed&rdquo; until evidence lands — that&apos;s the point.</p>}
        {[...byStudent.entries()].map(([studentId, rows]) => {
          const u = userOf[studentId];
          const p = profileOf[studentId];
          const mine = evs.filter((e) => e.userId === studentId);
          return (
            <div key={studentId} className="brutal-card" style={{ padding: "0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "10px 14px", borderBottom: "3px solid var(--border)", background: "var(--secondary)", color: "var(--secondary-foreground)" }}>
                <div>
                  <h2 className="display-sm" style={{ fontSize: "14px", color: "var(--concrete)" }}>{u?.name}</h2>
                  <p className="case-number" style={{ color: "var(--concrete-dark)" }}>{p?.branch} · CGPA {p?.cgpa} · TARGET {p?.targetRole}</p>
                </div>
                <span className="brutal-chip" style={{ background: "var(--concrete)", color: "var(--ink)" }}>EVIDENCE ON FILE</span>
              </div>
              <ul style={{ listStyle: "none" }}>
                {rows.map((r) => {
                  const related = mine.filter((e) => e.skillId === r.skillId);
                  return (
                    <li key={r.id} style={{ padding: "10px 14px", borderBottom: "2px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
                        <p style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase" }}>
                          {skillName[r.skillId] ?? r.skillId} — VERIFIED
                          <span style={{ color: "var(--muted-text)", fontWeight: 400, marginLeft: "8px", fontSize: "11px" }}>CONFIDENCE {r.confidence}</span>
                        </p>
                        <p className="case-number" style={{ color: "var(--muted-text)" }}>
                          VERIFIED {r.verifiedAt ? new Date(r.verifiedAt).toLocaleDateString("en-IN") : "?"} · EXPIRES {r.expiresAt ? new Date(r.expiresAt).toLocaleDateString("en-IN") : "?"}
                        </p>
                      </div>
                      {related.length > 0 && (
                        <ul style={{ listStyle: "none", marginTop: "4px", paddingLeft: "12px" }}>
                          {related.map((e) => (
                            <li key={e.id} className="case-number" style={{ color: "var(--muted-text)", padding: "2px 0" }}>
                              ↳ {e.kind.replace("_", " ").toUpperCase()} — {e.title} ({e.id})
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
        <p className="case-number" style={{ color: "var(--muted-text)" }}>DPDP NOTE: YOU SEE EVIDENCE TITLES + SKILLS ONLY AFTER THE STUDENT GRANTED RECRUITER ACCESS. NO HIDDEN SCORES ARE COMPUTED ON YOUR BEHALF.</p>
      </div>
    </AppShell>
  );
}
