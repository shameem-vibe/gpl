import { Activity, CalendarDays, Cog, Film, Gavel, Handshake, LayoutDashboard, Newspaper, Radio, ScrollText, Shield, Swords, Trophy, UserCheck, Users, UsersRound, type LucideIcon } from "lucide-react";
import type { Permission } from "@/domain/permissions";

export interface AdminNavItem { slug: string; href: string; label: string; icon: LucideIcon; permission: Permission; description: string; phase: string }

export const ADMIN_NAV: AdminNavItem[] = [
  { slug: "", href: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard:view", description: "Overview", phase: "Phase 1" },
  { slug: "seasons", href: "/admin/seasons", label: "Seasons", icon: CalendarDays, permission: "seasons:manage", description: "Create and archive seasons.", phase: "Phase 3" },
  { slug: "tournaments", href: "/admin/tournaments", label: "Tournaments", icon: Trophy, permission: "seasons:manage", description: "Formats, groups and stages.", phase: "Phase 3" },
  { slug: "matches", href: "/admin/matches", label: "Matches", icon: Swords, permission: "matches:manage", description: "Fixtures, venues and results.", phase: "Phase 4" },
  { slug: "scoring", href: "/admin/scoring", label: "Live Scoring", icon: Activity, permission: "scoring:write", description: "The scorer console.", phase: "Phase 5" },
  { slug: "teams", href: "/admin/teams", label: "Teams", icon: UsersRound, permission: "teams:manage", description: "Team profiles and squads.", phase: "Phase 3" },
  { slug: "players", href: "/admin/players", label: "Players", icon: Users, permission: "players:manage", description: "Player profiles.", phase: "Phase 3" },
  { slug: "registrations", href: "/admin/registrations", label: "Registrations", icon: UserCheck, permission: "registrations:review", description: "Review player sign-ups.", phase: "Phase 3" },
  { slug: "auction", href: "/admin/auction", label: "Auction", icon: Gavel, permission: "auction:manage", description: "Run the player auction.", phase: "Phase 6" },
  { slug: "news", href: "/admin/news", label: "News", icon: Newspaper, permission: "content:manage", description: "Announcements.", phase: "Phase 3" },
  { slug: "videos", href: "/admin/videos", label: "Videos", icon: Film, permission: "content:manage", description: "Highlights and replays.", phase: "Phase 3" },
  { slug: "streams", href: "/admin/streams", label: "Live Streaming", icon: Radio, permission: "streams:manage", description: "YouTube stream links.", phase: "Phase 4" },
  { slug: "sponsors", href: "/admin/sponsors", label: "Sponsors", icon: Handshake, permission: "sponsors:manage", description: "Sponsors and partners.", phase: "Phase 3" },
  { slug: "users", href: "/admin/users", label: "Users and Roles", icon: Shield, permission: "users:manage", description: "Invite staff and set roles.", phase: "Phase 2" },
  { slug: "settings", href: "/admin/settings", label: "Settings", icon: Cog, permission: "settings:manage", description: "Site settings.", phase: "Phase 3" },
  { slug: "audit-logs", href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText, permission: "audit:read", description: "Who changed what, and when.", phase: "Phase 2" },
];
