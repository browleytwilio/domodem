// src/stores/segment-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  LoggedEvent,
  AudienceMembership,
  ComputedTraits,
  JourneyStage,
  JourneyState,
} from "@/lib/segment/types";
import { loadEvents, saveEvents, clearEvents, EVENT_LOG_MAX } from "@/lib/segment/storage";

const DEFAULT_COMPUTED: ComputedTraits = {
  lifetime_orders: 0,
  lifetime_spend: 0,
  avg_order_value: 0,
  cart_item_count: 0,
  cart_value: 0,
  session_event_count: 0,
  has_applied_coupon: false,
  has_viewed_deals: false,
};

const DEFAULT_JOURNEY: JourneyState = {
  stage: "visitor",
  enteredAt: new Date().toISOString(),
  history: [{ stage: "visitor", at: new Date().toISOString() }],
};

interface SegmentState {
  // data
  events: LoggedEvent[];
  audiences: AudienceMembership[];
  computedTraits: ComputedTraits;
  journey: JourneyState;
  userId: string | null;
  anonymousId: string | null;
  traits: Record<string, unknown>;

  // demo ui state (persisted)
  demoModeEnabled: boolean;
  inspectorOpen: boolean;
  inspectorTab: "events" | "audiences" | "identity" | "journey" | "computed";
  eventFilter: { kind?: string; query?: string };

  // actions
  appendEvent: (event: LoggedEvent) => void;
  hydrateEvents: () => void;
  clear: () => void;
  setAudiences: (audiences: AudienceMembership[]) => void;
  setComputedTraits: (traits: ComputedTraits) => void;
  setJourney: (journey: JourneyState) => void;
  advanceJourney: (stage: JourneyStage) => void;
  setIdentity: (userId: string | null, anonymousId: string | null) => void;
  mergeTraits: (traits: Record<string, unknown>) => void;
  resetIdentity: () => void;
  setDemoMode: (enabled: boolean) => void;
  setInspectorOpen: (open: boolean) => void;
  setInspectorTab: (tab: SegmentState["inspectorTab"]) => void;
  setEventFilter: (filter: SegmentState["eventFilter"]) => void;
}

export const useSegmentStore = create<SegmentState>()(
  persist(
    (set) => ({
      events: [],
      audiences: [],
      computedTraits: DEFAULT_COMPUTED,
      journey: DEFAULT_JOURNEY,
      userId: null,
      anonymousId: null,
      traits: {},
      demoModeEnabled: true,
      inspectorOpen: false,
      inspectorTab: "events",
      eventFilter: {},

      appendEvent: (event) =>
        set((state) => {
          const next = [...state.events, event].slice(-EVENT_LOG_MAX);
          saveEvents(next);
          return { events: next };
        }),

      hydrateEvents: () => {
        const existing = loadEvents();
        if (existing.length > 0) set({ events: existing });
      },

      clear: () => {
        clearEvents();
        const now = new Date().toISOString();
        set({
          events: [],
          audiences: [],
          computedTraits: DEFAULT_COMPUTED,
          journey: {
            stage: "visitor",
            enteredAt: now,
            history: [{ stage: "visitor", at: now }],
          },
          traits: {},
        });
      },

      setAudiences: (audiences) => set({ audiences }),
      setComputedTraits: (computedTraits) => set({ computedTraits }),
      setJourney: (journey) => set({ journey }),
      advanceJourney: (stage) =>
        set((state) => {
          if (state.journey.stage === stage) return state;
          const now = new Date().toISOString();
          return {
            journey: {
              stage,
              enteredAt: now,
              history: [...state.journey.history, { stage, at: now }],
            },
          };
        }),

      setIdentity: (userId, anonymousId) => set({ userId, anonymousId }),
      mergeTraits: (traits) =>
        set((state) => ({ traits: { ...state.traits, ...traits } })),
      resetIdentity: () =>
        set({ userId: null, traits: {} }),

      setDemoMode: (enabled) => set({ demoModeEnabled: enabled }),
      setInspectorOpen: (inspectorOpen) => set({ inspectorOpen }),
      setInspectorTab: (inspectorTab) => set({ inspectorTab }),
      setEventFilter: (eventFilter) => set({ eventFilter }),
    }),
    {
      name: "segment-demo-ui",
      partialize: (state) => ({
        demoModeEnabled: state.demoModeEnabled,
        inspectorTab: state.inspectorTab,
      }),
    },
  ),
);
