import Link from "next/link";
import { cn } from "@/lib/utils/cn";

/** Temporary wordmark + stumps mark. Replace the SVG with the official GPL logo when available. */
export function Logo({ className, compact = false, href = "/" }: { className?: string; compact?: boolean; href?: string }) {
  return (
    <Link href={href} aria-label="Gobindapur Premier League, home" className={cn("flex items-center gap-3", className)}>
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden>
        <rect width="34" height="34" rx="6" fill="#D4A93C" />
        <g stroke="#04170F" strokeWidth="3" strokeLinecap="round">
          <path d="M11 11v15M17 11v15M23 11v15" />
        </g>
        <path d="M10 8h6M18 8h6" stroke="#04170F" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="leading-none">
        <span className="block font-display text-2xl font-bold tracking-wide">GPL</span>
        {compact ? null : <span className="block text-[11px] text-chalk-mute">Gobindapur Premier League</span>}
      </span>
    </Link>
  );
}
