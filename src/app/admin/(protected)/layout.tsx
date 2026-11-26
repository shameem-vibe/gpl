import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { can } from "@/domain/permissions";
import { ADMIN_NAV } from "@/lib/constants/admin-nav";
import { getCurrentAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · GPL Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentAdmin();
  if (!user) redirect("/admin/login");
  const allowedHrefs = ADMIN_NAV.filter((i) => can(user.role, i.permission)).map((i) => i.href);
  return (
    <AdminShell allowedHrefs={allowedHrefs} user={{ email: user.email, role: user.role, preview: user.preview }}>
      {children}
    </AdminShell>
  );
}
