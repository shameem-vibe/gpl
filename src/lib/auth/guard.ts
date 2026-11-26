import "server-only";
import { notFound, redirect } from "next/navigation";
import { can, type Permission } from "@/domain/permissions";
import { getCurrentAdmin, type AdminUser } from "@/lib/auth/session";

export class HttpError extends Error {
  constructor(public status: 400 | 401 | 403 | 404 | 409 | 429 | 500, message: string) { super(message); }
}

/**
 * Call at the top of EVERY mutating route handler / server action.
 * UI hiding is cosmetic; this is the actual authorization check.
 */
export async function requirePermission(permission: Permission): Promise<AdminUser> {
  const user = await getCurrentAdmin();
  if (!user) throw new HttpError(401, "Sign in required");
  if (user.preview) throw new HttpError(403, "Preview mode cannot perform actions");
  if (!can(user.role, permission)) throw new HttpError(403, "Not allowed");
  return user;
}

/**
 * Page-level guard for server components. Layouts do NOT re-run on client-side navigation, so every
 * protected page must call this itself. Unauthenticated -> login; authenticated without permission -> `denied: true`.
 */
export async function requirePagePermission(permission: Permission): Promise<{ user: AdminUser; allowed: boolean }> {
  const user = await getCurrentAdmin();
  if (!user) redirect("/admin/login");
  return { user, allowed: can(user.role, permission) };
}
export { notFound };

/** CSRF defence for cookie-authenticated mutations (in addition to SameSite=Lax). */
export function assertSameOrigin(req: Request): void {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (origin) {
    let originHost = "";
    try { originHost = new URL(origin).host; } catch { /* invalid */ }
    if (!host || originHost !== host) throw new HttpError(403, "Cross-origin request blocked");
    return;
  }
  const site = req.headers.get("sec-fetch-site");
  if (site !== "same-origin" && site !== "none") throw new HttpError(403, "Cross-origin request blocked");
}
