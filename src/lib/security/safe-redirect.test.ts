import { describe, expect, it } from "vitest";
import { safeAdminRedirect } from "./safe-redirect";

describe("safeAdminRedirect", () => {
  it("keeps admin paths", () => expect(safeAdminRedirect("/admin/users?q=a")).toBe("/admin/users?q=a"));
  it("blocks external and protocol-relative targets", () => {
    for (const bad of ["https://evil.com", "//evil.com", "/\\evil.com", "/other", "javascript:alert(1)", "/admin\r\nx"]) {
      expect(safeAdminRedirect(bad)).toBe("/admin");
    }
  });
  it("never loops back to login", () => expect(safeAdminRedirect("/admin/login")).toBe("/admin"));
  it("falls back on empty input", () => expect(safeAdminRedirect(undefined)).toBe("/admin"));
});
