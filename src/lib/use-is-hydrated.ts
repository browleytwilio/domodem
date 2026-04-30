"use client";

import { useSyncExternalStore } from "react";

// Stable empty subscribe — the hydration flag flips exactly once per client
// mount via React's SSR snapshot, not via an observed store.
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Returns `false` during SSR and the initial client render, `true` after
 * hydration. Replaces the common `useState(false) + useEffect(setMounted)`
 * pattern without triggering the React 19 `set-state-in-effect` lint.
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
