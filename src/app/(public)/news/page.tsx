import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "News" };

export default function Page() {
  return <ComingSoon title="News" description="Announcements from the GPL organisers." icon={Newspaper} phase="Phase 3" />;
}
