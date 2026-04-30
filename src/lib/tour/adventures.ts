import type { Adventure, TourContext } from "./types";
import { findPersona } from "@/lib/segment/personas";

async function seedPersona(ctx: TourContext, id: string) {
  const p = ctx.findPersona(id);
  if (!p) return;
  await p.seed();
}

function tourItemId(slug: string): string {
  return `tour-${slug}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
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
        copy: "Meet Sarah Thompson. Gold-tier, 12 orders, spent $386 with you. She opens Domino's from her couch.",
        advance: "click",
      },
      {
        kind: "action",
        copy: "Loading Sarah's profile and bringing up her home page…",
        advance: "auto",
        do: async (ctx) => {
          await seedPersona(ctx, "sarah_vip");
          ctx.router.push("/");
        },
      },
      {
        kind: "spotlight",
        target: "tour-personalization-banner",
        copy: "The hero banner changed for her. Gold-tier customers see a VIP combo offer — nobody else does.",
        advance: "click",
      },
      {
        kind: "multi-surface",
        focus: "mobile",
        copy: "She opens the mobile app. Same profile, same preferences — the reorder strip is already set up.",
        advance: "click",
      },
      {
        kind: "multi-surface",
        focus: "kiosk",
        copy: "She walks into a store. Scans her loyalty QR. The kiosk already knows her before she taps anything.",
        advance: "click",
      },
      {
        kind: "narrate",
        copy: "One customer. Three screens. Same profile, same loyalty tier, same order history — served live, no sync job.",
        advance: "click",
      },
      {
        kind: "recap",
        bullets: [
          "Sarah is one person to us, not three.",
          "Her profile — tier, orders, preferences — travels with her from web to app to kiosk.",
          "No sign-in on the kiosk; no reauth on mobile. The data platform stitches it automatically.",
        ],
        ctas: [
          { label: "Back to tour menu", href: "/tour" },
        ],
      },
    ],
  },

  {
    id: "build-audience",
    title: "Watch an audience form, live.",
    tagline: "No warehouse. No batch job. Instant.",
    estMinutes: 2,
    difficulty: "foundational",
    icon: "audience",
    beats: [
      {
        kind: "narrate",
        copy: "This is a brand-new, anonymous visitor. No history. No profile. Watch the site change as they browse.",
        advance: "click",
      },
      {
        kind: "action",
        copy: "Clearing identity and opening the deals page…",
        advance: "auto",
        do: async (ctx) => {
          await ctx.analytics.reset();
          ctx.router.push("/deals");
        },
      },
      {
        kind: "action",
        copy: "They look at the lunch combo…",
        advance: "auto",
        do: async (ctx) => {
          await ctx.analytics.track("Deal Viewed", {
            deal_id: "deal-005",
            deal_name: "Lunch Combo",
            discount_value: 7,
          });
        },
      },
      {
        kind: "action",
        copy: "Heading home to see what changed.",
        advance: "auto",
        do: async (ctx) => {
          ctx.router.push("/");
        },
      },
      {
        kind: "spotlight",
        target: "tour-personalization-banner",
        copy: "One click on a deal flipped them into the Deal Hunter audience. The hero swapped to coupon-forward copy — instantly.",
        advance: "click",
      },
      {
        kind: "action",
        copy: "Now they add a pizza to cart, but don't check out…",
        advance: "auto",
        do: async (ctx) => {
          const { useCartStore } = await import("@/stores/cart-store");
          useCartStore.getState().addItem({
            id: tourItemId("pepperoni"),
            productSlug: "pepperoni",
            productName: "Pepperoni",
            category: "pizzas",
            image: "/images/menu/pepperoni.webp",
            size: "large",
            crust: "classic",
            quantity: 1,
            unitPrice: 14.99,
          });
          await ctx.analytics.track("Product Added", {
            product_id: "pepperoni",
            name: "Pepperoni",
            category: "pizzas",
            price: 14.99,
            quantity: 1,
          });
        },
      },
      {
        kind: "spotlight",
        target: "tour-personalization-banner",
        copy: "Second audience joined — Cart Abandoner. The hero swapped again. Same visitor, different offer, zero delay.",
        advance: "click",
      },
      {
        kind: "recap",
        bullets: [
          "Two clicks. Two audience entries. Two banner changes.",
          "No overnight batch. No data-warehouse round trip.",
          "Every surface that reads from the profile saw both changes at the same instant.",
        ],
        ctas: [
          { label: "Back to tour menu", href: "/tour" },
        ],
      },
    ],
  },

  {
    id: "tracking-plan",
    title: "Same customer, every screen.",
    tagline: "The cart follows her from couch to counter.",
    estMinutes: 3,
    difficulty: "advanced",
    icon: "tracking",
    beats: [
      {
        kind: "narrate",
        copy: "Sarah starts an order on the web, switches to her phone on the way out, finishes at the kiosk inside the store. Watch her cart move with her.",
        advance: "click",
      },
      {
        kind: "action",
        copy: "Setting Sarah up with an empty cart…",
        advance: "auto",
        do: async (ctx) => {
          await seedPersona(ctx, "sarah_vip");
          const { useCartStore } = await import("@/stores/cart-store");
          useCartStore.getState().clearCart();
        },
      },
      {
        kind: "multi-surface",
        focus: "web",
        copy: "She adds a Meat Lovers on the web. Watch the mobile and kiosk panes on the right.",
        advance: "click",
      },
      {
        kind: "action",
        copy: "Adding Meat Lovers to her cart…",
        advance: "auto",
        do: async (ctx) => {
          const { useCartStore } = await import("@/stores/cart-store");
          useCartStore.getState().addItem({
            id: tourItemId("meat-lovers"),
            productSlug: "meat-lovers",
            productName: "Meat Lovers",
            category: "pizzas",
            image: "/images/menu/meat-lovers.webp",
            size: "large",
            crust: "classic",
            quantity: 1,
            unitPrice: 16.99,
          });
          await ctx.analytics.track("Product Added", {
            product_id: "meat-lovers",
            name: "Meat Lovers",
            category: "pizzas",
            price: 16.99,
            quantity: 1,
          });
        },
      },
      {
        kind: "multi-surface",
        focus: "mobile",
        copy: "She leaves the house. Same cart on her phone — no re-add, no restore button. Now she adds a side.",
        advance: "click",
      },
      {
        kind: "action",
        copy: "Adding Garlic Bread on mobile…",
        advance: "auto",
        do: async (ctx) => {
          const { useCartStore } = await import("@/stores/cart-store");
          useCartStore.getState().addItem({
            id: tourItemId("garlic-bread"),
            productSlug: "garlic-bread",
            productName: "Garlic Bread",
            category: "sides",
            image: "/images/menu/garlic-bread.webp",
            quantity: 1,
            unitPrice: 6.95,
          });
          await ctx.analytics.track("Product Added", {
            product_id: "garlic-bread",
            name: "Garlic Bread",
            category: "sides",
            price: 6.95,
            quantity: 1,
          });
        },
      },
      {
        kind: "multi-surface",
        focus: "kiosk",
        copy: "She walks into the store. The kiosk already has her cart. She taps a drink to finish the order.",
        advance: "click",
      },
      {
        kind: "action",
        copy: "Adding a Coke on the kiosk…",
        advance: "auto",
        do: async (ctx) => {
          const { useCartStore } = await import("@/stores/cart-store");
          useCartStore.getState().addItem({
            id: tourItemId("coca-cola-1.25l"),
            productSlug: "coca-cola-1.25l",
            productName: "Coca-Cola 1.25L",
            category: "drinks",
            image: "/images/menu/coca-cola-1.25l.webp",
            quantity: 1,
            unitPrice: 5.5,
          });
          await ctx.analytics.track("Product Added", {
            product_id: "coca-cola-1.25l",
            name: "Coca-Cola 1.25L",
            category: "drinks",
            price: 5.5,
            quantity: 1,
          });
        },
      },
      {
        kind: "narrate",
        copy: "Three surfaces, one cart. Nothing was re-entered, re-scanned, or re-selected. That's what a shared customer profile does.",
        advance: "click",
      },
      {
        kind: "recap",
        bullets: [
          "Her cart lives on the profile, not the device.",
          "Every surface reads from the same source — no sync scripts, no ETL windows.",
          "She never had to sign in twice, re-add a product, or explain herself.",
        ],
        ctas: [
          { label: "Back to tour menu", href: "/tour" },
        ],
      },
    ],
  },

  {
    id: "cart-rescue",
    title: "The cart-abandonment rescue.",
    tagline: "One rule. Every channel. No CRM engineer required.",
    estMinutes: 3,
    difficulty: "advanced",
    icon: "rescue",
    beats: [
      {
        kind: "narrate",
        copy: "Meet Dan. He's added a pizza and a Coke, but he's hesitating. Watch what happens when he stalls.",
        advance: "click",
      },
      {
        kind: "action",
        copy: "Loading Dan's session and opening the menu…",
        advance: "auto",
        do: async (ctx) => {
          await seedPersona(ctx, "dan_abandoner");
          ctx.router.push("/menu");
        },
      },
      {
        kind: "spotlight",
        target: "tour-personalization-banner",
        copy: "The banner already shifted to Cart-Abandoner copy — free garlic bread if he finishes his order. No human wrote this rule for Dan specifically; it's a segment.",
        advance: "click",
      },
      {
        kind: "narrate",
        copy: "Now he stalls for about 15 seconds. No clicks. No navigation. Watch the bottom-right.",
        advance: "click",
      },
      {
        kind: "spotlight",
        target: "tour-audience-toast-cart_abandoners",
        copy: "The on-site nudge fires automatically — same audience, same copy rule.",
        advance: { onEvent: "Audience Entered" },
      },
      {
        kind: "action",
        copy: "Meanwhile, an email lands in Dan's inbox…",
        advance: "auto",
        do: async () => {
          window.dispatchEvent(new CustomEvent("tour:open-inbox"));
        },
      },
      {
        kind: "narrate",
        copy: "Same audience. Same copy. Different channel. One rule, set once, activated everywhere a customer might be.",
        advance: "click",
      },
      {
        kind: "action",
        copy: "Dan taps the email and finishes his order…",
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
          ctx.router.push("/");
        },
      },
      {
        kind: "spotlight",
        target: "tour-personalization-banner",
        copy: "The banner changed again — he's a Repeat Customer now. One order flipped the segment and the site followed.",
        advance: "click",
      },
      {
        kind: "recap",
        bullets: [
          "One audience, one copy rule — on-site toast, email, and next-session banner all fired from it.",
          "Dan's stage advanced the instant his order completed. No overnight sync.",
          "Your CRM team sets this up once. Every surface honors it.",
        ],
        ctas: [
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
