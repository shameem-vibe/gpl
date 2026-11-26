import type { Metadata } from "next";
import { Video } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Videos" };

export default function Page() {
  return <ComingSoon title="Videos" description="Match highlights and replays." icon={Video} phase="Phase 3" />;
}
