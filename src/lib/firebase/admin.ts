import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

/** Server-only Admin SDK. Credentials come from Vercel env vars and never reach the browser bundle. */
export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_ADMIN_PROJECT_ID && process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  );
}

function getAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;
  if (!isAdminConfigured()) throw new Error("Firebase Admin is not configured. See docs/SETUP.md.");
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}
export const adminAuth = () => getAuth(getAdminApp());
export const adminDb = () => getFirestore(getAdminApp());
/** Trusted server clock. Use for every createdAt/updatedAt so clients can never forge timestamps. */
export const serverTimestamp = () => FieldValue.serverTimestamp();
export type ServerValue = ReturnType<typeof serverTimestamp>;
