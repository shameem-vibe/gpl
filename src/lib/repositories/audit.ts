import "server-only";
import type { DocumentData, QueryDocumentSnapshot, Timestamp } from "firebase-admin/firestore";
import { adminDb, serverTimestamp } from "@/lib/firebase/admin";
import { paths } from "@/lib/firebase/paths";
import type { AuditAction, AuditLogEntry, Role } from "@/types/domain";

export interface AuditActor { uid: string; email: string | null; role: Role | null }
export interface AuditInput {
  actor: AuditActor;
  action: AuditAction;
  targetType: AuditLogEntry["targetType"];
  targetId: string;
  summary: string;
  changes?: AuditLogEntry["changes"];
}

/** Builds a new audit doc ref + payload so callers can include the write in a transaction or batch. */
export function buildAudit(input: AuditInput) {
  const ref = adminDb().collection(paths.auditLogs).doc();
  const data = {
    actorUid: input.actor.uid,
    actorEmail: input.actor.email,
    actorRole: input.actor.role,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    summary: input.summary.slice(0, 300),
    changes: input.changes ?? null,
    createdAt: serverTimestamp(), // trusted server clock; clients cannot write this collection at all
  };
  return { ref, data };
}

export async function writeAudit(input: AuditInput): Promise<void> {
  const { ref, data } = buildAudit(input);
  await ref.set(data);
}

const iso = (t: unknown) => (t && typeof (t as Timestamp).toDate === "function" ? (t as Timestamp).toDate().toISOString() : null);

function toEntry(d: QueryDocumentSnapshot<DocumentData>): AuditLogEntry {
  const x = d.data();
  return {
    id: d.id,
    actorUid: String(x.actorUid ?? ""),
    actorEmail: (x.actorEmail as string | null) ?? null,
    actorRole: (x.actorRole as Role | null) ?? null,
    action: x.action as AuditAction,
    targetType: x.targetType,
    targetId: String(x.targetId ?? ""),
    summary: String(x.summary ?? ""),
    changes: (x.changes as AuditLogEntry["changes"]) ?? null,
    createdAt: iso(x.createdAt),
  };
}

export interface AuditPage { entries: AuditLogEntry[]; nextCursor: string | null }

/** Newest first. Cursor is the last doc's id (opaque to callers). */
export async function listAuditLogs(opts: { limit?: number; cursor?: string | null; actorUid?: string } = {}): Promise<AuditPage> {
  const limit = Math.min(Math.max(opts.limit ?? 25, 1), 100);
  let q = adminDb().collection(paths.auditLogs).orderBy("createdAt", "desc");
  if (opts.actorUid) q = adminDb().collection(paths.auditLogs).where("actorUid", "==", opts.actorUid).orderBy("createdAt", "desc");
  if (opts.cursor) {
    const snap = await adminDb().collection(paths.auditLogs).doc(opts.cursor).get();
    if (snap.exists) q = q.startAfter(snap);
  }
  const docs = (await q.limit(limit + 1).get()).docs;
  const page = docs.slice(0, limit);
  return { entries: page.map(toEntry), nextCursor: docs.length > limit ? (page[page.length - 1]?.id ?? null) : null };
}
