import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { ForgotPasswordForm } from "@/components/admin/forgot-password-form";
import { getCurrentAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Reset password", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  if (await getCurrentAdmin()) redirect("/admin");
  return (
    <div className="stripes flex min-h-screen items-center justify-center bg-pitch-900 p-4">
      <div className="w-full max-w-sm">
        <Logo className="mb-8 justify-center" />
        <div className="rounded-lg border border-chalk/10 bg-pitch-950 p-6">
          <h1 className="text-3xl">Reset password</h1>
          <p className="mt-1 text-sm text-chalk-mute">We will email a link to set a new password.</p>
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
