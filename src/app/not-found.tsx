import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function NotFound() {
  return (
    <div className="container py-20">
      <EmptyState icon={SearchX} title="That page is out of the ground"
        description="The page you are looking for does not exist or has moved."
        action={<Button asChild><Link href="/">Back to home</Link></Button>} />
    </div>
  );
}
