import Link from "next/link";
import { CalendarDays, PlayCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Scoreboard } from "@/components/public/scoreboard";
import { SITE } from "@/lib/constants/site";
import type { HomeData } from "@/lib/repositories/home";

export function Hero({ data }: { data: HomeData }) {
  const featured = data.live ?? data.upcoming[0] ?? null;
  return (
    <section className="stripes relative overflow-hidden border-b border-chalk/10 bg-gradient-to-b from-pitch-800 to-pitch-900">
      {/* pitch outline: one quiet graphic device */}
      <svg aria-hidden className="pointer-events-none absolute -right-24 top-1/2 hidden h-[620px] -translate-y-1/2 text-chalk/5 lg:block" viewBox="0 0 300 600" fill="none" stroke="currentColor" strokeWidth="3">
        <ellipse cx="150" cy="300" rx="145" ry="295" />
        <rect x="110" y="150" width="80" height="300" />
        <path d="M110 190h80M110 410h80" />
      </svg>
      <div className="container relative grid items-center gap-10 py-16 md:py-24 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <p className="text-chalk-dim">{data.season.name} · Gobindapur, Bangladesh</p>
          <h1 className="mt-3 text-[clamp(3.5rem,11vw,8.5rem)] font-bold uppercase leading-[0.88]">
            Our ground.
            <br />
            Our glory.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-chalk-dim">
            {SITE.secondary} Follow every ball, every wicket and every bid from the village ground.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link href="/live"><PlayCircle className="h-5 w-5" aria-hidden />Watch live</Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="/register"><UserPlus className="h-5 w-5" aria-hidden />Register as a player</Link></Button>
            <Button asChild size="lg" variant="ghost"><Link href="/matches"><CalendarDays className="h-5 w-5" aria-hidden />Fixtures</Link></Button>
          </div>
        </div>
        {featured ? <Scoreboard match={featured} sample={data.isSample} /> : null}
      </div>
    </section>
  );
}
