"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useSegmentStore } from "@/stores/segment-store";

const IDLE_MS = 45_000;

export function CartAbandonmentNudge() {
  const audiences = useSegmentStore((s) => s.audiences);
  const demoMode = useSegmentStore((s) => s.demoModeEnabled);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!demoMode) return;
    const isAbandoner = audiences.some((a) => a.id === "cart_abandoners");
    if (!isAbandoner || firedRef.current) return;

    const timer = setTimeout(() => {
      firedRef.current = true;
      toast("Don't forget your cart!", {
        description: "Complete your order in the next 10 min for free garlic bread.",
        action: {
          label: "Checkout",
          onClick: () => {
            if (typeof window !== "undefined") {
              window.location.href = "/checkout";
            }
          },
        },
        duration: 15_000,
      });
    }, IDLE_MS);

    return () => clearTimeout(timer);
  }, [audiences, demoMode]);

  return null;
}
