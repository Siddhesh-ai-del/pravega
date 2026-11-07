import { redirect } from "next/navigation";
import { eq, asc, desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/shell/app-shell";
import Link from "next/link";

export const dynamic = "force-dynamic";

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

  const kindLabel: Record<string, string> = {
    github_repo: "REPO",
    test: "TEST",
    certificate: "CERT",
    project: "PROJ",
    attestation: "ATTEST",
    practice: "PRACTICE",
  };

  const stateStyle: Record<string, string> = {
    verified: "background: var(--primary); color: var(--primary-foreground); border: 2px solid var(--border);",
    claimed: "background: var(--muted); color: var(--foreground); border: 2px solid var(--border);",
    expired: "background: var(--destructive); color: var(--destructive-foreground); border: 2px solid var(--border);",
  };

  return (
    <AppShell session={session}>
      <header style={{ borderBottom: "4px solid var(--border)", padding: "20px 24px" }}>
        <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "4px" }}>MY VERIFIED PROFILE</p>
        <h1 className="display-md" style={{ marginBottom: "4px" }}>
          SKILL LEDGER — {session.name.split(" ")[0].toUpperCase()}
        </h1>
        <p className="body-sm" style={{ color: "var(--muted-text)" }}>
          {profile?.branch} · Final year · CGPA {profile?.cgpa} · {verifiedCount}/{skills.length} verified
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px" }}>
          <div>
            <span className="display-lg" style={{ color: "var(--spot)" }}>{verifiedCount}</span>
            <span className="display-lg" style={{ color: "var(--muted-text)", fontSize: "32px" }}>/{skills.length}</span>
            <div className="case-number" style={{ color: "var(--muted-text)", marginTop: "2px" }}>VERIFIED SKILLS</div>
          </div>
          <Link href="/student/verify" className="btn-brutal-primary" style={{ marginLeft: "auto" }}>
            VERIFY FROM GITHUB →
          </Link>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 0 }}>
        {/* ledger table */}
        <section style={{ padding: "16px 24px" }}>
          <table className="brutal-table">
            <thead>
              <tr>
                <th>SKILL</th>
                <th>STATE</th>
                <th>CONFIDENCE</th>
                <th>EXPIRES</th>
                <th style={{ textAlign: "right" }}>JD DEMAND</th>
              </tr>
            </thead>
            <tbody>
              {[...skills].sort((a, b) => b.demandShare - a.demandShare).map((s) => (
                <tr key={s.id}>
                  <td>
                    <span style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "12px" }}>{s.name}</span>
                    <span className="case-number" style={{ display: "block", color: "var(--muted-text)", marginTop: "2px" }}>ESCO</span>
                  </td>
                  <td>
                    <span style={{ ...parseStyle(stateStyle[s.state]), padding: "2px 8px", fontSize: "9px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.12em", textTransform: "uppercase", display: "inline-block" }}>
                      {s.state}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{s.confidence}</span>
                    <span style={{ color: "var(--muted-text)", fontSize: "11px" }}>/100</span>
                  </td>
                  <td className="mono" style={{ fontSize: "11px" }}>
                    {s.expiresAt ? new Date(s.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 700 }}>
                    {s.demandShare}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="case-number" style={{ color: "var(--muted-text)", marginTop: "12px" }}>
            STATES: CLAIMED = SELF-DECLARED · VERIFIED = EVIDENCE-GATED (EXPIRY TRACKED) · EXPIRED = MUST REFRESH EVIDENCE
          </p>
        </section>

        {/* evidence packets rail */}
        <aside style={{ borderLeft: "4px solid var(--border)", padding: "16px", background: "var(--concrete-dark)" }}>
          <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "12px" }}>EVIDENCE PACKETS</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {evs.map((e) => (
              <div key={e.id} className="receipt" style={{ padding: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span className="brutal-chip" style={{ fontSize: "8px" }}>{kindLabel[e.kind] ?? e.kind.toUpperCase()}</span>
                  <span className="case-number" style={{ color: "var(--muted-text)" }}>{e.id}</span>
                </div>
                <p style={{ fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>{e.title}</p>
                <dl style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", lineHeight: "1.6" }}>
                  {Object.entries(e.refs as Record<string, unknown>).slice(0, 4).map(([k, v]) => (
                    <div key={k} style={{ display: "flex", gap: "8px" }}>
                      <dt style={{ color: "var(--muted-text)", minWidth: "80px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{k}:</dt>
                      <dd style={{ color: "var(--ink)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{typeof v === "object" ? JSON.stringify(v) : String(v)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function parseStyle(styleStr: string): Record<string, string> {
  const result: Record<string, string> = {};
  styleStr.split(";").forEach((part) => {
    const [key, val] = part.split(":").map((s) => s.trim());
    if (key && val) {
      const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      result[camelKey] = val;
    }
  });
  return result;
}
