"use client";
import { motion, useReducedMotion } from "framer-motion";
import { LiveBadge } from "@/components/ui/badge";
import { formatOvers } from "@/lib/utils/format";
import type { MatchSummary } from "@/types/domain";

/** The hero's signature element: a village-ground scoreboard. Digits settle in once on load. */
export function Scoreboard({ match, sample }: { match: MatchSummary; sample: boolean }) {
  const reduce = useReducedMotion();
  const s = match.scoreA;
  const digits = s ? [String(s.runs), String(s.wickets), formatOvers(s.legalBalls)] : ["–", "–", "–"];
  const labels = ["Runs", "Wickets", "Overs"];

  return (
    <div className="rounded-lg border border-gold/30 bg-pitch-950 p-5 shadow-[0_0_0_6px_rgb(212_169_60/0.06)]" role="group" aria-label="Scoreboard">
      <div className="mb-4 flex items-center justify-between">
        {match.status === "live" ? <LiveBadge /> : <span className="text-sm text-chalk-mute">Next match</span>}
        {sample ? <span className="text-xs text-gold">Sample data</span> : null}
      </div>
      <p className="text-lg text-chalk-dim">
        <span className="font-semibold text-chalk">{match.teamA.name}</span> v {match.teamB.name}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {digits.map((d, i) => (
          <div key={labels[i]} className="text-center">
            <motion.div
              initial={reduce ? false : { rotateX: -90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ delay: 0.25 + i * 0.18, duration: 0.5, ease: "easeOut" }}
              className="scoreboard-digit text-5xl sm:text-6xl"
              style={{ transformPerspective: 400 }}
            >
              {d}
            </motion.div>
            <div className="mt-1.5 text-xs text-chalk-mute">{labels[i]}</div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-chalk-mute">{match.stage} · {match.venue}</p>
    </div>
  );
}
