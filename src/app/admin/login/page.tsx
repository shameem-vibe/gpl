import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { LoginForm } from "@/components/admin/login-form";
import { getCurrentAdmin } from "@/lib/auth/session";
import { safeAdminRedirect } from "@/lib/security/safe-redirect";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeAdminRedirect((await searchParams).next);
  // Already signed in (verified server-side, not just "has a cookie")? Skip the login screen.
  if (await getCurrentAdmin()) redirect(next);
  return (
    <div className="stripes flex min-h-screen items-center justify-center bg-pitch-900 p-4">
      <div className="w-full max-w-sm">
        <Logo className="mb-8 justify-center" />
        <div className="rounded-lg border border-chalk/10 bg-pitch-950 p-6">
          <h1 className="text-3xl">Admin sign in</h1>
          <p className="mt-1 text-sm text-chalk-mute">For GPL staff only.</p>
          <LoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
