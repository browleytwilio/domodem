// src/lib/segment/bus.ts
import { AnalyticsBrowser } from "@segment/analytics-next";
import type { LoggedEvent } from "./types";
import { useSegmentStore } from "@/stores/segment-store";

const writeKey = process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY || "";

const realAnalytics = AnalyticsBrowser.load(
  { writeKey },
  { initialPageview: false },
);

const CHANNEL_NAME = "segment-demo-events";

let sharedChannel: BroadcastChannel | null = null;
function channel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }
  if (sharedChannel) return sharedChannel;
  sharedChannel = new BroadcastChannel(CHANNEL_NAME);
  return sharedChannel;
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function getIdentity(): Promise<{ userId: string | null; anonymousId: string | null }> {
  try {
    const [a] = await realAnalytics;
    const user = a.user();
    return {
      userId: user.id() ?? null,
      anonymousId: user.anonymousId() ?? null,
    };
  } catch {
    return { userId: null, anonymousId: null };
  }
}

function record(event: LoggedEvent) {
  useSegmentStore.getState().appendEvent(event);
  channel()?.postMessage(event);
}

export const analytics = {
  async track(name: string, properties?: object): Promise<void> {
    const { userId, anonymousId } = await getIdentity();
    const event: LoggedEvent = {
      id: newId(),
      kind: "track",
      name,
      userId,
      anonymousId,
      properties: properties as Record<string, unknown> | undefined,
      timestamp: new Date().toISOString(),
      receivedAt: Date.now(),
    };
    record(event);
    await realAnalytics.track(name, properties);
  },

  async identify(userId: string, traits?: object): Promise<void> {
    const { anonymousId } = await getIdentity();
    const event: LoggedEvent = {
      id: newId(),
      kind: "identify",
      userId,
      anonymousId,
      traits: traits as Record<string, unknown> | undefined,
      timestamp: new Date().toISOString(),
      receivedAt: Date.now(),
    };
    record(event);
    const store = useSegmentStore.getState();
    store.setIdentity(userId, anonymousId);
    if (traits) store.mergeTraits(traits as Record<string, unknown>);
    await realAnalytics.identify(userId, traits);
  },

  async page(
    category?: string,
    name?: string,
    properties?: object,
  ): Promise<void> {
    const { userId, anonymousId } = await getIdentity();
    const event: LoggedEvent = {
      id: newId(),
      kind: "page",
      name: name ?? "Page Viewed",
      userId,
      anonymousId,
      properties: { category, ...(properties as Record<string, unknown> | undefined) },
      timestamp: new Date().toISOString(),
      receivedAt: Date.now(),
    };
    record(event);
    await realAnalytics.page(category, name, properties);
  },

  async group(groupId: string, traits?: object): Promise<void> {
    const { userId, anonymousId } = await getIdentity();
    const event: LoggedEvent = {
      id: newId(),
      kind: "group",
      userId,
      anonymousId,
      groupId,
      traits: traits as Record<string, unknown> | undefined,
      timestamp: new Date().toISOString(),
      receivedAt: Date.now(),
    };
    record(event);
    await realAnalytics.group(groupId, traits);
  },

  async alias(userId: string, previousId?: string): Promise<void> {
    const { anonymousId } = await getIdentity();
    const event: LoggedEvent = {
      id: newId(),
      kind: "alias",
      userId,
      anonymousId,
      previousId,
      timestamp: new Date().toISOString(),
      receivedAt: Date.now(),
    };
    record(event);
    await realAnalytics.alias(userId, previousId);
  },

  async reset(): Promise<void> {
    const event: LoggedEvent = {
      id: newId(),
      kind: "reset",
      timestamp: new Date().toISOString(),
      receivedAt: Date.now(),
    };
    record(event);
    useSegmentStore.getState().resetIdentity();
    const [a] = await realAnalytics;
    a.reset();
  },
};

export const realAnalyticsPromise = realAnalytics;
