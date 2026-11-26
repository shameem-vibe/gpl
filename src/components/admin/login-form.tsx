"use client";
import { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";

/**
 * UI only. Phase 2 wires this to Firebase Auth (signInWithEmailAndPassword), then POSTs the ID token to
 * /api/auth/session to receive an httpOnly session cookie. No password is ever stored or checked here.
 */
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const authReady = false; // flipped when the auth module ships

  return (
    <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()} noValidate>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!authReady} />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={!authReady} />
        <FieldError />
      </div>
      <Button type="submit" className="w-full" disabled={!authReady}>Sign in</Button>
      <p className="flex gap-2 rounded-md bg-gold/10 p-3 text-sm text-gold">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        Sign-in is not connected yet. It arrives with the authentication module (Phase 2).
      </p>
    </form>
  );
}
