# Pre-Competition Plan — Quasar 5.0 (Jan 1, 2027, live presentation)

Posture changed 2026-11-04: this is the **selection gate**, not the build.
Goal = maximize selection odds with a coherent live presentation; the 36-hour
hack happens later, fresh, with selected teams.

## Re-prioritized tracks (in order)

### Track 1 — Pitch & narrative (the actual deliverable)
- A tight 8–10 slide deck: problem (ISR 2026 evidence), gap vs Superset/TCS iON,
  the 3-act solution, architecture, demo, impact model (placement rate delta,
  recruiter-hours saved), roadmap, team + cost to pilot
- The spoken 3–5 min narrative: open with the 56.35% / "match, not volume",
  land on the verification-stamp moment, close with one measurable pilot KPI
- 30s and 60s elevator versions (verbatim lines for hallway interview)
- Judged on: clarity, credibility, team, fit for college context — NOT feature count

### Track 2 — Demo spine reliability (what you show live)
- Current build is already demo-able; :commit-worthy fixes only
- Prerun the FULL golden flow many times on target machine; 60-second video backup
- Deterministic/verified fixture mode is the star; never trust venue Wi-Fi for the flip
- Add ONE wow that works offline: verification stamp flip on pre-linked repo
- Polish: slop pass (make-interfaces-feel-better), empty/loading states, ledger chips

### Track 3 — JudgeQ&A ammunition (defensible depth)
- Evidence: ISR 2026 numbers (Wheebox PDF + PIB citation), DPDP 2023 framing,
  Open Badges 3.0 / W3C VC reference for verifiable creds
- Competition slide: feature map vs Superset / TCS iON / LineupX / manual sheets
- Numbers discipline: every figure on slides traces to docs/research-brief.md
- Objection prep: "another Superset?" (evidence-gated + governance, not logistics),
  "AI hallucinates?" (human approve/override gate + audit trail),
  "₹ cost?" (free tier + pilot on one batch), "data privacy?" (DPDP patterns + revocable consent)

### Track 4 — Deepen proof, not breadth (if time)
Pick ONE, no more than two:
1. Real GitHub verification with a genuine public repo (evidence you ran it, not fixtures)
2. First real pilot artefact: one workshop questionnaire or N-student response data
3. Rules export / CSV export polish for the "NAAC-ready" story
4. Architecture one-pager (ports/adapters: analyzers behind an interface → swap fixtures↔live)

### Track 5 — Package & hygiene
- README: pitch-first, GIF, architecture diagram, deploy steps, links, team
- Cloud deploy (fix earlier blocked path) — useful for judges to click anytime
- Demo reset button + factory-fresh DB before every presentation
- One-page PRD/summary for the judges to keep

## What is DE-PRIORITIZED (was urgent for 36h, now optional)
- Aggressive deploy pipeline validation (keep, but relaxed)
- E2e exhaustiveness beyond golden flow
- 375px perfection (only needed if presenting from phone; still nice)
- More roles/dashboards (do NOT build more dashboards)

## Open questions for the user (need answers before Track 1 work)
1. Presentation format & time limit? (live from laptop, judged on demo? slides-only?)
2. Is a deployable public URL required for the pre-competition submission, or is a
   running local demo enough?
3. Deck required in .pptx / Google Slides / PDF — or in the room?
4. Who presents — you alone or team? Audience: judges only or also students/press?
5. What was the shortlisted shortlist criterion communicated by the organizers?
