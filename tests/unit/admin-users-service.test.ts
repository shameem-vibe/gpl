import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Role } from "@/types/domain";

// ---- fakes ----
let doc: { role: Role; active: boolean; displayName: string; email: string } | null;
let otherSupers = 0;
const tx = { get: vi.fn(async () => ({})), update: vi.fn(), set: vi.fn() };
const auth = {
  setCustomUserClaims: vi.fn(async () => undefined),
  updateUser: vi.fn(async () => undefined),
  revokeRefreshTokens: vi.fn(async () => undefined),
  createUser: vi.fn(async () => ({ uid: "newuid" })),
  deleteUser: vi.fn(async () => undefined),
  generatePasswordResetLink: vi.fn(async () => "https://reset"),
};
const refUpdate = vi.fn(async () => undefined);
const batch = { set: vi.fn(), commit: vi.fn(async () => undefined) };

vi.mock("@/lib/firebase/admin", () => ({
  adminAuth: () => auth,
  adminDb: () => ({ runTransaction: async (fn: (t: typeof tx) => unknown) => fn(tx), batch: () => batch }),
  serverTimestamp: () => "SERVER_TS",
}));
vi.mock("@/lib/repositories/users", () => ({
  userRef: () => ({ update: refUpdate }),
  toStaff: () => (doc ? { uid: "target", ...doc } : null),
  countOtherActiveSuperAdmins: async () => otherSupers,
  getStaff: async () => (doc ? { uid: "target", ...doc } : null),
  newStaffData: (v: object) => v,
}));
vi.mock("@/lib/repositories/audit", () => ({
  buildAudit: (i: object) => ({ ref: {}, data: i }),
  writeAudit: vi.fn(async () => undefined),
}));

import { createStaff, updateStaff } from "@/lib/services/admin-users";

const actor = { uid: "actor", email: "root@gpl.test", displayName: "Root", role: "superAdmin" as Role };
beforeEach(() => {
  vi.clearAllMocks();
  doc = { role: "editor", active: true, displayName: "Eddie", email: "e@gpl.test" };
  otherSupers = 1;
});

describe("updateStaff", () => {
  it("changes a role, syncs the claim and revokes existing sessions", async () => {
    await updateStaff(actor, "target", { role: "scorer" });
    expect(tx.update).toHaveBeenCalledOnce();
    expect(auth.setCustomUserClaims).toHaveBeenCalledWith("target", { role: "scorer" });
    expect(auth.revokeRefreshTokens).toHaveBeenCalledWith("target");
  });
  it("deactivation disables the Auth user and revokes sessions", async () => {
    await updateStaff(actor, "target", { active: false });
    expect(auth.updateUser).toHaveBeenCalledWith("target", { disabled: true });
    expect(auth.revokeRefreshTokens).toHaveBeenCalled();
  });
  it("writes one audit entry per kind of change", async () => {
    await updateStaff(actor, "target", { role: "admin", active: false });
    const actions = tx.set.mock.calls.map((c) => (c[1] as { action: string }).action).sort();
    expect(actions).toEqual(["user.deactivate", "user.role_change"]);
  });
  it("refuses to demote or deactivate the last active super admin and touches nothing", async () => {
    doc = { role: "superAdmin", active: true, displayName: "Root2", email: "r2@gpl.test" };
    otherSupers = 0;
    await expect(updateStaff(actor, "target", { role: "admin" })).rejects.toMatchObject({ status: 409 });
    await expect(updateStaff(actor, "target", { active: false })).rejects.toMatchObject({ status: 409 });
    expect(tx.update).not.toHaveBeenCalled();
    expect(auth.setCustomUserClaims).not.toHaveBeenCalled();
  });
  it("allows demoting a super admin when another remains", async () => {
    doc = { role: "superAdmin", active: true, displayName: "Root2", email: "r2@gpl.test" };
    otherSupers = 1;
    await updateStaff(actor, "target", { role: "admin" });
    expect(auth.setCustomUserClaims).toHaveBeenCalledWith("target", { role: "admin" });
  });
  it("blocks changing your own role or status", async () => {
    await expect(updateStaff({ ...actor, uid: "target" }, "target", { role: "admin" })).rejects.toMatchObject({ status: 409 });
  });
  it("404 for a missing account, 400 for a no-op", async () => {
    doc = null;
    await expect(updateStaff(actor, "target", { role: "admin" })).rejects.toMatchObject({ status: 404 });
    doc = { role: "editor", active: true, displayName: "Eddie", email: "e@gpl.test" };
    await expect(updateStaff(actor, "target", { role: "editor" })).rejects.toMatchObject({ status: 400 });
  });
  it("rolls Firestore back if the Auth update fails", async () => {
    auth.setCustomUserClaims.mockRejectedValueOnce(new Error("boom"));
    await expect(updateStaff(actor, "target", { role: "scorer" })).rejects.toMatchObject({ status: 500 });
    expect(refUpdate).toHaveBeenCalledWith(expect.objectContaining({ role: "editor", active: true }));
  });
});

describe("createStaff", () => {
  const input = { email: "n@gpl.test", displayName: "New One", role: "scorer" as Role };
  it("creates Auth user with claim, staff doc and audit entry; never returns a password", async () => {
    const res = await createStaff(actor, input);
    expect(res).toEqual({ uid: "newuid", resetLink: "https://reset" });
    expect(auth.setCustomUserClaims).toHaveBeenCalledWith("newuid", { role: "scorer" });
    expect(batch.set).toHaveBeenCalledTimes(2);
    expect(JSON.stringify(res)).not.toMatch(/password/i);
  });
  it("maps duplicate emails to 409", async () => {
    auth.createUser.mockRejectedValueOnce({ code: "auth/email-already-exists" });
    await expect(createStaff(actor, input)).rejects.toMatchObject({ status: 409 });
  });
  it("deletes the Auth user if the Firestore write fails (no orphan accounts)", async () => {
    batch.commit.mockRejectedValueOnce(new Error("firestore down"));
    await expect(createStaff(actor, input)).rejects.toThrow();
    expect(auth.deleteUser).toHaveBeenCalledWith("newuid");
  });
});
