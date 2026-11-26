import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatOvers, formatTime } from "@/lib/utils/format";
import type { InningsScore, MatchSummary } from "@/types/domain";

const line = (s?: InningsScore) => (s ? `${s.runs}/${s.wickets} (${formatOvers(s.legalBalls)})` : "");

export function MatchRow({ match }: { match: MatchSummary }) {
  const done = match.status === "completed";
  return (
    <Link
      href={`/matches/${match.id}`}
      className="group block rounded-lg border border-chalk/10 bg-pitch-800/50 p-4 transition-colors hover:border-gold/50"
    >
      <div className="flex items-center justify-between text-sm text-chalk-mute">
        <span>{match.stage}</span>
        <span>{done ? formatDate(match.startsAt) : `${formatDate(match.startsAt)}, ${formatTime(match.startsAt)}`}</span>
      </div>
      <div className="mt-3 space-y-2">
        {[{ t: match.teamA, s: match.scoreA }, { t: match.teamB, s: match.scoreB }].map(({ t, s }) => (
          <div key={t.id} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2.5 text-lg font-medium">
              <span aria-hidden className="h-3 w-1.5 rounded-sm" style={{ background: t.color }} />
              {t.name}
            </span>
            {done ? <span className="font-display text-xl tabular-nums text-chalk-dim">{line(s)}</span> : null}
          </div>
        ))}
      </div>
      <div className="mt-3">
        {done && match.resultText ? <Badge variant="win">{match.resultText}</Badge> : <span className="text-sm text-chalk-mute">{match.venue}</span>}
      </div>
    </Link>
  );
}
