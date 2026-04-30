"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useSegmentStore } from "@/stores/segment-store";
import { useTourStore } from "@/stores/tour-store";

interface ToastDef {
  audienceId: string;
  idleMs: number;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  duration?: number;
}

const TOASTS: ToastDef[] = [
  {
    audienceId: "cart_abandoners",
    idleMs: 45_000,
    title: "Don't forget your cart!",
    description:
      "Complete your order in the next 10 min for free garlic bread.",
    ctaLabel: "Checkout",
    ctaHref: "/checkout",
    duration: 15_000,
  },
  {
    audienceId: "builder_abandoners",
    idleMs: 30_000,
    title: "Finish your custom pizza?",
    description: "We saved your toppings. One click to resume and add to cart.",
    ctaLabel: "Finish",
    ctaHref: "/menu",
    duration: 15_000,
  },
  {
    audienceId: "browse_abandoners",
    idleMs: 60_000,
    title: "Can't decide?",
    description: "Try our top 3 sellers tonight — hand-picked for you.",
    ctaLabel: "Show Me",
    ctaHref: "/menu",
    duration: 12_000,
  },
];

export function AudienceToastNudge() {
  const demoMode = useSegmentStore((s) => s.demoModeEnabled);
  const audiences = useSegmentStore((s) => s.audiences);
  const tourActive = useTourStore((s) => s.active !== null);
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!demoMode) return;

    const memberIds = new Set(audiences.map((a) => a.id));
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (const def of TOASTS) {
      if (firedRef.current.has(def.audienceId)) continue;
      if (!memberIds.has(def.audienceId)) continue;

      const idleMs = tourActive ? Math.min(def.idleMs, 15_000) : def.idleMs;

      const timer = setTimeout(() => {
        firedRef.current.add(def.audienceId);
        toast(def.title, {
          id: `tour-audience-toast-${def.audienceId}`,
          className: "tour-audience-toast",
          description: def.description,
          action: {
            label: def.ctaLabel,
            onClick: () => {
              if (typeof window !== "undefined") {
                window.location.href = def.ctaHref;
              }
            },
          },
          duration: def.duration ?? 15_000,
        });
      }, idleMs);

      timers.push(timer);
    }

    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [audiences, demoMode, tourActive]);

  return null;
}
