# Roadmap and status

| Phase | Scope | Status |
|---|---|---|
| 1 Foundation | Setup, design system, public layout + homepage, admin shell, Firebase modules, rules draft, docs | **Implemented, not yet build-verified (see below)** |
| 2 Auth and RBAC | Firebase Auth login, session cookie API, custom claims, user management, audit logs, rules tests per role | Planned |
| 3 Core data | Seasons, teams, players, registration, news/videos/sponsors admin, Cloudinary uploads | Planned |
| 4 Matches | Fixtures, points table, match pages, YouTube stream embed | Planned |
| 5 Live scoring | Scoring engine + tests, scorer console, live page, scorecards | Planned |
| 6 Auction | Lots, transactional bidding, purses, live room | Planned |
| 7 Stats and history | Career stats, season archive, leaderboards | Planned |
| 8 Hardening | SEO, performance, accessibility audit, nonce CSP, load tests | Planned |

## Phase 1 detail
- Implemented: all files in this repo. Public pages other than Home are honest "Not built yet" placeholders. Admin sections likewise.
- Partially implemented: Firebase client/admin modules and session verification exist but are not exercised until Phase 2 (no login yet). Rules are written and have tests, not yet run against the emulator.
- Placeholder data: `src/data/dev-data.ts` (badged "Sample data" in the UI). Contact details and social links in `src/lib/constants/site.ts` are placeholders. Logo is a temporary mark.
- Not verified: `npm install`, `next build`, lint and tests have not been run (no network in the authoring environment). Only a syntax-level parse was done.
