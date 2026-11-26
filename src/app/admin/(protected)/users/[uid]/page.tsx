import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AccessDenied } from "@/components/admin/access-denied";
import { AuditList } from "@/components/admin/audit-list";
import { UserManagePanel } from "@/components/admin/user-manage-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePagePermission } from "@/lib/auth/guard";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { listAuditLogs } from "@/lib/repositories/audit";
import { getStaff } from "@/lib/repositories/users";
import { formatDateTime } from "@/lib/utils/format";
import { uidSchema } from "@/lib/validation/auth";

export const metadata = { title: "Administrator" };

export default async function UserDetailPage({ params }: { params: Promise<{ uid: string }> }) {
  const { user, allowed } = await requirePagePermission("users:manage");
  if (!allowed) return <AccessDenied />;
  if (user.preview) notFound();
  const parsed = uidSchema.safeParse((await params).uid);
  if (!parsed.success) notFound();
  const account = await getStaff(parsed.data);
  if (!account) notFound();
  const activity = await listAuditLogs({ limit: 10, actorUid: account.uid }).catch(() => null);
  const facts = [
    ["Email", account.email], ["Role", ROLE_LABELS[account.role]], ["Created", formatDateTime(account.createdAt)],
    ["Last sign-in", formatDateTime(account.lastLoginAt)], ["Last updated", formatDateTime(account.updatedAt)],
  ];
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-chalk-mute hover:text-gold"><ArrowLeft className="h-4 w-4" aria-hidden />All administrators</Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-5xl">{account.displayName || account.email}</h1>
        <Badge variant={account.active ? "win" : "neutral"}>{account.active ? "Active" : "Deactivated"}</Badge>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent><dl className="space-y-3">{facts.map(([k, v]) => <div key={k}><dt className="text-sm text-chalk-mute">{k}</dt><dd className="break-all">{v}</dd></div>)}</dl></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Manage</CardTitle></CardHeader>
          <CardContent><UserManagePanel account={account} isSelf={account.uid === user.uid} /></CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader><CardTitle>Recent activity by this administrator</CardTitle></CardHeader>
        <CardContent>{activity ? <AuditList entries={activity.entries} showActor={false} empty="No activity recorded." /> : <p className="text-chalk-mute">Activity could not be loaded.</p>}</CardContent>
      </Card>
    </div>
  );
}
