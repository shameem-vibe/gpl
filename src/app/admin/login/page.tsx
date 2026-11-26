import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <div className="stripes flex min-h-screen items-center justify-center bg-pitch-900 p-4">
      <div className="w-full max-w-sm">
        <Logo className="mb-8 justify-center" />
        <div className="rounded-lg border border-chalk/10 bg-pitch-950 p-6">
          <h1 className="text-3xl">Admin sign in</h1>
          <p className="mt-1 text-sm text-chalk-mute">For GPL staff only.</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
