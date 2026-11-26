import "server-only";
import { can, type Permission } from "@/domain/permissions";
import { getCurrentAdmin, type AdminUser } from "@/lib/auth/session";

export class HttpError extends Error {
  constructor(public status: 401 | 403, message: string) { super(message); }
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
