import "server-only";
import { cookies } from "next/headers";
import { adminAuth, isAdminConfigured } from "@/lib/firebase/admin";
import type { Role } from "@/types/domain";

export const SESSION_COOKIE = "gpl_session";
const ROLES: readonly Role[] = ["superAdmin", "admin", "scorer", "editor", "auctionManager"];

export interface AdminUser {
  uid: string;
  email: string | null;
  role: Role;
  /** true only for the development UI preview. Never true in production. */
  preview?: boolean;
}

/**
 * Verifies the httpOnly session cookie with the Admin SDK and reads the role from the signed custom claim.
 * Returns null on any failure (fail closed). Roles are NEVER read from client input.
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  if (process.env.NODE_ENV !== "production" && process.env.ADMIN_UI_PREVIEW === "true") {
    return { uid: "preview", email: "preview@localhost", role: "superAdmin", preview: true };
  }
  if (!isAdminConfigured()) return null;
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(cookie, true);
    const role = decoded["role"] as Role | undefined;
    if (!role || !ROLES.includes(role)) return null;
    return { uid: decoded.uid, email: decoded.email ?? null, role };
  } catch {
    return null;
  }
}
