"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Copy, UserPlus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { requestPasswordReset } from "@/lib/auth/client";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/constants/roles";
import { createAdminSchema } from "@/lib/validation/auth";
import { ROLES, type Role } from "@/types/domain";

export function UserCreateDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<{ email: string; emailed: boolean; link: string | null } | null>(null);
  const [copied, setCopied] = useState(false);

  function reset(o: boolean) {
    setOpen(o);
    if (!o) { setEmail(""); setDisplayName(""); setRole("editor"); setError(null); setDone(null); setCopied(false); router.refresh(); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    const parsed = createAdminSchema.safeParse({ email, displayName, role });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Check the form.");
    setPending(true);
    try {
      const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const body = (await res.json().catch(() => ({}))) as { error?: string; resetLink?: string | null };
      if (!res.ok) throw new Error(body.error ?? "Could not create the account.");
      // The new admin sets their own password: Firebase emails the reset link; the link is also shown as a fallback.
      let emailed = true;
      try { await requestPasswordReset(parsed.data.email); } catch { emailed = false; }
      setDone({ email: parsed.data.email, emailed, link: body.resetLink ?? null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the account.");
    } finally { setPending(false); }
  }

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogTrigger asChild><Button><UserPlus className="h-4 w-4" aria-hidden />New administrator</Button></DialogTrigger>
      <DialogContent title={done ? "Administrator created" : "New administrator"} description={done ? undefined : "They will get an email to set their own password."}>
        {done ? (
          <div className="space-y-4">
            <Alert variant={done.emailed ? "success" : "info"}>
              {done.emailed ? `A password setup email was sent to ${done.email}.` : "The account exists, but the email could not be sent. Share the link below securely."}
            </Alert>
            {done.link ? (
              <div>
                <Label htmlFor="link">One-time setup link (anyone with it can set the password; share privately)</Label>
                <div className="flex gap-2">
                  <Input id="link" readOnly value={done.link} onFocus={(e) => e.currentTarget.select()} />
                  <Button type="button" variant="outline" size="icon" aria-label="Copy link"
                    onClick={async () => { await navigator.clipboard.writeText(done.link!).catch(() => undefined); setCopied(true); }}><Copy className="h-4 w-4" /></Button>
                </div>
                {copied ? <p role="status" className="mt-1 text-xs text-win">Copied</p> : null}
              </div>
            ) : null}
            <div className="flex justify-end"><Button onClick={() => reset(false)}>Done</Button></div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4" noValidate aria-busy={pending}>
            <div><Label htmlFor="n-name">Full name</Label><Input id="n-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={pending} required /></div>
            <div><Label htmlFor="n-email">Email</Label><Input id="n-email" type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} disabled={pending} required /></div>
            <div>
              <Label htmlFor="n-role">Role</Label>
              <Select id="n-role" value={role} onChange={(e) => setRole(e.target.value as Role)} disabled={pending}>
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </Select>
              <p className="mt-1.5 text-xs text-chalk-mute">{ROLE_DESCRIPTIONS[role]}</p>
            </div>
            {error ? <Alert variant="error">{error}</Alert> : null}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => reset(false)} disabled={pending}>Cancel</Button>
              <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create account"}</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
