# Design Direction — Placement Intelligence Platform ("working name: Pravega")

Per the Universal UI/UX Exploration & Design Intelligence Protocol. Integrated
into the hackathon pipeline (Phase 3 Blueprint; skills applied in Phase 4 build).

## 1. Design capabilities available (inspected)
- ✅ `frontend-design-direction` — READ (this doc follows its review checklist)
- `frontend-patterns` — correctness layer (Phase 4)
- `make-interfaces-feel-better` — dedicated polish pass (Phase 4, final slices)
- `motion-foundations` → `motion-patterns` — one signature transition max
- `frontend-a11y` — keyboard walkthrough gate (Phase 5)
- `design-system` — available for audit if needed (optional)
- `ui-demo` / `frontend-slides` — Phase 7 packaging (deck must not look templated)

## 2. Product understanding
- **Problem:** placement runs on unverifiable claims; decisions are
  un-explainable; training is reactive. The UI must make *evidence, decisions,
  and trust* legible.
- **Users / primary workflows:**
  1. **T&P officer** (the operator, most frequent user): review agent actions,
     approve/override, manage eligibility rules + drives, cohort heatmap scan
  2. **Student:** see verified profile, mock-drive report, learning path,
     drive eligibility (and why)
  3. **Recruiter** (demo cameo): search "why did this match"
  4. **Judges:** watch a 3-min narrative — clarity at 2m projector distance
- **Info needed:** skill states (Claimed/Verified/Expired) WITH evidence, gap
  deltas, rule versions, approval queue state, audit trail
- **Frustrations to design against:** opaque scores, spreadsheet filters, fake
  AI, missed approvals
- **Constraints:** solo build, 36h, 375px walkthrough per slice, WCAG 2.2 AA via
  frontend-a11y, reduced-motion respect

## 3–5. Design concepts explored & evaluated

| Direction | Strengths | Weaknesses | Verdict |
|---|---|---|---|
| **1. Generic SaaS shadcn dashboard** | Fast (prebuilt), familiar | Protocol violation: generic template; no memorable detail; judges see a boilerplate app | ✗ rejected |
| **2. Neo-brutalist poster app** | Distinctive, high-contrast blocks | Noisy for repeated officer workflows; slows scanning; motion-heavy | ✗ rejected |
| **3. Glassmorphism command center** | Looks "demo cool" | Low AA contrast risk, decorative, masks data density; performance overhead | ✗ rejected |
| **4. Swiss/International typographic data-dense registry** | Quiet, scannable, hierarchy through type not boxes; dense tables feel intentional; projector-legible | Risk of feeling cold; needs typography discipline to avoid monotony | ★ core |
| **5. Editorial "audit dossier / evidence ledger"** | Direct metaphor for the product (one trail, append-only); monospace IDs, receipt-like evidence rows, verification flip = a stamp moment | Editorial elements must stay functional, not merely pretty | ★ signature layer |

**Selected: 4 + 5 combined — "Registry with a visible ledger."**
Swiss data-density for the officer console; evidence rendered as ledger
receipts (every skill shows: state → evidence → confidence → expiry). The ONE
memorable detail: **the verification flip** — a Claimed chip becomes a Verified
"stamp" with an animated evidence-chain reveal (the Signature Transition;
`motion-foundations` spring, reduced-motion = instant swap).

## 6. Design system (tokens, boring-tech friendly)
- **Typography:** system UI stack for UI text (fast, no font-loading risk at the
  venue) + `ui-monospace` for evidence IDs / rule versions / hashes. Scale:
  12/13/14/16/20/28 nearby steps; line-height 1.45 body.
- **Color (multi-dimension, not one hue):** neutral ink/paper ramp (light-first
  for projector + 375px legibility), **probe indigo** for interactive, **ledger
  green** for Verified state, **amber** for Expiring/Expired, **red** reserved
  for fairness flags/errors. All pairs checked ≥4.5:1 text.
- **Spacing/grid:** 4px scale; 12-col desktop, single-column 375px; tables on a
  stable 8/16/24 rhythm (fixed toolbars per design-direction guidance).
- **Shape:** 1px borders, 6px radius max — receipts, not bubbles.
- **States:** every interactive element defines hi-focus (visible 2px ring),
  hover, disabled, error; evidence chips have all 4 skill states styled.
- **Motion:** signature flip only + input feedback; `prefers-reduced-motion`
  honored; nothing else animates.
- **Data viz:** cohort heatmap tinted from paper→ink (works for color-blind
  amb virt?), gap deltas as signed text + tint, not color-only encode.

## 7. Workflow validation (realistic checks)
- New user: student dashboard first-vue explains skill state in ≤3s (chip +
  evidence line, no jargon)
- Officer: queue enables keyboard complete-and-approve flow (arrow/enter/1-2)
- Overturn risks identified: agent action needed → override is visible default,
  reason picker mandatory, every override writes to audit trail
- Error/empty states: repo fetch fail → explicit "fixtures mode" banner (never
  silently fake), drives empty state prompts posting drive
- 375px: evidence packet wraps to stacked receipts; verified flip intact
- Known assumption (unresolved): projection screen contrast — fixed with
  projector-dark-mode check in harden phase if time allows

## 8. One-line design opinion (recorded for HACKATHON.md)
**"An audit registry you can read at arm's length: Swiss-dense, ledger-honest,
with one unmissable verification stamp."**
