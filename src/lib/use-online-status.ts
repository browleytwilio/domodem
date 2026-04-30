"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

const getSnapshot = () => navigator.onLine;
// SSR default — assume online so server-rendered markup matches the common case.
const getServerSnapshot = () => true;

/**
 * Returns `true` while the browser reports an online connection, `false`
 * otherwise. SSR-safe via `useSyncExternalStore`.
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
