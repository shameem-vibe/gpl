import { CircleAlert, CircleCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const styles = {
  error: { box: "bg-live/10 text-live", Icon: CircleAlert, role: "alert" as const },
  success: { box: "bg-win/10 text-win", Icon: CircleCheck, role: "status" as const },
  info: { box: "bg-gold/10 text-gold", Icon: Info, role: "status" as const },
};

export function Alert({ variant = "info", className, children }: { variant?: keyof typeof styles; className?: string; children: React.ReactNode }) {
  const { box, Icon, role } = styles[variant];
  return (
    <p role={role} className={cn("flex gap-2 rounded-md p-3 text-sm", box, className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span className="min-w-0 break-words">{children}</span>
    </p>
  );
}
