// src/lib/segment/journey.ts
import type {
  LoggedEvent,
  JourneyStage,
  ComputedTraits,
} from "./types";

export const JOURNEY_STAGES: { stage: JourneyStage; label: string; description: string }[] = [
  { stage: "visitor",          label: "Visitor",          description: "Landed on the site, not yet engaged" },
  { stage: "engaged",          label: "Engaged",          description: "Viewed a product or deal" },
  { stage: "cart_abandoner",   label: "Cart Abandoner",   description: "Added to cart but didn't complete" },
  { stage: "customer",         label: "Customer",         description: "Completed one order" },
  { stage: "repeat_customer",  label: "Repeat Customer",  description: "Completed multiple orders" },
  { stage: "vip",              label: "VIP",              description: "High-value loyal customer" },
];

export function classifyStage(
  events: LoggedEvent[],
  computed: ComputedTraits,
): JourneyStage {
  if (computed.lifetime_spend >= 200 || computed.lifetime_orders >= 5) return "vip";
  if (computed.lifetime_orders >= 2) return "repeat_customer";
  if (computed.lifetime_orders >= 1) return "customer";

  const hasAddToCart = events.some(
    (e) => e.kind === "track" && e.name === "Product Added",
  );
  const hasOrder = events.some(
    (e) => e.kind === "track" && e.name === "Order Completed",
  );
  const hasCheckoutStart = events.some(
    (e) => e.kind === "track" && e.name === "Checkout Started",
  );

  if (hasAddToCart && !hasOrder) {
    const lastAdd = [...events]
      .reverse()
      .find((e) => e.kind === "track" && e.name === "Product Added");
    if (lastAdd && Date.now() - lastAdd.receivedAt > 60_000) {
      return "cart_abandoner";
    }
    if (hasCheckoutStart) return "cart_abandoner";
  }

  const hasEngaged = events.some(
    (e) =>
      e.kind === "track" &&
      (e.name === "Product Viewed" ||
        e.name === "Deal Viewed" ||
        e.name === "Product List Viewed"),
  );

  return hasEngaged ? "engaged" : "visitor";
}
