// src/lib/segment/audiences.ts
import type {
  AudienceDefinition,
  AudienceMembership,
  ComputedTraits,
  LoggedEvent,
} from "./types";

// ---------------------------------------------------------------------------
// Computed traits — derived from the event log (+ optional persisted order history)
// ---------------------------------------------------------------------------

interface ComputeInput {
  events: LoggedEvent[];
  cartItemCount?: number;
  cartValue?: number;
}

export function computeTraits(input: ComputeInput): ComputedTraits {
  const { events } = input;

  const completed = events.filter(
    (e) => e.kind === "track" && e.name === "Order Completed",
  );

  const totals = completed.map((e) => {
    const p = e.properties ?? {};
    const total = typeof p.total === "number" ? p.total
      : typeof p.revenue === "number" ? p.revenue : 0;
    return { total, at: e.timestamp };
  });

  const lifetime_spend = totals.reduce((s, t) => s + t.total, 0);
  const lifetime_orders = totals.length;
  const avg_order_value = lifetime_orders > 0
    ? Math.round((lifetime_spend / lifetime_orders) * 100) / 100
    : 0;

  const last_order_at = totals.length > 0
    ? totals[totals.length - 1].at
    : undefined;
  const days_since_last_order = last_order_at
    ? Math.floor((Date.now() - new Date(last_order_at).getTime()) / 86_400_000)
    : undefined;

  const categoryCounts: Record<string, number> = {};
  for (const e of events) {
    if (e.kind !== "track") continue;
    const cat = (e.properties?.category as string | undefined);
    if (!cat) continue;
    categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
  }
  let favorite_category: string | undefined;
  let maxCount = 0;
  for (const [cat, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count;
      favorite_category = cat;
    }
  }

  const has_applied_coupon = events.some(
    (e) => e.kind === "track" && e.name === "Coupon Applied",
  );
  const has_viewed_deals = events.some(
    (e) => e.kind === "track" && e.name === "Deal Viewed",
  );

  return {
    lifetime_orders,
    lifetime_spend: Math.round(lifetime_spend * 100) / 100,
    avg_order_value,
    last_order_at,
    days_since_last_order,
    favorite_category,
    cart_item_count: input.cartItemCount ?? 0,
    cart_value: input.cartValue ?? 0,
    session_event_count: events.length,
    has_applied_coupon,
    has_viewed_deals,
  };
}

// ---------------------------------------------------------------------------
// Audience definitions
// ---------------------------------------------------------------------------

export const AUDIENCES: AudienceDefinition[] = [
  {
    id: "high_value",
    name: "High-Value Customers",
    description: "Lifetime spend ≥ $100",
    color: "bg-amber-500",
    match: ({ computedTraits }) => computedTraits.lifetime_spend >= 100,
  },
  {
    id: "cart_abandoners",
    name: "Cart Abandoners",
    description: "Items in cart but no order in this session",
    color: "bg-orange-500",
    match: ({ computedTraits, events }) => {
      if (computedTraits.cart_item_count === 0) return false;
      return !events.some(
        (e) => e.kind === "track" && e.name === "Order Completed",
      );
    },
  },
  {
    id: "deal_hunters",
    name: "Deal Hunters",
    description: "Viewed deals or applied a coupon",
    color: "bg-rose-500",
    match: ({ computedTraits }) =>
      computedTraits.has_viewed_deals || computedTraits.has_applied_coupon,
  },
  {
    id: "pizza_lovers",
    name: "Pizza Lovers",
    description: "Favorite category is pizzas",
    color: "bg-red-600",
    match: ({ computedTraits }) => computedTraits.favorite_category === "pizzas",
  },
  {
    id: "vip_tier",
    name: "VIP Tier Members",
    description: "Lifetime orders ≥ 5 or spend ≥ $200",
    color: "bg-purple-600",
    match: ({ computedTraits }) =>
      computedTraits.lifetime_orders >= 5 || computedTraits.lifetime_spend >= 200,
  },
  {
    id: "lapsed_customers",
    name: "Lapsed Customers",
    description: "Hasn't ordered in 30+ days",
    color: "bg-slate-500",
    match: ({ computedTraits }) =>
      computedTraits.lifetime_orders > 0 &&
      (computedTraits.days_since_last_order ?? 0) >= 30,
  },
  {
    id: "new_visitors",
    name: "New Visitors",
    description: "No identify call yet",
    color: "bg-sky-500",
    match: ({ userId, computedTraits }) =>
      userId === null && computedTraits.session_event_count > 0,
  },
  {
    id: "pickup_preferring",
    name: "Pickup-Preferring",
    description: "Selected pickup as delivery method at least once",
    color: "bg-emerald-500",
    match: ({ events }) =>
      events.some(
        (e) =>
          e.kind === "track" &&
          e.name === "Delivery Method Selected" &&
          e.properties?.method === "pickup",
      ),
  },
];

export function evaluateAudiences(
  events: LoggedEvent[],
  traits: Record<string, unknown>,
  computedTraits: ComputedTraits,
  userId: string | null,
  previous: AudienceMembership[],
): { current: AudienceMembership[]; entered: AudienceDefinition[]; exited: AudienceDefinition[] } {
  const prevIds = new Set(previous.map((m) => m.id));
  const current: AudienceMembership[] = [];
  const entered: AudienceDefinition[] = [];
  const exited: AudienceDefinition[] = [];

  for (const def of AUDIENCES) {
    const matched = def.match({ events, traits, computedTraits, userId });
    if (matched) {
      const existing = previous.find((m) => m.id === def.id);
      current.push(
        existing ?? { id: def.id, name: def.name, enteredAt: new Date().toISOString() },
      );
      if (!prevIds.has(def.id)) entered.push(def);
    }
  }

  const currentIds = new Set(current.map((m) => m.id));
  for (const def of AUDIENCES) {
    if (prevIds.has(def.id) && !currentIds.has(def.id)) exited.push(def);
  }

  return { current, entered, exited };
}
