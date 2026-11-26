import type { Metadata } from "next";
import { Gavel } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Auction" };

export default function Page() {
  return <ComingSoon title="Auction" description="The GPL player auction, live." icon={Gavel} phase="Phase 6" />;
}
