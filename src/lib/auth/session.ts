import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { adminAuth, isAdminConfigured } from "@/lib/firebase/admin";
import { ROLES, type Role } from "@/types/domain";

export const SESSION_COOKIE = "gpl_session";
/** 5 days. Admins re-authenticate after this; role changes and deactivation revoke sessions immediately. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 5;
const isRole = (r: unknown): r is Role => typeof r === "string" && (ROLES as readonly string[]).includes(r);

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: Role;
  /** true only for the development UI preview. Never true in production. */
  preview?: boolean;
}

export const sessionCookieOptions = (maxAgeSeconds = SESSION_MAX_AGE_SECONDS) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: maxAgeSeconds,
});

/**
 * Verifies the httpOnly session cookie with the Admin SDK (including the revocation and disabled-user check)
 * and reads the role from the signed custom claim. Returns null on any failure (fail closed).
 * Roles are NEVER read from client input.
 */
export const getCurrentAdmin = cache(async (): Promise<AdminUser | null> => {
  if (process.env.NODE_ENV !== "production" && process.env.ADMIN_UI_PREVIEW === "true") {
    return { uid: "preview", email: "preview@localhost", displayName: "UI preview", role: "superAdmin", preview: true };
  }
  if (!isAdminConfigured()) return null;
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(cookie, true);
    const role = decoded["role"];
    if (!isRole(role)) return null;
    return { uid: decoded.uid, email: decoded.email ?? null, displayName: (decoded["name"] as string | undefined) ?? null, role };
  } catch {
    return null;
  }
});
