# Gobindapur Premier League (GPL)

Website and admin platform for the GPL village cricket league. Free-tier stack: Next.js on Vercel (Hobby), Firebase Spark (Auth + Firestore), Cloudinary free tier for images.

**Status:** Phase 2 (authentication, RBAC, admin management). See `docs/ROADMAP.md` for what is implemented and what is planned.

## Quick start
```bash
npm install
cp .env.example .env.local     # fill values, see docs/SETUP.md
npm run dev                    # http://localhost:3000
```

### First administrator
1. Fill `.env.local` (public `NEXT_PUBLIC_FIREBASE_*` values and the server-only `FIREBASE_ADMIN_*` service-account values).
2. Enable **Authentication -> Email/Password** and create Firestore in the Firebase console.
3. `npm run admin:bootstrap -- you@example.com "Your Name"` (one-time; refuses if a Super Admin exists).
4. Deploy rules: `npx firebase-tools deploy --only firestore,storage`.
5. Sign in at `/admin/login`. Manage staff under **Users and Roles**.

`ADMIN_UI_PREVIEW=true` (development only, ignored in production) shows the admin layout without signing in; every action is refused in this mode.

### Roles
Super Admin (everything), Admin (content, teams, players, matches, registrations), Scorer (matches and live scoring), Editor (news, videos, streams, sponsors), Auction Manager (auction and players). Full matrix: `docs/PROJECT_ARCHITECTURE.md`.

## Scripts
`dev`, `build`, `lint`, `typecheck`, `test` (unit), `test:rules` (Firestore + Storage rules on the emulators), `emulators`, `admin:bootstrap`.

## Docs
`docs/PROJECT_ARCHITECTURE.md` · `docs/DATABASE_SCHEMA.md` · `docs/SECURITY.md` · `docs/SETUP.md` · `docs/DEPLOYMENT.md` · `docs/ROADMAP.md`
