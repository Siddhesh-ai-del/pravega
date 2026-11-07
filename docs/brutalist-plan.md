# Bold Brutalist Ledger — Full UI Replacement Plan v2

## Component Library Integration Map

We're using ALL 6 libraries, taking the best from each. Here's exactly what comes from where:

### 1. NeoBrutalism UI (neobrutalism.dev) — THE base layer
- **What it gives:** shadcn-based brutalist components — Button, Card, Badge, Input, Table, Dialog, Tabs, Tooltip, Separator, Avatar, Alert
- **Why:** Purpose-built for brutalism. Hard shadows (3px offset, solid black, no blur), thick borders (2-3px), square corners (radius: 0), mono tags, heavy type. Replaces our hand-rolled brutalist components with a polished, tested library.
- **Integration:** Copy-paste components into `components/ui/` (overwrite existing shadcn ones). They're MIT-licensed and shadcn-compatible.
- **Used on:** EVERY screen — all buttons, cards, badges, inputs, tables, dialogs

### 2. react-fast-marquee — The ticker strip
- **What it gives:** Lightweight marquee/ticker component (CSS-based, silky smooth)
- **Why:** Brutalist signature move — full-width color band with repeated mono text along one edge. "append-only · no delete path · tenant: vpcoe · 1,204 audit entries" scrolling.
- **Integration:** `npm install react-fast-marquee` ✅ (done). Import `<Marquee>` component.
- **Used on:** Footer strip (every page), top bar status ticker, section dividers

### 3. Motion (Framer Motion) — The life
- **What it gives:** Animation primitives — number tickers, spring physics, gesture handling, scroll triggers, layout animations
- **Why:** Makes the brutalist feel alive without going soft. The stamp flip (our signature transition), card entrance stagger, number count-up on KPIs.
- **Integration:** `npm install motion` ✅ (done). Import from `motion/react`.
- **Used on:** KPI number count-up, verification stamp flip, card entrance stagger (3 cards cascade in), hover micro-interactions

### 4. NumberFlow (@number-flow/react) — The giant numerals
- **What it gives:** Animated number counters — dependency-free, accessible, tabular-nums
- **Why:** The "giant numeral" signature element becomes interactive. 128 ticks up on page load. 3/3 e2e badge counts up.
- **Integration:** `npm install @number-flow/react` ✅ (done). Import `<NumberFlow>`.
- **Used on:** KPI strip (128, 3, 2, 1,204), verified count on student ledger, composite score on mock drive

### 5. Aceternity UI — The one "wow" moment
- **What it gives:** 200+ animated components — 3D cards, parallax, text effects, backgrounds, spotlight, meteors, aurora
- **Why:** One "wow" moment per deck. The verification stamp flip could use a 3D card tilt. The hero number on the login screen could use a text reveal animation. Used VERY sparingly — brutalist says "one signature move per page."
- **Integration:** Copy-paste specific components (not the whole library). We'll pick 2-3.
- **Used on:** Login hero "PRAVEGA." text reveal, verification stamp 3D flip, one parallax section

### 6. Magic UI — The subtle enhancements
- **What it gives:** 150+ animated components — animated counters, beam animations, border gradients, shine effects, marquee, particles
- **Why:** Subtle enhancements that don't break brutalism. Animated border on active nav item. Shine effect on the "SEALED" stamp. Marquee for the ticker (alternative to react-fast-marquee).
- **Integration:** Copy-paste specific components. We'll pick 2-3.
- **Used on:** Active nav indicator animation, sealed stamp shine, audit trail row entrance

## Component-to-Screen Map

### Login Screen
- NeoBrutalism: Button (inverted), Card (sticker), Input (hard border), Badge (mono tag)
- Aceternity: Text reveal animation on "PRAVEGA." display type
- Motion: Card entrance stagger (persona cards cascade in)
- react-fast-marquee: "VERIFYING LEDGER · APPEND-ONLY · NO DELETE PATH" ticker at top

### Student Ledger (app/student/page.tsx)
- NeoBrutalism: Table (hard borders, zebra), Badge (state chips), Card (evidence receipts)
- NumberFlow: Verified count ticks up (3/5)
- Motion: Evidence packet cards stagger in from right
- react-fast-marquee: "SKILL LEDGER · EVIDENCE-GATED · EXPIRY-TRACKED" footer ticker

### Verification Flow (app/student/verify/page.tsx + verify-client.tsx)
- NeoBrutalism: Button, Input, Card, Progress (steps as numbered blocks)
- Aceternity: 3D card tilt on the result panel (the "wow" moment)
- Motion: Stamp flip (signature transition), step progression animation
- Magic UI: Shine effect on VERIFIED stamp
- react-fast-marquee: "CONSENT · READ-ONLY · REVOCABLE" ticker

### Mock Drive (app/student/mock-drive/page.tsx + mock-drive-client.tsx)
- NeoBrutalism: Card (rounds), Radio (hard borders), Badge (weak topics)
- Motion: Round cards cascade in, live gate answer feedback animation
- NumberFlow: Composite score ticks up
- react-fast-marquee: "MOCK DRIVE · 3 ROUNDS · LIVE GATE" ticker

### Learning Path (app/student/learning-path/page.tsx + learning-path-client.tsx)
- NeoBrutalism: Checkbox (hard border), Card (tasks), Progress bar
- Motion: Task completion animation (checkmark draws in), progress bar fills
- NumberFlow: Task counter (1/3 → 2/3 → 3/3)
- react-fast-marquee: "GAP-CLOSING · EVIDENCE-PRODUCING" ticker

### Drives (app/student/drives/page.tsx)
- NeoBrutalism: Card (drive cards), Badge (eligibility verdict), Button (appeal)
- Motion: Drive cards entrance stagger

### Consent (app/student/consent/page.tsx)
- NeoBrutalism: Toggle (hard border), Card (sections), Badge (granted/revoked)
- Motion: Toggle animation

### Officer Decision Queue (app/officer/page.tsx)
- NeoBrutalism: Card (agent cards), Badge (kind chips), Button (approve/override/defer)
- Motion: Card entrance stagger, seal animation (stamp + disable)
- NumberFlow: KPI strip (128, 3, 2, 1,204) tick up on load
- Magic UI: Active card focus ring animation, shine on sealed stamp
- react-fast-marquee: "DECISION QUEUE · AGENTS PROPOSE · HUMANS DISPOSE" ticker

### Officer Heatmap (app/officer/heatmap/page.tsx)
- NeoBrutalism: Table (hard borders), Card (signal/action panels)
- Motion: Heatmap cells fade in
- NumberFlow: Placement rate numbers
- react-fast-marquee: "COHORT ANALYTICS · NAAC-READY" ticker

### Officer Rules (app/officer/rules/page.tsx)
- NeoBrutalism: Table (clauses), Card (rule card), Button (run check)
- Motion: Decision row entrance

### Officer Fairness (app/officer/fairness/page.tsx)
- NeoBrutalism: Card (report), Table (segments), Button (record review)
- Motion: Flag panel entrance

### Officer Audit (app/officer/audit/page.tsx)
- NeoBrutalism: Table (append-only log), Card
- Motion: Row entrance stagger (subtle)
- react-fast-marquee: "APPEND-ONLY · NO DELETE PATH · 1,204 ENTRIES" ticker

### Officer Mail (app/officer/mail/page.tsx)
- NeoBrutalism: Card (mail cards), Button (send), Badge (status)
- Motion: Mail card entrance

### Recruiter Search (app/recruiter/page.tsx)
- NeoBrutalism: Card (candidate cards), Input (search), Badge (verified)
- Motion: Search results entrance stagger
- NumberFlow: Match count
- react-fast-marquee: "TALENT DISCOVERY · EVIDENCE-FIRST · NO BLACK BOXES" ticker

## Execution Plan (updated with component libraries)

### Phase A — Foundation
A.1: Install NeoBrutalism UI components (copy-paste into components/ui/)
A.2: Replace globals.css with brutalist tokens (concrete bg, black text, orange accent, Fira fonts)
A.3: Update layout.tsx (fonts: Fira Sans Condensed + Fira Sans + JetBrains Mono)
A.4: Rebuild app-shell.tsx (brutalist sidebar, topbar, rail)
A.5: Rebuild nav.tsx (mono uppercase, hard borders, orange active)

### Phase B — Auth
B.1: Rebuild login page (brutalist, Aceternity text reveal, Motion card stagger)

### Phase C — Student screens
C.1: Student ledger (NeoBrutalism table + badges, NumberFlow count, Motion stagger)
C.2: Verification flow (NeoBrutalism inputs/buttons, Motion stamp flip, Magic UI shine, Aceternity 3D tilt)
C.3: Mock drive (NeoBrutalism cards/radio, Motion entrances, NumberFlow score)
C.4: Learning path (NeoBrutalism checkbox/card, Motion completion, NumberFlow counter)
C.5: Drives (NeoBrutalism cards/badges, Motion stagger)
C.6: Consent (NeoBrutalism toggles/cards)

### Phase D — Officer screens
D.1: Decision queue (NeoBrutalism cards/badges/buttons, Motion stagger+seal, NumberFlow KPIs, Magic UI shine)
D.2: Heatmap (NeoBrutalism table/cards, Motion cell fade, NumberFlow rates)
D.3: Rules (NeoBrutalism table/cards/buttons, Motion rows)
D.4: Fairness (NeoBrutalism cards/table, Motion entrance)
D.5: Audit (NeoBrutalism table, Motion row stagger, react-fast-marquee ticker)
D.6: Mail (NeoBrutalism cards/buttons, Motion entrance)

### Phase E — Recruiter
E.1: Recruiter search (NeoBrutalism cards/input/badges, Motion stagger, NumberFlow count)

### Phase F — Verification
F.1: tsc --noEmit → clean
F.2: next build → passes
F.3: Playwright golden flow → 3/3
F.4: Visual inspection 1440px + 375px
F.5: Update deck screenshots

## What I will NOT do
- Touch db/, lib/, app/api/, tests/, docs/, scripts/
- Add more than the 6 chosen libraries
- Use Aceternity/Magic UI beyond 2-3 components each (brutalist discipline)
- Add gradients, soft shadows, rounded corners (except NeoBrutalism's default 0 radius)
- Change business logic

## Open questions
1. NeoBrutalism UI is copy-paste (shadcn-based) — I'll fetch components from their registry. OK?
2. Aceternity/Magic UI are also copy-paste — I'll add only 2-3 specific components each. OK?
3. Should I update the deck screenshots after the redesign or leave the deck as-is?
EOF
echo "plan v2 written"