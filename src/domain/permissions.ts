import type { Role } from "@/types/domain";

/** Single source of truth for RBAC. Server routes call can(); UI only uses it to hide controls. */
export const PERMISSIONS = [
  "dashboard:view", "seasons:manage", "matches:manage", "scoring:write", "teams:manage",
  "players:manage", "registrations:review", "auction:manage", "auction:bid", "content:manage",
  "streams:manage", "sponsors:manage", "users:manage", "settings:manage", "audit:read",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const ALL = [...PERMISSIONS] as Permission[];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  superAdmin: ALL,
  admin: ALL.filter((p) => p !== "users:manage" && p !== "audit:read" && p !== "settings:manage"),
  scorer: ["dashboard:view", "scoring:write"],
  editor: ["dashboard:view", "content:manage", "streams:manage", "sponsors:manage"],
  auctionManager: ["dashboard:view", "auction:manage", "auction:bid", "players:manage"],
};

export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
