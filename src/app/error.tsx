"use client";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container py-20">
      <EmptyState icon={TriangleAlert} title="Something went wrong"
        description="The page could not be loaded. Try again, and if it keeps happening, contact the GPL organisers."
        action={<Button onClick={reset}>Try again</Button>} />
    </div>
  );
}
