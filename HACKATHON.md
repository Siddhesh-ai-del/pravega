# HACKATHON STATE — Quasar 5.0 (VPPCOEVA, 36-Hour International Hackathon)
Status: phase-6 | Deploy
Deadline: ~11:30 IST / ~06:00 UTC, Thu Nov 5, 2026 (36h from start ~23:30 IST Tue Nov 3, 2026)
Time remaining: ~36h at kickoff

## Context
- Hackathon: Quasar 5.0, hosted by VPPCOEVA T&P Office
- Chosen PS: **EdTech — Agentic Placement Intelligence Platform** (PDF pages 13–18)
- Rules & eligibility: demonstrable working prototype; evaluation per PS pages 13–18
- Submission format: **all of the above** — deployed public URL, GitHub repo, demo video (≤90s unless specified), pitch deck, polished README
- Team size / mode: **Solo** (sequential slices, no Team mode)
- Tech constraints: user gave free rein — pick boring/fast/well-known stack (no learning curves). Software-only build.
- Course materials: problem statements in `quasar-problem-statements.pdf`; extracted text at
  `docs/ps-edtech.md`

## Decisions (append-only)
- 2026-11-03: PS chosen = EdTech Agentic Placement Intelligence. Software-only PS → best
  demo-ability for solo build in 36h; hardware PSes (CompostIQ, Vibration) rejected for scope risk.
- 2026-11-03: PDF is image-based; text extracted by rendering pages to PNG and reading images.
- 2026-11-03: Stack: to be decided in Phase 3 (Blueprint) — boring & fast per user.
- 2026-11-03: Ideation pivot chosen: **A + folded B/C** — evidence-over-claims
  verification as demo spine; Act 2 = closed-loop gap→path→proof→retest (C);
  Act 3 = agent approval + fairness/audit governance (B). D/E as supporting
  screens. Breadth build rejected. See docs/ideation.md.
- 2026-11-03: Working name "Pravega". Design direction (per user's UI/UX
  protocol): **Swiss-dense audit registry w/ evidence-ledger metaphor**; one
  signature transition = verification stamp flip. See docs/design-direction.md.
- 2026-11-03: Stack locked: Next.js 15 + TypeScript + Tailwind v4 + Drizzle +
  Postgres (Supabase free tier; SQLite offline fallback), cookie-session auth,
  deterministic explainable agents, fixtures-first external data.
- 2026-11-03: Trigger cuts agreed: behind at slice 6 → drop slice 8 to static
  cameo and fold slice 9 into heatmap export.
- 2026-11-03 (Nov 04, ~00:10 IST): Reused user's existing local Supabase stack
  (port 54322); created dedicated `pravega` DB. Next 16 cacheComponents ENABLED
  by default; auth-heavy internal tool → disabled per official docs
  ("caching-without-cache-components"); pages use plain cookies() reads.
- 2026-11-03/04: npm scripts can't run local bins in this sandbox — run tools
  directly (./node_modules/.bin/tsc, next, tsx).
- 2026-11-04: S2 done & verified live (Playwright): Rahul Python flip via
  labeled fixtures replay; audit rows written; seed re-run to reset demo state.
- 2026-11-04: Phase 5 hardening done: zod on POST routes, SameSite=strict cookie,
  security headers, 10 req/min verify limiter, audit = append-only by construction;
  npm audit: 0 high/critical (20 moderate transitive → noted). A11y spot-check:
  Tab navigation on /login lands on persona button with visible 2px outline.
- 2026-11-04: National NAAC/NIRF CSV export checks out; heatmap export button renders.
- 2026-11-04: Golden e2e (Playwright) passes 3/3 — tests/golden-flow.spec.ts
  (global setup reseeds factory data). Full keyboard+375px pass done via MCP.
- 2026-11-03/04: S0+S1 done & verified live: login → ledger (verified/claimed
  flip source data present; Rahul: Python claimed, SQL verified, React, Git).

## Artifacts
- Research brief: `docs/research-brief.md` ✅ (2026-11-03, PASS WITH NOTES; provenance in outputs/.drafts/)
- Plan: —
- Deck: —
- Demo video: —
- README status: 0%

## Completed phases
- [x] kickoff
- [x] research (2026-11-03 — brief delivered with inline sources)
- [x] ideation (2026-11-03 — A+folded B/C chosen; matrix in docs/ideation.md)
- [x] blueprint (2026-11-03 — docs/plan.md + docs/design-direction.md; git initialized, docs committed)
- [x] build — slices 0–9 DONE & verified live (Nov 04 ~02:00 IST); golden flow
  walked end-to-end (login → ledger → verify flip → mock drive + live SQL gate →
  path task → drives) with Playwright; build passes clean; recruiter + all 6
  officer screens render; 375px pass OK (screenshot in .playwright-mcp/, gitignored). dogfood note:
  npm scripts broken in sandbox → run binaries directly.
- [x] harden (2026-11-04 — docs/security-notes.md; golden e2e 3/3; build clean;
  feature freeze active)
- [ ] deploy
- [ ] win package

## Time discipline callouts
- Solo + 36h + AI-agent platform scope = highest risk is scope creep, not code quality.
  Golden demo flow locked in docs/plan.md.
- Trigger cuts (locked): behind at slice 6 → slice 8 static cameo, slice 9 folded.
