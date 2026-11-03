# Draft — Agentic Placement Intelligence (Quasar 5.0, EdTech PS)

## Executive summary
College placement still runs on PDF resumes, spreadsheet eligibility filters, and
reactive training. India Skills Report 2026 puts employability at 56.35% (up from
54.81%) — real but modest progress; skill mismatch remains the binding constraint
(employers rate AI/IT skills hardest; only ~42.6% of graduates are considered
industry-ready in stricter indices). Existing placement platforms digitize
scheduling and applications but do not *verify skills from evidence* or explain
eligibility decisions. The problem statement asks for exactly that: one
multi-tenant platform that turns student evidence into a Verified Skill Graph,
closes gaps pre-recruitment, and automates the hiring workflow with explainable,
human-approved AI decisions under DPDPA-compliant governance.

## Q1: Is the problem real? (evidence check)
- **ISR 2026 (Wheebox, published with CII/AICTE partners):** employability rose
  54.81% → 56.35% YoY. Commerce grads 62.81%, Arts 55.55% — CS/IT and polytechnic
  laggards per PS framing (CS/IT ~78–80% claim from PS consistent with direction,
  though I verified the headline number, not the sub-figure).
- **PIB (govt.) doc:** acknowledges the same ISR trend (46% in 2020 → 56.4% in 2026)
  and frames skilling as national priority.
- **Graduate Skill Index 2025:** only ~42.6% judged industry-ready — a harder
  lens that shows the "degree ≠ readiness" gap employers complain about.
- **PLFS 2025 (per Raysolute summary):** graduate unemployment ~11.2%, ~3× the
  national rate — supply of degrees outstrips verified skills demand.
- **NIIT India Skills Gap Report 2026:** 51% of academic leaders think grads will
  be employer-ready within 3–5 years, only 35% of students optimistic — the
  college-side cannot see the gap; hence "match, not volume."

## Q2: Competing / prior solutions and the gap
1. **Superset** — market-leading campus placement automation: job posting,
   application, scheduling, corporate campus-hiring automation. Digitizes the
   *process*, not skills. No evidence-verified skill state, no explainable code.
2. **TCS iON NQT** — standardized benchmark test twice a month; recruiters trust
   the score, but it's a point-in-time exam, not a live verified profile, and
   serves the employer, not the college workflow.
3. **T&P spreadsheets** — the status quo the PS attacks: versionless eligibility
   filters, late training, no audit trail. (Superset's own blog admits teams
   "manually tracked student eligibility.")
4. **LineupX** — Superset alternative adding AI mock interviews/assessment; still
   assessment-first, not evidence-first.
5. **Open Badges 3.0 / W3C Verifiable Credentials (1EdTech, 2023)** — the
   standards layer for tamper-evident, portable skill credentials. Adopted by
   credential issuers, but not yet wired into Indian college placement systems —
   that integration is the open gap.

**Gap statement:** No mainstream Indian placement platform (a) builds a
*Verified Skill Graph from lived evidence* (GitHub/LeetCode/projects), (b) gates
"verified" on evidence with expiry, (c) exposes explainable, versioned
eligibility decisions, and (d) puts AI agents under mandatory human (T&P officer)
approval with fairness monitoring. Superset digitizes logistics; nothing proves
skill.

## Q3: Winning angles (mapped to judge criteria)
1. **"Evidence over claims" demo moment (judge impact: wow + honesty).** Live:
   link a GitHub repo → system finds Python code → skill flips Claimed →
   Verified with evidence trail + expiry. One click, understandable in 10
   seconds, and directly falsifiable — judges can't accuse vaporware.
2. **Explainable eligibility + fairness + "AI helps, human decides" (judge
   impact: governance maturity).** Show a rejected student's eligibility screen
   with the exact failed rule version, an appeal path, and a fairness parity
   check across gender/branch. This is a differentiator almost no 36h build
   bothers with — and the PS explicitly demands it.
3. **AgenticProfile: mock-drive report → AI learning path → new evidence →
   retest (judge impact: end-to-end story).** The closed loop "gap found → path
   assigned → proof produced → gap closed" demonstrates the platform *moves the
   number*, which is the metric T&P officers actually buy.

## Caveats / honesty notes
- The PS sub-figures (CS/IT 78–80%, polytech 32.92%) were not independently
  verified; only the 56.35% headline was.
- DPDPA 2023 compliance will be demonstrated as design patterns (consent, data
  isolation, purpose limitation), not legal certification.
- On Badges 3.0: we will show standards-aligned credential shape; full
  cryptographic issuance is a stretch goal, not a demo requirement.

## Open questions
- Does judge scoring favor breadth (all 3 dashboards) or depth (one golden flow)?
- Real GitHub API vs seeded fixtures for live demo (network risk at venue)?
