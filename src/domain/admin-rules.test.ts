import { describe, expect, it } from "vitest";
import { checkAccountChange, type AccountState } from "./admin-rules";

const target = (o: Partial<AccountState> = {}): AccountState => ({ uid: "t", role: "editor", active: true, ...o });

describe("checkAccountChange", () => {
  it("allows promoting and demoting ordinary accounts", () => {
    expect(checkAccountChange("a", target(), { role: "scorer" }, 0)).toBeNull();
    expect(checkAccountChange("a", target(), { active: false }, 0)).toBeNull();
  });
  it("rejects no-op changes", () => expect(checkAccountChange("a", target(), { role: "editor" }, 1)).toBe("no_change"));
  it("blocks changing your own role or status", () => {
    expect(checkAccountChange("t", target({ role: "superAdmin" }), { role: "admin" }, 3)).toBe("self_change");
    expect(checkAccountChange("t", target(), { active: false }, 3)).toBe("self_change");
  });
  it("blocks demoting or deactivating the last active super admin", () => {
    const sa = target({ role: "superAdmin" });
    expect(checkAccountChange("a", sa, { role: "admin" }, 0)).toBe("last_super_admin");
    expect(checkAccountChange("a", sa, { active: false }, 0)).toBe("last_super_admin");
  });
  it("allows demoting a super admin when another active one exists", () => {
    expect(checkAccountChange("a", target({ role: "superAdmin" }), { role: "admin" }, 1)).toBeNull();
  });
  it("does not treat an already-inactive super admin as a protected one", () => {
    expect(checkAccountChange("a", target({ role: "superAdmin", active: false }), { role: "admin" }, 0)).toBeNull();
  });
  it("allows reactivating a super admin", () => {
    expect(checkAccountChange("a", target({ role: "superAdmin", active: false }), { active: true }, 0)).toBeNull();
  });
});
