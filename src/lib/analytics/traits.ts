import type { UserTraits } from "@/types/analytics";

export function computeLoyaltyTier(lifetimePoints: number): UserTraits["loyalty_tier"] {
  if (lifetimePoints >= 5000) return "vip";
  if (lifetimePoints >= 2000) return "gold";
  if (lifetimePoints >= 500) return "silver";
  return "bronze";
}

export function computeDaysSinceLastOrder(lastOrderDate?: string): number | undefined {
  if (!lastOrderDate) return undefined;
  const last = new Date(lastOrderDate);
  const now = new Date();
  return Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
}
