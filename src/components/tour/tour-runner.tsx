"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { useTourStore } from "@/stores/tour-store";
import { useSegmentStore } from "@/stores/segment-store";
import { findAdventure } from "@/lib/tour/registry";
import type { AdventureId } from "@/lib/tour/types";

export function TourRunner({ adventureId }: { adventureId: AdventureId }) {
  const setDemoMode = useSegmentStore((s) => s.setDemoMode);
  const startedRef = useRef<AdventureId | null>(null);

  useEffect(() => {
    setDemoMode(true);
    if (startedRef.current === adventureId) return;
    const { active, startAdventure } = useTourStore.getState();
    if (active !== adventureId) {
      startAdventure(adventureId);
    }
    startedRef.current = adventureId;
  }, [adventureId, setDemoMode]);

  const adventure = findAdventure(adventureId);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <Sparkles className="h-6 w-6 text-rose-400" />
        <p className="text-xs uppercase tracking-widest text-rose-400">Tour &middot; starting</p>
        <h1 className="text-2xl font-black">{adventure?.title}</h1>
        <p className="text-sm text-slate-400">
          Follow the narrator panel on the right. Just click Next — we&apos;ll drive the site for you.
        </p>
      </div>
    </div>
  );
}
