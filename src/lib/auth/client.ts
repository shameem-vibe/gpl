"use client";
import { inMemoryPersistence, sendPasswordResetEmail, setPersistence, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getClientAuth, isFirebaseClientConfigured } from "@/lib/firebase/client";

/**
 * Browser-side auth helpers. The Firebase client session is deliberately in-memory only: after sign-in the ID token
 * is exchanged for an httpOnly cookie and the client SDK signs out again, so no token or password is ever kept in
 * localStorage/IndexedDB. The cookie is the persistence.
 */

const FRIENDLY: Record<string, string> = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/user-disabled": "This account is deactivated. Contact a Super Admin.",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes or reset your password.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
};
export const authErrorMessage = (e: unknown) => FRIENDLY[(e as { code?: string })?.code ?? ""] ?? "Sign-in failed. Please try again.";

export async function signInAdmin(email: string, password: string): Promise<void> {
  if (!isFirebaseClientConfigured) throw new Error("Authentication is not configured on this site.");
  const auth = getClientAuth();
  await setPersistence(auth, inMemoryPersistence);
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await cred.user.getIdToken(true);
    const res = await fetch("/api/auth/session", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? "Sign-in failed. Please try again.");
    }
  } finally {
    await signOut(auth).catch(() => undefined); // drop the client-side session either way
  }
}

export async function signOutAdmin(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
  if (isFirebaseClientConfigured) await signOut(getClientAuth()).catch(() => undefined);
}

/** Resolves for any address (never reveals whether an account exists). Rejects only on config/network problems. */
export async function requestPasswordReset(email: string): Promise<void> {
  if (!isFirebaseClientConfigured) throw new Error("Authentication is not configured on this site.");
  try {
    await sendPasswordResetEmail(getClientAuth(), email);
  } catch (e) {
    const code = (e as { code?: string })?.code;
    if (code === "auth/network-request-failed") throw new Error("Network error. Check your connection and try again.");
    if (code === "auth/too-many-requests") throw new Error("Too many requests. Wait a few minutes and try again.");
    // user-not-found / invalid-email / anything else: stay silent to prevent account enumeration
  }
}
