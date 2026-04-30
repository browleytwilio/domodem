"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { QrCode } from "lucide-react";
import { KioskPersonaPicker } from "./kiosk-persona-picker";
import { trackKioskSessionStarted } from "@/lib/analytics/events";
import { analytics } from "@/lib/segment/bus";

export function KioskAttractScreen() {
  const router = useRouter();
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    analytics.page(undefined, "Kiosk Attract");
  }, []);

  function handleTapAnywhere(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("[data-kiosk-qr]")) return;
    trackKioskSessionStarted({ identified: false });
    router.push("/kiosk/menu");
  }

  return (
    <div
      onClick={handleTapAnywhere}
      className="relative flex h-full items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--dominos-dark-blue)] via-[var(--dominos-blue)] to-[var(--dominos-red)] text-white"
    >
      <div
        className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5"
        aria-hidden
      />
      <div
        className="absolute -bottom-32 -left-20 h-[28rem] w-[28rem] rounded-full bg-white/5"
        aria-hidden
      />

      <div className="relative flex flex-col items-center gap-4 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-white/70">
          Domino&apos;s · Self-Order
        </p>
        <motion.h1
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-7xl font-black tracking-tight"
        >
          TAP TO ORDER
        </motion.h1>
        <p className="text-lg text-white/85">Fresh. Fast. Fired up.</p>
      </div>

      <button
        type="button"
        data-kiosk-qr
        onClick={(e) => {
          e.stopPropagation();
          setShowPicker(true);
        }}
        className="absolute bottom-20 right-12 flex items-center gap-3 rounded-2xl border-2 border-dashed border-white/50 bg-white/10 px-5 py-3 text-left backdrop-blur"
      >
        <QrCode className="h-10 w-10" />
        <span className="flex flex-col">
          <span className="text-xs uppercase tracking-wider text-white/70">
            Scan for VIP rewards
          </span>
          <span className="text-sm font-bold">Tap to simulate scan →</span>
        </span>
      </button>

      <KioskPersonaPicker
        open={showPicker}
        onClose={() => setShowPicker(false)}
      />
    </div>
  );
}
