# Security

## Implemented in Phase 1
- Firestore rules: default deny, all client writes denied, private paths unlisted (`firebase/firestore.rules`). Rules tests: `npm run test:rules`.
- RBAC map in `src/domain/permissions.ts` (unit tested). `requirePermission()` in `src/lib/auth/guard.ts` is the server-side check for every future mutation.
- Admin session design: Admin SDK `verifySessionCookie` (with revocation check) in the protected layout; roles read from signed custom claims only; fails closed.
- Middleware pre-gate for `/admin` (no cookie -> login). Not trusted for authorization.
- Security headers and CSP in `next.config.mjs`. `ADMIN_UI_PREVIEW` is ignored when `NODE_ENV=production`.
- No secrets in client code; `server-only` guards the Admin SDK module.

## Implemented in Phase 2
- Real Firebase email/password sign-in. ID token -> `/api/auth/session` -> httpOnly, Secure (prod), SameSite=Lax session cookie (5 days). The client SDK uses in-memory persistence and signs out right after the exchange: no tokens or passwords in localStorage/IndexedDB.
- Password reset through Firebase (`sendPasswordResetEmail`); the UI never reveals whether an account exists. Locked-out admins can also get a one-time link from a Super Admin (audited, never stored).
- Server-side authorization on every page (`requirePagePermission`) and every mutation (`requirePermission`). Roles come only from signed custom claims plus a matching active `users/{uid}` record. Unknown role strings are denied.
- Immediate revocation: role change or deactivation sets claims / `disabled` and calls `revokeRefreshTokens`; sessions are verified with `checkRevoked`.
- Super Admin bootstrap: `npm run admin:bootstrap`, run locally with service-account credentials, refuses to run if a Super Admin exists. No public path can create staff.
- Last-active-Super-Admin protection inside a Firestore transaction; nobody can change their own role or status.
- CSRF: SameSite=Lax cookie plus Origin/Sec-Fetch-Site check on every mutating route. Open-redirect-safe `?next=`.
- Zod validation on every request body (unknown fields rejected on updates, no mass assignment). Errors are mapped to safe messages; internals are never returned.
- Audit log: server-written with server timestamps, append-only from the app, readable only by Super Admin in rules and UI.
- Firestore rules: default deny; no client writes anywhere; audit logs and users cannot be created/edited/deleted by clients. Storage rules: default deny.
- Best-effort rate limit on `/api/auth/session` (10/min/IP).

### Registration submissions
The Phase 2 brief asks that the public can "submit permitted registration requests". Rules deliberately deny direct client writes to `registrations`: a rules-level `create` would bypass server validation, Turnstile and per-IP limits. Public registration will go through a server route in Phase 3 (listed below).

## Planned (by phase)
- P2 follow-ups: shared rate-limit store; MFA for Super Admins (Firebase Auth multi-factor requires Identity Platform, check pricing).
- P3: registration endpoint with Zod, honeypot + Turnstile, per-IP limits, signed Cloudinary uploads with MIME/size/extension checks, HTML sanitisation for news.
- P5: scoring events validated server-side, idempotency keys, optimistic version checks.
- P6: bids in Firestore transactions (lot status, min increment, purse, squad limit, audit entry).
- P8: nonce-based CSP (remove `unsafe-inline`), dependency audit, load and abuse tests.

## Known limitations
- App Check enforcement is configured in the Firebase console after the site key exists.
- Vercel Hobby has no WAF; rate limiting is application-level and in-memory per serverless instance (best effort, not a hard guarantee). Firebase Auth throttles password attempts independently.
- The Firebase web API key in client config is a public identifier, not a secret. Restrict it to your domains (Google Cloud Console -> Credentials -> HTTP referrers) and enable App Check.
- Firebase password-reset emails use Firebase's default sender and template; they may land in spam until a custom domain/template is configured.
- Session cookies are not bound to a device. Revocation is per user (all sessions), not per session.
- Firestore rules and Storage rules tests are written but need the emulators; see README for how to run them. They were NOT executed during Phase 2 authoring (no emulator download access).
