"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Input, Label } from "@/components/ui/input";
import { authErrorMessage, signInAdmin } from "@/lib/auth/client";
import { isFirebaseClientConfigured } from "@/lib/firebase/client";
import { loginSchema } from "@/lib/validation/auth";

/**
 * Real sign-in: Firebase Auth (email + password) -> ID token -> /api/auth/session -> httpOnly cookie.
 * No password is stored or checked here, and nothing is written to browser storage.
 */
export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Check your details.");
    setPending(true);
    try {
      await signInAdmin(parsed.data.email, parsed.data.password);
      router.replace(next);
      router.refresh();
    } catch (err) {
      const isServerMessage = err instanceof Error && !("code" in err);
      setError(isServerMessage ? err.message : authErrorMessage(err));
      setPassword("");
      setPending(false);
    }
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate aria-busy={pending}>
      {!isFirebaseClientConfigured ? <Alert variant="error">Firebase is not configured. See docs/SETUP.md.</Alert> : null}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} disabled={pending} required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={pending} required />
      </div>
      {error ? <Alert variant="error">{error}</Alert> : null}
      <Button type="submit" className="w-full" disabled={pending || !isFirebaseClientConfigured}>{pending ? "Signing in…" : "Sign in"}</Button>
      <p className="text-center text-sm"><Link href="/admin/forgot-password" className="text-gold underline-offset-4 hover:underline">Forgot your password?</Link></p>
    </form>
  );
}
