"use client";

import { useRouter, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { analytics } from "@/lib/segment/bus";
import { useCartStore } from "@/stores/cart-store";
import { trackKioskIdleReset } from "@/lib/analytics/events";
import { TourResumePill } from "@/components/tour/tour-resume-pill";

export function KioskTopChrome() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  if (pathname === "/kiosk") return null;

  async function handleStartOver() {
    trackKioskIdleReset();
    useCartStore.getState().clearCart();
    await analytics.reset();
    router.replace("/kiosk");
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 pt-4">
      <span className="pointer-events-auto rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
        Store #147 · Melbourne CBD
      </span>
      <div className="pointer-events-auto flex items-center gap-2">
        <TourResumePill />
        <button
          type="button"
          onClick={handleStartOver}
          className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[var(--dominos-red)] shadow"
        >
          <X className="h-4 w-4" />
          Start over
        </button>
      </div>
    </div>
  );
}
