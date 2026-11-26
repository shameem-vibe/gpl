import "server-only";
import { randomBytes } from "node:crypto";
import { checkAccountChange, VIOLATION_MESSAGES } from "@/domain/admin-rules";
import { HttpError } from "@/lib/auth/guard";
import type { AdminUser } from "@/lib/auth/session";
import { adminAuth, adminDb, serverTimestamp, type ServerValue } from "@/lib/firebase/admin";
import { buildAudit, writeAudit, type AuditActor } from "@/lib/repositories/audit";
import { countOtherActiveSuperAdmins, getStaff, newStaffData, toStaff, userRef } from "@/lib/repositories/users";
import { ROLE_LABELS } from "@/lib/constants/roles";
import type { CreateAdminInput, UpdateAdminInput } from "@/lib/validation/auth";
import type { StaffAccount } from "@/types/domain";

const actorOf = (a: AdminUser): AuditActor => ({ uid: a.uid, email: a.email, role: a.role });
const errCode = (e: unknown) => (e as { code?: string })?.code;

/**
 * Account management. Business rules live in src/domain/admin-rules.ts; this orchestrates Auth + Firestore.
 * Firestore (source of truth for status, with the audit entry) is changed first inside a transaction;
 * Auth claims / disabled flag / token revocation follow. If Auth fails, Firestore is rolled back.
 */
export async function createStaff(actor: AdminUser, input: CreateAdminInput) {
  const auth = adminAuth();
  let uid: string;
  try {
    // Random password nobody ever sees: the new admin sets their own through the reset link/email.
    const created = await auth.createUser({
      email: input.email, displayName: input.displayName, emailVerified: false,
      password: randomBytes(24).toString("base64url"),
    });
    uid = created.uid;
  } catch (e) {
    if (errCode(e) === "auth/email-already-exists") throw new HttpError(409, "An account with this email already exists.");
    throw e;
  }

  try {
    await auth.setCustomUserClaims(uid, { role: input.role });
    const batch = adminDb().batch();
    batch.set(userRef(uid), newStaffData({ ...input, createdBy: actor.uid }));
    const audit = buildAudit({
      actor: actorOf(actor), action: "user.create", targetType: "user", targetId: uid,
      summary: `Created ${input.email} as ${ROLE_LABELS[input.role]}`,
      changes: { role: { from: null, to: input.role } },
    });
    batch.set(audit.ref, audit.data);
    await batch.commit();
  } catch (e) {
    await auth.deleteUser(uid).catch(() => undefined); // compensate: never leave an Auth user without a staff record
    throw e;
  }

  const resetLink = await auth.generatePasswordResetLink(input.email).catch(() => null);
  return { uid, resetLink };
}

export async function updateStaff(actor: AdminUser, uid: string, input: UpdateAdminInput): Promise<StaffAccount> {
  const ref = userRef(uid);
  const before = await adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const cur = toStaff(snap);
    if (!cur) throw new HttpError(404, "Administrator not found.");

    const roleChanged = input.role !== undefined && input.role !== cur.role;
    const activeChanged = input.active !== undefined && input.active !== cur.active;
    const nameChanged = input.displayName !== undefined && input.displayName !== cur.displayName;
    if (!roleChanged && !activeChanged && !nameChanged) throw new HttpError(400, VIOLATION_MESSAGES.no_change);

    if (roleChanged || activeChanged) {
      const others = await countOtherActiveSuperAdmins(tx, uid);
      const violation = checkAccountChange(actor.uid, { uid, role: cur.role, active: cur.active }, { role: input.role, active: input.active }, others);
      if (violation) throw new HttpError(409, VIOLATION_MESSAGES[violation]);
    }

    const patch: Record<string, string | boolean | ServerValue> = { updatedAt: serverTimestamp(), updatedBy: actor.uid };
    if (roleChanged) patch.role = input.role!;
    if (activeChanged) patch.active = input.active!;
    if (nameChanged) patch.displayName = input.displayName!;
    tx.update(ref, patch);

    const audits: Parameters<typeof buildAudit>[0][] = [];
    const base = { actor: actorOf(actor), targetType: "user" as const, targetId: uid };
    if (roleChanged) audits.push({ ...base, action: "user.role_change", summary: `${cur.email}: ${ROLE_LABELS[cur.role]} -> ${ROLE_LABELS[input.role!]}`, changes: { role: { from: cur.role, to: input.role! } } });
    if (activeChanged) audits.push({ ...base, action: input.active ? "user.reactivate" : "user.deactivate", summary: `${input.active ? "Reactivated" : "Deactivated"} ${cur.email}`, changes: { active: { from: String(cur.active), to: String(input.active) } } });
    if (nameChanged) audits.push({ ...base, action: "user.update", summary: `Renamed ${cur.email}`, changes: { displayName: { from: cur.displayName, to: input.displayName! } } });
    for (const a of audits) { const b = buildAudit(a); tx.set(b.ref, b.data); }
    return { cur, roleChanged, activeChanged, nameChanged };
  });

  const next = { role: input.role ?? before.cur.role, active: input.active ?? before.cur.active };
  try {
    const auth = adminAuth();
    if (before.roleChanged) await auth.setCustomUserClaims(uid, { role: next.role });
    if (before.activeChanged || before.nameChanged) {
      await auth.updateUser(uid, { disabled: !next.active, ...(input.displayName ? { displayName: input.displayName } : {}) });
    }
    // Kill existing sessions so the old role/status stops working immediately.
    if (before.roleChanged || before.activeChanged) await auth.revokeRefreshTokens(uid);
  } catch (e) {
    await ref.update({ role: before.cur.role, active: before.cur.active, displayName: before.cur.displayName, updatedAt: serverTimestamp() }).catch(() => undefined);
    await adminAuth().setCustomUserClaims(uid, { role: before.cur.role }).catch(() => undefined);
    await adminAuth().updateUser(uid, { disabled: !before.cur.active }).catch(() => undefined);
    console.error("[admin-users] auth sync failed, rolled back", errCode(e));
    throw new HttpError(500, "Could not apply the change. Nothing was modified.");
  }
  const updated = await getStaff(uid);
  if (!updated) throw new HttpError(404, "Administrator not found.");
  return updated;
}

/** Issues a one-time password-setup link for a locked-out admin. The link itself is never stored or logged. */
export async function issueResetLink(actor: AdminUser, uid: string): Promise<string> {
  const target = await getStaff(uid);
  if (!target) throw new HttpError(404, "Administrator not found.");
  const link = await adminAuth().generatePasswordResetLink(target.email);
  await writeAudit({ actor: actorOf(actor), action: "user.reset_link_issued", targetType: "user", targetId: uid, summary: `Issued password reset link for ${target.email}` });
  return link;
}
