# Gobindapur Premier League (GPL)

Website and admin platform for the GPL village cricket league. Free-tier stack: Next.js on Vercel (Hobby), Firebase Spark (Auth + Firestore), Cloudinary free tier for images.

**Status:** Phase 1 (foundation). See `docs/ROADMAP.md` for what is implemented and what is planned.

## Quick start
```bash
npm install
cp .env.example .env.local     # fill values, see docs/SETUP.md
npm run dev                    # http://localhost:3000
```
To review the admin UI before authentication exists, set `ADMIN_UI_PREVIEW=true` in `.env.local` (development only, ignored in production builds).

## Scripts
`dev`, `build`, `lint`, `typecheck`, `test` (unit), `test:rules` (Firestore rules on the emulator), `emulators`.

## Docs
`docs/ARCHITECTURE.md` · `docs/DATABASE.md` · `docs/SECURITY.md` · `docs/SETUP.md` · `docs/DEPLOYMENT.md` · `docs/ROADMAP.md`
