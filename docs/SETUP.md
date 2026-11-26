# Setup (all free)

1. **Firebase (Spark plan, no card).** console.firebase.google.com -> create project -> add a Web app -> copy config into `.env.local` (`NEXT_PUBLIC_FIREBASE_*`).
2. Enable **Authentication -> Email/Password** and create **Firestore** (production mode, region `asia-south1` or nearest).
3. **Admin credentials.** Project settings -> Service accounts -> Generate new private key. Copy `project_id`, `client_email`, `private_key` into the three `FIREBASE_ADMIN_*` variables. Never commit the JSON; keep `\n` escapes in the key.
4. **App Check.** Register a reCAPTCHA v3 site key, add it in App Check, set `NEXT_PUBLIC_APPCHECK_SITE_KEY`. Enforce on Firestore only after verifying traffic.
5. `.firebaserc` already points to `gpl-web-b84b0`. Deploy rules and indexes: `npx firebase-tools login && npx firebase-tools deploy --only firestore,storage`. (If Storage is not enabled for the project yet, deploy `--only firestore` first.)
6. **Create the first Super Admin** (once, on your own machine, with `.env.local` filled including the `FIREBASE_ADMIN_*` values):
   `npm run admin:bootstrap -- you@example.com "Your Name"` and enter a password (12+ characters) when prompted. It refuses to run if a Super Admin already exists. Then sign in at `/admin/login` and create other administrators from **Users and Roles**.
7. Run locally: `npm install && npm run dev`. Admin UI preview: `ADMIN_UI_PREVIEW=true` (dev only).
8. Tests: `npm test` (unit), `npm run test:rules` (needs Java and network access to download the Firestore and Storage emulators).

Authorized domains: Firebase console -> Authentication -> Settings -> Authorized domains must include your Vercel domain, or password-reset links will not work.

Cloudinary (Phase 3) and Cloudflare Turnstile (Phase 3) are free; keys are documented when those modules ship.
