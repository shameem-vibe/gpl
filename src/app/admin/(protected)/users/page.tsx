import Link from "next/link";
import { Search } from "lucide-react";
import { AccessDenied } from "@/components/admin/access-denied";
import { UserCreateDialog } from "@/components/admin/user-create-dialog";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { requirePagePermission } from "@/lib/auth/guard";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { listStaff } from "@/lib/repositories/users";
import { formatDateTime } from "@/lib/utils/format";
import type { StaffAccount } from "@/types/domain";

export const metadata = { title: "Users and Roles" };

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { user, allowed } = await requirePagePermission("users:manage");
  if (!allowed) return <AccessDenied />;
  const q = ((await searchParams).q ?? "").slice(0, 80);
  let accounts: StaffAccount[] | null = null;
  if (!user.preview) { try { accounts = await listStaff(q); } catch { accounts = null; } }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-5xl">Users and Roles</h1><p className="mt-2 text-chalk-dim">Invite staff and set roles. Only Super Admins can see this page.</p></div>
        {user.preview ? null : <UserCreateDialog />}
      </div>

      <form role="search" className="mt-6 flex max-w-md gap-2">
        <Input name="q" defaultValue={q} placeholder="Search by name or email" aria-label="Search administrators" />
        <Button type="submit" variant="outline" size="icon" aria-label="Search"><Search className="h-4 w-4" /></Button>
      </form>

      <Card className="mt-6">
        {user.preview ? <div className="p-5"><Alert variant="info">Not available in UI preview mode.</Alert></div>
          : accounts === null ? <div className="p-5"><Alert variant="error">Administrators could not be loaded. Check the Firebase Admin configuration.</Alert></div>
          : accounts.length === 0 ? <p className="p-8 text-center text-chalk-mute">{q ? "No administrators match your search." : "No administrators yet."}</p>
          : (
            <Table>
              <THead><tr><TH>Name</TH><TH>Role</TH><TH>Status</TH><TH className="hidden md:table-cell">Last sign-in</TH></tr></THead>
              <TBody>
                {accounts.map((a) => (
                  <TR key={a.uid}>
                    <TD>
                      <Link href={`/admin/users/${a.uid}`} className="block font-medium hover:text-gold">{a.displayName || a.email}</Link>
                      <span className="block break-all text-xs text-chalk-mute">{a.email}</span>
                    </TD>
                    <TD>{ROLE_LABELS[a.role]}</TD>
                    <TD><Badge variant={a.active ? "win" : "neutral"}>{a.active ? "Active" : "Deactivated"}</Badge></TD>
                    <TD className="hidden text-chalk-mute md:table-cell">{formatDateTime(a.lastLoginAt)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
      </Card>
    </div>
  );
}
