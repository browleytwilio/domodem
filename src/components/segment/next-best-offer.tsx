"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSegmentStore } from "@/stores/segment-store";

interface Offer {
  audienceId?: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  reason: string;
}

const OFFERS: Offer[] = [
  {
    audienceId: "vip_tier",
    title: "VIP Exclusive — 3 Premium Pizzas $35.95",
    description: "Our Premium range, all yours at a VIP price. Members only.",
    cta: "Claim VIP Deal",
    href: "/deals",
    reason: "VIP audience match",
  },
  {
    audienceId: "multi_channel",
    title: "Your cart is synced",
    description: "Finish on any screen — web, app, or in-store kiosk.",
    cta: "Resume Order",
    href: "/checkout",
    reason: "Multi-channel audience",
  },
  {
    audienceId: "builder_abandoners",
    title: "Complete your custom pizza",
    description: "Still warm in your session — one tap to finish and add to cart.",
    cta: "Resume Builder",
    href: "/menu",
    reason: "Pizza Builder Abandoner",
  },
  {
    audienceId: "cart_abandoners",
    title: "Complete your order — free garlic bread",
    description: "We've saved your cart. Check out now and garlic bread is on us.",
    cta: "Resume Checkout",
    href: "/checkout",
    reason: "Cart abandoner signal",
  },
  {
    audienceId: "high_cart_value_session",
    title: "Add a side, skip the delivery fee",
    description: "You're close to free delivery. Garlic bread or a drink will do it.",
    cta: "Add a Side",
    href: "/menu",
    reason: "High cart value ($50+)",
  },
  {
    audienceId: "repeat_customers",
    title: "Reorder your last — 1 tap, 15 min",
    description: "Same order as last time, delivered in 30 minutes.",
    cta: "Reorder",
    href: "/account/orders",
    reason: "Repeat Customer",
  },
  {
    audienceId: "loyalty_engaged",
    title: "Redeem 500 pts for any side",
    description: "Turn your rewards into garlic bread, a drink, or a dessert on us.",
    cta: "Redeem Now",
    href: "/account/loyalty",
    reason: "Loyalty audience",
  },
  {
    audienceId: "deal_hunters",
    title: "Lunch Combo $9.95",
    description: "Personal pizza + side + drink. Your favourite kind of deal.",
    cta: "Grab Lunch",
    href: "/deals",
    reason: "Deal Hunter audience",
  },
  {
    audienceId: "builder_completers",
    title: "Try another crust free",
    description: "You've built a pizza before — next one, swap crusts at no charge.",
    cta: "Build Another",
    href: "/menu",
    reason: "Builder Completer",
  },
  {
    audienceId: "browse_abandoners",
    title: "Can't pick? Any 3 Pizzas $29.95",
    description: "Mix and match our Traditional range. Fastest way to decide.",
    cta: "See the Combo",
    href: "/deals",
    reason: "Browse Abandoner",
  },
  {
    audienceId: "video_engaged",
    title: "Featured in the video you just watched",
    description: "BBQ Meat Lovers, $16.99 — the pizza from the highlight reel.",
    cta: "Order It",
    href: "/menu",
    reason: "Video Engaged",
  },
  {
    audienceId: "newsletter_subscribers",
    title: "Subscriber price: 20% off Tuesdays",
    description: "Exclusive weekly drop reserved for newsletter members.",
    cta: "See Deal",
    href: "/deals",
    reason: "Newsletter Subscriber",
  },
  {
    audienceId: "kiosk_users",
    title: "Deliver your in-store usual tonight",
    description: "Same menu, delivered — no queue, no fuss.",
    cta: "Order Delivery",
    href: "/menu",
    reason: "Kiosk User",
  },
  {
    audienceId: "mobile_users",
    title: "App-only: next order ships free",
    description: "Download the app and your next delivery is on us.",
    cta: "Open App",
    href: "/m",
    reason: "Mobile App User",
  },
  {
    audienceId: "authenticated_users",
    title: "Welcome back — your usual is saved",
    description: "Saved addresses and cards are ready. Start in 2 taps.",
    cta: "Start an Order",
    href: "/menu",
    reason: "Authenticated User",
  },
];

const PIZZA_FAVORITE_OFFER: Offer = {
  title: "Build a custom pizza",
  description:
    "Based on your pizza browsing, try the builder — 20+ toppings, 4 crusts.",
  cta: "Start Building",
  href: "/product/pepperoni",
  reason: "Favorite category = pizzas",
};

const DEFAULT_OFFER: Offer = {
  title: "Any 3 Pizzas $29.95",
  description: "Mix & match Traditional range. Pickup or delivery.",
  cta: "See Deal",
  href: "/deals",
  reason: "Default recommendation",
};

export function NextBestOffer() {
  const demoMode = useSegmentStore((s) => s.demoModeEnabled);
  const computed = useSegmentStore((s) => s.computedTraits);
  const audiences = useSegmentStore((s) => s.audiences);

  if (!demoMode) return null;

  const memberIds = new Set(audiences.map((a) => a.id));

  const offer =
    OFFERS.find((o) => o.audienceId && memberIds.has(o.audienceId)) ??
    (computed.favorite_category === "pizzas" ? PIZZA_FAVORITE_OFFER : undefined) ??
    DEFAULT_OFFER;

  return (
    <motion.aside
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex flex-col gap-3 rounded-xl border border-[var(--dominos-blue)]/30 bg-gradient-to-br from-[var(--dominos-blue)]/5 to-transparent p-4 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Recommended offer"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--dominos-blue)]/10">
          <TrendingUp className="h-5 w-5 text-[var(--dominos-blue)]" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-800">
              <Sparkles className="h-3 w-3" />
              Recommended for you
            </Badge>
            <span className="text-[11px] text-muted-foreground">({offer.reason})</span>
          </div>
          <h3 className="text-base font-bold">{offer.title}</h3>
          <p className="text-sm text-muted-foreground">{offer.description}</p>
        </div>
      </div>
      <Link
        href={offer.href}
        className="inline-flex items-center rounded-lg bg-[var(--dominos-red)] px-4 py-2 text-sm font-bold text-white shadow hover:bg-[var(--dominos-red)]/90"
      >
        {offer.cta}
      </Link>
    </motion.aside>
  );
}
