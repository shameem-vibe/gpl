import { ShieldAlert } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export const AccessDenied = () => (
  <EmptyState icon={ShieldAlert} title="You do not have access to this section" description="Ask a Super Admin to change your role if you need it." />
);
