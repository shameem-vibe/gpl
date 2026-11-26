import type { Metadata } from "next";
import { Radio } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Live Score" };

export default function Page() {
  return <ComingSoon title="Live Score" description="Ball-by-ball scoring and the live stream." icon={Radio} phase="Phase 5" />;
}
