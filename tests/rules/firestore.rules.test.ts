import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
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
    await setDoc(doc(db, "users/u1"), { role: "scorer" });
    await setDoc(doc(db, "auditLogs/a1"), { action: "x" });
  });
});

const anon = () => env.unauthenticatedContext().firestore();
const as = (uid: string, role?: string) => env.authenticatedContext(uid, role ? { role } : {}).firestore();

describe("public reads", () => {
  it("allows published news, denies drafts to the public", async () => {
    await assertSucceeds(getDoc(doc(anon(), "news/pub")));
    await assertFails(getDoc(doc(anon(), "news/draft")));
  });
  it("lets editors read drafts", async () => { await assertSucceeds(getDoc(doc(as("e1", "editor"), "news/draft"))); });
  it("allows the public to read match state", async () => { await assertSucceeds(getDoc(doc(anon(), "seasons/s1/matches/m1"))); });
});

describe("private data", () => {
  it("denies registrations to everyone, even super admin (server only)", async () => {
    await assertFails(getDoc(doc(anon(), "seasons/s1/registrations/r1")));
    await assertFails(getDoc(doc(as("a", "superAdmin"), "seasons/s1/registrations/r1")));
  });
  it("denies scorer state, player private profile and private settings", async () => {
    await assertFails(getDoc(doc(anon(), "seasons/s1/matches/m1/private/state")));
    await assertFails(getDoc(doc(anon(), "players/p1/private/profile")));
    await assertFails(getDoc(doc(anon(), "settings/private")));
  });
});

describe("writes and privilege escalation", () => {
  it("denies every client write, including to staff", async () => {
    await assertFails(setDoc(doc(anon(), "news/x"), { status: "published" }));
    await assertFails(setDoc(doc(as("a", "superAdmin"), "seasons/s1/matches/m1"), { status: "completed" }));
  });
  it("prevents a user from changing their own role", async () => {
    await assertFails(updateDoc(doc(as("u1", "scorer"), "users/u1"), { role: "superAdmin" }));
  });
  it("only lets a user read their own profile", async () => {
    await assertSucceeds(getDoc(doc(as("u1", "scorer"), "users/u1")));
    await assertFails(getDoc(doc(as("u2", "scorer"), "users/u1")));
  });
  it("limits audit logs to super admin", async () => {
    await assertFails(getDoc(doc(as("a", "admin"), "auditLogs/a1")));
    await assertSucceeds(getDoc(doc(as("s", "superAdmin"), "auditLogs/a1")));
  });
});
