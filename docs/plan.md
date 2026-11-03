# Plan — Agentic Placement Intelligence Platform ("Pravega")

Quasar 5.0 · solo · 36h · deadline ≈ 11:30 IST Thu Nov 5 2026.
Design direction: docs/design-direction.md. Pivot: A + folded B/C (docs/ideation.md).

## 1. Golden demo flow (written FIRST — everything else supports this)

**Narrative: "One profile. One trail. Every decision explained." (3 minutes)**

- **Setup (5s):** Landing console logged in as T&P officer; cohort skill heatmap
  on screen. One line: "Placement runs on claims. We run on evidence."
- **ACT 1 — Evidence over claims (Student view, ~60s):**
  1. Student profile shows skills as ledger rows: state chips
     (Claimed/Verified/Expired/Expired-render as amber), each row opens its
     evidence packet (commits, test scores, attestation, confidence, expiry).
  2. Toggle "Verify from GitHub" → demo repo selected → analyzer runs →
     **Python: Claimed → Verified** with the animated stamp flip + evidence
     chain (commit refs, file count). Signature moment.
  3. Certificate row is >1y old → shows **Expired → must refresh** (evidence
     gating is not theater).
- **ACT 2 — The number moves (closed loop, ~60s):**
  1. Student takes Mock Drive (hardened run: pre-seeded results replay instantly
     for time; one live aptitude question answered to show it's real).
  2. Report: 3 round scores, weak topics, "why marks were lost" — plain words.
  3. AI flags gap vs target company JD ("Docker in 40% of new JDs, batch 10%").
  4. Learning path assigned (SQL practice + 1 mini-project) → task completed →
     new verifiable evidence produced → skill chips update → retest delta shown.
- **ACT 3 — AI helps, human decides (officer + governance, ~60s):**
  1. Officer console: agent queue shows 3 agent-drafted actions (interview
     questions for a drive, eligibility check sweep, schedule draft).
  2. Officer APPROVES one, **overrides one with a required reason** (writes to
     audit trail with rule version), defers one.
  3. Eligibility decision explorer: a student who failed shows the EXACT rule
     version that failed them + appeal button.
  4. Fairness panel: shortlist parity check across gender/branch with
     four-fifths benchmark — e.g. flags a disparity + suggests human review.
  5. Closing frame: "Every score explained. Every action logged. One profile,
     one trail." + recruiter cameo: search "Python, evidence: Verified" → match
     with reason codes (10s).
- **Recovery one-liner (if live GitHub fails):** "Network's shy — this is the
  same verification run on pre-computed fixtures; the evidence chain is
  identical." Flip to fixtures mode mid-demo without breaking rhythm.

## 2. MVP slice list (ordered, each independently demoable)

| # | Slice | Ships | PS requirements covered |
|---|---|---|---|
| 0 | Scaffold + tokens + seed data + auth (3 roles) | Running shell w/ design system | Roles + college-separate data (shared-schema tenant_id) |
| 1 | Skill ledger: states + evidence packets + expiry | Student skill table LIVE | Student Skill Profile, Skill Proof Check |
| 2 | GitHub importer + analyzer → verification flip | ACT 1 live moment | Safe Code Import, Evidence-gated verification |
| 3 | Mock Drive (3 rounds) + report | ACT 2 engine | Mock Drive + Personal Report |
| 4 | Gap analysis + AI learning path + evidence-producing tasks | loop closes | Skill Gap, Personal Learning Path |
| 5 | Eligibility engine (versioned rules) + explorer + appeal | ACT 3 core | Eligibility Rules, My Drives + Eligibility |
| 6 | Agent queue + approve/override + append-only audit log | ACT 3 core | AI Helps/Human Decides, Auditable trail |
| 7 | Officer dashboards: cohort heatmap, reports, fairness check | ACT 3 end + demo data | Cohort Skill Dashboard, Industry Skill-Gap Profiler, Fairness Check, Predictive Placement Analytics (rule-based forecast) |
| 8 | Recruiter search with reason codes | cameo + completeness | Recruiter Candidate Search |
| 9 | Bulk mailing stub, accreditation export (CSV/PDF stub), consent center | checkbox features | Bulk Mailing, Accreditation Suite, My Privacy + Consent |

Test note (hackathon-TDD): automated tests for the golden path + eligibility
engine + audit append-only property. Not exhaustive coverage.

## 3. Cut list (explicitly OUT — write it down)
- ❌ Real GitHub OAuth app flow → public-token + fixture files instead (PS asks
  read-only consent; we simulate the consent gate + revocation UI)
- ❌ Live LeetCode ingestion → fixtures
- ❌ Real ML model for placement prediction → transparent rule-based forecast
  (PS permits: "rule-based logic is equally acceptable"); label as estimate
- ❌ Full DPDPA `consent architecture` (DPO emails, breach pipelines) →
  consent center + purpose-limitation patterns only, documented
- ❌ Multi-college hierarchy (university→college→dept) → one college, tenant_id
  column everywhere (schema carries the multi-tenant shape)
- ❌ Real email sending → logged mail queue with preview
- ❌ Open Badges cryptographic issuance → standards-shaped credential JSON
  renderable/debuggable, clearly framed as a demo artifact
- ❌ Video-CV / Lottie marketing site — no marketing pages at all; app IS the
  first viewport (frontend-design-direction rule)

## 4. Stack decisions (boring, fast, zero learning curve)
- **Next.js 15 App Router + TypeScript + Tailwind CSS v4** — one deployable unit
- **Postgres via Supabase** (free tier) + **Drizzle ORM** — typed SQL, cheap
  migrations; **SQLite-file fallback profile for offline demo risk**
- **Auth:** lightweight cookie sessions + seeded users (agent/officer/student/
  recruiter). No OAuth complexity.
- **"AI" agents:** deterministic, explainable engines (reason codes, confidence,
  rule versions) — PS explicitly accepts rule-based. Optional live LLM call
  (question drafting) gated on an env key; never blocks demo.
- **Charts:** lightweight (no chart lib); heatmap as CSS grid + gradients.
- **Deploy:** Vercel. Seed script makes demo data fresh-visit-safe;
  "demo mode" reset button in footer (judges break things).

## 5. Repo skeleton
```
/ (git init @ root)
  docs/              research-brief, ideation, design-direction, plan
  HACKATHON.md       state ledger
  app/               Next.js app router tree
    (auth)/          seeded login
    student/         ledger, mock-drive, path, drives
    officer/         queue, heatmap, rules, fairness
    recruiter/       search
    api/             route handlers (import, verify, drive, agents, rules)
  lib/               db (drizzle), audit, agents/, analyzers/, fixtures/
  db/                schema + seeds + drizzle config
  tests/             golden-path e2e (Playwright) + unit (vitest)
```
Conventional commits per slice; `git init` + docs commit now, scaffold next.

## 6. Scope-vs-time verdict
~35.25h remain. Solo: 10 slices ≈ 2.5–3h each = 25–30h build; harden 3h;
deploy 1h; win package 2–3h; demo-drills buffer ~1.5h. **Verdict: feasible but
with ZERO slack — cuts on trigger:** if behind at slice 6, drop slice 8
(recruiter cameo reduces to static screen) and slice 9 (fold accreditation into
heatmap export). Golden flow slices 0–7 protected; feature freeze after Phase 5
begins.
