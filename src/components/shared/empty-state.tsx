import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function EmptyState({
  icon: Icon, title, description, action, className,
}: { icon: LucideIcon; title: string; description: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center rounded-lg border border-dashed border-chalk/20 px-6 py-14 text-center", className)}>
      <Icon aria-hidden className="h-9 w-9 text-gold" />
      <h3 className="mt-4 text-2xl">{title}</h3>
      <p className="mt-2 max-w-md text-chalk-mute">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
