"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTourStore } from "@/stores/tour-store";
import { useIsHydrated } from "@/lib/use-is-hydrated";

export function TourFab() {
  const mounted = useIsHydrated();
  const active = useTourStore((s) => s.active);
  const pathname = usePathname() ?? "";

  if (!mounted) return null;
  if (active !== null) return null;
  if (pathname.startsWith("/tour")) return null;
  if (pathname.startsWith("/kiosk")) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="pointer-events-none fixed bottom-5 left-5 z-40"
    >
      <Link
        href="/tour"
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[var(--dominos-red)] px-4 py-3 text-sm font-semibold text-white shadow-xl ring-1 ring-black/10 transition-transform hover:scale-[1.03] active:scale-[0.97]"
        aria-label="Start the self-demo tour"
      >
        <Sparkles className="h-4 w-4" />
        Start tour
      </Link>
    </motion.div>
  );
}
