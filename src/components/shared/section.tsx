import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";

export function Section({
  title, href, linkLabel, sample, className, children, id,
}: {
  title: string; href?: string; linkLabel?: string; sample?: boolean; className?: string; id?: string; children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className={cn("container py-12 md:py-16", className)}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 id={id ? `${id}-title` : undefined} className="text-4xl md:text-5xl">{title}</h2>
          {sample ? <Badge variant="sample" title="Placeholder content for development">Sample data</Badge> : null}
        </div>
        {href ? (
          <Link href={href} className="text-sm font-medium text-gold underline-offset-4 hover:underline">
            {linkLabel ?? "View all"}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
