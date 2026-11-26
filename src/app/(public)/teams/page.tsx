import type { Metadata } from "next";
import { Users } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Teams" };

export default function Page() {
  return <ComingSoon title="Teams" description="Every GPL team, its squad and its record." icon={Users} phase="Phase 3" />;
}
