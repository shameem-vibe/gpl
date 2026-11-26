/**
 * TEMPORARY DEVELOPMENT DATA. NOT REAL GPL INFORMATION.
 * Every section that renders this must show the "Sample data" badge.
 * Delete this file once the Firestore repositories are connected (Phase 3-4).
 */
import type { AuctionSummary, MatchSummary, NewsItem, PlayerPublic, Sponsor, Team, VideoItem } from "@/types/domain";

export const sampleTeams: Team[] = [
  { id: "t1", name: "Sample Team A", shortName: "STA", color: "#D4A93C" },
  { id: "t2", name: "Sample Team B", shortName: "STB", color: "#E5484D" },
  { id: "t3", name: "Sample Team C", shortName: "STC", color: "#4DA3FF" },
  { id: "t4", name: "Sample Team D", shortName: "STD", color: "#3DDC84" },
];
const [A, B, C, D] = sampleTeams as [Team, Team, Team, Team];

export const sampleSeason = {
  name: "GPL Season 1", year: 2026, status: "Registration open",
  teams: 4, matches: 12, players: 48,
};

export const sampleLiveMatch: MatchSummary = {
  id: "m1", seasonId: "s1", status: "live", stage: "Match 3", venue: "Gobindapur Central Ground",
  startsAt: "2026-12-05T09:00:00+06:00", teamA: A, teamB: B,
  scoreA: { teamId: "t1", runs: 112, wickets: 4, legalBalls: 83 },
  scoreB: { teamId: "t2", runs: 0, wickets: 0, legalBalls: 0 },
};

export const sampleUpcoming: MatchSummary[] = [
  { id: "m2", seasonId: "s1", status: "scheduled", stage: "Match 4", venue: "Gobindapur Central Ground", startsAt: "2026-12-06T09:00:00+06:00", teamA: C, teamB: D },
  { id: "m3", seasonId: "s1", status: "scheduled", stage: "Match 5", venue: "Gobindapur Central Ground", startsAt: "2026-12-06T14:00:00+06:00", teamA: A, teamB: C },
  { id: "m4", seasonId: "s1", status: "scheduled", stage: "Match 6", venue: "Gobindapur Central Ground", startsAt: "2026-12-07T09:00:00+06:00", teamA: B, teamB: D },
];

export const sampleResults: MatchSummary[] = [
  { id: "m5", seasonId: "s1", status: "completed", stage: "Match 2", venue: "Gobindapur Central Ground", startsAt: "2026-12-04T14:00:00+06:00", teamA: C, teamB: D,
    scoreA: { teamId: "t3", runs: 141, wickets: 6, legalBalls: 120 }, scoreB: { teamId: "t4", runs: 128, wickets: 9, legalBalls: 120 }, resultText: "Sample Team C won by 13 runs" },
  { id: "m6", seasonId: "s1", status: "completed", stage: "Match 1", venue: "Gobindapur Central Ground", startsAt: "2026-12-04T09:00:00+06:00", teamA: A, teamB: D,
    scoreA: { teamId: "t1", runs: 99, wickets: 10, legalBalls: 108 }, scoreB: { teamId: "t4", runs: 100, wickets: 3, legalBalls: 96 }, resultText: "Sample Team D won by 7 wickets" },
];

export const samplePlayers: PlayerPublic[] = [
  { id: "p1", name: "Sample Player One", role: "Batter", teamId: "t1" },
  { id: "p2", name: "Sample Player Two", role: "Bowler", teamId: "t2" },
  { id: "p3", name: "Sample Player Three", role: "All-rounder", teamId: "t3" },
  { id: "p4", name: "Sample Player Four", role: "Wicket-keeper", teamId: "t4" },
];

export const sampleAuction: AuctionSummary = { status: "upcoming", startsAt: "2026-11-30T19:00:00+06:00", playersInPool: 48, teams: 4, purseBdt: 100000 };

export const sampleVideos: VideoItem[] = [
  { id: "v1", title: "Sample highlight: opening match", duration: "4:12", publishedAt: "2026-12-04T20:00:00+06:00" },
  { id: "v2", title: "Sample highlight: best catches", duration: "2:48", publishedAt: "2026-12-04T21:00:00+06:00" },
  { id: "v3", title: "Sample highlight: last-over finish", duration: "3:30", publishedAt: "2026-12-05T08:00:00+06:00" },
];

export const sampleNews: NewsItem[] = [
  { id: "n1", title: "Sample: Player registration is open", excerpt: "Sample text. Real announcements will be published from the admin dashboard.", publishedAt: "2026-11-20T10:00:00+06:00", category: "Announcement" },
  { id: "n2", title: "Sample: Auction date announced", excerpt: "Sample text. This is placeholder content for layout review only.", publishedAt: "2026-11-22T10:00:00+06:00", category: "Auction" },
  { id: "n3", title: "Sample: Fixtures released", excerpt: "Sample text. The fixture list will come from Firestore.", publishedAt: "2026-11-24T10:00:00+06:00", category: "Fixtures" },
];

export const sampleSponsors: Sponsor[] = [
  { id: "s1", name: "Sample Title Sponsor", tier: "title" },
  { id: "s2", name: "Sample Gold Partner", tier: "gold" },
  { id: "s3", name: "Sample Gold Partner 2", tier: "gold" },
  { id: "s4", name: "Sample Partner", tier: "partner" },
];
