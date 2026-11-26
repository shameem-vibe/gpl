import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

/** Honest placeholder: states plainly that the module is planned, not connected. */
export function ComingSoon({
  title, description, icon, phase,
}: { title: string; description: string; icon: LucideIcon; phase: string }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="container py-12">
        <EmptyState icon={icon} title="Not built yet" description={`This page is planned for ${phase}. No data is connected here yet.`} />
      </div>
    </>
  );
}
