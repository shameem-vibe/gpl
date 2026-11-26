import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Role } from "@/types/domain";

const m = vi.hoisted(() => ({
  getCurrentAdmin: vi.fn(),
  createStaff: vi.fn(async () => ({ uid: "new1", resetLink: "https://x" })),
  updateStaff: vi.fn(async () => ({ uid: "u12345" })),
  issueResetLink: vi.fn(async () => "https://reset"),
  createAdminSession: vi.fn(async () => ({ cookie: "COOKIE", maxAgeSeconds: 100 })),
}));
vi.mock("@/lib/auth/session", () => ({
  getCurrentAdmin: () => m.getCurrentAdmin(),
  SESSION_COOKIE: "gpl_session",
  SESSION_MAX_AGE_SECONDS: 100,
  sessionCookieOptions: () => ({ httpOnly: true, path: "/" }),
}));
vi.mock("@/lib/services/admin-users", () => ({ createStaff: m.createStaff, updateStaff: m.updateStaff, issueResetLink: m.issueResetLink }));
vi.mock("@/lib/services/session", () => ({ createAdminSession: m.createAdminSession, recordLogout: vi.fn() }));
const { getCurrentAdmin, createStaff, issueResetLink, createAdminSession } = m;

import { POST as createUser } from "@/app/api/admin/users/route";
import { PATCH as patchUser } from "@/app/api/admin/users/[uid]/route";
import { POST as resetLink } from "@/app/api/admin/users/[uid]/reset-link/route";
import { POST as session } from "@/app/api/auth/session/route";
import { __resetRateLimit } from "@/lib/security/rate-limit";

const HOST = "gpl.test";
function req(method: string, body?: unknown, headers: Record<string, string> = {}) {
  return new Request(`https://${HOST}/api/x`, {
    method,
    headers: { "content-type": "application/json", host: HOST, origin: `https://${HOST}`, ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
const as = (role: Role | null, extra = {}) =>
  getCurrentAdmin.mockResolvedValue(role ? { uid: "actor", email: "a@b.co", displayName: "A", role, ...extra } : null);
const ctx = { params: Promise.resolve({ uid: "user123" }) };
const valid = { email: "new@b.co", displayName: "New Admin", role: "scorer" };

beforeEach(() => { vi.clearAllMocks(); __resetRateLimit(); });

describe("POST /api/admin/users (create administrator)", () => {
  it("401 without a session", async () => {
    as(null);
    expect((await createUser(req("POST", valid))).status).toBe(401);
    expect(createStaff).not.toHaveBeenCalled();
  });
  for (const role of ["admin", "scorer", "editor", "auctionManager"] as Role[]) {
    it(`403 for ${role}`, async () => {
      as(role);
      expect((await createUser(req("POST", valid))).status).toBe(403);
      expect(createStaff).not.toHaveBeenCalled();
    });
  }
  it("403 in UI-preview mode even as 'superAdmin'", async () => {
    as("superAdmin", { preview: true });
    expect((await createUser(req("POST", valid))).status).toBe(403);
  });
  it("403 on cross-origin requests (CSRF)", async () => {
    as("superAdmin");
    expect((await createUser(req("POST", valid, { origin: "https://evil.com" }))).status).toBe(403);
    expect(createStaff).not.toHaveBeenCalled();
  });
  it("403 when Origin is absent and the request is not same-origin", async () => {
    as("superAdmin");
    const r = new Request(`https://${HOST}/api/x`, { method: "POST", headers: { host: HOST, "content-type": "application/json", "sec-fetch-site": "cross-site" }, body: JSON.stringify(valid) });
    expect((await createUser(r)).status).toBe(403);
  });
  it("400 on invalid input, including an invented role", async () => {
    as("superAdmin");
    expect((await createUser(req("POST", { ...valid, role: "owner" }))).status).toBe(400);
    expect((await createUser(req("POST", { ...valid, email: "bad" }))).status).toBe(400);
  });
  it("201 for super admin with valid input", async () => {
    as("superAdmin");
    const res = await createUser(req("POST", valid));
    expect(res.status).toBe(201);
    expect(createStaff).toHaveBeenCalledOnce();
  });
});

describe("PATCH /api/admin/users/[uid]", () => {
  it("403 for admin, 200 for super admin", async () => {
    as("admin");
    expect((await patchUser(req("PATCH", { role: "editor" }), ctx)).status).toBe(403);
    as("superAdmin");
    expect((await patchUser(req("PATCH", { role: "editor" }), ctx)).status).toBe(200);
  });
  it("rejects unknown fields (no mass assignment) and bad uids", async () => {
    as("superAdmin");
    expect((await patchUser(req("PATCH", { role: "editor", email: "x@y.z" }), ctx)).status).toBe(400);
    expect((await patchUser(req("PATCH", { role: "editor" }), { params: Promise.resolve({ uid: "../x" }) })).status).toBe(400);
  });
});

describe("POST /api/admin/users/[uid]/reset-link", () => {
  it("403 for non-super-admins", async () => {
    as("editor");
    expect((await resetLink(req("POST"), ctx)).status).toBe(403);
    expect(issueResetLink).not.toHaveBeenCalled();
  });
  it("returns the link to a super admin, uncached", async () => {
    as("superAdmin");
    const res = await resetLink(req("POST"), ctx);
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });
});

describe("POST /api/auth/session", () => {
  const body = { idToken: "x".repeat(40) };
  it("sets an httpOnly session cookie on success", async () => {
    const res = await session(req("POST", body));
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toContain("gpl_session=COOKIE");
  });
  it("rejects cross-origin and malformed bodies", async () => {
    expect((await session(req("POST", body, { origin: "https://evil.com" }))).status).toBe(403);
    expect((await session(req("POST", { idToken: "short" }))).status).toBe(400);
    expect(createAdminSession).not.toHaveBeenCalled();
  });
  it("rate limits repeated attempts from one IP", async () => {
    let last = 200;
    for (let i = 0; i < 12; i++) last = (await session(req("POST", body, { "x-forwarded-for": "9.9.9.9" }))).status;
    expect(last).toBe(429);
  });
});
