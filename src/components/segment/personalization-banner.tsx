"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useSegmentStore } from "@/stores/segment-store";

interface BannerCopy {
  audienceId: string;
  headline: string;
  subtext: string;
  cta: string;
  href: string;
  gradient: string;
  badge: string;
}

const COPY_BY_AUDIENCE: BannerCopy[] = [
  {
    audienceId: "vip_tier",
    headline: "Welcome back, VIP",
    subtext: "Your exclusive 3-large combo is waiting — $35.95 only for you.",
    cta: "Grab My VIP Deal",
    href: "/deals",
    gradient: "from-purple-700 to-[var(--dominos-dark-blue)]",
    badge: "VIP Tier",
  },
  {
    audienceId: "multi_channel",
    headline: "Same order, three screens",
    subtext: "Your cart follows you. Web, app, or kiosk — pick up where you left off.",
    cta: "Continue Order",
    href: "/checkout",
    gradient: "from-violet-600 to-[var(--dominos-blue)]",
    badge: "Multi-Channel",
  },
  {
    audienceId: "builder_abandoners",
    headline: "Your custom pizza is waiting",
    subtext: "One tap to finish what you started. We saved your toppings.",
    cta: "Finish My Pizza",
    href: "/menu",
    gradient: "from-yellow-600 to-[var(--dominos-red)]",
    badge: "Builder Abandoner",
  },
  {
    audienceId: "cart_abandoners",
    headline: "Come back to your cart",
    subtext: "Complete your order now and we'll throw in free garlic bread.",
    cta: "Finish Checkout",
    href: "/checkout",
    gradient: "from-orange-500 to-[var(--dominos-red)]",
    badge: "Cart Abandoner",
  },
  {
    audienceId: "high_cart_value_session",
    headline: "You're almost at free delivery",
    subtext: "Free delivery unlocks at $30. Add a side to save the fee.",
    cta: "Add a Side",
    href: "/menu",
    gradient: "from-orange-600 to-amber-500",
    badge: "High Cart Value",
  },
  {
    audienceId: "repeat_customers",
    headline: "Your usual? We've got it ready",
    subtext: "One-tap reorder from your last order. Delivery in 30 min.",
    cta: "Reorder Now",
    href: "/account/orders",
    gradient: "from-indigo-600 to-[var(--dominos-dark-blue)]",
    badge: "Repeat Customer",
  },
  {
    audienceId: "loyalty_engaged",
    headline: "You're close to the next tier",
    subtext: "Redeem your points now or bank them toward gold-tier rewards.",
    cta: "Redeem Points",
    href: "/account/loyalty",
    gradient: "from-fuchsia-600 to-purple-700",
    badge: "Loyalty Engaged",
  },
  {
    audienceId: "deal_hunters",
    headline: "More deals, just for you",
    subtext: "Exclusive coupons based on your favourites. Limited time.",
    cta: "See Deals",
    href: "/deals",
    gradient: "from-rose-500 to-[var(--dominos-red)]",
    badge: "Deal Hunter",
  },
  {
    audienceId: "pizza_lovers",
    headline: "Fresh pizza, your way",
    subtext: "Build your perfect pie with our premium toppings.",
    cta: "Build a Pizza",
    href: "/menu",
    gradient: "from-[var(--dominos-red)] to-[var(--dominos-dark-blue)]",
    badge: "Pizza Lover",
  },
  {
    audienceId: "browse_abandoners",
    headline: "Still deciding?",
    subtext: "Tonight's #1 seller: BBQ Meat Lovers. From $16.99.",
    cta: "See the Winner",
    href: "/menu",
    gradient: "from-stone-600 to-stone-800",
    badge: "Browse Abandoner",
  },
  {
    audienceId: "newsletter_subscribers",
    headline: "Subscriber-only: 2-for-1 Tuesdays",
    subtext: "Exclusive weekly drop — only for newsletter members.",
    cta: "Unlock Offer",
    href: "/deals",
    gradient: "from-green-600 to-emerald-700",
    badge: "Subscriber",
  },
  {
    audienceId: "video_engaged",
    headline: "Hungry now?",
    subtext: "Skip ahead — order the pizza you just watched in two clicks.",
    cta: "Order It",
    href: "/menu",
    gradient: "from-red-600 to-[var(--dominos-red)]",
    badge: "Video Engaged",
  },
  {
    audienceId: "kiosk_users",
    headline: "Delivered tonight, same as in-store",
    subtext: "You've ordered at the kiosk before. Same menu, your door.",
    cta: "Order Delivery",
    href: "/menu",
    gradient: "from-cyan-600 to-[var(--dominos-blue)]",
    badge: "Kiosk User",
  },
  {
    audienceId: "mobile_users",
    headline: "Got the app?",
    subtext: "Reorder your last in two taps. Faster than the website.",
    cta: "Open App",
    href: "/m",
    gradient: "from-pink-500 to-rose-600",
    badge: "Mobile User",
  },
  {
    audienceId: "lapsed_customers",
    headline: "We miss you",
    subtext: "Take 20% off your next order with code WELCOMEBACK20.",
    cta: "Order Now",
    href: "/menu",
    gradient: "from-slate-700 to-[var(--dominos-dark-blue)]",
    badge: "Lapsed Customer",
  },
  {
    audienceId: "delivery_preferring",
    headline: "Free delivery over $30",
    subtext: "Your favourite way — delivered fresh in 30 minutes.",
    cta: "Start Order",
    href: "/menu",
    gradient: "from-teal-600 to-[var(--dominos-blue)]",
    badge: "Delivery Preferring",
  },
  {
    audienceId: "pickup_preferring",
    headline: "Pickup in 15 min — skip the fee",
    subtext: "Your local store is ready. Order now, collect fresh.",
    cta: "Order Pickup",
    href: "/store-locator",
    gradient: "from-emerald-600 to-teal-700",
    badge: "Pickup Preferring",
  },
  {
    audienceId: "authenticated_users",
    headline: "Welcome back",
    subtext: "Your saved addresses and payment methods are ready.",
    cta: "Start an Order",
    href: "/menu",
    gradient: "from-blue-600 to-[var(--dominos-dark-blue)]",
    badge: "Signed In",
  },
];

export function PersonalizationBanner() {
  const audiences = useSegmentStore((s) => s.audiences);
  const demoMode = useSegmentStore((s) => s.demoModeEnabled);

  if (!demoMode) return null;

  const memberIds = new Set(audiences.map((a) => a.id));
  const match = COPY_BY_AUDIENCE.find((c) => memberIds.has(c.audienceId));
  if (!match) return null;

  return (
    <motion.section
      key={match.audienceId}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative w-full overflow-hidden bg-gradient-to-r ${match.gradient}`}
      aria-label="Personalized banner"
      data-tour-id="tour-personalization-banner"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 px-6 py-8 md:flex-row md:items-center md:justify-between md:py-10">
        <div className="flex flex-col gap-1.5 text-white">
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="h-3 w-3" />
            Personalized · {match.badge}
          </span>
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
            {match.headline}
          </h2>
          <p className="max-w-xl text-sm text-white/85 sm:text-base">
            {match.subtext}
          </p>
        </div>
        <Link
          href={match.href}
          className="inline-flex items-center rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-[var(--dominos-red)] shadow transition-transform hover:scale-105"
        >
          {match.cta}
        </Link>
      </div>
    </motion.section>
  );
}
