import type { AuctionSummary, MatchSummary, NewsItem, PlayerPublic, Sponsor, Team, VideoItem } from "@/types/domain";
import * as dev from "@/data/dev-data";

export interface HomeData {
  /** true while any part of this payload is development data. Pages show a "Sample data" badge. */
  isSample: boolean;
  season: typeof dev.sampleSeason;
  live: MatchSummary | null;
  upcoming: MatchSummary[];
  results: MatchSummary[];
  teams: Team[];
  players: PlayerPublic[];
  auction: AuctionSummary | null;
  videos: VideoItem[];
  news: NewsItem[];
  sponsors: Sponsor[];
}

/**
 * Single seam between the homepage and its data source.
 * Phase 3-4 replaces the body with Firestore reads (Admin SDK + ISR); the page code does not change.
 */
export async function getHomeData(): Promise<HomeData> {
  return {
    isSample: true,
    season: dev.sampleSeason,
    live: dev.sampleLiveMatch,
    upcoming: dev.sampleUpcoming,
    results: dev.sampleResults,
    teams: dev.sampleTeams,
    players: dev.samplePlayers,
    auction: dev.sampleAuction,
    videos: dev.sampleVideos,
    news: dev.sampleNews,
    sponsors: dev.sampleSponsors,
  };
}
