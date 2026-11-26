import type { Role } from "@/types/domain";

/** Single source of truth for RBAC. Server code calls can(); the UI only uses it to hide controls. */
export const PERMISSIONS = [
  "dashboard:view", "seasons:manage", "matches:manage", "scoring:write", "teams:manage",
  "players:manage", "registrations:review", "auction:manage", "auction:bid", "content:manage",
  "streams:manage", "sponsors:manage", "users:manage", "settings:manage", "audit:read",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

/**
 * Every role lists its permissions explicitly (no "everything except"), so adding a new permission
 * can never silently grant it to an existing role. Only superAdmin receives all permissions.
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  superAdmin: PERMISSIONS,
  admin: [
    "dashboard:view", "seasons:manage", "matches:manage", "teams:manage", "players:manage",
    "registrations:review", "content:manage", "streams:manage", "sponsors:manage",
  ],
  scorer: ["dashboard:view", "matches:manage", "scoring:write"],
  editor: ["dashboard:view", "content:manage", "streams:manage", "sponsors:manage"],
  auctionManager: ["dashboard:view", "auction:manage", "auction:bid", "players:manage"],
};

export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
