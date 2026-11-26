#!/usr/bin/env node
/**
 * One-time Super Admin bootstrap. Runs on YOUR machine with the service-account credentials in .env.local.
 *
 *   npm run admin:bootstrap -- you@example.com "Your Name"
 *
 * - Refuses to run if any Super Admin already exists (so it cannot be reused as a backdoor).
 * - Prompts for the password (hidden), min 12 chars. The password is never logged or stored by this script.
 * - Creates the Auth user, sets the signed `role` claim, writes users/{uid} and an audit entry.
 */
import { createInterface } from "node:readline";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const [email, ...nameParts] = process.argv.slice(2);
const displayName = nameParts.join(" ").trim();
const fail = (m) => { console.error(`\n✖ ${m}\n`); process.exit(1); };

if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || displayName.length < 2) {
  fail('Usage: npm run admin:bootstrap -- you@example.com "Your Name"');
}
const { FIREBASE_ADMIN_PROJECT_ID: projectId, FIREBASE_ADMIN_CLIENT_EMAIL: clientEmail, FIREBASE_ADMIN_PRIVATE_KEY: key } = process.env;
if (!projectId || !clientEmail || !key) fail("Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY in .env.local (see docs/SETUP.md).");

function askHidden(q) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => { if (s.includes(q)) process.stdout.write(s); };
    rl.question(q, (a) => { rl.close(); process.stdout.write("\n"); resolve(a); });
  });
}

initializeApp({ credential: cert({ projectId, clientEmail, privateKey: key.replace(/\\n/g, "\n") }) });
const auth = getAuth();
const db = getFirestore();

const existing = await db.collection("users").where("role", "==", "superAdmin").limit(1).get();
if (!existing.empty) fail("A Super Admin already exists. Sign in and create further administrators from Users and Roles.");

const password = process.env.GPL_BOOTSTRAP_PASSWORD || (await askHidden("Password (min 12 characters): "));
if (password.length < 12) fail("Password must be at least 12 characters.");
if (!process.env.GPL_BOOTSTRAP_PASSWORD && (await askHidden("Repeat password: ")) !== password) fail("Passwords do not match.");

let user;
try {
  user = await auth.getUserByEmail(email);
  await auth.updateUser(user.uid, { password, displayName, disabled: false });
  console.log("• Existing Firebase Auth user found; password and name updated.");
} catch (e) {
  if (e?.code !== "auth/user-not-found") throw e;
  user = await auth.createUser({ email, password, displayName, emailVerified: true });
}
await auth.setCustomUserClaims(user.uid, { role: "superAdmin" });
const batch = db.batch();
batch.set(db.collection("users").doc(user.uid), {
  email: email.toLowerCase(), displayName, role: "superAdmin", active: true,
  createdAt: FieldValue.serverTimestamp(), createdBy: "bootstrap-script",
  updatedAt: FieldValue.serverTimestamp(), updatedBy: "bootstrap-script", lastLoginAt: null,
});
batch.set(db.collection("auditLogs").doc(), {
  actorUid: user.uid, actorEmail: email.toLowerCase(), actorRole: "superAdmin", action: "user.create",
  targetType: "user", targetId: user.uid, summary: `Bootstrapped first Super Admin ${email.toLowerCase()}`,
  changes: { role: { from: null, to: "superAdmin" } }, createdAt: FieldValue.serverTimestamp(),
});
await batch.commit();
console.log(`\n✔ Super Admin created: ${email}\n  Sign in at /admin/login. Then delete the service-account JSON from your machine if you no longer need it.\n`);
