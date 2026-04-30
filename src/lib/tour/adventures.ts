import type { Adventure, TourContext } from "./types";
import { findPersona } from "@/lib/segment/personas";

async function seedPersona(ctx: TourContext, id: string) {
  const p = ctx.findPersona(id);
  if (!p) return;
  await p.seed();
}

export const ADVENTURES: Adventure[] = [
  {
    id: "meet-sarah",
    title: "Meet Sarah. Everywhere.",
    tagline: "One customer, three surfaces, one profile.",
    estMinutes: 3,
    difficulty: "foundational",
    icon: "identity",
    beats: [
      {
        kind: "narrate",
        copy: "Meet Sarah Thompson. Gold-tier, 12 orders. She opens Domino's from her couch.",
        advance: "click",
      },
      {
        kind: "action",
        copy: "Loading Sarah's identity and order history…",
        advance: "auto",
        do: async (ctx) => {
          await seedPersona(ctx, "sarah_vip");
        },
      },
      {
        kind: "spotlight",
        target: "tour-personalization-banner",
        copy: "Her home page is already personalized. The copy swapped based on her loyalty_tier trait.",
        advance: "click",
      },
      {
        kind: "spotlight",
        target: "tour-identity-panel",
        copy: "One userId, live traits. This panel is the same regardless of which surface she's on.",
        advance: "click",
      },
      {
        kind: "multi-surface",
        focus: "mobile",
        copy: "Same customer, now on the mobile app. Notice the reorder strip is already populated.",
        advance: "click",
      },
      {
        kind: "multi-surface",
        focus: "kiosk",
        copy: "At the store, the kiosk recognizes her scanned loyalty QR. No sign-in — the session is already Sarah.",
        advance: "click",
      },
      {
        kind: "spotlight",
        target: "tour-event-inspector",
        copy: "Every event is tagged with context.app.name. Same person, three surfaces, one profile.",
        advance: "click",
      },
      {
        kind: "recap",
        bullets: [
          "Identity stitched across web, mobile, and kiosk via one userId.",
          "Traits travel with the profile, not the surface.",
          "Source attribution is automatic via context.app.name.",
        ],
        ctas: [
          { label: "Segment Identity docs", href: "https://segment.com/docs/connections/spec/identify/", external: true },
          { label: "Back to tour menu", href: "/tour" },
        ],
      },
    ],
  },

  {
    id: "build-audience",
    title: "Build an audience in 60 seconds.",
    tagline: "Real-time, not batch.",
    estMinutes: 2,
    difficulty: "foundational",
    icon: "audience",
    beats: [
      {
        kind: "narrate",
        copy: "We start anonymous. No account, no history. Watch the Audiences panel.",
        advance: "click",
      },
      {
        kind: "action",
        copy: "Clearing identity and heading to the deals page…",
        advance: "auto",
        do: async (ctx) => {
          await ctx.analytics.reset();
          ctx.router.push("/deals");
        },
      },
      {
        kind: "spotlight",
        target: "tour-audiences-panel",
        copy: "Click any deal on the page. I'll wait.",
        advance: { onEvent: "Deal Viewed" },
      },
      {
        kind: "spotlight",
        target: "tour-audiences-panel",
        copy: "Deal Hunter audience entered. That rule is live — no batch job, no overnight wait.",
        advance: "click",
      },
      {
        kind: "spotlight",
        target: "tour-audiences-panel",
        copy: "Now add a pizza to cart. Then come back here.",
        advance: { onEvent: "Product Added" },
      },
      {
        kind: "spotlight",
        target: "tour-audiences-panel",
        copy: "Cart Abandoner is primed. If she leaves without checking out, the nudge fires.",
        advance: "click",
      },
      {
        kind: "spotlight",
        target: "tour-computed-traits-panel",
        copy: "These traits recomputed after every event — favorite_category, product_add_count, cart_value.",
        advance: "click",
      },
      {
        kind: "recap",
        bullets: [
          "Audiences evaluate live from the event stream and computed traits.",
          "Entering an audience fires a trackable Audience Entered event.",
          "No warehouse round-trip, no pipeline lag.",
        ],
        ctas: [
          { label: "Segment Audiences docs", href: "https://segment.com/docs/engage/audiences/", external: true },
          { label: "Back to tour menu", href: "/tour" },
        ],
      },
    ],
  },

  {
    id: "tracking-plan",
    title: "One tracking plan, every surface.",
    tagline: "Write the spec once, honor it everywhere.",
    estMinutes: 3,
    difficulty: "advanced",
    icon: "tracking",
    beats: [
      {
        kind: "narrate",
        copy: "Most companies have different events on web, mobile, and in-store. Watch what happens here.",
        advance: "click",
      },
      {
        kind: "action",
        copy: "Opening the Event Inspector…",
        advance: "auto",
        do: async () => {
          const { useSegmentStore } = await import("@/stores/segment-store");
          useSegmentStore.getState().setInspectorOpen(true);
          useSegmentStore.getState().setInspectorTab("events");
          useSegmentStore.getState().setEventFilter({});
        },
      },
      {
        kind: "multi-surface",
        focus: "web",
        copy: "Add a Meat Lovers to the cart on the web surface. I'll wait.",
        advance: { onEvent: "Product Added" },
      },
      {
        kind: "spotlight",
        target: "tour-event-inspector-latest",
        copy: "There's the Product Added event — product_id, category, price, quantity, source: web.",
        advance: "click",
      },
      {
        kind: "multi-surface",
        focus: "mobile",
        copy: "Now the same action in the mobile app.",
        advance: { onEvent: "Product Added" },
      },
      {
        kind: "spotlight",
        target: "tour-event-inspector-latest",
        copy: "Same event, same shape. Only source is different.",
        advance: "click",
      },
      {
        kind: "multi-surface",
        focus: "kiosk",
        copy: "Now in-store on the kiosk.",
        advance: { onEvent: "Product Added" },
      },
      {
        kind: "spotlight",
        target: "tour-event-inspector-latest",
        copy: "Identical. Your warehouse team loves you.",
        advance: "click",
      },
      {
        kind: "recap",
        bullets: [
          "One tracking plan is the contract across surfaces.",
          "Protocol violations surface immediately in the inspector.",
          "Source attribution is the only difference, and it's automatic.",
        ],
        ctas: [
          { label: "Segment Protocols docs", href: "https://segment.com/docs/protocols/", external: true },
          { label: "Back to tour menu", href: "/tour" },
        ],
      },
    ],
  },

  {
    id: "cart-rescue",
    title: "The cart abandonment rescue.",
    tagline: "One audience, every channel.",
    estMinutes: 3,
    difficulty: "advanced",
    icon: "rescue",
    beats: [
      {
        kind: "narrate",
        copy: "Meet Dan. Bronze tier. One item in cart. He's about to walk away.",
        advance: "click",
      },
      {
        kind: "action",
        copy: "Loading Dan's session…",
        advance: "auto",
        do: async (ctx) => {
          await seedPersona(ctx, "dan_abandoner");
        },
      },
      {
        kind: "spotlight",
        target: "tour-audiences-panel",
        copy: "Cart Abandoner audience is already active from his seeded events.",
        advance: "click",
      },
      {
        kind: "narrate",
        copy: "Watch. No clicks from here. Just wait — about 15 seconds.",
        advance: "click",
      },
      {
        kind: "spotlight",
        target: "tour-audience-toast-cart_abandoners",
        copy: "The on-site toast fires automatically. Same audience, same copy rule.",
        advance: { onEvent: "Audience Entered" },
      },
      {
        kind: "action",
        copy: "Opening Dan's inbox…",
        advance: "auto",
        do: async () => {
          window.dispatchEvent(new CustomEvent("tour:open-inbox"));
        },
      },
      {
        kind: "narrate",
        copy: "Same rule, different channel. You set this once in Segment Engage.",
        advance: "click",
      },
      {
        kind: "action",
        copy: "Recording Dan's order completion…",
        advance: "auto",
        do: async (ctx) => {
          await ctx.analytics.track("Order Completed", {
            order_id: `tour-order-${Date.now()}`,
            total: 20.49,
            revenue: 18.99,
            currency: "AUD",
            category: "pizzas",
            store_id: "store-002",
          });
        },
      },
      {
        kind: "spotlight",
        target: "tour-journey-panel",
        copy: "Journey advanced. The audience, the recovery email, and the journey stage are all driven by one source of truth.",
        advance: "click",
      },
      {
        kind: "recap",
        bullets: [
          "Same audience powers on-site toast and email — one source of truth.",
          "Journey stages advance from real events, not manual tagging.",
          "Engage and journeys read from the same profile as the site.",
        ],
        ctas: [
          { label: "Segment Engage docs", href: "https://segment.com/docs/engage/", external: true },
          { label: "Back to tour menu", href: "/tour" },
        ],
      },
    ],
  },
];

export function makeTourContext(
  router: TourContext["router"],
  analytics: TourContext["analytics"],
): TourContext {
  return { router, analytics, findPersona };
}
