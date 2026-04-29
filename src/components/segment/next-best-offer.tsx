"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSegmentStore } from "@/stores/segment-store";

interface Offer {
  title: string;
  description: string;
  cta: string;
  href: string;
  reason: string;
}

export function NextBestOffer() {
  const demoMode = useSegmentStore((s) => s.demoModeEnabled);
  const computed = useSegmentStore((s) => s.computedTraits);
  const audiences = useSegmentStore((s) => s.audiences);
  const memberIds = new Set(audiences.map((a) => a.id));

  if (!demoMode) return null;

  let offer: Offer;
  if (memberIds.has("vip_tier")) {
    offer = {
      title: "VIP Exclusive — 3 Premium Pizzas $35.95",
      description: "Our Premium range, all yours at a VIP price. Members only.",
      cta: "Claim VIP Deal",
      href: "/deals",
      reason: "VIP audience match",
    };
  } else if (memberIds.has("cart_abandoners")) {
    offer = {
      title: "Complete your order — free garlic bread",
      description: "We've saved your cart. Check out now and garlic bread is on us.",
      cta: "Resume Checkout",
      href: "/checkout",
      reason: "Cart abandoner signal",
    };
  } else if (computed.favorite_category === "pizzas") {
    offer = {
      title: "Build a custom pizza",
      description: "Based on your pizza browsing, try the builder — 20+ toppings, 4 crusts.",
      cta: "Start Building",
      href: "/product/pepperoni",
      reason: "Favorite category = pizzas",
    };
  } else if (memberIds.has("deal_hunters")) {
    offer = {
      title: "Lunch Combo $9.95",
      description: "Personal pizza + side + drink. Your favourite kind of deal.",
      cta: "Grab Lunch",
      href: "/deals",
      reason: "Deal Hunter audience",
    };
  } else {
    offer = {
      title: "Any 3 Pizzas $29.95",
      description: "Mix & match Traditional range. Pickup or delivery.",
      cta: "See Deal",
      href: "/deals",
      reason: "Default recommendation",
    };
  }

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
