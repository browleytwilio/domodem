// src/lib/segment/types.ts
export type EventKind =
  | "track"
  | "identify"
  | "page"
  | "group"
  | "alias"
  | "reset";

export interface LoggedEvent {
  id: string;
  kind: EventKind;
  name?: string;                 // event name (track) / page name (page) / undefined
  userId?: string | null;
  anonymousId?: string | null;
  properties?: Record<string, unknown>;
  traits?: Record<string, unknown>;
  groupId?: string;
  previousId?: string;           // alias source
  timestamp: string;             // ISO
  receivedAt: number;            // ms epoch
}

export type AudienceMatcher = (ctx: AudienceContext) => boolean;

export interface AudienceContext {
  events: LoggedEvent[];
  traits: Record<string, unknown>;
  computedTraits: ComputedTraits;
  userId: string | null;
}

export interface AudienceDefinition {
  id: string;
  name: string;
  description: string;
  color: string;                  // Tailwind bg-* class for the badge
  match: AudienceMatcher;
}

export interface AudienceMembership {
  id: string;
  name: string;
  enteredAt: string;
}

export interface ComputedTraits {
  lifetime_orders: number;
  lifetime_spend: number;
  avg_order_value: number;
  last_order_at?: string;
  days_since_last_order?: number;
  favorite_category?: string;
  cart_item_count: number;
  cart_value: number;
  session_event_count: number;
  has_applied_coupon: boolean;
  has_viewed_deals: boolean;
  has_viewed_loyalty: boolean;
  has_redeemed_points: boolean;
  has_subscribed_newsletter: boolean;
  has_played_video: boolean;
  has_opened_builder: boolean;
  has_completed_builder: boolean;
  product_view_count: number;
  product_add_count: number;
  is_authenticated: boolean;
  sources_used: string[];
  web_event_count: number;
  mobile_event_count: number;
  kiosk_event_count: number;
  tours_completed_count: number;
}

export type JourneyStage =
  | "visitor"
  | "engaged"
  | "cart_abandoner"
  | "customer"
  | "repeat_customer"
  | "vip";

export interface JourneyState {
  stage: JourneyStage;
  enteredAt: string;
  history: { stage: JourneyStage; at: string }[];
}
