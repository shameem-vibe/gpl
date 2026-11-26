import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container space-y-6 py-16" role="status" aria-label="Loading">
      <Skeleton className="h-16 w-2/3" />
      <Skeleton className="h-64 w-full" />
      <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
    </div>
  );
}
