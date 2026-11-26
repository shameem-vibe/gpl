import { describe, expect, it } from "vitest";
import { can, PERMISSIONS, ROLE_PERMISSIONS, type Permission } from "./permissions";
import { ROLES, type Role } from "@/types/domain";

describe("permissions", () => {
  it("denies when there is no role", () => {
    expect(can(undefined, "dashboard:view")).toBe(false);
    expect(can(null, "dashboard:view")).toBe(false);
  });
  it("denies an unknown role string (e.g. a forged claim)", () => {
    expect(can("owner" as Role, "dashboard:view")).toBe(false);
  });
  it("lets a scorer score but not manage users", () => {
    expect(can("scorer", "scoring:write")).toBe(true);
    expect(can("scorer", "users:manage")).toBe(false);
  });
  it("keeps user management, settings and audit logs with super admin only", () => {
    for (const p of ["users:manage", "settings:manage", "audit:read"] as Permission[]) {
      for (const r of ROLES) expect(can(r, p)).toBe(r === "superAdmin");
    }
  });
  it("gives super admin every permission", () => {
    for (const p of PERMISSIONS) expect(can("superAdmin", p)).toBe(true);
  });
  it("every non-super role can at least see the dashboard", () => {
    for (const r of ROLES) expect(can(r, "dashboard:view")).toBe(true);
  });

  // Full matrix, so any change to a role is a deliberate, visible test edit.
  const expected: Record<Exclude<Role, "superAdmin">, Permission[]> = {
    admin: ["dashboard:view", "seasons:manage", "matches:manage", "teams:manage", "players:manage", "registrations:review", "content:manage", "streams:manage", "sponsors:manage"],
    scorer: ["dashboard:view", "matches:manage", "scoring:write"],
    editor: ["dashboard:view", "content:manage", "streams:manage", "sponsors:manage"],
    auctionManager: ["dashboard:view", "auction:manage", "auction:bid", "players:manage"],
  };
  for (const [role, perms] of Object.entries(expected) as [keyof typeof expected, Permission[]][]) {
    it(`${role} has exactly the documented permissions`, () => {
      expect([...ROLE_PERMISSIONS[role]].sort()).toEqual([...perms].sort());
    });
  }
  it("editor cannot touch scores or the auction; scorer cannot touch content", () => {
    expect(can("editor", "scoring:write")).toBe(false);
    expect(can("editor", "auction:manage")).toBe(false);
    expect(can("scorer", "content:manage")).toBe(false);
    expect(can("auctionManager", "users:manage")).toBe(false);
  });
});
