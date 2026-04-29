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
    audienceId: "cart_abandoners",
    headline: "Come back to your cart",
    subtext: "Complete your order now and we'll throw in free garlic bread.",
    cta: "Finish Checkout",
    href: "/checkout",
    gradient: "from-orange-500 to-[var(--dominos-red)]",
    badge: "Cart Abandoner",
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
    audienceId: "lapsed_customers",
    headline: "We miss you",
    subtext: "Take 20% off your next order with code WELCOMEBACK20.",
    cta: "Order Now",
    href: "/menu",
    gradient: "from-slate-700 to-[var(--dominos-dark-blue)]",
    badge: "Lapsed Customer",
  },
];

export function PersonalizationBanner() {
  const audiences = useSegmentStore((s) => s.audiences);
  const demoMode = useSegmentStore((s) => s.demoModeEnabled);
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
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 px-6 py-8 md:flex-row md:items-center md:justify-between md:py-10">
        <div className="flex flex-col gap-1.5 text-white">
          {demoMode && (
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              Personalized · {match.badge}
            </span>
          )}
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
