export const SITE = {
  name: "Gobindapur Premier League",
  short: "GPL",
  tagline: "Our Ground. Our Glory.",
  secondary: "One village. One game. One champion.",
  description:
    "The home of village cricket in Gobindapur, Bangladesh: live scores, fixtures, teams, players and the player auction.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  // TODO(owner): replace with real contact details and social URLs
  contact: { email: "contact@example.com", phone: "+880 1XXX-XXXXXX", location: "Gobindapur, Bangladesh" },
  social: { facebook: "#", youtube: "#" },
} as const;

export const PUBLIC_NAV = [
  { href: "/", label: "Home" },
  { href: "/matches", label: "Matches" },
  { href: "/live", label: "Live Score" },
  { href: "/teams", label: "Teams" },
  { href: "/players", label: "Players" },
  { href: "/auction", label: "Auction" },
  { href: "/videos", label: "Videos" },
  { href: "/news", label: "News" },
  { href: "/about", label: "About GPL" },
] as const;
