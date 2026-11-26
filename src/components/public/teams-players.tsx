import Link from "next/link";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import type { PlayerPublic, Team } from "@/types/domain";

export function TeamGrid({ teams }: { teams: Team[] }) {
  if (!teams.length) return <EmptyState icon={Users} title="Teams are not announced yet" description="Squads will be listed after the player auction." />;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {teams.map((t) => (
        <li key={t.id}>
          <Link href={`/teams/${t.id}`} className="flex h-full flex-col justify-between overflow-hidden rounded-lg border border-chalk/10 bg-pitch-800/50 hover:border-gold/50">
            <div className="h-2" style={{ background: t.color }} aria-hidden />
            <div className="p-5">
              <p className="font-display text-5xl text-chalk/20">{t.shortName}</p>
              <h3 className="mt-2 text-2xl">{t.name}</h3>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function PlayerList({ players, teams }: { players: PlayerPublic[]; teams: Team[] }) {
  if (!players.length) return <EmptyState icon={Users} title="No players yet" description="Registered players will appear here once approved." />;
  const teamName = (id?: string) => teams.find((t) => t.id === id)?.name ?? "Unassigned";
  return (
    <ul className="divide-y divide-chalk/10 rounded-lg border border-chalk/10">
      {players.map((p) => (
        <li key={p.id}>
          <Link href={`/players/${p.id}`} className="flex items-center gap-4 p-4 hover:bg-pitch-800/60">
            <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pitch-700 font-display text-xl text-gold">
              {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-lg font-medium">{p.name}</span>
              <span className="block text-sm text-chalk-mute">{teamName(p.teamId)}</span>
            </span>
            <span className="text-sm text-chalk-dim">{p.role}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
