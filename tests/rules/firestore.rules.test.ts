import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "gpl-rules-test",
    firestore: { rules: readFileSync("firebase/firestore.rules", "utf8"), host: "127.0.0.1", port: 8080 },
  });
});
afterAll(async () => env.cleanup());
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "news/pub"), { status: "published", title: "Public" });
    await setDoc(doc(db, "news/draft"), { status: "draft", title: "Draft" });
    await setDoc(doc(db, "seasons/s1/registrations/r1"), { phone: "01700000000" });
    await setDoc(doc(db, "seasons/s1/matches/m1/private/state"), { key: "secret" });
    await setDoc(doc(db, "players/p1/private/profile"), { phone: "01700000000" });
    await setDoc(doc(db, "settings/private"), { secret: true });
    await setDoc(doc(db, "seasons/s1/matches/m1"), { status: "live" });
    await setDoc(doc(db, "users/u1"), { role: "scorer", active: true });
    await setDoc(doc(db, "users/u2"), { role: "editor", active: true });
    await setDoc(doc(db, "auditLogs/a1"), { action: "x" });
  });
});

const ROLES = ["superAdmin", "admin", "scorer", "editor", "auctionManager"] as const;
const anon = () => env.unauthenticatedContext().firestore();
const as = (uid: string, role?: string) => env.authenticatedContext(uid, role ? { role } : {}).firestore();

describe("public reads", () => {
  it("allows published news, denies drafts to the public", async () => {
    await assertSucceeds(getDoc(doc(anon(), "news/pub")));
    await assertFails(getDoc(doc(anon(), "news/draft")));
  });
  it("lets every staff role read drafts, but not a signed-in user with no role", async () => {
    for (const r of ROLES) await assertSucceeds(getDoc(doc(as("x", r), "news/draft")));
    await assertFails(getDoc(doc(as("x"), "news/draft")));
    await assertFails(getDoc(doc(as("x", "owner"), "news/draft")));
  });
  it("allows the public to read match state", async () => { await assertSucceeds(getDoc(doc(anon(), "seasons/s1/matches/m1"))); });
});

describe("private data", () => {
  it("denies registrations to everyone, even super admin (server only)", async () => {
    await assertFails(getDoc(doc(anon(), "seasons/s1/registrations/r1")));
    for (const r of ROLES) await assertFails(getDoc(doc(as("a", r), "seasons/s1/registrations/r1")));
  });
  it("denies scorer state, player private profile and private settings", async () => {
    for (const ctx of [anon(), as("a", "superAdmin")]) {
      await assertFails(getDoc(doc(ctx, "seasons/s1/matches/m1/private/state")));
      await assertFails(getDoc(doc(ctx, "players/p1/private/profile")));
      await assertFails(getDoc(doc(ctx, "settings/private")));
    }
  });
  it("denies unlisted paths (default deny)", async () => {
    await assertFails(getDoc(doc(as("a", "superAdmin"), "somethingNew/x")));
  });
});

describe("users collection", () => {
  it("only lets a user read their own profile; no listing", async () => {
    await assertSucceeds(getDoc(doc(as("u1", "scorer"), "users/u1")));
    await assertFails(getDoc(doc(as("u2", "editor"), "users/u1")));
    await assertFails(getDoc(doc(anon(), "users/u1")));
    await assertFails(getDocs(collection(as("a", "superAdmin"), "users")));
  });
  it("prevents any client from changing roles or creating staff, including super admin", async () => {
    await assertFails(updateDoc(doc(as("u1", "scorer"), "users/u1"), { role: "superAdmin" }));
    await assertFails(updateDoc(doc(as("s", "superAdmin"), "users/u1"), { role: "admin" }));
    await assertFails(setDoc(doc(as("s", "superAdmin"), "users/new"), { role: "superAdmin" }));
    await assertFails(setDoc(doc(anon(), "users/new"), { role: "superAdmin" }));
    await assertFails(deleteDoc(doc(as("u1", "scorer"), "users/u1")));
  });
});

describe("writes", () => {
  it("denies every client write, for every role and anonymous", async () => {
    for (const ctx of [anon(), ...ROLES.map((r) => as("a", r))]) {
      await assertFails(setDoc(doc(ctx, "news/x"), { status: "published" }));
      await assertFails(setDoc(doc(ctx, "seasons/s1/matches/m1"), { status: "completed" }));
      await assertFails(setDoc(doc(ctx, "seasons/s1/registrations/new"), { phone: "x" }));
    }
  });
});

describe("audit logs", () => {
  it("lets only super admin read; nobody can write, edit or delete", async () => {
    await assertSucceeds(getDoc(doc(as("s", "superAdmin"), "auditLogs/a1")));
    for (const r of ROLES.filter((r) => r !== "superAdmin")) await assertFails(getDoc(doc(as("a", r), "auditLogs/a1")));
    await assertFails(getDoc(doc(anon(), "auditLogs/a1")));
    for (const r of ROLES) {
      const db = as("a", r);
      await assertFails(setDoc(doc(db, "auditLogs/forged"), { action: "user.create" }));
      await assertFails(updateDoc(doc(db, "auditLogs/a1"), { action: "tampered" }));
      await assertFails(deleteDoc(doc(db, "auditLogs/a1")));
    }
  });
});
