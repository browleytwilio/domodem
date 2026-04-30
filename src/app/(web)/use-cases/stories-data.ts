import type { LucideIcon } from "lucide-react";
import {
  Crown,
  ShoppingCart,
  Tag,
  UserRound,
  Monitor,
  Globe,
  Pizza,
  Sparkles,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

export interface Story {
  id: string;
  title: string;
  persona: string;
  personaDetail: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  audienceIds: string[];
  challenge: string;
  whatYouSee: string[];
  howSegmentPowers: string[];
  businessImpact: string;
  tryIt: string[];
  cta: { label: string; href: string };
}

export const STORIES: Story[] = [
  {
    id: "vip-recognition",
    title: "VIP Recognition & Loyalty",
    persona: "Sarah",
    personaDetail: "Gold tier, 12 orders, $386 lifetime spend",
    icon: Crown,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    audienceIds: ["vip_tier", "authenticated_users", "loyalty_engaged", "repeat_customers"],
    challenge:
      "How does Domino's recognize its highest-value customers the moment they return and deliver an experience that reinforces loyalty?",
    whatYouSee: [
      "A personalized hero banner: \"Welcome back, VIP — Your exclusive 3-large combo is waiting at $35.95\"",
      "Cart pre-loaded with Sarah's usual order (Meat Lovers + Garlic Bread)",
      "Kiosk banner on /kiosk/menu reads \"Welcome back. Your usual is one tap away.\"",
    ],
    howSegmentPowers: [
      "Real-time audience evaluation checks lifetime_spend ≥ $100 and lifetime_orders ≥ 5",
      "Computed traits (lifetime_spend, avg_order_value) are calculated from the event stream on every interaction",
      "Identity resolution links Sarah's anonymous browsing to her authenticated profile the moment she logs in",
    ],
    businessImpact:
      "VIP customers shown exclusive offers see 22% higher AOV and 3× repeat purchase frequency compared to generic messaging.",
    tryIt: [
      "Open the Demo Toolbar (bottom-right pill).",
      "Under \"Load persona\", click Sarah VIP. Wait for the toast confirmation.",
      "Navigate to / — the purple VIP banner renders with her headline and CTA.",
      "Open /menu — the Next Best Offer shows \"VIP audience match\" as the reason.",
      "Switch to /kiosk/menu — the kiosk banner greets her by tier.",
    ],
    cta: { label: "Try the VIP Flow", href: "/" },
  },
  {
    id: "cart-abandonment",
    title: "Cart Abandonment Recovery",
    persona: "Dan",
    personaDetail: "Bronze tier, 2 items in cart, left before checkout",
    icon: ShoppingCart,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    audienceIds: ["cart_abandoners"],
    challenge:
      "A customer adds items to their cart, gets distracted, and leaves. How does Domino's bring them back before the craving fades?",
    whatYouSee: [
      "After 45 seconds of inactivity, a toast nudge appears: \"Don't forget your cart! Complete your order in the next 10 min for free garlic bread.\"",
      "The homepage banner changes to: \"Come back to your cart — free garlic bread if you finish now\"",
      "The Event Inspector shows the Cart Abandoner audience activate in real time",
    ],
    howSegmentPowers: [
      "Behavioural audience rule: cart_item_count > 0 AND no \"Order Completed\" event in session",
      "Membership re-evaluates on every event — the moment conditions flip, the user enters the segment",
      "Journey classification advances to \"Cart Abandoner\" stage, unlocking retention workflows",
    ],
    businessImpact:
      "Real-time cart abandonment nudges recover 8–12% of would-be lost orders — without waiting for an email that arrives hours later.",
    tryIt: [
      "Open the Demo Toolbar → Load persona → Dan Abandoner.",
      "Land on / — the orange cart banner appears immediately.",
      "Wait 45 seconds without touching the page.",
      "The toast nudge pops with the 'Don't forget your cart!' message.",
      "Click Checkout inside the toast to complete the recovery flow.",
    ],
    cta: { label: "Try the Abandonment Flow", href: "/" },
  },
  {
    id: "deal-targeting",
    title: "Deal-Sensitive Targeting",
    persona: "Alex",
    personaDetail: "Silver tier, coupon user, lunch combo buyer",
    icon: Tag,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    audienceIds: ["deal_hunters"],
    challenge:
      "Price-sensitive customers need to feel they're getting value — but blanket discounting erodes margins. How does Domino's target deals to the right people?",
    whatYouSee: [
      "Banner: \"More deals, just for you — Exclusive coupons based on your favourites\"",
      "Next Best Offer widget recommends: \"Lunch Combo $9.95 — Deal Hunter audience\"",
      "The coupon code LUNCH1295 is surfaced because Alex's behavioural profile shows coupon affinity",
    ],
    howSegmentPowers: [
      "Deal Hunter audience triggers on has_viewed_deals OR has_applied_coupon — two behavioural signals that indicate price sensitivity",
      "Computed traits track coupon usage patterns across sessions",
      "The personalization layer renders deal-first messaging only for this segment — other customers see menu-first experiences",
    ],
    businessImpact:
      "Targeted deal surfacing increases conversion for price-sensitive segments by 35% while protecting full-price revenue from non-deal-seekers.",
    tryIt: [
      "Open the Demo Toolbar → Load persona → Alex Deals.",
      "Banner on / shifts to \"More deals, just for you\".",
      "Open /menu — the Next Best Offer reads \"Deal Hunter audience\" in its reason pill.",
      "Open /deals — matching offers are highlighted first.",
    ],
    cta: { label: "Try the Deals Flow", href: "/deals" },
  },
  {
    id: "cold-start",
    title: "Cold-Start Personalization",
    persona: "Anonymous Visitor",
    personaDetail: "No account, first visit, browsing pizzas",
    icon: UserRound,
    color: "text-sky-600",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
    audienceIds: ["new_visitors", "browse_abandoners"],
    challenge:
      "A brand-new visitor lands on the site with zero history. Can Domino's still personalize without a login or cookie history?",
    whatYouSee: [
      "Default hero: \"Any 3 Pizzas from $29.95\" — the highest-converting offer for new traffic",
      "After viewing 3+ products without adding any, the Browse Abandoners toast fires after 60s",
      "The New Visitors audience activates immediately (no userId, session events > 0)",
    ],
    howSegmentPowers: [
      "Anonymous tracking via anonymousId captures intent signals (Product List Viewed, Hero Banner Clicked) before identification",
      "Session-based audience rules evaluate in real time — no backend sync required",
      "When the visitor eventually signs up, alias() merges the anonymous history into their new profile (progressive profiling)",
    ],
    businessImpact:
      "In-session personalization for anonymous visitors lifts add-to-cart rate by 18% compared to static content — turning first-time browsers into first-time buyers.",
    tryIt: [
      "Reset demo state from the Demo Toolbar (Reset → confirm).",
      "Open /menu and click into 3–4 products without adding any to cart.",
      "Wait 60 seconds — the Browse Abandoners toast fires.",
      "Open the Event Inspector and filter to the last 10 events — all show source:\"web\" + anonymousId.",
    ],
    cta: { label: "Try the Anonymous Flow", href: "/" },
  },
  {
    id: "omnichannel-kiosk",
    title: "Omnichannel Kiosk Experience",
    persona: "Scan-to-Identify",
    personaDetail: "In-store self-order terminal with loyalty scan",
    icon: Monitor,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    audienceIds: ["kiosk_users", "vip_tier"],
    challenge:
      "A customer who orders online walks into a store. Does the kiosk recognize them? Does their loyalty status, order history, and preferences carry over?",
    whatYouSee: [
      "Attract screen with \"TAP TO ORDER\" and a corner QR card labelled \"Scan for VIP rewards\"",
      "Tapping the QR opens a persona picker — pick Sarah and the full VIP profile loads (tier, points, preferred items)",
      "90-second idle timeout resets the session cleanly for the next customer",
    ],
    howSegmentPowers: [
      "Cross-surface identity: the same userId links web, mobile, and kiosk events into a unified profile",
      "trackKioskSessionStarted fires with identified:true when the QR flow finishes, connecting in-store to digital",
      "analytics.reset() on idle ensures clean handoff between kiosk users — no data bleed",
    ],
    businessImpact:
      "Omnichannel customers who are recognized in-store spend 40% more per visit and visit 2× more frequently than anonymous kiosk users.",
    tryIt: [
      "Open /kiosk — attract screen pulses.",
      "Tap the QR card bottom-right — the persona picker overlays.",
      "Select Sarah VIP — the kiosk navigates to /kiosk/menu, cart pre-loaded.",
      "Open Event Inspector from any window — the Kiosk Session Started event has source:\"kiosk\".",
    ],
    cta: { label: "Try the Kiosk", href: "/kiosk" },
  },
  {
    id: "cross-channel",
    title: "Cross-Channel Continuity",
    persona: "Any Persona",
    personaDetail: "Same user, three surfaces — web, mobile app, kiosk",
    icon: Globe,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    audienceIds: ["multi_channel", "mobile_users", "kiosk_users"],
    challenge:
      "Customers start an order on their phone, finish at a kiosk, or bounce between devices. How does the experience stay coherent across every surface?",
    whatYouSee: [
      "A cart added on /m appears in / and /kiosk/menu within a second (BroadcastChannel sync)",
      "Every event carries app_name and source properties so web/mobile/kiosk attribution is visible in the Inspector",
      "Once a user hits 2+ surfaces, the Multi-Channel banner wins priority on all three",
    ],
    howSegmentPowers: [
      "BroadcastChannel mirrors cart state across tabs without a backend round-trip",
      "context.app.name is auto-set in the analytics bus from the current pathname",
      "Per-source counts in ComputedTraits (web_event_count, mobile_event_count, kiosk_event_count) power the multi_channel audience rule",
    ],
    businessImpact:
      "Multi-surface customers have 45% higher 90-day LTV and convert on follow-up orders 2× faster than single-surface customers.",
    tryIt: [
      "Open /, /m, and /kiosk/menu in three browser windows side-by-side.",
      "Load any persona in one window — identity propagates via persist.",
      "Add an item to cart in the mobile window — watch it appear in the other two.",
      "After fire events on all three surfaces, the Multi-Channel banner promotes to top priority.",
    ],
    cta: { label: "Try Multi-Channel", href: "/" },
  },
  {
    id: "builder-abandonment",
    title: "Custom Build Abandonment",
    persona: "Pizza Builder User",
    personaDetail: "Started the pizza builder, dropped off mid-way",
    icon: Pizza,
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    audienceIds: ["builder_abandoners", "builder_completers"],
    challenge:
      "Custom pizzas convert higher than menu items — but only if the customer finishes. How does Domino's recover abandoned builds and reward completions?",
    whatYouSee: [
      "After opening the builder without completing, the Pizza Builder Abandoners banner appears on /",
      "30 seconds of idle triggers a toast: \"Finish your custom pizza? We saved your toppings.\"",
      "If the build is completed, audience flips to Builder Completers — the Next Best Offer promotes a free crust swap",
    ],
    howSegmentPowers: [
      "Distinct Pizza Builder Opened and Pizza Builder Completed events in the tracking plan",
      "Audience membership flips the instant the second event lands — single pass through evaluateAudiences",
      "Computed traits has_opened_builder / has_completed_builder remove the need for per-surface state",
    ],
    businessImpact:
      "Recovered builder sessions convert 28% more often than re-engagement emails, with a higher attach rate on sides and drinks.",
    tryIt: [
      "Open /menu and click Customise on any pizza.",
      "Pick a size and crust, add one topping.",
      "Leave the builder without pressing Add to Cart.",
      "Wait 30 seconds — the Builder Abandoners toast fires.",
      "Return to / — the yellow builder banner is now rendered.",
    ],
    cta: { label: "Open the Builder", href: "/menu" },
  },
  {
    id: "loyalty-upgrade",
    title: "Loyalty Tier Upgrade Moment",
    persona: "Sarah VIP",
    personaDetail: "Gold tier, points balance ready to redeem",
    icon: Sparkles,
    color: "text-fuchsia-600",
    bgColor: "bg-fuchsia-50",
    borderColor: "border-fuchsia-200",
    audienceIds: ["loyalty_engaged", "vip_tier", "authenticated_users"],
    challenge:
      "Loyalty programs fail when customers forget their points balance. How does Domino's surface the redeem-or-upgrade moment at the exact right time?",
    whatYouSee: [
      "Banner on / reads \"You're close to the next tier. Redeem now.\"",
      "Kiosk banner on /kiosk/menu says \"You've got points. Redeem at checkout.\"",
      "Next Best Offer shows \"Redeem 500 pts for any side, free.\"",
    ],
    howSegmentPowers: [
      "Loyalty Program Viewed and Loyalty Points Redeemed events flip the loyalty_engaged audience",
      "Cross-channel means the kiosk reflects the latest balance without an API poll",
      "VIP stacking: authenticated + loyalty_engaged + vip_tier all activate simultaneously — the banner priority still surfaces the single most relevant hero",
    ],
    businessImpact:
      "Prompting redemption at visit-time boosts loyalty engagement 3× and bumps next-order frequency by 18%.",
    tryIt: [
      "Load Sarah VIP from the Demo Toolbar.",
      "Visit /account/loyalty — the Loyalty Program Viewed event fires.",
      "Return to / — the fuchsia loyalty banner renders.",
      "Switch to /kiosk/menu — kiosk banner shows the points-ready copy.",
    ],
    cta: { label: "View Loyalty", href: "/account/loyalty" },
  },
  {
    id: "repeat-customer",
    title: "Repeat Customer Re-engagement",
    persona: "Sarah VIP",
    personaDetail: "2+ past orders, bridging toward lapsed if ignored",
    icon: RefreshCw,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    audienceIds: ["repeat_customers", "lapsed_customers", "authenticated_users"],
    challenge:
      "The messy middle — customers who aren't VIPs but have history. One missed prompt and they slip into lapsed. How do we keep them engaged?",
    whatYouSee: [
      "Banner: \"Your usual? We've got it ready.\" on / for repeat customers",
      "On /m, a Reorder strip on the Home tab shows the top 3 items from their history",
      "If 30+ days pass since the last order, the audience flips to lapsed and a 20% off banner fires instead",
    ],
    howSegmentPowers: [
      "lifetime_orders and days_since_last_order computed traits separate repeat (2–4 orders) from VIP (5+) from lapsed (30+ days)",
      "Bridge audiences prevent overlap — a single customer only falls into one bucket at a time",
      "Win-back messaging only fires for authenticated_users so anonymous sessions aren't spammed",
    ],
    businessImpact:
      "Targeted reorder prompts for repeat customers lift 14-day repurchase rate by 24%.",
    tryIt: [
      "Load Sarah VIP from the Demo Toolbar.",
      "Visit /m/account and confirm she's signed in.",
      "Open /m — the Reorder strip is populated from her history.",
      "Return to / — the indigo repeat customer banner is visible.",
    ],
    cta: { label: "See Reorder Flow", href: "/m" },
  },
  {
    id: "high-cart-value",
    title: "High-Value Session Upsell",
    persona: "Hot Session",
    personaDetail: "Current cart $50+ — high intent, unsent",
    icon: TrendingUp,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    audienceIds: ["high_cart_value_session", "pizza_lovers"],
    challenge:
      "High-intent sessions cross the free-delivery threshold with room to spare. One small side could bring the customer under or over the line. How do we capture that moment?",
    whatYouSee: [
      "Banner on / reads \"You're almost at free delivery. Add a side.\"",
      "Next Best Offer recommends garlic bread or a drink with the delta value visible",
      "The trigger is real-time: cart_value crosses $50 and the audience fires instantly",
    ],
    howSegmentPowers: [
      "cart_value is a computed trait derived live from cart state, not stored server-side",
      "Audience membership flips synchronously — no webhook, no polling",
      "The offer reason pill shows \"High cart value ($50+)\" so the SE can demo the signal clearly",
    ],
    businessImpact:
      "Upsells at the free-delivery threshold recover 60% of sessions that would have settled for a paid-delivery order, protecting margin per-ticket.",
    tryIt: [
      "Reset demo state from the Demo Toolbar.",
      "Open /menu and add three large pizzas to the cart (cart_value crosses $50).",
      "Return to / — the orange high-value banner renders.",
      "Open /menu again — the Next Best Offer promotes a side with the delta to free delivery.",
    ],
    cta: { label: "Browse Menu", href: "/menu" },
  },
];
