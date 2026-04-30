import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdventureId } from "@/lib/tour/types";

interface TourState {
  active: AdventureId | null;
  beatIndex: number;
  guestName: string;
  completed: AdventureId[];
  dismissed: boolean;
  panelCollapsed: boolean;
  startedAt: number | null;

  startAdventure: (id: AdventureId, guestName?: string) => void;
  advance: () => void;
  goToBeat: (index: number) => void;
  exit: (opts?: { markComplete?: boolean }) => void;
  toggleCollapse: () => void;
  reset: () => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set, get) => ({
      active: null,
      beatIndex: 0,
      guestName: "",
      completed: [],
      dismissed: false,
      panelCollapsed: false,
      startedAt: null,

      startAdventure: (id, guestName) =>
        set({
          active: id,
          beatIndex: 0,
          guestName: guestName ?? get().guestName,
          dismissed: false,
          panelCollapsed: false,
          startedAt: Date.now(),
        }),

      advance: () => set((s) => ({ beatIndex: s.beatIndex + 1 })),

      goToBeat: (index) => set({ beatIndex: Math.max(0, index) }),

      exit: (opts) =>
        set((s) => {
          const id = s.active;
          const markComplete = opts?.markComplete === true && id !== null;
          const nextCompleted =
            markComplete && !s.completed.includes(id)
              ? [...s.completed, id]
              : s.completed;
          return {
            active: null,
            beatIndex: 0,
            dismissed: !markComplete,
            startedAt: null,
            completed: nextCompleted,
          };
        }),

      toggleCollapse: () =>
        set((s) => ({ panelCollapsed: !s.panelCollapsed })),

      reset: () =>
        set({
          active: null,
          beatIndex: 0,
          guestName: "",
          completed: [],
          dismissed: false,
          panelCollapsed: false,
          startedAt: null,
        }),
    }),
    {
      name: "dominos-tour-state",
      partialize: (s) => ({
        active: s.active,
        beatIndex: s.beatIndex,
        guestName: s.guestName,
        completed: s.completed,
        dismissed: s.dismissed,
        panelCollapsed: s.panelCollapsed,
        startedAt: s.startedAt,
      }),
    },
  ),
);
