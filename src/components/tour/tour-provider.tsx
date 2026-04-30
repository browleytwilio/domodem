"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useTourStore } from "@/stores/tour-store";
import { useSegmentStore } from "@/stores/segment-store";
import { useIsHydrated } from "@/lib/use-is-hydrated";
import { findAdventure } from "@/lib/tour/registry";
import { makeTourContext } from "@/lib/tour/adventures";
import { analytics } from "@/lib/segment/bus";
import {
  trackTourBeatAdvanced,
  trackTourCompleted,
  trackTourExited,
} from "@/lib/analytics/events";
import { NarratorPanel } from "./narrator-panel";
import { SpotlightOverlay } from "./spotlight-overlay";
import { TourInboxModal } from "./tour-inbox-modal";

export function TourProvider() {
  const mounted = useIsHydrated();
  const active = useTourStore((s) => s.active);
  const beatIndex = useTourStore((s) => s.beatIndex);
  const collapsed = useTourStore((s) => s.panelCollapsed);
  const advance = useTourStore((s) => s.advance);
  const exit = useTourStore((s) => s.exit);
  const toggleCollapse = useTourStore((s) => s.toggleCollapse);
  const startedAt = useTourStore((s) => s.startedAt);

  const router = useRouter();
  const runningActionRef = useRef<number>(-1);
  const advanceRef = useRef(advance);
  const runNextRef = useRef<() => void>(() => {});
  useEffect(() => {
    advanceRef.current = advance;
  }, [advance]);
  const [runningOnBeat, setRunningOnBeat] = useState<number | null>(null);
  const handleNextRef = useRef<() => void | Promise<void>>(() => {});
  useEffect(() => {
    runNextRef.current = () => {
      void handleNextRef.current();
    };
  }, []);

  const adventure = active ? findAdventure(active) : undefined;
  const beat = adventure?.beats[beatIndex];

  const actionRunning = runningOnBeat === beatIndex;

  useEffect(() => {
    if (!adventure || !beat) return;
    if (beat.kind !== "action") return;
    if (beat.advance !== "auto") return;
    if (runningActionRef.current === beatIndex) return;
    runningActionRef.current = beatIndex;
    const ctx = makeTourContext(router, analytics);
    (async () => {
      try {
        await beat.do(ctx);
      } catch (err) {
        console.warn("[tour] action beat failed:", err);
      } finally {
        trackTourBeatAdvanced({
          adventure_id: adventure.id,
          beat_index: beatIndex,
          beat_kind: beat.kind,
        });
        advanceRef.current();
      }
    })();
  }, [adventure, beat, beatIndex, router]);

  useEffect(() => {
    if (!adventure || !beat) return;
    if (beat.kind !== "spotlight") return;
    if (beat.advance === "click" || beat.advance === "auto") return;
    const onEvent = beat.advance.onEvent;

    const unsub = useSegmentStore.subscribe((state, prev) => {
      if (state.events.length <= prev.events.length) return;
      const latest = state.events[state.events.length - 1];
      if (latest.kind !== "track" || latest.name !== onEvent) return;
      trackTourBeatAdvanced({
        adventure_id: adventure.id,
        beat_index: beatIndex,
        beat_kind: beat.kind,
      });
      advanceRef.current();
    });
    return () => unsub();
  }, [adventure, beat, beatIndex]);

  useEffect(() => {
    if (!adventure) return;
    if (beatIndex < adventure.beats.length) return;
    const elapsed = startedAt ? Date.now() - startedAt : 0;
    trackTourCompleted({ adventure_id: adventure.id, elapsed_ms: elapsed });
    exit({ markComplete: true });
  }, [adventure, beatIndex, startedAt, exit]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        toggleCollapse();
        return;
      }
      if (e.key !== "ArrowRight") return;
      runNextRef.current();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [toggleCollapse]);

  const isClickGatedAction =
    !!beat && beat.kind === "action" && beat.advance === "click";

  const canAdvanceByClick =
    !actionRunning &&
    !!beat &&
    (beat.kind === "narrate" ||
      (beat.kind === "spotlight" && beat.advance === "click") ||
      isClickGatedAction);

  const handleNext = async () => {
    if (!adventure || !beat) return;
    if (actionRunning) return;

    if (beat.kind === "action" && beat.advance === "click") {
      setRunningOnBeat(beatIndex);
      const ctx = makeTourContext(router, analytics);
      try {
        await beat.do(ctx);
      } catch (err) {
        console.warn("[tour] action beat failed:", err);
      }
      trackTourBeatAdvanced({
        adventure_id: adventure.id,
        beat_index: beatIndex,
        beat_kind: beat.kind,
      });
      setRunningOnBeat(null);
      advanceRef.current();
      return;
    }

    trackTourBeatAdvanced({
      adventure_id: adventure.id,
      beat_index: beatIndex,
      beat_kind: beat.kind,
    });
    advance();
  };

  useEffect(() => {
    handleNextRef.current = handleNext;
  });

  if (!mounted || !adventure || !beat) return null;

  function handleExit() {
    if (!adventure) return;
    trackTourExited({
      adventure_id: adventure.id,
      beat_index: beatIndex,
      reason: "user_dismissed",
    });
    exit();
  }

  return (
    <AnimatePresence>
      {beat.kind === "spotlight" && !collapsed && (
        <SpotlightOverlay
          target={beat.target}
          copy={beat.copy}
          onNext={beat.advance === "click" ? handleNext : undefined}
          waitingForEvent={beat.advance !== "click"}
        />
      )}
      <NarratorPanel
        adventure={adventure}
        beatIndex={beatIndex}
        beat={beat}
        collapsed={collapsed}
        canAdvanceByClick={canAdvanceByClick}
        onNext={handleNext}
        onExit={handleExit}
        onToggleCollapse={toggleCollapse}
      />
      <TourInboxModal />
    </AnimatePresence>
  );
}
