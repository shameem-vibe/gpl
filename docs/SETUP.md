# Setup (all free)

1. **Firebase (Spark plan, no card).** console.firebase.google.com -> create project -> add a Web app -> copy config into `.env.local` (`NEXT_PUBLIC_FIREBASE_*`).
2. Enable **Authentication -> Email/Password** and create **Firestore** (production mode, region `asia-south1` or nearest).
3. **Admin credentials.** Project settings -> Service accounts -> Generate new private key. Copy `project_id`, `client_email`, `private_key` into the three `FIREBASE_ADMIN_*` variables. Never commit the JSON; keep `\n` escapes in the key.
4. **App Check.** Register a reCAPTCHA v3 site key, add it in App Check, set `NEXT_PUBLIC_APPCHECK_SITE_KEY`. Enforce on Firestore only after verifying traffic.
5. Update `.firebaserc` with your project id, then deploy rules: `npx firebase-tools login && npx firebase-tools deploy --only firestore`.
6. Run locally: `npm install && npm run dev`. Admin UI preview: `ADMIN_UI_PREVIEW=true` (dev only).
7. Tests: `npm test` (unit), `npm run test:rules` (needs Java for the Firestore emulator).

Cloudinary (Phase 3) and Cloudflare Turnstile (Phase 3) are free; keys are documented when those modules ship.
