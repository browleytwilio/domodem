"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useTourStore } from "@/stores/tour-store";
import { useIsHydrated } from "@/lib/use-is-hydrated";

export function TourResumePill() {
  const mounted = useIsHydrated();
  const active = useTourStore((s) => s.active);
  if (!mounted || !active) return null;

  return (
    <Link
      href={`/tour/${active}`}
      className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white shadow hover:opacity-90"
    >
      <Sparkles className="h-3.5 w-3.5" />
      Resume tour
    </Link>
  );
}
