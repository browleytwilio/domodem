// src/lib/segment/bus.ts
import { AnalyticsBrowser } from "@segment/analytics-next";
import type { LoggedEvent } from "./types";
import { useSegmentStore } from "@/stores/segment-store";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import { resolveSourceFromPath, appNameForSource } from "./source";

const ECOMMERCE_EVENT_PATTERNS = [
  /^Product /, /^Products /, /^Cart /, /^Checkout /, /^Order /, /^Coupon /,
  /^Promotion /, /^Deal /, /^Payment /, /^Store /,
];

function isEcommerceEvent(name: string): boolean {
  return ECOMMERCE_EVENT_PATTERNS.some((rx) => rx.test(name));
}

function buildContextProperties(eventName: string): Record<string, unknown> {
  const ctx: Record<string, unknown> = {};
  if (typeof window !== "undefined") {
    ctx.source_page = window.location.pathname;
    const source = resolveSourceFromPath(window.location.pathname);
    ctx.source = source;
    ctx.app_name = appNameForSource(source);
  }
  if (isEcommerceEvent(eventName)) {
    const cart = useCartStore.getState();
    const ui = useUIStore.getState();
    ctx.cart_item_count = cart.items.reduce((s, i) => s + i.quantity, 0);
    ctx.cart_value = cart.items.reduce(
      (s, i) => s + i.unitPrice * i.quantity,
      0,
    );
    ctx.delivery_method = ui.deliveryMethod;
    if (ui.selectedStore) {
      ctx.selected_store_id = ui.selectedStore.id;
    }
  }
  return ctx;
}

const writeKey = process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY || "";
const analyticsEnabled = writeKey.length > 0;

// When no write key is configured, pass `disable: true` so the SDK returns a
// NullAnalytics instance. Otherwise it would attempt to load CDN settings from
// `/v1/projects//settings`, which rejects and breaks every .track/.identify
// await downstream. The local store + inspector are the source of truth for
// the demo regardless of whether the real SDK is enabled.
const realAnalytics = AnalyticsBrowser.load(
  { writeKey: writeKey || "demo-placeholder" },
  {
    initialPageview: false,
    disable: !analyticsEnabled,
  },
);

if (typeof window !== "undefined") {
  if (analyticsEnabled) {
    console.info("[segment] Analytics enabled");
  } else {
    console.info(
      "[segment] Analytics disabled — NEXT_PUBLIC_SEGMENT_WRITE_KEY not set; demo runs locally",
    );
  }
}

async function safeAwait<T>(p: PromiseLike<T>): Promise<T | null> {
  try {
    return await p;
  } catch (err) {
    console.warn("[segment] SDK call failed (demo unaffected):", err);
    return null;
  }
}

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
  // Prefer the store: it's updated synchronously by identify()/reset(), so
  // subsequent track() calls always see the latest identity even before the
  // real SDK's async identify has resolved.
  const state = useSegmentStore.getState();
  if (state.userId || state.anonymousId) {
    return { userId: state.userId, anonymousId: state.anonymousId };
  }
  const resolved = await safeAwait(realAnalytics);
  if (!resolved) return { userId: null, anonymousId: null };
  try {
    const [a] = resolved;
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
    const merged: Record<string, unknown> = {
      ...buildContextProperties(name),
      ...((properties as Record<string, unknown> | undefined) ?? {}),
    };
    const event: LoggedEvent = {
      id: newId(),
      kind: "track",
      name,
      userId,
      anonymousId,
      properties: merged,
      timestamp: new Date().toISOString(),
      receivedAt: Date.now(),
    };
    record(event);
    await safeAwait(realAnalytics.track(name, merged));
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
    await safeAwait(realAnalytics.identify(userId, traits));
  },

  async page(
    category?: string,
    name?: string,
    properties?: object,
  ): Promise<void> {
    const { userId, anonymousId } = await getIdentity();
    const merged: Record<string, unknown> = {
      ...buildContextProperties("Page Viewed"),
      ...(category !== undefined && { category }),
      ...((properties as Record<string, unknown> | undefined) ?? {}),
    };
    const event: LoggedEvent = {
      id: newId(),
      kind: "page",
      name: name ?? "Page Viewed",
      userId,
      anonymousId,
      properties: merged,
      timestamp: new Date().toISOString(),
      receivedAt: Date.now(),
    };
    record(event);
    await safeAwait(realAnalytics.page(category, name, merged));
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
    await safeAwait(realAnalytics.group(groupId, traits));
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
    await safeAwait(realAnalytics.alias(userId, previousId));
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
    const resolved = await safeAwait(realAnalytics);
    if (resolved) {
      try {
        resolved[0].reset();
      } catch {
        // demo unaffected
      }
    }
  },
};

export const realAnalyticsPromise = realAnalytics;
