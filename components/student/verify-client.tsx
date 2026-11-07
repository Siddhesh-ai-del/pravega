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
      setError("Network error — is the dev server / API reachable?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 0 }}>
      <div style={{ padding: "20px 24px" }}>
        <div style={{ maxWidth: "560px" }}>
          <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "8px" }}>REPOSITORY TO VERIFY — PYTHON</p>
          <input
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            disabled={busy}
            spellCheck={false}
            className="brutal-input"
            style={{ width: "100%", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}
            placeholder="github.com/owner/repo"
          />
          <p className="body-sm" style={{ color: "var(--muted-text)", marginTop: "8px", fontSize: "11px" }}>
            Try a seeded replay, or any public repo — e.g.{" "}
            <button type="button" style={{ textDecoration: "underline", color: "var(--ink)", background: "none", border: "none", cursor: "pointer", fontSize: "11px" }}
              onClick={() => setRepo("github.com/pallets/click")}>
              github.com/pallets/click
            </button>
          </p>

          <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", border: "3px solid var(--border)", background: "var(--card)", padding: "12px", marginTop: "12px", cursor: "pointer" }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: "2px", accentColor: "var(--spot)" }} />
            <span className="body-sm" style={{ fontSize: "12px" }}>
              I consent to <b>read-only</b> access (repo metadata, languages, commit timestamps). I can revoke this at any time in{" "}
              <Link href="/student/consent" style={{ textDecoration: "underline", color: "var(--ink)" }}>My Privacy</Link>.
            </span>
          </label>

          <button
            type="button"
            onClick={run}
            disabled={!consent || busy || repo.trim().length < 9}
            className="btn-brutal-primary"
            style={{ marginTop: "12px" }}
          >
            {busy ? "VERIFYING…" : "VERIFY PYTHON →"}
          </button>
        </div>

        <ol style={{ listStyle: "none", marginTop: "16px", maxWidth: "560px", border: "3px solid var(--border)", background: "var(--card)" }}>
          {STEPS.map((label, i) => {
            const done = step > i || step === STEPS.length;
            const active = step === i;
            return (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderBottom: i < STEPS.length - 1 ? "2px solid var(--border)" : "none", fontSize: "12px" }}>
                <span style={{
                  width: "24px", height: "24px", display: "grid", placeItems: "center",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", fontWeight: 700,
                  border: "2px solid var(--border)",
                  background: done ? "var(--primary)" : active ? "var(--concrete)" : "var(--muted)",
                  color: done ? "var(--primary-foreground)" : "var(--ink)",
                }}>
                  {done ? "✓" : i + 1}
                </span>
                <span style={{ color: done ? "var(--ink)" : "var(--muted-text)" }}>{label}</span>
              </li>
            );
          })}
        </ol>
        {error && (
          <div role="alert" style={{ marginTop: "12px", maxWidth: "560px", border: "3px solid var(--destructive)", background: "var(--destructive-foreground)", padding: "10px 12px", fontSize: "12px", color: "var(--destructive)" }}>
            {error}
          </div>
        )}
      </div>

      {/* result panel */}
      <aside style={{ borderLeft: "4px solid var(--border)", padding: "20px", background: "var(--concrete-dark)" }}>
        <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "12px" }}>EVIDENCE CHAIN</p>

        {!result && !busy && (
          <div style={{ border: "2px dashed var(--border)", padding: "16px", fontSize: "12px", color: "var(--muted-text)" }}>
            {name}, your check resolves into one of two outcomes — there is no &ldquo;submit &amp; hope&rdquo;.
            The chain shows <b>why</b> it passed or failed.
          </div>
        )}

        {busy && <p className="body-sm" style={{ color: "var(--muted-text)", animation: "pulse 1.5s infinite" }}>Reading the repository…</p>}

        {result && (
          <div>
            {result.findings.mode === "fixtures" && (
              <span className="brutal-chip" style={{ marginBottom: "12px", display: "inline-block" }}>REPLAY MODE — PRECOMPUTED EVIDENCE, LABELED</span>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
              <span
                className="verify-stamp"
                style={{
                  width: "80px", height: "80px", display: "grid", placeItems: "center",
                  border: `4px solid ${result.findings.verdict === "verified" ? "var(--primary)" : "var(--destructive)"}`,
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 700,
                  textAlign: "center", lineHeight: "1.2", transform: "rotate(-3deg)",
                  background: result.findings.verdict === "verified" ? "var(--primary)" : "var(--destructive)",
                  color: result.findings.verdict === "verified" ? "var(--primary-foreground)" : "var(--destructive-foreground)",
                }}
              >
                {result.findings.verdict === "verified" ? "✓\nVERIFIED" : "✗\nREJECTED"}
              </span>
              <div>
                <p style={{ fontSize: "16px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em" }}>
                  {result.findings.verdict === "verified" ? "Python is now Verified" : "Evidence below the bar"}
                </p>
                <p className="case-number" style={{ color: "var(--muted-text)", marginTop: "4px" }}>
                  {result.findings.repoName} · {result.findings.mode.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="receipt" style={{ padding: "12px", marginBottom: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px" }}>
                <div>
                  <div className="case-number" style={{ color: "var(--muted-text)" }}>LANGUAGE BYTES</div>
                  <div style={{ fontWeight: 700, marginTop: "2px" }}>{Object.entries(result.findings.languageShare).map(([k, v]) => `${k} ${v}%`).join(" · ")}</div>
                </div>
                <div>
                  <div className="case-number" style={{ color: "var(--muted-text)" }}>COMMITS (LAST 100)</div>
                  <div style={{ fontWeight: 700, marginTop: "2px" }}>{result.findings.commitsLastYear ?? "—"}</div>
                </div>
                <div>
                  <div className="case-number" style={{ color: "var(--muted-text)" }}>LAST PUSH</div>
                  <div style={{ fontWeight: 700, marginTop: "2px" }}>{result.findings.lastCommitDays ?? "—"} days ago</div>
                </div>
                <div>
                  <div className="case-number" style={{ color: "var(--muted-text)" }}>EVIDENCE ID</div>
                  <div style={{ fontWeight: 700, marginTop: "2px", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px" }}>{result.evidenceId ?? "—"}</div>
                </div>
              </div>
            </div>

            <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "6px" }}>WHY</p>
            <ul style={{ listStyle: "none" }}>
              {result.findings.reasons.map((r, i) => (
                <li key={i} style={{ display: "flex", gap: "8px", padding: "6px 0", borderBottom: "1px dashed var(--border)", fontSize: "12px" }}>
                  <span style={{ color: "var(--spot)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>→</span>
                  {r}
                </li>
              ))}
            </ul>
            {result.findings.verdict === "verified" && (
              <Link href="/student" className="btn-brutal-primary" style={{ marginTop: "12px", display: "inline-flex" }}>
                SEE IT ON MY LEDGER →
              </Link>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
