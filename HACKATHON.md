# HACKATHON STATE — Quasar 5.0 (VPPCOEVA, 36-Hour International Hackathon)
Status: phase-4 | Build (awaiting scope approval)
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
- [ ] build
- [ ] harden
- [ ] deploy
- [ ] win package

## Time discipline callouts
- Solo + 36h + AI-agent platform scope = highest risk is scope creep, not code quality.
  Golden demo flow locked in docs/plan.md.
- Trigger cuts (locked): behind at slice 6 → slice 8 static cameo, slice 9 folded.
