import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Matches" };

export default function Page() {
  return <ComingSoon title="Matches" description="Fixtures, results and the points table." icon={CalendarDays} phase="Phase 4" />;
}
