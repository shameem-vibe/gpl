import type { Metadata } from "next";
import { Info } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "About GPL" };

export default function Page() {
  return <ComingSoon title="About GPL" description="How the Gobindapur Premier League started and how it runs." icon={Info} phase="Phase 3" />;
}
