# Architecture

## Principles
- Public pages are Server Components, read through repositories, cached with ISR (`revalidate`). Visitors cost almost no Firestore reads.
- Client components only where interaction is required (mobile menu, scoreboard animation, login form, later: live score, auction room).
- All writes go through server routes (`src/app/api/*`) using the Firebase Admin SDK. Clients never write to Firestore.
- Layers: `UI -> features/hooks -> services (rules) -> repositories (only Firestore access) -> lib/firebase`.
- Cricket scoring and auction rules are pure functions in `src/domain` with no Firebase imports, so they are unit-testable.

## Free-tier decisions
| Need | Choice | Why |
|---|---|---|
| Trusted server code | Next.js Route Handlers + Admin SDK | Cloud Functions require the Blaze plan |
| Image storage | Cloudinary free tier (signed uploads) | Firebase Storage requires Blaze for new projects |
| Bot protection | Cloudflare Turnstile + App Check (reCAPTCHA v3) | Free |
| Live updates | One Firestore listener on one small `liveState` doc | Keeps reads under the 50k/day Spark quota; fallback is polling |

## Folder map
```
src/app/(public)/      public site (layout: header, footer)
src/app/admin/         login, forgot-password, (protected)/ shell + users, audit-logs, dashboard
src/app/api/           trusted server layer: auth/session, auth/logout, admin/users[/uid[/reset-link]]
src/components/        ui (primitives), brand, layout, public, admin, shared
src/domain/            pure business rules (permissions.ts, admin-rules.ts; cricket.ts, auction.ts later)
src/lib/firebase/      client.ts (browser), admin.ts (server only), paths.ts
src/lib/auth/          session.ts (cookie verification), guard.ts (requirePermission, requirePagePermission, assertSameOrigin), client.ts (browser sign-in/out)
src/lib/services/      orchestration with business rules: admin-users.ts, session.ts
src/lib/validation/    Zod schemas shared by client forms and server routes
src/lib/security/      rate-limit.ts, safe-redirect.ts
src/lib/api/           respond.ts (error mapping, no-store)
scripts/               bootstrap-super-admin.mjs (one-time, run locally)
src/lib/repositories/  only code that reads/writes Firestore
src/data/dev-data.ts   TEMPORARY sample data, delete in Phase 3-4
firebase/              firestore.rules, storage.rules, firestore.indexes.json
tests/rules/           rules tests (emulator)
```

## Data seam
`getHomeData()` in `src/lib/repositories/home.ts` is the only source for the homepage. Today it returns sample data with `isSample: true` (every affected section shows a "Sample data" badge). Replacing its body with Firestore reads requires no page changes.

## Multi-season model
Global: `teams`, `players`, `users`. Per-season (under `seasons/{sid}`): matches, squads, registrations, auctions. This allows career stats across seasons and a new season without schema changes.

## Authentication and authorization (Phase 2)
```
Browser                      Next.js server (Node runtime)                 Firebase
LoginForm
  signInWithEmailAndPassword ------------------------------------------->  Auth (verifies password)
  getIdToken <-------------------------------------------------------------
  POST /api/auth/session {idToken} -> verifyIdToken(checkRevoked)  ------->  Auth
                                   -> role claim valid? users/{uid} active & role matches?  -> Firestore
                                   -> createSessionCookie -> Set-Cookie gpl_session (httpOnly, Secure, SameSite=Lax, 5 days)
  client SDK signOut()  (nothing persisted in the browser besides the cookie)
Every admin page:   requirePagePermission(p)  -> verifySessionCookie(checkRevoked) -> role from signed claim -> can(role, p)
Every API mutation: assertSameOrigin -> requirePermission(p) -> Zod parse -> service -> Firestore txn / Admin SDK
```
- **Why a session cookie and not client tokens:** the browser never holds a long-lived credential in JS-readable storage, and the server can verify and revoke centrally.
- **Where authorization is enforced:** (1) `middleware.ts` is only a cheap "has a cookie" bounce. (2) Protected pages and (3) API routes verify the cookie with the Admin SDK. Layouts do not re-run on client navigation, so each page calls `requirePagePermission` itself. Hiding nav links is cosmetic.
- **Role changes take effect immediately:** the service sets the new claim, then `revokeRefreshTokens`, so existing session cookies fail `verifySessionCookie(…, true)`. Deactivation also sets the Auth `disabled` flag.
- **Cross-system consistency:** Firestore (staff record + audit entry) changes first in a transaction that enforces the last-Super-Admin rule; Auth is updated next; if Auth fails the Firestore change is rolled back. Creating a user deletes the Auth user if the Firestore write fails.
- **Known behaviour:** if a protected page redirects after the response has started streaming (root `loading.tsx`), the browser receives HTTP 200 with an immediate redirect instead of a 307. No protected content is rendered or sent.

## Roles and permissions
| Permission | Super Admin | Admin | Scorer | Editor | Auction Mgr |
|---|:-:|:-:|:-:|:-:|:-:|
| dashboard:view | ✔ | ✔ | ✔ | ✔ | ✔ |
| seasons:manage, teams:manage, registrations:review | ✔ | ✔ | | | |
| matches:manage | ✔ | ✔ | ✔ | | |
| scoring:write | ✔ | | ✔ | | |
| players:manage | ✔ | ✔ | | | ✔ |
| content:manage, streams:manage, sponsors:manage | ✔ | ✔ | | ✔ | |
| auction:manage, auction:bid | ✔ | | | | ✔ |
| users:manage, settings:manage, audit:read | ✔ | | | | |

Defined once in `src/domain/permissions.ts` (explicit allow-lists per role) and locked by a matrix test. Phase 2 narrowed Admin (no scoring or auction) compared with Phase 1, to follow least privilege.
