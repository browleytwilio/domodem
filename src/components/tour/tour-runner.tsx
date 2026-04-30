"use client";

import { useEffect, useRef } from "react";
import { useTourStore } from "@/stores/tour-store";
import { useSegmentStore } from "@/stores/segment-store";
import { findAdventure } from "@/lib/tour/registry";
import { TourMultiSurface } from "./tour-multi-surface-client";
import type { AdventureId } from "@/lib/tour/types";

export function TourRunner({ adventureId }: { adventureId: AdventureId }) {
  const beatIndex = useTourStore((s) => s.beatIndex);
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
  const beat = adventure?.beats[beatIndex];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 text-white">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-widest text-rose-400">Tour &middot; in progress</p>
        <h1 className="mt-1 text-3xl font-black">{adventure?.title}</h1>
      </header>
      {beat?.kind === "multi-surface" ? (
        <TourMultiSurface focus={beat.focus} />
      ) : (
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-10 text-sm text-slate-300">
          <p>Follow the narrator panel on the right to advance.</p>
          <p className="mt-2 text-xs text-slate-500">
            Tip: if a spotlight is shown on the main site, the narrator will tell you
            what to click. When waiting, it advances automatically once the expected
            event fires.
          </p>
        </div>
      )}
    </div>
  );
}
