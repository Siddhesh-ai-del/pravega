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
      <header className="m-dotgrid border-b border-line px-4 pb-5 pt-5 md:px-8 md:pt-6">
        <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted">My privacy · DPDP 2023 patterns</p>
        <h1 className="mt-2 max-w-[20ch] text-[32px] font-semibold leading-[1.08] tracking-[-0.03em] text-ink md:text-[38px]">You opt in. You opt out. Any time.</h1>
      </header>
      <div className="p-4 md:p-6 grid gap-5 max-w-[880px]">
        <section className="border border-line bg-panel" aria-labelledby="consent-heading">
          <h2 id="consent-heading" className="border-b border-line px-4 py-2 font-mono text-[9px] uppercase tracking-[0.32em] text-muted">Data access consents</h2>
          {[
            ["github", github, "Repository read — metadata, languages, commit timestamps", "Recruiter & T&P see sourced evidence only"],
            ["leetcode", leetcode, "Practice history — problem acceptance rate only", "Currently no integration linked"],
          ].map(([key, grantedNow, scope, note]) => (
            <div key={String(key)} className="flex items-center justify-between gap-4 border-b last:border-b-0 border-line px-4 py-3">
              <div>
                <p className="text-[13px] font-medium uppercase font-mono">{String(key)}</p>
                <p className="text-[12px] text-muted">{String(scope)}</p>
                <p className="text-[11px] text-muted">{String(note)}</p>
              </div>
              <form action={toggleConsent}>
                <input type="hidden" name="key" value={String(key)} />
                <input type="hidden" name="granted" value={String(!grantedNow)} />
                <button type="submit" className={`font-mono text-[11px] uppercase border px-3 py-1.5 ${grantedNow ? "border-ledger text-ledger" : "border-red/50 text-red"}`}>
                  {grantedNow ? "granted — revoke?" : "revoked — grant?"}
                </button>
              </form>
            </div>
          ))}
        </section>

        <section className="border border-line bg-panel" aria-labelledby="why-heading">
          <h2 id="why-heading" className="border-b border-line px-4 py-2 font-mono text-[9px] uppercase tracking-[0.32em] text-muted">Why your scores look like this</h2>
          <ul className="divide-y divide-line text-[13px]">
            {[
              ["SQL — verified", "T&P mock series 2025.11 · 82/100 · evidence ev-r-sql-test · report expires Sep 2027. If the score is wrong, appeal to T&P with your own test — the officer reviews the chain, not the number."],
              ["Git — verified", "Mentor attestation by Prof. S. Kulkarni · expires Jul 2027. Not a screenshot anyone uploaded — a named human said so, on record."],
              ["Python — claimed", "Your Coursera certificate aged past its validity window. Nothing about you is 'bad' — the evidence simply expired. Verify from your repo or re-assert with fresh proof."],
            ].map(([t, d]) => (
              <li key={String(t)} className="px-4 py-3">
                <b>{String(t)}.</b> <span className="text-muted">{String(d)}</span>
              </li>
            ))}
          </ul>
        </section>

        <p className="font-mono text-[10px] text-muted">Full export of your profile + complete audit of who viewed it is available on request to the DPO (data protection officer) — demo placeholder, not a legal notice.</p>
      </div>
    </AppShell>
  );
}
