import { describe, expect, it } from "vitest";
import { createAdminSchema, loginSchema, updateAdminSchema, uidSchema } from "./auth";

describe("validation", () => {
  it("normalises emails", () => {
    expect(loginSchema.parse({ email: "  Admin@Example.COM ", password: "x" }).email).toBe("admin@example.com");
  });
  it("rejects bad emails and empty passwords", () => {
    expect(loginSchema.safeParse({ email: "nope", password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
  });
  it("rejects unknown roles on create", () => {
    expect(createAdminSchema.safeParse({ email: "a@b.co", displayName: "Ab", role: "owner" }).success).toBe(false);
    expect(createAdminSchema.safeParse({ email: "a@b.co", displayName: "Ab", role: "scorer" }).success).toBe(true);
  });
  it("rejects empty or unexpected fields on update (no mass assignment)", () => {
    expect(updateAdminSchema.safeParse({}).success).toBe(false);
    expect(updateAdminSchema.safeParse({ role: "admin", uid: "x" }).success).toBe(false);
    expect(updateAdminSchema.safeParse({ active: false }).success).toBe(true);
  });
  it("only accepts safe uid characters", () => {
    expect(uidSchema.safeParse("abc123_-XYZ").success).toBe(true);
    expect(uidSchema.safeParse("../etc/passwd").success).toBe(false);
  });
});
