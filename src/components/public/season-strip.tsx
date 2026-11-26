import type { HomeData } from "@/lib/repositories/home";
import { Badge } from "@/components/ui/badge";

export function SeasonStrip({ data }: { data: HomeData }) {
  const { season } = data;
  const stats = [
    { label: "Teams", value: season.teams },
    { label: "Matches", value: season.matches },
    { label: "Players", value: season.players },
  ];
  return (
    <section aria-label="Current season" className="border-b border-chalk/10 bg-pitch-950/60">
      <div className="container flex flex-wrap items-center justify-between gap-6 py-6">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl">{season.name}</h2>
          <Badge variant="gold">{season.status}</Badge>
          {data.isSample ? <Badge variant="sample">Sample data</Badge> : null}
        </div>
        <dl className="flex gap-8">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="text-sm text-chalk-mute">{s.label}</dt>
              <dd className="font-display text-3xl tabular-nums text-gold">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
