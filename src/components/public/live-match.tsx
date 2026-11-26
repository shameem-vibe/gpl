import Link from "next/link";
import { Radio, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatOvers } from "@/lib/utils/format";
import type { MatchSummary } from "@/types/domain";

export function LiveMatch({ match }: { match: MatchSummary | null }) {
  if (!match) {
    return (
      <EmptyState icon={Radio} title="No match is live right now"
        description="When a match starts, the live score and video stream will appear here."
        action={<Button asChild variant="outline"><Link href="/matches">See upcoming matches</Link></Button>} />
    );
  }
  const s = match.scoreA;
  return (
    <div className="grid overflow-hidden rounded-lg border border-live/40 bg-pitch-800/60 lg:grid-cols-[1.4fr_1fr]">
      {/* Video slot: replaced by the YouTube nocookie embed when the Streams module is built (Phase 4). */}
      <div className="flex aspect-video items-center justify-center bg-pitch-950 text-chalk-mute">
        <div className="text-center">
          <Tv className="mx-auto h-10 w-10 text-gold" aria-hidden />
          <p className="mt-2">Live stream appears here</p>
          <p className="text-sm">Stream link is not configured yet</p>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-6 p-6">
        <div>
          <LiveBadge />
          <h3 className="mt-3 text-3xl">{match.teamA.name} v {match.teamB.name}</h3>
          <p className="mt-1 text-chalk-mute">{match.stage} · {match.venue}</p>
          {s ? (
            <p className="mt-5 font-display text-6xl tabular-nums text-gold">
              {s.runs}/{s.wickets} <span className="text-2xl text-chalk-dim">({formatOvers(s.legalBalls)} ov)</span>
            </p>
          ) : null}
        </div>
        <Button asChild><Link href="/live">Open full scorecard</Link></Button>
      </div>
    </div>
  );
}
