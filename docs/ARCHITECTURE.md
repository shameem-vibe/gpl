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
src/app/admin/         login + (protected)/ shell, session-verified in layout
src/app/api/           trusted server layer (Phase 2+)
src/components/        ui (primitives), brand, layout, public, admin, shared
src/domain/            pure business rules (permissions now; cricket.ts, auction.ts later)
src/lib/firebase/      client.ts (browser), admin.ts (server only), paths.ts
src/lib/auth/          session.ts (cookie verification), guard.ts (requirePermission)
src/lib/repositories/  only code that reads/writes Firestore
src/data/dev-data.ts   TEMPORARY sample data, delete in Phase 3-4
firebase/              firestore.rules, firestore.indexes.json
tests/rules/           rules tests (emulator)
```

## Data seam
`getHomeData()` in `src/lib/repositories/home.ts` is the only source for the homepage. Today it returns sample data with `isSample: true` (every affected section shows a "Sample data" badge). Replacing its body with Firestore reads requires no page changes.

## Multi-season model
Global: `teams`, `players`, `users`. Per-season (under `seasons/{sid}`): matches, squads, registrations, auctions. This allows career stats across seasons and a new season without schema changes.
