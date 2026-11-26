import type { MetadataRoute } from "next";
import { PUBLIC_NAV, SITE } from "@/lib/constants/site";

/** Static routes now. Phase 3-4 appends published teams, players, matches and news from Firestore. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [...PUBLIC_NAV.map((n) => n.href), "/register"].map((path) => ({
    url: `${SITE.url}${path === "/" ? "" : path}`,
    changeFrequency: path === "/live" ? "always" : "daily",
    priority: path === "/" ? 1 : 0.7,
  }));
}
