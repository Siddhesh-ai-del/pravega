# Master Prompt — Pravega “The Quiet Ledger” (Direction 06)

> Status: approved by owner (2026-11-04, “Yes, proceed”). This document is the
> binding contract for the Direction 06 build. Execute verbatim. If reality
> contradicts this document, stop and surface the conflict — do not silently
> improvise.

---

## 0. Role & mission

You are the design engineer for **Pravega**, an evidence-verified placement
intelligence product (a solo, pre-competition build for Quasar 5.0 / VPPCOE & VA
Training & Placement Cell). Your mission:

> Deliver `/design-lab/monochrome` — a sixth Design Lab candidate for the T&P
> officer Decision Queue — and nothing else.

The five existing variants (`mercury`, `linear`, `stripe`, `attio`, `credential`)
were rejected by the owner as "trash". Direction 06 must therefore be
**conceptually stronger**, not just another reskin. The concept:

**One quiet, near-black registry. Hierarchy is carried by weight, size, hairline
rules and inversion — never by colour. A single violet is reserved for the
verified/approved semantics and the focus ring. Everything else is graphite.**

No lorem ipsum. No invented metrics. Same `SAMPLE` data as every other variant.

## 1. Product & audience

- Product: agents propose placements actions (interview sets, eligibility sweeps,
  scheduling); a human T&P officer seals or overrides; every decision appends to
  an audit ledger.
- Audience: judges at ~2 m on a projector; officers on a laptop; 375 px mobile.
- Metaphor: an audit registry — mono case numbers, evidence receipts,
  append-only ledger, verification stamp.
- Honesty rule: if a number is on screen, it must come from `lib/design-lab/data.ts`.

## 2. Hard constraints

- Routes: `app/design-lab/monochrome/*` only. `/design-lab` index gains a 6th entry.
- Product screens (`app/login`, `app/student`, `app/officer`, `app/recruiter`,
  `app/globals.css` product tokens, `db/`, `lib/actions`) are **untouched**.
- 375 px and 1440 px both verified; no horizontal scroll; no clipped controls.
- WCAG 2.2 AA: body/UI text ≥ 4.5:1; large text ≥ 3:1 (mark large-text pairs).
- `prefers-reduced-motion`: all animation collapses to instant swaps.
- Keyboard-complete approval flow: `↑`/`↓` move the active card, `A` approve,
  `O` override, `D` defer, `Enter` confirm, `⌘K`/`Ctrl+K` command palette,
  `Esc` closes.
- No network calls, no DB writes, no new env vars, no API routes. Lab route is
  static. Client boundaries only around the interactive queue column / command menu.
- No new global CSS rules that leak outside `.mono-scope`.

## 3. Design tokens

Single-hue graphite ramp + one accent. Concrete values:

```css
.mono-scope {
  --m-bg:          #0b0b0c;  /* page */
  --m-panel:       #131315;  /* cards */
  --m-panel-2:     #1a1a1d;  /* raised / hover */
  --m-panel-3:     #202024;  /* inputs */
  --m-line:        #26262a;  /* hairline */
  --m-line-strong: #3a3a40;  /* emphasis hairline */
  --m-ink:         #ededea;  /* primary text */
  --m-ink-dim:     #a6a6a2;  /* secondary text */
  --m-ink-faint:   #6e6e6a;  /* metadata — decorative only, never for body text */
  --m-accent:      #a78bfa;  /* THE ONE accent — verified/approved + focus ring */
  --m-accent-ink:  #0b0b0c;  /* text on accent */
  --m-invert-bg:   #ededea;  /* inverted primary button */
  --m-invert-ink:  #0b0b0c;  /* inverted primary button text */
  --m-danger:      #d98c8c;  /* desaturated alert text (not a hue, a value) */
  --m-ok:          #ededea;  /* success uses inversion + accent dot, not green */
}
```

Heatmap ramp is **single-hue** (lightness steps only, no hue shift):

```css
.mono-scope .m-heat-1 { background:#17171a; color:#6e6e6a; }
.mono-scope .m-heat-2 { background:#232327; color:#a6a6a2; }
.mono-scope .m-heat-3 { background:#34343a; color:#c9c9c6; }
.mono-scope .m-heat-4 { background:#55555e; color:#ededea; }
.mono-scope .m-heat-5 { background:#ededea; color:#0b0b0c; }  /* inverted peak */
```

Rules:

- `--m-accent` may appear ONLY on: (a) "SEALED / VERIFIED" chips & the seal
  stamp fill, (b) `:focus-visible` outline (2px, offset 2px), (c) the tiny dot
  in the LIVE badge. Never on links, charts, hovers, or decoration.
- Approve buttons are **inverted-neutral** (`--m-invert-bg`), not violet. The
  violet confirms the *state after sealing*.
- No pure `#ffffff` on pure `#000000`. No gradients behind text. No glow.
- Dot-grid backdrop allowed: `radial-gradient(circle, #1d1d20 1px, transparent 1px)` at 24px grid, opacity ≤ 0.5, fixed position, `aria-hidden`.
- Radius: 8px cards, 6px controls. Borders: 1px hairlines. Shadows: none.

## 4. Typography

- **Inter** (UI) + **JetBrains Mono** (`agr-1`, case numbers, hashes, `⌘K`, kbd).
  No new font packages; reuse the `next/font/google` pattern from sibling variants.
- Scale: 12 / 13 / 14 / 16 / 20 / 28. Line-height 1.45 body.
- Hierarchy axis = weight + size + tracking. Headings: Inter 600, tracking −0.02em.
  Eyebrow labels: mono 10px, tracking 0.18em, uppercase, `--m-ink-dim`.
- Numerals: `font-variant-numeric: tabular-nums` on every KPI and confidence figure.
- Serif is banned in this direction. Italics are banned (no "editorial" drift).

## 5. Component inventory (licences — all MIT)

Copy-in, **never** `shadcn init` (it would clobber Tailwind v4 + `@tailwindcss/turbopack`):

| Component (own copy) | Source pattern | Licence |
|---|---|---|
| Button (inverted / outline / ghost) | shadcn/ui | MIT |
| Badge (kind chips) | shadcn/ui | MIT |
| Input (⌘K search field) | shadcn/ui | MIT |
| Separator | shadcn/ui | MIT |
| Tooltip (heatmap cells, icon buttons) | Radix UI | MIT |
| Dialog + Command | Radix UI + cmdk | MIT |
| Sonner toaster | sonner | MIT |
| Icons | Lucide, 1.5px stroke, single 16px grid | ISC |
| Toast + palette | cmdk + sonner | MIT |

Helpers: `clsx` + `tailwind-merge` (`cn()` in `lib/utils.ts`),
`class-variance-authority` for button variants. `components.json` created for
future shadcn `add` (Tailwind v4 style, aliases `@/components/ui`, `@/lib/utils`).

Budget: **9 packages maximum** (`lucide-react cmdk sonner clsx tailwind-merge class-variance-authority @radix-ui/react-slot @radix-ui/react-tooltip @radix-ui/react-dialog`).
**No** Aceternity/Magic UI install. One optional flourish (CSS dot-grid / KPI
counter) — droppable without layout change.

Anti-copy rule: Obsidian (obsidian.dev) is a *visual* reference only. No
assets, code, icons or layouts may be copied from it.

## 6. Screen spec — region by region

Root: `app/design-lab/monochrome/{layout.tsx,page.tsx}` +
`components/design-lab/monochrome/{sidebar,topbar,kpi-strip,queue-card,heatmap,fairness,ledger-rail,command-menu}.tsx`
(client boundary wraps the interactive queue column + command menu only).

1. **Sidebar** (~236px, `--m-panel`, hairline right border)
   - Logo lockup: inverted rounded square w/ check + "Pravega" + mono eyebrow
     `VERIFYING LEDGER`.
   - Nav: 5 items, icons (`Layers`, `Grid3x3`, `SlidersHorizontal`, `Scale`,
     `ListChecks`), active = inverted slab (`--m-invert-bg` bg, `--m-invert-ink`
     text) — not a coloured pill.
   - Footer: Anjali Deshmukh chip (initials in inverted disc), mono
     `T&P OFFICER · SIGNATORY`, sign-out ghost link.
2. **Top bar** — breadcrumb mono `placement / nimbus-tech / decision-queue`;
   right: ⌘K search input (mono placeholder `search cases, students, rules…`),
   LIVE badge (accent 6px dot, static under reduced-motion), date `2026-11-04 · 09:40 IST`.
3. **Header** — mono eyebrow `NIMBUS TECH — BACKEND DEV DRIVE`; H1 `Decision
   Queue` (Inter 600, 32–36px, tight); subhead: "Agents propose. You dispose.
   Every sign-off appends to the ledger." Right cluster: `PENDING 3` /
   `OLDEST 2H 41M` in an inverted-outline stat chip.
4. **KPI strip** — 4 columns separated by hairlines (no boxes): verified this
   week 128 (+12), approvals pending 3, eligibility blocks 2, audit entries
   1,204. tabular-nums; mono delta captions.
5. **Queue cards ×3** (panels, 8px radius)
   - Header row: kind Badge (mono, hairline outline, **no fill colour**) +
     `PVG-2026-0114 · agr-1` mono faint + confidence segmented mono bar (5
     segments, filled = `--m-ink`) + 92/88/90.
   - Title Inter 16/600. `why —` line: mono label `WHY` + dim text.
   - agr-1: three question rows, mono `Q1..Q3` labels. agr-2: two barred rows
     (mono, dim-red text). agr-3: clash row (dim-red text on `--m-panel-2`) +
     remedy row (ink text).
   - Actions: **Approve = inverted near-white button** (check icon), Override =
     hairline outline, Defer = ghost. `kbd` footer strip: `↑↓ navigate · A
     approve · O override · D defer · ⌘K palette`.
   - After seal: card flips to "SEALED · LEDGER #1205", violet accent chip
     `VERIFIED` appears (stamp keyframe), Approve button disabled.
6. **Right rail**
   - Heatmap: semantic `<table>` + visually hidden `<caption>`; single-hue
     `.m-heat-*`; axis labels mono; HDR microcopy `SQL joins — 41% weak`.
   - Fairness panel: `ShieldCheck` icon, `Fairness passed`, mono detail
     `parity 0.91 · χ² p = 0.44`.
   - Ledger invariant panel: append-only / one-way note + inverted
     **Export audit pack ↓** button (toast: "Audit pack queued · demo").
7. **375 px** — rail stacks below queue; sidebar collapses into the top bar
   with horizontally scrollable nav (same pattern as sibling variants).

## 7. Interaction contract

- `useState` only. No server actions, no mutations.
- `⌘K` / `Ctrl+K` / `⌘P` opens command menu (cmdk): actions — `Approve agr-1`,
  `Approve agr-2`, `Approve agr-3`, `Override with reason…`, `Export audit pack`,
  `Go to Heatmap / Fairness / Audit`. `Esc` closes.
- Approve (button / `A` / `Enter` on active card):
  1. `m-stamp` keyframe plays on the accent VERIFIED chip (480ms,
     `cubic-bezier(0.2,1.4,0.4,1)`); reduced-motion → instant.
  2. Sonner toast: `Sealed → audit ledger · demo`.
  3. Card state → SEALED; Approve disabled; override reason box appears if
     Override was chosen.
- Override: inline reason field; confirm button **disabled until ≥ 8 chars**;
  error hint if submitted short.
- Roving focus: `↑`/`↓` moves `aria-current="true"` across the 3 cards; focus
  ring always visible (`--m-accent`, 2px, offset 2px).
- All icon-only buttons carry `aria-label`. Toggle/stamp a11y text included.

## 8. Anti-goals

- No indigo/violet glow, no glassmorphism, no gradient text, no coloured
  shadows (those were rejected Direction 02/04/03 cues).
- No third hue anywhere — `--m-danger` is desaturated, never "red alarm".
- No accent creep (links, hover states, charts, brand dots elsewhere).
- No new dependencies beyond §5 budget. No font downloads beyond Inter +
  JetBrains Mono (both already in the repo).
- No edits to product tokens/screens. No DB/env/API. No commit without owner
  instruction.
- Do not "improve" sibling variants or the current product UI as a side effect.

## 9. Verification & acceptance

Run in this order; all must pass before reporting done:

1. `./node_modules/.bin/tsc --noEmit` — clean.
2. `./node_modules/.bin/eslint app/design-lab/monochrome app/design-lab/page.tsx components/design-lab components/ui/monochrome lib/utils.ts` — clean (warnings allowed only if pre-existing).
3. `./node_modules/.bin/next build` — `/design-lab/monochrome` compiles & prerenders.
4. Playwright: 1440×900 **and** 375×812 screenshots → `variant-monochrome.png`;
   zero console errors; ⌘K opens/closes; Approve flow seals card + toast;
   `reducedMotion: "reduce"` pass; focus ring visible in 1440 shot.
5. Contrast table appended to this doc's §11 before sign-off:
   ink/bg · dim-ink/bg · accent/bg · invert pair · heat-4/5 text · heat cell
   numerals. Every pair ≥ 4.5:1 (or marked LARGE only).
6. Self-review against §2, §8, §10. Any violation = not done.

Acceptance criteria: all of the above + owner approval in the lab.

## 10. Attribution

- Visual reference: Obsidian (obsidian.dev), Vercel/Geist, shadcn/ui docs.
- Libraries: shadcn/ui, Radix UI, Lucide (ISC), cmdk, sonner — MIT.
- No Obsidian assets/code used. Tailwind v4 + `@tailwindcss/turbopack`.

## 11. Contrast table (verified 2026-11-05)

WCAG 2.x relative-luminance ratios, computed from the shipped tokens:

| Pair | Ratio | Verdict |
|---|---|---|
| ink `#ededea` / bg `#0b0b0c` | 16.77 | AA ✓ |
| ink `#ededea` / panel `#131315` | 15.82 | AA ✓ |
| ink-dim `#a6a6a2` / bg `#0b0b0c` | 8.05 | AA ✓ |
| ink-dim `#a6a6a2` / panel `#131315` | 7.60 | AA ✓ |
| ink-dim `#a6a6a2` / panel-2 `#1a1a1d` | 7.11 | AA ✓ |
| accent `#a78bfa` / bg `#0b0b0c` | 7.23 | AA ✓ |
| accent `#a78bfa` / panel `#131315` | 6.82 | AA ✓ |
| accent `#a78bfa` / panel-2 `#1a1a1d` | 6.38 | AA ✓ |
| invert `#0b0b0c` / `#ededea` (Approve, exports) | 16.77 | AA ✓ |
| ink `#ededea` / heat-4 `#55555e` | 6.29 | AA ✓ |
| ink `#0b0b0c` / heat-5 `#ededea` | 16.77 | AA ✓ |
| `#c9c9c6` / heat-3 `#34343a` | 7.45 | AA ✓ |
| `#a6a6a2` / heat-2 `#232327` | 6.41 | AA ✓ |
| danger `#d98c8c` / panel `#131315` | 7.14 | AA ✓ |
| ink-faint `#6e6e6a` / panel `#131315` | 3.62 | **AA-large only** — metadata/decorative text exclusively; never body copy |

Focus ring `#a78bfa` ≥ 3:1 against all graphite surfaces — meets non-text
contrast (1.4.11). `::focus-visible` outline is 2 px, offset 2 px, and mirrors
on body-level portals via `.mono-portal`.
