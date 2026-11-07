# Pravega

[![CI](https://img.shields.io/github/actions/workflow/status/Siddhesh-ai-del/pravega/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=1e1e2e&color=a6e3a1&logo=githubactions&logoColor=1e1e2e)](https://github.com/Siddhesh-ai-del/pravega/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-89b4fa?style=for-the-badge&logo=nextdotjs&logoColor=1e1e2e&labelColor=1e1e2e)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-89b4fa?style=for-the-badge&logo=typescript&logoColor=1e1e2e&labelColor=1e1e2e)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-74c7ec?style=for-the-badge&logo=tailwindcss&logoColor=1e1e2e&labelColor=1e1e2e)](https://tailwindcss.com)
[![Playwright](https://img.shields.io/badge/E2E-3%2F3_passing-a6e3a1?style=for-the-badge&logo=playwright&logoColor=1e1e2e&labelColor=1e1e2e)](./tests/golden-flow.spec.ts)
[![License](https://img.shields.io/badge/License-MIT-cba6f7?style=for-the-badge&labelColor=1e1e2e)](./LICENSE)
[![Catppuccin](https://img.shields.io/badge/Catppuccin-Mocha-cba6f7?style=for-the-badge&logo=catppuccin&logoColor=1e1e2e&labelColor=1e1e2e)](https://github.com/catppuccin/catppuccin)

> **One profile. One trail. Every decision explained.**
> Evidence-verified placement intelligence for college Training & Placement cells —
> built for the Quasar 5.0 international hackathon (VPPCOE & VA, EdTech track).

<p align="center">
  <img src="docs/screenshots/brutalist-ledger.png" alt="Pravega skill ledger — verified/claimed/expired states with evidence packets" width="49%" />
  <img src="docs/screenshots/brutalist-verify.png" alt="Evidence-gated verification — Claimed flips to Verified against repo evidence, labeled replay mode" width="49%" />
</p>

## Why Pravega

College placements still run on **unverifiable claims**. The India Skills Report 2026
puts graduate employability at **56.35%** — real, but barely moving — while graduate
unemployment sits at roughly **11.2%**, about 3× the national rate. Employers can't
tell which graduates actually have the skills; T&P officers can't audit the decisions
they make under deadline pressure; training is reactive, not predictive.

Every existing tool (Superset, TCS iON, LineupX) digitises the **logistics** of a
drive — posting, applying, scheduling. None of them verify the **person**. Pravega
does: it turns self-declared skills into an **evidence-gated Verified Skill Graph**,
closes skill gaps with a measurable learning loop, and puts every AI decision under a
human gate with an append-only audit trail — so NAAC/NIRF outcomes are *evidence*,
not compiled by hand.

## The three acts

1. **Evidence over claims** — a student links a GitHub repo; the analyzer reads
   language bytes, commit cadence and test presence; the skill flips
   `Claimed → Verified` (expiry-tracked) with an evidence chain. A failed live fetch
   falls back to a **labeled replay** — never silent.
2. **The number moves** — mock drive → weak SQL flagged → AI assigns a learning path
   whose tasks produce **real evidence** → retest delta shown. The loop closes in
   days, not placement seasons.
3. **AI helps, human decides** — agents draft interview sets, eligibility sweeps and
   schedule drafts; the officer **approves or overrides (mandatory reason)**; every
   action writes to an append-only audit log. A fairness parity scan (four-fifths
   rule) runs on every shortlist.

## Feature map (vs. the problem statement)

| Pillar | Pravega feature | Status |
|---|---|---|
| Evidence-Based Competency Profiling | Skill ledger with `claimed / verified / expired` states + evidence receipts | ✅ |
| Skill Proof Check | GitHub importer + analyzer (live + labeled fixtures replay) | ✅ |
| Skill-Gap Bridging | Mock drive (3 rounds) → gap report → AI learning path whose tasks produce evidence | ✅ |
| Agentic Placement Intelligence | Agent queue — approve / override-with-reason / defer | ✅ |
| Explainable decisions | Versioned eligibility rules (`v3`) with reason codes + appeal path | ✅ |
| Governance & trust | Append-only audit log, fairness parity scan, DPDPA-style consent center | ✅ |
| Cohort & industry analytics | Heatmap + NAAC/NIRF CSV export | ✅ |
| Recruiter discovery | Evidence-first search — every match shows *why* | ✅ |

## Architecture

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  GitHub REST │ → │  Analyzer    │ → │  Evidence    │ → │  Rules       │ → │  Agent runner│
│  read-only   │   │  ports/adapt │   │  ledger (DB) │   │  engine v3   │   │  + human gate│
│  revocable   │   │  labeled FB  │   │  expiry-tracked│  │  parse-free  │   │  audit_log   │
└──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
       Next.js 16 · React 19 · TypeScript · Tailwind v4 · Drizzle ORM · Postgres (Supabase ap-south-1)
```

The analyzer is a **port/adapter**: swap fixtures ↔ live GitHub with zero change above
the ledger. Agents are deterministic engines with reason codes and confidence — no LLM
on the critical path (LLM is optional for drafting interview questions, never for deciding).

## Tech stack

- **Framework:** Next.js 16 (App Router) · React 19 · TypeScript 5
- **Styling:** Tailwind CSS v4 · design tokens in `app/globals.css` (The Quiet Ledger —
  monochrome graphite, single violet accent)
- **Database:** Postgres · Drizzle ORM · Supabase (ap-south-1, Mumbai)
- **Auth:** HMAC-signed httpOnly cookie sessions (role-scoped: student / officer / recruiter)
- **Testing:** Playwright — golden demo flow passes 3/3
- **CI:** GitHub Actions — typecheck + lint + build + e2e (see `.github/workflows/ci.yml`)

## Run locally

```bash
# 1. install
npm ci

# 2. environment
cp .env .env.local   # or create .env with:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pravega
# SESSION_SECRET=<strong-random>
# GITHUB_TOKEN=        # optional; demo works without it

# 3. schema + seed (factory demo data)
npx drizzle-kit push --force
npx tsx db/seed.ts

# 4. dev
npm run dev            # http://localhost:3000
```

Sign in with any seeded persona (no passwords — demo mode). Default demo lead:
**Rahul Jadhav** (student) → `Python` is `claimed`; click *Verify Python* to watch
the stamp flip.

## Project layout

```
app/                 Next.js routes (student / officer / recruiter / design-lab)
components/          shells, design-lab variants (monochrome + 5 legacy), UI primitives
db/                  Drizzle schema + seed
lib/                 auth, audit, analyzers, eligibility, actions
scripts/             deck builder + verification gate (make-ppts)
docs/                research brief, ideation, design direction, plan, round-1 facts,
                     security notes, remaining work
tests/               golden-flow.spec.ts (Playwright, 3×)
```

## Security posture

See [`docs/security-notes.md`](./docs/security-notes.md). Highlights: zod on every POST
route, parameterized queries (Drizzle), httpOnly `SameSite=strict` session cookie,
append-only audit log by construction, 10 req/min rate limit on the verify endpoint,
security headers (nosniff, frame-DENY, referrer-strict, permissions-policy),
0 high/critical npm-audit findings. CSP is intentionally unset pending a nonce
rollout — documented, not hidden.

## Hackathon context

- **Round 1:** online PPT presentation + live online evaluation (5 min) → selects
  teams for the **offline hackathon, 23–24 January 2027**.
- **PS:** EdTech — Agentic Placement Intelligence Platform (pages 13–18 of
  `quasar-problem-statements.pdf`).
- **Track:** Evidence-Based Competency Profiling · Skill-Gap Bridging ·
  Agentic Placement Intelligence · Governance & Trust.

## License

[MIT](./LICENSE) — © 2026 Siddhesh. Built for the Quasar 5.0 hackathon.
EOF
echo README written