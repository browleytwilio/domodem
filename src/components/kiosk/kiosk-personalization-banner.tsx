"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useSegmentStore } from "@/stores/segment-store";

interface KioskBannerCopy {
  audienceId: string;
  headline: string;
  subtext: string;
  badge: string;
  gradient: string;
}

const COPY: KioskBannerCopy[] = [
  {
    audienceId: "multi_channel",
    headline: "Found you — picking up where you left off",
    subtext: "Your cart is already synced from your other screens.",
    badge: "Multi-Channel",
    gradient: "from-violet-600 to-[var(--dominos-blue)]",
  },
  {
    audienceId: "vip_tier",
    headline: "Welcome back. Your usual is one tap away.",
    subtext: "VIP members get first look at tonight's premium range.",
    badge: "VIP Tier",
    gradient: "from-purple-700 to-[var(--dominos-dark-blue)]",
  },
  {
    audienceId: "repeat_customers",
    headline: "Reorder from last time?",
    subtext: "We'll fire it up — same toppings, same store.",
    badge: "Repeat Customer",
    gradient: "from-indigo-600 to-[var(--dominos-dark-blue)]",
  },
  {
    audienceId: "loyalty_engaged",
    headline: "You've got points",
    subtext: "Redeem at checkout for any side on the menu, free.",
    badge: "Loyalty Engaged",
    gradient: "from-fuchsia-600 to-purple-700",
  },
  {
    audienceId: "builder_abandoners",
    headline: "Finish the pizza you started on the app?",
    subtext: "We saved every topping. One tap to add it to this order.",
    badge: "Builder Abandoner",
    gradient: "from-yellow-600 to-[var(--dominos-red)]",
  },
];

export function KioskPersonalizationBanner() {
  const demoMode = useSegmentStore((s) => s.demoModeEnabled);
  const audiences = useSegmentStore((s) => s.audiences);

  if (!demoMode) return null;

  const memberIds = new Set(audiences.map((a) => a.id));
  const match = COPY.find((c) => memberIds.has(c.audienceId));
  if (!match) return null;

  return (
    <motion.section
      key={match.audienceId}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative w-full overflow-hidden bg-gradient-to-r ${match.gradient} text-white`}
      aria-label="Kiosk personalized banner"
    >
      <div className="flex items-center justify-between gap-6 px-8 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm">
              Personalized · {match.badge}
            </span>
            <h2 className="text-2xl font-black leading-tight">
              {match.headline}
            </h2>
            <p className="text-sm text-white/90">{match.subtext}</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
