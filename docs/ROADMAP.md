# Roadmap and status

| Phase | Scope | Status |
|---|---|---|
| 1 Foundation | Setup, design system, public layout + homepage, admin shell, Firebase modules, rules draft, docs | **Implemented and build-verified in Phase 2** |
| 2 Auth and RBAC | Firebase Auth login, session cookie API, custom claims, user management, audit logs, rules tests per role | **Implemented. Build, typecheck, lint and 60 unit tests pass; emulator rules tests written but not run (see below)** |
| 3 Core data | Seasons, teams, players, registration, news/videos/sponsors admin, Cloudinary uploads | Planned |
| 4 Matches | Fixtures, points table, match pages, YouTube stream embed | Planned |
| 5 Live scoring | Scoring engine + tests, scorer console, live page, scorecards | Planned |
| 6 Auction | Lots, transactional bidding, purses, live room | Planned |
| 7 Stats and history | Career stats, season archive, leaderboards | Planned |
| 8 Hardening | SEO, performance, accessibility audit, nonce CSP, load tests | Planned |

## Phase 1 detail
- Implemented: public pages (non-Home pages are honest "Not built yet" placeholders), design system, admin shell.
- Phase 2 verification found and fixed one Phase 1 defect: `globals.css` used `@apply font-display` inside a `.font-display` rule (circular), which broke `next build`.
- Placeholder data: `src/data/dev-data.ts` (badged "Sample data"). Contact details and social links in `src/lib/constants/site.ts` are placeholders. Logo is a temporary mark.

## Phase 2 detail
- Implemented: login, logout, password reset, session cookie, RBAC, bootstrap script, admin user management (list, search, details, create, role change, deactivate/reactivate, reset link, last-Super-Admin protection), audit logs, dashboard integration, Firestore + Storage rules, Zod validation, CSRF/origin checks, rate limit on login.
- Verified here: `tsc --noEmit`, `next lint`, `next build` (fonts mocked: sandbox has no Google access), 60 unit tests (permissions matrix, account rules, validation, route authorization for every role, service logic including rollback), and HTTP smoke tests against the production server (unauthenticated and forged-cookie access, CSRF, malformed input).
- **Not verified (needs your environment):** (1) Firestore/Storage rules tests (`npm run test:rules`) need the emulator JARs, which the authoring sandbox could not download. (2) The full login -> cookie -> dashboard path against your real Firebase project needs the service-account key and the bootstrap run. (3) Password-reset email delivery. (4) App Check is wired (client init when `NEXT_PUBLIC_APPCHECK_SITE_KEY` is set) but enforcement is a console step.
- Not implemented: MFA, per-session revocation, shared rate-limit store, Firebase Analytics (the `measurementId` was intentionally not added).
