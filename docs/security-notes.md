# Security Notes — Pravega demo path (Phase 5)

Audit: ecc security-audit (no secrets found), manual OWASP checklist, xterm pass,
flat XSS/eval grep, `npm audit` (0 high/critical; 20 moderate transitive, dev chain).

## Fixed (or already safe)
- Secrets: `.env` gitignored (.env + .env* folders verified with check-ignore);
  SESSION_SECRET + DATABASE_URL env-driven; nothing hardcoded in code
- Auth: HMAC-SHA256 signed session cookie, httpOnly + SameSite=strict + timingSafeEqual;
  role checks before every officer/student action; students can only act on their own rows
  (ownership check in /api/learning-path/complete)
- Input validation: zod on both POST routes (repoUri length cap + known skillId enum;
  pathId/taskId caps). Server actions use FormData with typed parsing.
- SQL: drizzle parameterized throughout; eligibility clause grammar is parse-free (no eval());
  no string-concatenated SQL anywhere; raw `sql` used only for TRUNCATE in seed (dev only)
- XSS: zero dangerouslySetInnerHTML; all user content escaped by React
- Rate limit: /api/verify limited to 10 req/min/user (protects GitHub API budget)
- Audit integrity: /audit/log is append-only in app code; no update/delete path exists
- Security headers: nosniff, frame-DENY, referrer-strict-origin, permissions-policy — in
  next.config.ts (prod applies; verified build passes)
- Failure modes: verify fetch fails → labeled fixtures replay (never silent);
  role-redirects leak no target screens; error JSON generic

## Accepted / documented for demo (not shipped to prod)
- CSP: deliberately NOT enabled — Next inline hydration + demo velocity;
  follow-up: nonce-based CSP or report-only rollout before real pilot
- Rate limiting: single-node in-memory bucket; multi-instance deploy needs Redis
- Seeded persona login has no passwords — demo-only, never for real deployments
- 20 moderate npm audit findings (transitive, dev chain); 0 high/critical; no `audit fix --force`
- CSRF: SameSite=strict + Next server-action origin checks cover the demo path; no token layer yet
- Row-Level Security: enforced in app code (tenant + role + ownership), not in Postgres policies;
  production pilot must mirror with RLS policies
- .env.local/.env never printed to logs; demo DB holds fake data only
