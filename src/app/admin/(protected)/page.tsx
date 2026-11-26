import Link from "next/link";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuditList } from "@/components/admin/audit-list";
import { ADMIN_NAV } from "@/lib/constants/admin-nav";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { can } from "@/domain/permissions";
import { requirePagePermission } from "@/lib/auth/guard";
import { listAuditLogs } from "@/lib/repositories/audit";
import { countStaff } from "@/lib/repositories/users";
import type { AuditLogEntry } from "@/types/domain";

export const metadata = { title: "Dashboard" };

/** Real data only. If Firestore is unreachable the card says so instead of showing made-up numbers. */
async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try { return await fn(); } catch { return null; }
}

export default async function DashboardPage() {
  const { user } = await requirePagePermission("dashboard:view");
  const preview = !!user.preview;
  const seeAll = can(user.role, "audit:read");
  const staff = !preview && can(user.role, "users:manage") ? await safe(countStaff) : null;
  const activity = preview ? null : await safe(() => listAuditLogs({ limit: 8, actorUid: seeAll ? undefined : user.uid }));
  const modules = ADMIN_NAV.filter((i) => i.slug && can(user.role, i.permission));
  const checklist = [
    { label: "Firebase Admin credentials", done: isAdminConfigured(), note: "Set in Vercel environment variables" },
    { label: "Admin sign-in and sessions", done: true, note: "Firebase Auth + httpOnly session cookie" },
    { label: "Firestore security rules deployed", done: false, note: "Cannot be detected from the app. Run: npx firebase-tools deploy --only firestore,storage" },
    { label: "Seasons and teams", done: false, note: "Phase 3" },
    { label: "Match scoring", done: false, note: "Phase 5" },
  ];
  const entries: AuditLogEntry[] = activity?.entries ?? [];
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-5xl">Dashboard</h1>
      <p className="mt-2 text-chalk-dim">Signed in as {user.displayName || user.email} · {ROLE_LABELS[user.role]}</p>

      {staff ? (
        <dl className="mt-6 grid grid-cols-2 gap-4 sm:max-w-md">
          <Card className="p-4"><dt className="text-sm text-chalk-mute">Active administrators</dt><dd className="font-display text-4xl tabular-nums text-gold">{staff.active}</dd></Card>
          <Card className="p-4"><dt className="text-sm text-chalk-mute">Deactivated</dt><dd className="font-display text-4xl tabular-nums">{staff.inactive}</dd></Card>
        </dl>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader><CardTitle>Setup status</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {checklist.map((c) => (
                <li key={c.label} className="flex items-start gap-3">
                  {c.done ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-win" aria-label="Done" /> : <CircleDashed className="mt-0.5 h-5 w-5 text-chalk-mute" aria-label="Not done" />}
                  <span><span className="block">{c.label}</span><span className="text-sm text-chalk-mute">{c.note}</span></span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Your modules</CardTitle></CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2">
              {modules.map((m) => (
                <li key={m.href}>
                  <Link href={m.href} className="flex items-center justify-between gap-3 rounded-md border border-chalk/10 p-3 hover:border-gold/50">
                    <span className="flex items-center gap-3"><m.icon className="h-5 w-5 text-gold" aria-hidden />{m.label}</span>
                    <Badge>{m.phase}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{seeAll ? "Recent administrative activity" : "Your recent activity"}</CardTitle>
          {seeAll ? <Link href="/admin/audit-logs" className="text-sm text-gold hover:underline">All logs</Link> : null}
        </CardHeader>
        <CardContent>
          {preview ? <p className="text-chalk-mute">Not available in UI preview mode.</p>
            : activity === null ? <p className="text-chalk-mute">Activity could not be loaded. Check the Firebase Admin configuration.</p>
            : <AuditList entries={entries} showActor={seeAll} empty="No activity recorded yet." />}
        </CardContent>
      </Card>
    </div>
  );
}
