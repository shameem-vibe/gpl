import "server-only";
import { HttpError } from "@/lib/auth/guard";
import { SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session";
import { adminAuth, isAdminConfigured } from "@/lib/firebase/admin";
import { writeAudit } from "@/lib/repositories/audit";
import { getStaff, touchLogin } from "@/lib/repositories/users";
import { ROLES, type Role } from "@/types/domain";

const isRole = (r: unknown): r is Role => typeof r === "string" && (ROLES as readonly string[]).includes(r);

/**
 * Exchanges a freshly issued Firebase ID token for a session cookie, but ONLY for active staff.
 * Authorization = signed role claim AND a matching, active users/{uid} record (trusted server lookup).
 */
export async function createAdminSession(idToken: string) {
  if (!isAdminConfigured()) throw new HttpError(500, "Server authentication is not configured. See docs/SETUP.md.");
  const auth = adminAuth();
  let decoded;
  try {
    decoded = await auth.verifyIdToken(idToken, true);
  } catch {
    throw new HttpError(401, "Sign-in failed. Please try again.");
  }
  const actor = { uid: decoded.uid, email: decoded.email ?? null, role: isRole(decoded["role"]) ? (decoded["role"] as Role) : null };

  const staff = await getStaff(decoded.uid);
  const denied = async (message: string) => {
    await writeAudit({ actor, action: "auth.login_denied", targetType: "session", targetId: decoded.uid, summary: message }).catch(() => undefined);
    throw new HttpError(403, "This account does not have admin access.");
  };
  if (!actor.role) return denied("Valid credentials but no staff role");
  if (!staff || staff.role !== actor.role) return denied("Role claim and staff record do not match");
  if (!staff.active) throw new HttpError(403, "This account is deactivated. Contact a Super Admin.");

  const cookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_SECONDS * 1000 });
  await touchLogin(decoded.uid).catch(() => undefined);
  await writeAudit({ actor, action: "auth.login", targetType: "session", targetId: decoded.uid, summary: "Signed in" }).catch(() => undefined);
  return { cookie, maxAgeSeconds: SESSION_MAX_AGE_SECONDS };
}

export async function recordLogout(cookie: string | undefined): Promise<void> {
  if (!cookie) return;
  try {
    const d = await adminAuth().verifySessionCookie(cookie, false);
    await writeAudit({
      actor: { uid: d.uid, email: d.email ?? null, role: isRole(d["role"]) ? (d["role"] as Role) : null },
      action: "auth.logout", targetType: "session", targetId: d.uid, summary: "Signed out",
    });
  } catch { /* invalid or expired cookie: nothing to record */ }
}
