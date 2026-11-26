/** Shared entity types. Mirrors docs/DATABASE.md. Dates are ISO strings at the app boundary. */

export type Role = "superAdmin" | "admin" | "scorer" | "editor" | "auctionManager";
export type ContentStatus = "draft" | "published";
export type SeasonStatus = "draft" | "registration" | "auction" | "live" | "completed";
export type MatchStatus = "scheduled" | "live" | "innings_break" | "completed" | "abandoned";

export interface Season {
  id: string;
  name: string;
  year: number;
  status: SeasonStatus;
  isCurrent: boolean;
  startDate: string;
  endDate: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string;
  logoUrl?: string;
}

export type PlayerRole = "Batter" | "Bowler" | "All-rounder" | "Wicket-keeper";

export interface PlayerPublic {
  id: string;
  name: string;
  role: PlayerRole;
  teamId?: string;
  photoUrl?: string;
  // Never include phone, address, NID or date of birth here. Those live in private docs.
}

export interface InningsScore {
  teamId: string;
  runs: number;
  wickets: number;
  legalBalls: number;
}

export interface MatchSummary {
  id: string;
  seasonId: string;
  status: MatchStatus;
  stage: string;
  venue: string;
  startsAt: string;
  teamA: Team;
  teamB: Team;
  scoreA?: InningsScore;
  scoreB?: InningsScore;
  resultText?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  category: string;
}

export interface VideoItem {
  id: string;
  title: string;
  youtubeId?: string;
  duration?: string;
  publishedAt: string;
}

export interface Sponsor {
  id: string;
  name: string;
  tier: "title" | "gold" | "partner";
  logoUrl?: string;
  url?: string;
}

export interface AuctionSummary {
  status: "upcoming" | "live" | "completed";
  startsAt?: string;
  playersInPool: number;
  teams: number;
  purseBdt: number;
}
