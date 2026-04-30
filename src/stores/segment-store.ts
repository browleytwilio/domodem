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
import { analyticsEnabled } from "@/lib/segment/config";

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSave(events: LoggedEvent[]) {
  if (typeof window === "undefined") {
    saveEvents(events);
    return;
  }
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    saveEvents(events);
  }, 300);
}

const DEFAULT_COMPUTED: ComputedTraits = {
  lifetime_orders: 0,
  lifetime_spend: 0,
  avg_order_value: 0,
  cart_item_count: 0,
  cart_value: 0,
  session_event_count: 0,
  has_applied_coupon: false,
  has_viewed_deals: false,
  has_viewed_loyalty: false,
  has_redeemed_points: false,
  has_subscribed_newsletter: false,
  has_played_video: false,
  has_opened_builder: false,
  has_completed_builder: false,
  product_view_count: 0,
  product_add_count: 0,
  is_authenticated: false,
  sources_used: [],
  web_event_count: 0,
  mobile_event_count: 0,
  kiosk_event_count: 0,
};

function makeDefaultJourney(): JourneyState {
  const now = new Date().toISOString();
  return {
    stage: "visitor",
    enteredAt: now,
    history: [{ stage: "visitor", at: now }],
  };
}

const DEFAULT_JOURNEY: JourneyState = makeDefaultJourney();

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
      demoModeEnabled: !analyticsEnabled,
      inspectorOpen: false,
      inspectorTab: "events",
      eventFilter: {},

      appendEvent: (event) =>
        set((state) => {
          const next = [...state.events, event].slice(-EVENT_LOG_MAX);
          scheduleSave(next);
          return { events: next };
        }),

      hydrateEvents: () => {
        const existing = loadEvents();
        if (existing.length === 0) return;
        set((state) => (state.events.length === 0 ? { events: existing } : state));
      },

      clear: () => {
        clearEvents();
        set({
          events: [],
          audiences: [],
          computedTraits: DEFAULT_COMPUTED,
          journey: makeDefaultJourney(),
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
        set({
          userId: null,
          anonymousId: null,
          traits: {},
          audiences: [],
          computedTraits: DEFAULT_COMPUTED,
          journey: makeDefaultJourney(),
        }),

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
        userId: state.userId,
        anonymousId: state.anonymousId,
        traits: state.traits,
        audiences: state.audiences,
        computedTraits: state.computedTraits,
        journey: state.journey,
      }),
    },
  ),
);
