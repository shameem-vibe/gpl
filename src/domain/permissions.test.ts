import { describe, expect, it } from "vitest";
import { can } from "./permissions";

describe("permissions", () => {
  it("denies when there is no role", () => expect(can(undefined, "dashboard:view")).toBe(false));
  it("lets a scorer score but not manage users", () => {
    expect(can("scorer", "scoring:write")).toBe(true);
    expect(can("scorer", "users:manage")).toBe(false);
  });
  it("keeps user management and audit logs with super admin only", () => {
    expect(can("admin", "users:manage")).toBe(false);
    expect(can("admin", "audit:read")).toBe(false);
    expect(can("superAdmin", "users:manage")).toBe(true);
  });
});
