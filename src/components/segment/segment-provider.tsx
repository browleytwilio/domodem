"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/stores/cart-store";
import { useSegmentStore } from "@/stores/segment-store";
import { analytics } from "@/lib/segment/bus";
import { computeTraits, evaluateAudiences } from "@/lib/segment/audiences";
import { classifyStage } from "@/lib/segment/journey";
import { setupCartBroadcast } from "@/lib/segment/cart-broadcast";
import { useIsHydrated } from "@/lib/use-is-hydrated";
import { DemoFab } from "./demo-fab";
import { DemoToolbar } from "./demo-toolbar";
import { EventInspector } from "./event-inspector";
import { AudienceToastNudge } from "./audience-toast-nudge";

export function SegmentProvider({ children }: { children: React.ReactNode }) {
  const hydrateEvents = useSegmentStore((s) => s.hydrateEvents);
  const events = useSegmentStore((s) => s.events);
  const traits = useSegmentStore((s) => s.traits);
  const userId = useSegmentStore((s) => s.userId);
  const audiences = useSegmentStore((s) => s.audiences);
  const demoMode = useSegmentStore((s) => s.demoModeEnabled);
  const setAudiences = useSegmentStore((s) => s.setAudiences);
  const setComputedTraits = useSegmentStore((s) => s.setComputedTraits);
  const advanceJourney = useSegmentStore((s) => s.advanceJourney);
  const prevAudiencesRef = useRef(audiences);
  const mounted = useIsHydrated();

  useEffect(() => {
    return setupCartBroadcast();
  }, []);

  const cartItems = useCartStore((s) => s.items);
  const cartItemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartValue = cartItems.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0,
  );

  useEffect(() => {
    hydrateEvents();
  }, [hydrateEvents]);

  useEffect(() => {
    const computed = computeTraits({
      events,
      cartItemCount,
      cartValue,
    });
    setComputedTraits(computed);

    const { current, entered, exited } = evaluateAudiences(
      events,
      traits,
      computed,
      userId,
      prevAudiencesRef.current,
    );

    for (const def of entered) {
      analytics.track("Audience Entered", {
        audience_id: def.id,
        audience_name: def.name,
      });
    }
    for (const def of exited) {
      analytics.track("Audience Exited", {
        audience_id: def.id,
        audience_name: def.name,
      });
    }

    setAudiences(current);
    prevAudiencesRef.current = current;

    const stage = classifyStage(events, computed);
    advanceJourney(stage);
  }, [
    events,
    cartItemCount,
    cartValue,
    traits,
    userId,
    setAudiences,
    setComputedTraits,
    advanceJourney,
  ]);

  return (
    <>
      {children}
      {mounted && demoMode && (
        <>
          <DemoToolbar />
          <DemoFab />
          <EventInspector />
          <AudienceToastNudge />
        </>
      )}
    </>
  );
}
