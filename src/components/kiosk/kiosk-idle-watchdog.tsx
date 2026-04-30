"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { analytics } from "@/lib/segment/bus";
import { useCartStore } from "@/stores/cart-store";
import { trackKioskIdleReset } from "@/lib/analytics/events";

const IDLE_MS = 90_000;

export function KioskIdleWatchdog({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pathname === "/kiosk") return;

    function reset() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        trackKioskIdleReset();
        useCartStore.getState().clearCart();
        await analytics.reset();
        router.replace("/kiosk");
      }, IDLE_MS);
    }

    const events: Array<keyof DocumentEventMap> = [
      "pointerdown",
      "pointermove",
      "keydown",
      "scroll",
      "wheel",
      "touchstart",
    ];
    events.forEach((ev) =>
      document.addEventListener(ev, reset, {
        passive: true,
      } as AddEventListenerOptions),
    );
    reset();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((ev) => document.removeEventListener(ev, reset));
    };
  }, [pathname, router]);

  return <>{children}</>;
}
