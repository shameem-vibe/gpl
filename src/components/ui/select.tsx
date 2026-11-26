import * as React from "react";
import { cn } from "@/lib/utils/cn";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn("h-11 w-full rounded-md border border-chalk/20 bg-pitch-950 px-3 text-sm text-chalk focus-visible:border-gold disabled:opacity-50", className)}
      {...props}
    />
  ),
);
Select.displayName = "Select";
