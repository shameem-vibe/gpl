/** Shared entity types. Mirrors docs/DATABASE_SCHEMA.md. Dates are ISO strings at the app boundary. */

export const ROLES = ["superAdmin", "admin", "scorer", "editor", "auctionManager"] as const;
export type Role = (typeof ROLES)[number];
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

/** A staff account as shown in the admin UI. Dates are ISO strings. Never carries credentials. */
export interface StaffAccount {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  active: boolean;
  createdAt: string | null;
  createdBy: string | null;
  updatedAt: string | null;
  lastLoginAt: string | null;
}

export type AuditAction =
  | "auth.login"
  | "auth.login_denied"
  | "auth.logout"
  | "user.create"
  | "user.update"
  | "user.role_change"
  | "user.deactivate"
  | "user.reactivate"
  | "user.reset_link_issued";

export interface AuditLogEntry {
  id: string;
  actorUid: string;
  actorEmail: string | null;
  actorRole: Role | null;
  action: AuditAction;
  targetType: "user" | "session";
  targetId: string;
  summary: string;
  /** Small before/after map. Must never contain secrets, tokens, links or passwords. */
  changes: Record<string, { from: string | null; to: string | null }> | null;
  createdAt: string | null;
}
