import Link from "next/link";
import { AccessDenied } from "@/components/admin/access-denied";
import { AuditList } from "@/components/admin/audit-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requirePagePermission } from "@/lib/auth/guard";
import { listAuditLogs } from "@/lib/repositories/audit";

export const metadata = { title: "Audit Logs" };

export default async function AuditLogsPage({ searchParams }: { searchParams: Promise<{ cursor?: string }> }) {
  const { user, allowed } = await requirePagePermission("audit:read");
  if (!allowed) return <AccessDenied />;
  const cursor = (await searchParams).cursor;
  let page = null;
  if (!user.preview) { try { page = await listAuditLogs({ limit: 25, cursor: cursor && /^[A-Za-z0-9]{10,40}$/.test(cursor) ? cursor : null }); } catch { page = null; } }
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-5xl">Audit Logs</h1>
      <p className="mt-2 text-chalk-dim">Who changed what, and when. Records are written by the server and cannot be edited here.</p>
      <Card className="mt-8"><CardContent className="pt-5">
        {user.preview ? <p className="text-chalk-mute">Not available in UI preview mode.</p>
          : page === null ? <p className="text-chalk-mute">Logs could not be loaded. Check the Firebase Admin configuration.</p>
          : <AuditList entries={page.entries} showActor empty="No activity recorded yet." />}
      </CardContent></Card>
      {page?.nextCursor ? <div className="mt-4"><Button asChild variant="outline"><Link href={`/admin/audit-logs?cursor=${page.nextCursor}`}>Older entries</Link></Button></div> : null}
    </div>
  );
}
