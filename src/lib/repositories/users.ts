import "server-only";
import type { DocumentData, DocumentSnapshot, Timestamp, Transaction } from "firebase-admin/firestore";
import { adminDb, serverTimestamp } from "@/lib/firebase/admin";
import { paths } from "@/lib/firebase/paths";
import { ROLES, type Role, type StaffAccount } from "@/types/domain";

const iso = (t: unknown) => (t && typeof (t as Timestamp).toDate === "function" ? (t as Timestamp).toDate().toISOString() : null);
const isRole = (r: unknown): r is Role => typeof r === "string" && (ROLES as readonly string[]).includes(r);

export const usersCol = () => adminDb().collection(paths.users);
export const userRef = (uid: string) => usersCol().doc(uid);

export function toStaff(d: DocumentSnapshot<DocumentData>): StaffAccount | null {
  const x = d.data();
  if (!x || !isRole(x.role)) return null;
  return {
    uid: d.id,
    email: String(x.email ?? ""),
    displayName: String(x.displayName ?? ""),
    role: x.role,
    active: x.active !== false,
    createdAt: iso(x.createdAt),
    createdBy: (x.createdBy as string | null) ?? null,
    updatedAt: iso(x.updatedAt),
    lastLoginAt: iso(x.lastLoginAt),
  };
}

export async function getStaff(uid: string): Promise<StaffAccount | null> {
  return toStaff(await userRef(uid).get());
}

/** Staff lists are small (tens), so one read + in-memory search is cheaper and simpler than search indexes. */
export async function listStaff(query?: string): Promise<StaffAccount[]> {
  const snap = await usersCol().orderBy("createdAt", "desc").limit(500).get();
  const all = snap.docs.map(toStaff).filter((s): s is StaffAccount => s !== null);
  const q = query?.trim().toLowerCase();
  return q ? all.filter((s) => s.email.toLowerCase().includes(q) || s.displayName.toLowerCase().includes(q)) : all;
}

export async function countStaff(): Promise<{ active: number; inactive: number }> {
  const [a, i] = await Promise.all([
    usersCol().where("active", "==", true).count().get(),
    usersCol().where("active", "==", false).count().get(),
  ]);
  return { active: a.data().count, inactive: i.data().count };
}

/** Counts other ACTIVE super admins inside a transaction so concurrent demotions cannot both succeed. */
export async function countOtherActiveSuperAdmins(tx: Transaction, excludeUid: string): Promise<number> {
  const snap = await tx.get(usersCol().where("role", "==", "superAdmin").where("active", "==", true).limit(5));
  return snap.docs.filter((d) => d.id !== excludeUid).length;
}

export const newStaffData = (v: { email: string; displayName: string; role: Role; createdBy: string }) => ({
  email: v.email,
  displayName: v.displayName,
  role: v.role,
  active: true,
  createdAt: serverTimestamp(),
  createdBy: v.createdBy,
  updatedAt: serverTimestamp(),
  updatedBy: v.createdBy,
  lastLoginAt: null,
});

export const touchLogin = (uid: string) => userRef(uid).update({ lastLoginAt: serverTimestamp() });
