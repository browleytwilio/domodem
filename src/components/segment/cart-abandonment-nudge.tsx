"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useSegmentStore } from "@/stores/segment-store";

const IDLE_MS = 45_000;

export function CartAbandonmentNudge() {
  const isAbandoner = useSegmentStore((s) =>
    s.audiences.some((a) => a.id === "cart_abandoners"),
  );
  const demoMode = useSegmentStore((s) => s.demoModeEnabled);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!demoMode || !isAbandoner || firedRef.current) return;

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
  }, [isAbandoner, demoMode]);

  return null;
}
