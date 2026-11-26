import type { Role } from "@/types/domain";

export const ROLE_LABELS: Record<Role, string> = {
  superAdmin: "Super Admin", admin: "Admin", scorer: "Scorer", editor: "Editor", auctionManager: "Auction Manager",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  superAdmin: "Full access. Manages administrators, roles, settings and audit logs.",
  admin: "Manages seasons, matches, teams, players, registrations, news, videos and sponsors. No access to users, settings or audit logs.",
  scorer: "Manages matches and enters live scores and commentary. Nothing else.",
  editor: "Manages news, videos, highlights, streams and sponsors. Cannot touch scores or the auction.",
  auctionManager: "Runs the player auction, bidding and player pool. Cannot manage administrators or settings.",
};
