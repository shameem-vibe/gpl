import Link from "next/link";
import { Newspaper, Play, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils/format";
import type { NewsItem, Sponsor, VideoItem } from "@/types/domain";

export function VideoGrid({ videos }: { videos: VideoItem[] }) {
  if (!videos.length) return <EmptyState icon={Video} title="No highlights yet" description="Match highlights will be posted after each game." />;
  return (
    <ul className="grid gap-4 md:grid-cols-3">
      {videos.map((v) => (
        <li key={v.id}>
          <Link href={`/videos/${v.id}`} className="group block">
            <div className="relative flex aspect-video items-center justify-center rounded-lg bg-pitch-700">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-pitch-950 transition-transform group-hover:scale-105">
                <Play className="h-6 w-6 translate-x-0.5" aria-hidden />
              </span>
              {v.duration ? <span className="absolute bottom-2 right-2 rounded bg-pitch-950/90 px-1.5 py-0.5 text-xs">{v.duration}</span> : null}
            </div>
            <h3 className="mt-3 text-lg font-medium leading-snug group-hover:text-gold">{v.title}</h3>
            <p className="text-sm text-chalk-mute">{formatDate(v.publishedAt)}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function NewsList({ news }: { news: NewsItem[] }) {
  if (!news.length) return <EmptyState icon={Newspaper} title="No news yet" description="Announcements from the organisers will appear here." />;
  return (
    <ul className="divide-y divide-chalk/10 border-y border-chalk/10">
      {news.map((n) => (
        <li key={n.id}>
          <Link href={`/news/${n.id}`} className="grid gap-1 py-5 hover:bg-pitch-800/40 md:grid-cols-[9rem_1fr] md:gap-6">
            <span className="flex items-center gap-2 text-sm text-chalk-mute md:block">
              <time dateTime={n.publishedAt}>{formatDate(n.publishedAt)}</time>
              <Badge variant="neutral" className="md:mt-2">{n.category}</Badge>
            </span>
            <span>
              <span className="block text-2xl font-semibold leading-snug">{n.title}</span>
              <span className="mt-1 block text-chalk-dim">{n.excerpt}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function SponsorStrip({ sponsors }: { sponsors: Sponsor[] }) {
  if (!sponsors.length) return null;
  return (
    <ul className="flex flex-wrap items-center gap-4">
      {sponsors.map((s) => (
        <li key={s.id} className={`flex items-center justify-center rounded-md border border-chalk/10 px-6 text-center text-chalk-dim ${s.tier === "title" ? "h-24 min-w-56 text-xl" : "h-16 min-w-40"}`}>
          {/* Replace with <Image> of the sponsor logo once uploads exist. */}
          {s.name}
        </li>
      ))}
    </ul>
  );
}
