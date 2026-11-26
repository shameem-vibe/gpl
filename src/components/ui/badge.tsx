import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium", {
  variants: {
    variant: {
      neutral: "bg-pitch-700 text-chalk-dim",
      gold: "bg-gold/15 text-gold",
      win: "bg-win/15 text-win",
      live: "bg-live/15 text-live",
      sample: "border border-dashed border-gold/50 text-gold",
    },
  },
  defaultVariants: { variant: "neutral" },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function LiveBadge({ className }: { className?: string }) {
  return (
    <Badge variant="live" className={className}>
      <span aria-hidden className="h-2 w-2 animate-pulseDot rounded-full bg-live" />
      Live
    </Badge>
  );
}
