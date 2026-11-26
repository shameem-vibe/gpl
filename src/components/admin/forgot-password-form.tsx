"use client";
import Link from "next/link";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/auth/client";
import { forgotPasswordSchema } from "@/lib/validation/auth";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "pending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "pending") return;
    setError(null);
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Enter a valid email address.");
    setState("pending");
    try {
      await requestPasswordReset(parsed.data.email);
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the email.");
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <div className="mt-6 space-y-4">
        <Alert variant="success">If an administrator account exists for that address, a reset link is on its way. Check your spam folder too.</Alert>
        <Button asChild variant="outline" className="w-full"><Link href="/admin/login">Back to sign in</Link></Button>
      </div>
    );
  }
  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate aria-busy={state === "pending"}>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} disabled={state === "pending"} required />
      </div>
      {error ? <Alert variant="error">{error}</Alert> : null}
      <Button type="submit" className="w-full" disabled={state === "pending"}>{state === "pending" ? "Sending…" : "Send reset link"}</Button>
      <p className="text-center text-sm"><Link href="/admin/login" className="text-gold underline-offset-4 hover:underline">Back to sign in</Link></p>
    </form>
  );
}
