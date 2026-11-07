import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { toggleConsent } from "@/lib/actions/consent";

export default async function ConsentPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "student") redirect("/officer");

  const [profile] = await db.select().from(schema.studentProfiles).where(eq(schema.studentProfiles.userId, session.userId));
  const consents = (profile?.consents ?? {}) as Record<string, unknown>;
  const github = Boolean(consents.github);
  const leetcode = Boolean(consents.leetcode);

  return (
    <AppShell session={session}>
      <header className="construction-line" style={{ padding: "20px 24px" }}>
        <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "4px" }}>MY PRIVACY · DPDP 2023 PATTERNS</p>
        <h1 className="display-md" style={{ marginBottom: "4px" }}>YOU OPT IN. YOU OPT OUT. ANY TIME.</h1>
      </header>
      <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: "16px", maxWidth: "880px" }}>
        <div className="brutal-card" style={{ padding: "0" }}>
          <div style={{ padding: "10px 14px", borderBottom: "3px solid var(--border)", background: "var(--secondary)", color: "var(--secondary-foreground)" }}>
            <p className="case-number">DATA ACCESS CONSENTS</p>
          </div>
          {[
            ["github", github, "Repository read — metadata, languages, commit timestamps", "Recruiter & T&P see sourced evidence only"],
            ["leetcode", leetcode, "Practice history — problem acceptance rate only", "Currently no integration linked"],
          ].map(([key, grantedNow, scope, note], i) => (
            <div key={String(key)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", padding: "14px", borderBottom: i === 0 ? "2px solid var(--border)" : "none" }}>
              <div>
                <p style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{String(key)}</p>
                <p className="body-sm" style={{ color: "var(--muted-text)", fontSize: "11px" }}>{String(scope)}</p>
                <p className="case-number" style={{ color: "var(--muted-text)", marginTop: "2px" }}>{String(note)}</p>
              </div>
              <form action={toggleConsent}>
                <input type="hidden" name="key" value={String(key)} />
                <input type="hidden" name="granted" value={String(!grantedNow)} />
                <button type="submit" className={grantedNow ? "btn-brutal-primary" : "btn-brutal-outline"} style={{ fontSize: "10px", padding: "6px 12px" }}>
                  {grantedNow ? "GRANTED — REVOKE?" : "REVOKED — GRANT?"}
                </button>
              </form>
            </div>
          ))}
        </div>

        <div className="brutal-card" style={{ padding: "0" }}>
          <div style={{ padding: "10px 14px", borderBottom: "3px solid var(--border)", background: "var(--secondary)", color: "var(--secondary-foreground)" }}>
            <p className="case-number">WHY YOUR SCORES LOOK LIKE THIS</p>
          </div>
          {[
            ["SQL — VERIFIED", "T&P mock series 2025.11 · 82/100 · evidence ev-r-sql-test · expires Sep 2027. If the score is wrong, appeal to T&P with your own test — the officer reviews the chain, not the number."],
            ["GIT — VERIFIED", "Mentor attestation by Prof. S. Kulkarni · expires Jul 2027. Not a screenshot anyone uploaded — a named human said so, on record."],
            ["PYTHON — CLAIMED", "Your Coursera certificate aged past its validity window. Nothing about you is 'bad' — the evidence simply expired. Verify from your repo or re-assert with fresh proof."],
          ].map(([t, d], i) => (
            <div key={String(t)} style={{ padding: "12px 14px", borderBottom: i < 2 ? "2px solid var(--border)" : "none" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{String(t)}.</p>
              <p className="body-sm" style={{ color: "var(--muted-text)", fontSize: "11px" }}>{String(d)}</p>
            </div>
          ))}
        </div>

        <p className="case-number" style={{ color: "var(--muted-text)" }}>
          Full export of your profile + complete audit of who viewed it is available on request to the DPO — demo placeholder, not a legal notice.
        </p>
      </div>
    </AppShell>
  );
}
