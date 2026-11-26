import Link from "next/link";
import { Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBdt, formatDate, formatTime } from "@/lib/utils/format";
import type { AuctionSummary } from "@/types/domain";

export function AuctionBanner({ auction }: { auction: AuctionSummary | null }) {
  if (!auction) return null;
  const facts = [
    { label: "Players in the pool", value: auction.playersInPool },
    { label: "Teams bidding", value: auction.teams },
    { label: "Purse per team", value: formatBdt(auction.purseBdt) },
  ];
  return (
    <div className="grid gap-8 rounded-lg border border-gold/30 bg-pitch-800 p-6 md:grid-cols-[1.2fr_1fr] md:p-10">
      <div>
        <Gavel className="h-9 w-9 text-gold" aria-hidden />
        <h3 className="mt-3 text-4xl md:text-5xl">The GPL player auction</h3>
        <p className="mt-3 text-chalk-dim">
          {auction.startsAt ? `Starts ${formatDate(auction.startsAt)} at ${formatTime(auction.startsAt)}. ` : ""}
          Every team gets the same purse. Bids are checked on the server, so the highest valid bid always wins.
        </p>
        <Button asChild className="mt-6"><Link href="/auction">Go to the auction</Link></Button>
      </div>
      <dl className="grid content-center gap-4">
        {facts.map((f) => (
          <div key={f.label} className="flex items-baseline justify-between border-b border-chalk/10 pb-3">
            <dt className="text-chalk-mute">{f.label}</dt>
            <dd className="font-display text-3xl tabular-nums text-gold">{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
