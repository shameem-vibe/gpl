import type { Metadata } from "next";
import { UserPlus } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Register as a player" };

export default function Page() {
  return <ComingSoon title="Register as a player" description="Sign up to be part of the next GPL auction." icon={UserPlus} phase="Phase 3" />;
}
