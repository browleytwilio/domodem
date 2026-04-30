export type Surface = "Banner" | "Offer" | "Kiosk Banner" | "Toast";

export interface AtlasRow {
  id: string;
  name: string;
  trigger: string;
  surfaces: Surface[];
  persona: string;
  color: string;
}

export const AUDIENCE_ATLAS: AtlasRow[] = [
  {
    id: "high_value",
    name: "High-Value Customers",
    trigger: "Lifetime spend ≥ $100",
    surfaces: [],
    persona: "Sarah VIP",
    color: "bg-amber-500",
  },
  {
    id: "cart_abandoners",
    name: "Cart Abandoners",
    trigger: "Items in cart, no order yet this session",
    surfaces: ["Banner", "Offer", "Toast"],
    persona: "Dan Abandoner",
    color: "bg-orange-500",
  },
  {
    id: "deal_hunters",
    name: "Deal Hunters",
    trigger: "Viewed deals or applied a coupon",
    surfaces: ["Banner", "Offer"],
    persona: "Alex Deals",
    color: "bg-rose-500",
  },
  {
    id: "pizza_lovers",
    name: "Pizza Lovers",
    trigger: "Favourite category is pizzas",
    surfaces: ["Banner"],
    persona: "Browse pizzas",
    color: "bg-red-600",
  },
  {
    id: "vip_tier",
    name: "VIP Tier Members",
    trigger: "5+ orders or $200+ lifetime spend",
    surfaces: ["Banner", "Offer", "Kiosk Banner"],
    persona: "Sarah VIP",
    color: "bg-purple-600",
  },
  {
    id: "lapsed_customers",
    name: "Lapsed Customers",
    trigger: "Past customer, no order in 30+ days",
    surfaces: ["Banner"],
    persona: "Time-shifted VIP",
    color: "bg-slate-500",
  },
  {
    id: "new_visitors",
    name: "New Visitors",
    trigger: "Anonymous session with at least one event",
    surfaces: [],
    persona: "Anonymous",
    color: "bg-sky-500",
  },
  {
    id: "pickup_preferring",
    name: "Pickup-Preferring",
    trigger: "Chose pickup as delivery method",
    surfaces: ["Banner"],
    persona: "Manual pickup toggle",
    color: "bg-emerald-500",
  },
  {
    id: "delivery_preferring",
    name: "Delivery-Preferring",
    trigger: "Chose delivery as delivery method",
    surfaces: ["Banner"],
    persona: "Manual delivery toggle",
    color: "bg-teal-500",
  },
  {
    id: "builder_abandoners",
    name: "Pizza Builder Abandoners",
    trigger: "Opened the builder, didn't complete",
    surfaces: ["Banner", "Offer", "Kiosk Banner", "Toast"],
    persona: "Open builder",
    color: "bg-yellow-600",
  },
  {
    id: "builder_completers",
    name: "Pizza Builder Completers",
    trigger: "Finished a custom pizza",
    surfaces: ["Offer"],
    persona: "Complete builder",
    color: "bg-lime-600",
  },
  {
    id: "loyalty_engaged",
    name: "Loyalty Engaged",
    trigger: "Viewed loyalty program or redeemed points",
    surfaces: ["Banner", "Offer", "Kiosk Banner"],
    persona: "Sarah VIP",
    color: "bg-fuchsia-500",
  },
  {
    id: "repeat_customers",
    name: "Repeat Customers",
    trigger: "2–4 orders, below VIP thresholds",
    surfaces: ["Banner", "Offer", "Kiosk Banner"],
    persona: "Sarah VIP (bridge)",
    color: "bg-indigo-500",
  },
  {
    id: "authenticated_users",
    name: "Authenticated Users",
    trigger: "Completed a Signed In / Signed Up event",
    surfaces: ["Banner", "Offer"],
    persona: "Any signed-in",
    color: "bg-blue-600",
  },
  {
    id: "kiosk_users",
    name: "Kiosk Users",
    trigger: "Started a session on the in-store kiosk",
    surfaces: ["Banner", "Offer"],
    persona: "Visit /kiosk",
    color: "bg-cyan-600",
  },
  {
    id: "mobile_users",
    name: "Mobile App Users",
    trigger: "At least one event from the mobile surface",
    surfaces: ["Banner", "Offer"],
    persona: "Visit /m",
    color: "bg-pink-500",
  },
  {
    id: "multi_channel",
    name: "Multi-Channel Customers",
    trigger: "Events from 2+ surfaces (web, mobile, kiosk)",
    surfaces: ["Banner", "Offer", "Kiosk Banner"],
    persona: "Switch modes",
    color: "bg-violet-600",
  },
  {
    id: "high_cart_value_session",
    name: "High Cart Value (Session)",
    trigger: "Cart total $50 or more right now",
    surfaces: ["Banner", "Offer"],
    persona: "Add $50+ to cart",
    color: "bg-orange-600",
  },
  {
    id: "browse_abandoners",
    name: "Browse Abandoners",
    trigger: "Viewed 3+ products, added none",
    surfaces: ["Banner", "Offer", "Toast"],
    persona: "Browse 3+ products",
    color: "bg-stone-500",
  },
  {
    id: "video_engaged",
    name: "Video Engaged",
    trigger: "Started at least one video",
    surfaces: ["Banner", "Offer"],
    persona: "Play a video",
    color: "bg-red-500",
  },
  {
    id: "newsletter_subscribers",
    name: "Newsletter Subscribers",
    trigger: "Completed a newsletter signup",
    surfaces: ["Banner", "Offer"],
    persona: "Submit subscribe",
    color: "bg-green-600",
  },
];

export function colorById(id: string): string {
  return AUDIENCE_ATLAS.find((r) => r.id === id)?.color ?? "bg-slate-400";
}

export function nameById(id: string): string {
  return AUDIENCE_ATLAS.find((r) => r.id === id)?.name ?? id;
}
