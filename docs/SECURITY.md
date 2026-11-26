# Security

## Implemented in Phase 1
- Firestore rules: default deny, all client writes denied, private paths unlisted (`firebase/firestore.rules`). Rules tests: `npm run test:rules`.
- RBAC map in `src/domain/permissions.ts` (unit tested). `requirePermission()` in `src/lib/auth/guard.ts` is the server-side check for every future mutation.
- Admin session design: Admin SDK `verifySessionCookie` (with revocation check) in the protected layout; roles read from signed custom claims only; fails closed.
- Middleware pre-gate for `/admin` (no cookie -> login). Not trusted for authorization.
- Security headers and CSP in `next.config.mjs`. `ADMIN_UI_PREVIEW` is ignored when `NODE_ENV=production`.
- No secrets in client code; `server-only` guards the Admin SDK module.

## Planned (by phase)
- P2: session cookie issuing (`/api/auth/session`), custom claims assignment, audit log writes, rules tests per role, rate limiting on login.
- P3: registration endpoint with Zod, honeypot + Turnstile, per-IP limits, signed Cloudinary uploads with MIME/size/extension checks, HTML sanitisation for news.
- P5: scoring events validated server-side, idempotency keys, optimistic version checks.
- P6: bids in Firestore transactions (lot status, min increment, purse, squad limit, audit entry).
- P8: nonce-based CSP (remove `unsafe-inline`), dependency audit, load and abuse tests.

## Known limitations
- App Check enforcement is configured in the Firebase console after the site key exists.
- Vercel Hobby has no WAF; rate limiting is application-level.
