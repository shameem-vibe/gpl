import type { Role } from "@/types/domain";

export const ROLE_LABELS: Record<Role, string> = {
  superAdmin: "Super Admin", admin: "Admin", scorer: "Scorer", editor: "Editor", auctionManager: "Auction Manager",
};
