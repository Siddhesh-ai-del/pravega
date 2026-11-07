"use client";
import { useState } from "react";
import Link from "next/link";
import type { AnalysisFindings } from "@/lib/analyzer";

const STEPS = [
  "Fetching repository metadata (owner / repo)",
  "Sampling language bytes…",
  "Pulling last 100 commits and file tree",
  "Applying evidence thresholds (≥25% Python, ≥5 commits)",
];

type Result = { findings: AnalysisFindings; evidenceId?: string };

export function VerifyClient({ name }: { name: string }) {
  const [repo, setRepo] = useState("github.com/rahuljadhav/placement-lab");
  const [consent, setConsent] = useState(true);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(-1);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!consent) return;
    setBusy(true);
    setError(null);
    setResult(null);
    setStep(0);
    const tick = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 700);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUri: repo, skillId: "py" }),
      });
      const data = await res.json();
      clearInterval(tick);
      setStep(STEPS.length);
      if (!res.ok) setError(data.error ?? "Verification failed");
      else setResult(data);
    } catch {
      clearInterval(tick);
      setError("Network error — is the dev server / API reachable from your browser?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_400px]">
      {/* input panel */}
      <div className="p-4 md:p-8">
        <div className="max-w-[560px]">
          <label htmlFor="repo" className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            Repository to verify — Python
          </label>
          <input
            id="repo"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            disabled={busy}
            spellCheck={false}
            className="mt-2 w-full border border-line bg-panel px-3 py-2.5 font-mono text-[13px] focus:border-probe"
            placeholder="github.com/owner/repo"
          />
          <p className="mt-2 text-[12px] text-muted">
            Try a seeded replay, or any public repo — e.g.{" "}
            <button type="button" className="underline underline-offset-2 hover:text-ink"
              onClick={() => setRepo("github.com/pallets/click")}>
              github.com/pallets/click
            </button>
          </p>

          <label className="mt-4 flex items-start gap-2 border border-line bg-panel p-3 text-[13px]">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 accent-[var(--probe)]"
            />
            <span>
              I consent to <b>read-only</b> access (repo metadata, languages, commit
              timestamps). I can revoke this at any time in{" "}
              <Link href="/student/consent" className="underline underline-offset-2">My Privacy</Link>.
            </span>
          </label>

          <button
            type="button"
            onClick={run}
            disabled={!consent || busy || repo.trim().length < 9}
            className="mt-4 inline-flex items-center gap-2 bg-probe text-paper px-5 py-2.5 text-[14px] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
          >
            {busy ? "Verifying…" : "Verify Python →"}
          </button>
        </div>

        {/* progress steps */}
        <ol className="mt-6 max-w-[560px] border border-line bg-panel">
          {STEPS.map((label, i) => {
            const done = step > i || step === STEPS.length;
            const active = step === i;
            return (
              <li key={i} className="flex items-center gap-3 px-3 py-2 border-b last:border-b-0 border-line text-[13px]">
                <span
                  aria-hidden
                  className={`grid place-items-center w-5 h-5 font-mono text-[10px] border ${
                    done ? "border-ledger bg-green-wash text-ledger" : active ? "border-probe text-probe animate-pulse" : "border-line text-muted"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className={done ? "text-ink" : "text-muted"}>{label}</span>
              </li>
            );
          })}
        </ol>
        {error && (
          <p role="alert" className="mt-3 max-w-[560px] border border-red/40 bg-red-wash px-3 py-2 text-[13px] text-red">
            {error}
          </p>
        )}
      </div>

      {/* result panel */}
      <aside className="border-t lg:border-t-0 lg:border-l border-line bg-panel p-4 md:p-6" aria-live="polite">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Evidence chain</h2>

        {!result && !busy && (
          <div className="mt-4 rounded-none border border-dashed border-line-strong p-4 text-[13px] text-muted">
            {name}, your check will resolve into one of two outcomes — there is no
            &quot;submit &amp; hope&quot;. The chain shows <b>why</b> it passed or failed.
          </div>
        )}

        {busy && <p className="mt-4 text-[13px] text-muted animate-pulse">Reading the repository…</p>}

        {result && (
          <div className="mt-4">
            {result.findings.mode === "fixtures" && (
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-amber border border-amber/40 bg-amber-wash px-2 py-1 inline-block">
                Replay mode — precomputed evidence, labeled
              </p>
            )}
            <div className="flex items-center gap-4">
              <span
                aria-hidden
                className={`verify-stamp grid place-items-center w-24 h-24 shrink-0 border-4 ${
                  result.findings.verdict === "verified"
                    ? "border-ledger text-ledger"
                    : "border-red text-red"
                } font-mono text-center text-[13px] font-bold leading-tight rotate-[-3deg]`}
              >
                {result.findings.verdict === "verified" ? "✓\nVERIFIED" : "✗\nREJECTED"}
              </span>
              <div>
                <p className="text-lg font-semibold leading-tight">
                  {result.findings.verdict === "verified" ? "Python is now Verified" : "Evidence below the bar"}
                </p>
                <p className="mt-1 text-[12px] text-muted font-mono break-all">
                  {result.findings.repoName} · {result.findings.mode.toUpperCase()}
                </p>
              </div>
            </div>

            <dl className="mt-4 receipt">
              <div className="grid grid-cols-2 gap-2 p-3 text-[12px]">
                <div>
                  <dt className="text-muted font-mono text-[10px] uppercase">Language bytes</dt>
                  <dd className="font-medium">{Object.entries(result.findings.languageShare).map(([k, v]) => `${k} ${v}%`).join("  ·  ")}</dd>
                </div>
                <div>
                  <dt className="text-muted font-mono text-[10px] uppercase">Commits (last 100)</dt>
                  <dd className="font-medium">{result.findings.commitsLastYear ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted font-mono text-[10px] uppercase">Last push</dt>
                  <dd className="font-medium">{result.findings.lastCommitDays ?? "—"} days ago</dd>
                </div>
                <div>
                  <dt className="text-muted font-mono text-[10px] uppercase">Evidence ID</dt>
                  <dd className="font-medium">{result.evidenceId ?? "—"}</dd>
                </div>
              </div>
            </dl>

            <h3 className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Why</h3>
            <ul className="mt-1 list-none text-[13px]">
              {result.findings.reasons.map((r, i) => (
                <li key={i} className="flex gap-2 py-1 border-b border-dashed border-line">
                  <span aria-hidden className="text-probe font-mono">→</span>
                  {r}
                </li>
              ))}
            </ul>
            {result.findings.verdict === "verified" && (
              <Link href="/student" className="mt-4 inline-flex items-center gap-2 border border-ledger text-ledger px-4 py-2 text-[13px] font-medium hover:bg-green-wash">
                See it on my ledger →
              </Link>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
