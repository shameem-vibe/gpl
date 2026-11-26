"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/constants/roles";
import { ROLES, type Role, type StaffAccount } from "@/types/domain";

type Pending = { kind: "role"; role: Role } | { kind: "active"; active: boolean } | { kind: "link" } | null;

export function UserManagePanel({ account, isSelf }: { account: StaffAccount; isSelf: boolean }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(account.role);
  const [confirm, setConfirm] = useState<Pending>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [link, setLink] = useState<string | null>(null);

  async function run(p: NonNullable<Pending>) {
    setBusy(true); setMsg(null);
    try {
      if (p.kind === "link") {
        const res = await fetch(`/api/admin/users/${account.uid}/reset-link`, { method: "POST" });
        const body = (await res.json().catch(() => ({}))) as { error?: string; resetLink?: string };
        if (!res.ok || !body.resetLink) throw new Error(body.error ?? "Could not create the link.");
        setLink(body.resetLink);
        setMsg({ type: "success", text: "Link created. It is shown once; share it privately." });
      } else {
        const res = await fetch(`/api/admin/users/${account.uid}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(p.kind === "role" ? { role: p.role } : { active: p.active }),
        });
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) throw new Error(body.error ?? "Could not apply the change.");
        setMsg({ type: "success", text: "Saved. Their active sessions were signed out." });
        router.refresh();
      }
      setConfirm(null);
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "Something went wrong." });
      setConfirm(null);
      setRole(account.role);
    } finally { setBusy(false); }
  }

  const copy = {
    role: { title: "Change role?", description: `${account.email} will become ${confirm?.kind === "role" ? ROLE_LABELS[confirm.role] : ""}. They are signed out everywhere and must sign in again.`, label: "Change role", danger: false },
    active: confirm?.kind === "active" && !confirm.active
      ? { title: "Deactivate account?", description: `${account.email} will be signed out immediately and unable to sign in until reactivated.`, label: "Deactivate", danger: true }
      : { title: "Reactivate account?", description: `${account.email} will be able to sign in again with their current role.`, label: "Reactivate", danger: false },
    link: { title: "Create a reset link?", description: "Anyone with the link can set a new password for this account. The action is recorded in the audit log.", label: "Create link", danger: true },
  };
  const c = confirm ? copy[confirm.kind] : null;

  return (
    <div className="space-y-6">
      {isSelf ? <Alert variant="info">This is your own account. You cannot change your own role or status.</Alert> : null}
      <div>
        <Label htmlFor="role">Role</Label>
        <div className="flex gap-2">
          <Select id="role" value={role} onChange={(e) => setRole(e.target.value as Role)} disabled={busy || isSelf}>
            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </Select>
          <Button variant="outline" disabled={busy || isSelf || role === account.role} onClick={() => setConfirm({ kind: "role", role })}>Apply</Button>
        </div>
        <p className="mt-1.5 text-xs text-chalk-mute">{ROLE_DESCRIPTIONS[role]}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant={account.active ? "danger" : "primary"} disabled={busy || isSelf} onClick={() => setConfirm({ kind: "active", active: !account.active })}>
          {account.active ? "Deactivate account" : "Reactivate account"}
        </Button>
        <Button variant="outline" disabled={busy} onClick={() => setConfirm({ kind: "link" })}>Create password reset link</Button>
      </div>
      {msg ? <Alert variant={msg.type}>{msg.text}</Alert> : null}
      {link ? <div><Label htmlFor="rl">Reset link</Label><Input id="rl" readOnly value={link} onFocus={(e) => e.currentTarget.select()} /></div> : null}
      {c && confirm ? (
        <ConfirmDialog open onOpenChange={(o) => { if (!o) { setConfirm(null); setRole(account.role); } }} title={c.title} description={c.description}
          confirmLabel={c.label} danger={c.danger} pending={busy} onConfirm={() => run(confirm)} />
      ) : null}
    </div>
  );
}
