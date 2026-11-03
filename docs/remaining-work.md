# REMAINING WORK — Pravega (Quasar 5.0)

Deferred items + pipeline steps still open. Ordered by dependency.

## A. Deferred from this session (picked up later — noted, NOT lost)

### A1. Demo-mode reset button (Phase 6 mandate)
Design:
1. `db/seed-core.ts` — extract the entire seed body from `db/seed.ts` into
   `export async function applySeed() { ... return { users: users.length } }`
   (drop dotenv/main wrapper, keep all contents unchanged)
2. `db/seed.ts` — thin wrapper: `import { applySeed } from "./seed-core"`, call, log, exit
3. `app/api/demo-reset/route.ts` — POST only; role == officer; 1 call/min per tenant
   (in-memory bucket); calls `applySeed()`; returns JSON `{ ok: true }`
   (DO NOT spawn process — serverless has no tsx)
4. Officer-only visible button — small, in AppShell footer rail next to "Sign out"
   or on /officer bottom; POSTs to /api/demo-reset, then `revalidatePath("/")`
5. Use `/usr/bin/env tsx` style PATH hygiene: nothing needed — pure TS via lib imports

### A2. CSP nonce migration (security follow-up, not blocking)
docs/security-notes.md documents: CSP deliberately unset (Next hydration);
follow-up = nonce-based rollout or report-only before real pilot. Not demo-blocking.

### A3. Rate limiter durability
Verify-rate limit is in-memory; multi-instance deploy needs Redis bucket. Demo OK.

## B. Deploy blockers waiting on user (Phase 6 checkpoint)

1. **Provision Supabase project** — user does web dashboard (browser):
   Name `pravega`, region **ap-south-1**, free size, generate+save DB password
   → wait ~2 min → paste **Settings → Database → Connection string URI**
   (NOTE: old project "Siddhesh-ai-del's Project" was deleted by user's explicit
   choice; Vercel project list OK: account `siddhesh-ai-del`)
2. **Push schema to cloud DB**: `DATABASE_URL=<uri> ./node_modules/.bin/drizzle-kit push --force`
3. **Seed cloud DB**: `DATABASE_URL=<uri> ./node_modules/.bin/tsx db/seed.ts`
4. **Vercel link + env**: `vercel link --token $VERCEL_TOKEN --yes --project pravega`
   then add env vars (production): `DATABASE_URL` (the URI),
   `SESSION_SECRET` (regenerate strong via openssl, NOT the dev default)
   `GITHUB_TOKEN` (optional; demo works without it)
5. **`vercel --prod --token $VERCEL_TOKEN --yes`** → captures public URL
6. **Verify live URL**: curl 200 on /login, run golden flow via MCP/Playwright
   against prod (login → ledger → "Python is now Verified" → live SQL gate → drives)
7. **Demo refresh data check**: seed already gives Rahul Python=Claimed; don't let
   anyone click Verify on the public URL before the judges do — add note on README or
   re-run applySeed after verification pass
8. Feature freeze remains in effect — bug fixes only, no new features
9. Update HACKATHON.md with live URL once deployed; deploy fallback = local
   screen recording (already an agreed backup, and REQUIRED anyway for video)

## C. Phase 7 — Win package (not started)

1. **Pitch deck** — submission says "all of the above": make BOTH
   - `pravega-deck.pptx` via make-ppts skill (.pptx judges can open)
   - HTML deck via frontend-slides skill (nice-to-have if time permits)
   Content per judging.md deck structure (load references/judging.md first):
   problem evidence (ISR 2026: 56.35%), why-us gap table vs Superset/TCS iON/
   LineupX, the 3 acts (verification flip / closed loop / governance), architecture,
   demo path, impact metrics, team + links
2. **Demo video** — ui-demo skill; match max length (default 90s); script the golden
   flow; export to demo/video.webm; upload or attach link
3. **README** — repo front page must stand alone:
   one-line pitch + GIF of golden flow, how to run (DATABASE_URL + seed + dev),
   architecture diagram, sponsor tech/positioning list, team + links
4. **Elevator pitches** — 30s (hallway) + 60s (stage) spoken versions, written out
5. **Demo script** — exact narration incl. "one-liner recovery" for mid-demo breaks
6. **Submission checklist** — run templates/submission-checklist.md against actual
   hackathon rules; tick every box; finalize HACKATHON.md → `Status: ready-to-submit`
7. **Final state reset** — re-run seed once all judging-pass tests done so demo data
   is factory-fresh when judges open the URL

## D. Judging criteria sanity checks before submission

- Every judge-visible claim in deck/README traces to a verified number
  (ISR 2026 56.35%, PIB 46%→56.4%, Superset gap — docs/research-brief.md has sources)
- Compliance claims framed as "patterns, not certification"
- "AI helps, human decides" line said verbatim at least once in video/demo
- Demo does NOT depend on live GitHub (fixtures replay must be the default online,
  verified working)
- Recording + screenshot backup if venue network dies (deploy fallback)
