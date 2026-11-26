import { notFound, redirect } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";
import { can } from "@/domain/permissions";
import { ADMIN_NAV } from "@/lib/constants/admin-nav";
import { getCurrentAdmin } from "@/lib/auth/session";

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const item = ADMIN_NAV.find((i) => i.slug === section && i.slug !== "");
  if (!item) notFound();
  const user = await getCurrentAdmin();
  if (!user) redirect("/admin/login");
  if (!can(user.role, item.permission)) {
    return <EmptyState icon={item.icon} title="You do not have access to this section" description="Ask a Super Admin to change your role if you need it." />;
  }
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-5xl">{item.label}</h1>
      <p className="mt-2 text-chalk-dim">{item.description}</p>
      <EmptyState className="mt-8" icon={item.icon} title="Not built yet" description={`This module is planned for ${item.phase}. Nothing here is connected to Firebase yet.`} />
    </div>
  );
}
