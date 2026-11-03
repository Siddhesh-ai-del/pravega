# Ideation — Agentic Placement Intelligence (Quasar 5.0)

Feature scope is fixed by the PS (~20 features, 3 dashboards). Ideation here =
which PILLAR the golden demo path centers on, and how deep each goes.
Scale: 1–5 per criterion. Judging fit = explicit PS criteria (explainable,
auditable, human-approved AI, evidence-gated, multi-tenant).
Scope risk shown as risk (lower is better).

## Candidates

### A. "Evidence Over Claims" — Skill Verification as the star
One golden moment: officer/student links a GitHub repo → analyzer finds code
factors → skill flips Claimed → Verified with evidence trail + expiry. Rest of
the platform orbits this (eligibility reads verified skills; recruiter searches
verified skills; gap analysis consumes verified state).
- Judging fit: 5 (evidence-gated verification = PS pillar #1, most explicit)
- Demo-ability: 5 (falsifiable live, works offline w/ fixtures fallback)
- Scope risk (risk): 3 (repo analysis needs a believable analyzer; fixtures OK)
- Wow factor: 5 (10-second, judge-verifiable moment)
- Honesty: 5 (nothing faked; states real)
- **Total: 23/25**

### B. "AI Helps, Human Decides" — Agent command center as the star
Officer dashboard where agent activities (profiling runs, eligibility checks,
scheduling drafts, interview question generation) queue for human
review/override; every action logged; override reasons recorded.
- Judging fit: 5 (explicit governance requirement)
- Demo-ability: 4 (approval queue = great screens, slower narrative)
- Scope risk (risk): 2 (CRUD + simulated agent runs)
- Wow factor: 3 (impressive but admin-ish)
- Honesty: 4 (agents must look real; risk of fake-ness)
- **Total: 18/25**

### C. "The Number Moves" — Closed loop Gap→Path→Proof→Retest
Student takes mock drive → report shows weak SQL → AI assigns learning path →
student completes practice producing new verifiable evidence → gap closes →
mock retest score rises.
- Judging fit: 5 (skill-gap + learning path pillar; T&P "value" metric)
- Demo-ability: 4 (multi-step; needs seeded time-lapse states)
- Scope risk (risk): 3 (mock drive = 3 rounds + questions + scoring)
- Wow factor: 4 (before/after delta is compelling)
- Honesty: 4 (must avoid fabricating improvements)
- **Total: 20/25**

### D. "Governance Vault" — Explainability + fairness audit as the star
Rejected student screen with exact failed rule version, appeal path; fairness
parity check across gender/branch/college-tier flags disparity for review;
append-only audit trail explorer.
- Judging fit: 5 (DPDPA/fairness explicit in PS)
- Demo-ability: 3 (abstract; hard to make sing in 3 min)
- Scope risk (risk): 2 (computable from rules + seed data)
- Wow factor: 2
- Honesty: 5
- **Total: 17/25**

### E. "Recruiter Lens" — Talent discovery as the star
Recruiter searches by verified skills; every match shows *why* (evidence
weight); no opaque scores.
- Judging fit: 4 (third pillar; "reason codes for every match")
- Demo-ability: 4 (nice search demo; but weakest emotional stake)
- Scope risk (risk): 1
- Wow factor: 3
- Honesty: 4
- **Total: 16/25**

### F. "Breadth Build" — every feature shallow, all dashboards
- Judging fit: 3 | Demo-ability: 2 (nothing memorable) | Scope risk (risk): 5
  (high — solo + 36h) | Wow factor: 2 | Honesty: 3 | **Total: 15/25**

## Recommendation
**A as the spine, folded with B and C as acts 2–3 of the demo:**
1. Act 1 (A): live skill verification from GitHub evidence (the 10-second wow)
2. Act 2 (C): mock drive → gap → AI learning path → new evidence (the story)
3. Act 3 (B): officer approves agent-scheduled drive + overrides one agent
   action, with fairness check visible (the governance proof)
D and E become supporting screens (audit trail + recruiter search cameo),
not pillars. F is rejected outright.
