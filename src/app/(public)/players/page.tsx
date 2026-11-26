import type { Metadata } from "next";
import { User } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Players" };

export default function Page() {
  return <ComingSoon title="Players" description="Player profiles and career statistics." icon={User} phase="Phase 3" />;
}
