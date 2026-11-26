import { Hero } from "@/components/public/hero";
import { SeasonStrip } from "@/components/public/season-strip";
import { LiveMatch } from "@/components/public/live-match";
import { MatchRow } from "@/components/public/match-row";
import { PlayerList, TeamGrid } from "@/components/public/teams-players";
import { AuctionBanner } from "@/components/public/auction-banner";
import { NewsList, SponsorStrip, VideoGrid } from "@/components/public/media-news-sponsors";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { getHomeData } from "@/lib/repositories/home";
import { CalendarX } from "lucide-react";
import Link from "next/link";

// ISR: public pages are rebuilt at most every 60s, so visitors do not cost Firestore reads.
export const revalidate = 60;

export default async function HomePage() {
  const data = await getHomeData();
  const s = data.isSample;
  return (
    <>
      <Hero data={data} />
      <SeasonStrip data={data} />

      <Section id="live" title="Live now" href="/live" linkLabel="Live score centre" sample={s}>
        <LiveMatch match={data.live} />
      </Section>

      <div className="border-y border-chalk/10 bg-pitch-950/40">
        <div className="container grid gap-10 py-12 md:py-16 lg:grid-cols-2">
          <div>
            <div className="mb-5 flex items-center justify-between"><h2 className="text-4xl">Upcoming matches</h2><Link href="/matches" className="text-sm font-medium text-gold hover:underline">All fixtures</Link></div>
            {data.upcoming.length ? <div className="grid gap-3">{data.upcoming.map((m) => <MatchRow key={m.id} match={m} />)}</div>
              : <EmptyState icon={CalendarX} title="No fixtures yet" description="The match schedule will be published soon." />}
          </div>
          <div>
            <div className="mb-5 flex items-center justify-between"><h2 className="text-4xl">Recent results</h2><Link href="/matches?tab=results" className="text-sm font-medium text-gold hover:underline">All results</Link></div>
            {data.results.length ? <div className="grid gap-3">{data.results.map((m) => <MatchRow key={m.id} match={m} />)}</div>
              : <EmptyState icon={CalendarX} title="No results yet" description="Results appear after the first match is completed." />}
          </div>
        </div>
      </div>

      <Section id="teams" title="Teams" href="/teams" sample={s}><TeamGrid teams={data.teams} /></Section>
      <Section id="players" title="Featured players" href="/players" sample={s}><PlayerList players={data.players} teams={data.teams} /></Section>
      <Section id="auction" title="Auction" sample={s} className="pt-0"><AuctionBanner auction={data.auction} /></Section>
      <Section id="videos" title="Latest highlights" href="/videos" sample={s}><VideoGrid videos={data.videos} /></Section>
      <Section id="news" title="Latest news" href="/news" sample={s}><NewsList news={data.news} /></Section>

      <Section id="sponsors" title="Sponsors and partners" sample={s}>
        <SponsorStrip sponsors={data.sponsors} />
      </Section>

      <section className="container pb-16">
        <div className="stripes flex flex-col items-start justify-between gap-5 rounded-lg bg-gold p-8 text-pitch-950 md:flex-row md:items-center">
          <div>
            <h2 className="text-4xl md:text-5xl">Think you can play?</h2>
            <p className="mt-1 text-pitch-800">Register once. Selected players go into the GPL auction.</p>
          </div>
          <Button asChild size="lg" className="bg-pitch-950 text-gold hover:bg-pitch-800"><Link href="/register">Register as a player</Link></Button>
        </div>
      </section>
    </>
  );
}
