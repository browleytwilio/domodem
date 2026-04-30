// src/lib/segment/storage.ts
import type { LoggedEvent } from "./types";
import { analyticsEnabled } from "./config";

const KEY = "segment-demo-event-log";
const MAX = 500;

export function loadEvents(): LoggedEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LoggedEvent[];
    return Array.isArray(parsed) ? parsed.slice(-MAX) : [];
  } catch {
    return [];
  }
}

export function saveEvents(events: LoggedEvent[]): void {
  if (typeof window === "undefined") return;
  if (analyticsEnabled) return;
  try {
    const trimmed = events.slice(-MAX);
    window.localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    // quota exceeded — drop oldest half and retry once
    try {
      const half = events.slice(-Math.floor(MAX / 2));
      window.localStorage.setItem(KEY, JSON.stringify(half));
    } catch {
      // give up silently; in-memory store still works
    }
  }
}

export function clearEvents(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export const EVENT_LOG_MAX = MAX;
