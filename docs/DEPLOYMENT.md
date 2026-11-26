# Deployment (Vercel Hobby + Firebase Spark)

1. Push the repo to GitHub (`shameem-vibe/gpl`).
2. Import into Vercel. Framework: Next.js. Add every variable from `.env.example` (server-only ones as non-public). Do NOT set `ADMIN_UI_PREVIEW`.
3. Add your Vercel domain to Firebase Auth -> Authorized domains.
4. Deploy rules/indexes with `npx firebase-tools deploy --only firestore,storage` BEFORE going live. Indexes take a few minutes to build; the admin dashboard filters audit logs by administrator and needs the `auditLogs actorUid+createdAt` index.
4a. Run `npm run admin:bootstrap` locally once to create the first Super Admin (production data lives in the same Firebase project).
4b. Set `FIREBASE_ADMIN_PRIVATE_KEY` in Vercel with the `\\n` escapes intact.
5. Set `NEXT_PUBLIC_SITE_URL` to the production URL (used for sitemap/Open Graph).

Notes: Vercel Hobby is for non-commercial use. Check its terms before accepting paid sponsorship. Watch Firestore usage in the Firebase console (Spark: 50k reads/day, 20k writes/day).
