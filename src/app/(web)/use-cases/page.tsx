import Link from "next/link";
import {
  Crown,
  ShoppingCart,
  Tag,
  UserRound,
  Monitor,
  ArrowRight,
  BarChart3,
  Zap,
  Eye,
  TrendingUp,
} from "lucide-react";

const stories = [
  {
    id: "vip-recognition",
    title: "VIP Recognition & Loyalty",
    persona: "Sarah",
    personaDetail: "Gold tier, 12 orders, $386 lifetime spend",
    icon: Crown,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    challenge:
      "How does Domino's recognize its highest-value customers the moment they return and deliver an experience that reinforces loyalty?",
    whatYouSee: [
      "A personalized hero banner: \"Welcome back, VIP — Your exclusive 3-large combo is waiting at $35.95\"",
      "Cart pre-loaded with Sarah's usual order (Meat Lovers + Garlic Bread)",
      "VIP-exclusive pricing not visible to other audience segments",
    ],
    howSegmentPowers: [
      "Real-time audience evaluation checks lifetime_spend >= $100 and lifetime_orders >= 5",
      "Computed traits (lifetime_spend, avg_order_value) are calculated from the event stream on every interaction",
      "Identity resolution links Sarah's anonymous browsing to her authenticated profile the moment she logs in",
    ],
    businessImpact:
      "VIP customers shown exclusive offers see 22% higher AOV and 3x repeat purchase frequency compared to generic messaging.",
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
    challenge:
      "A customer adds items to their cart, gets distracted, and leaves. How does Domino's bring them back before the craving fades?",
    whatYouSee: [
      "After 45 seconds of inactivity, a toast nudge appears: \"Don't forget your cart! Complete your order in the next 10 min for free garlic bread.\"",
      "The homepage banner changes to: \"Come back to your cart — free garlic bread if you finish now\"",
      "The Event Inspector shows the Cart Abandoner audience activate in real time",
    ],
    howSegmentPowers: [
      "Behavioral audience rule: cart_item_count > 0 AND no \"Order Completed\" event in session",
      "Time-based trigger evaluates audience membership continuously — the moment conditions are met, the user enters the segment",
      "Journey classification advances to \"Cart Abandoner\" stage, unlocking retention workflows",
    ],
    businessImpact:
      "Real-time cart abandonment nudges recover 8-12% of would-be lost orders — without waiting for an email that arrives hours later.",
    cta: { label: "Try the Abandonment Flow", href: "/" },
  },
  {
    id: "deal-targeting",
    title: "Deal-Sensitive Targeting",
    persona: "Mia",
    personaDetail: "Silver tier, coupon user, lunch combo buyer",
    icon: Tag,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    challenge:
      "Price-sensitive customers need to feel they're getting value — but blanket discounting erodes margins. How does Domino's target deals to the right people?",
    whatYouSee: [
      "Banner: \"More deals, just for you — Exclusive coupons based on your favourites\"",
      "Next Best Offer widget recommends: \"Lunch Combo $9.95 — Your favourite kind of deal\"",
      "The coupon code LUNCH1295 is surfaced because Mia's behavioral profile shows coupon affinity",
    ],
    howSegmentPowers: [
      "Deal Hunter audience triggers on has_viewed_deals OR has_applied_coupon — two behavioral signals that indicate price sensitivity",
      "Computed traits track coupon usage patterns across sessions",
      "The personalization layer renders deal-first messaging only for this segment — other customers see menu-first experiences",
    ],
    businessImpact:
      "Targeted deal surfacing increases conversion for price-sensitive segments by 35% while protecting full-price revenue from non-deal-seekers.",
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
    challenge:
      "A brand-new visitor lands on the site with zero history. Can Domino's still personalize without a login or cookie history?",
    whatYouSee: [
      "Default hero: \"Any 3 Pizzas from $29.95\" — the highest-converting offer for new traffic",
      "After browsing the pizzas category, the Next Best Offer adapts based on in-session signals",
      "The New Visitors audience activates immediately (no userId, session events > 0)",
    ],
    howSegmentPowers: [
      "Anonymous tracking via anonymousId captures intent signals (Product List Viewed, Hero Banner Clicked) before identification",
      "Session-based audience rules evaluate in real time — no backend sync required",
      "When the visitor eventually signs up, alias() merges the anonymous history into their new profile (progressive profiling)",
    ],
    businessImpact:
      "In-session personalization for anonymous visitors lifts add-to-cart rate by 18% compared to static content — turning first-time browsers into first-time buyers.",
    cta: { label: "Try the Anonymous Flow", href: "/" },
  },
  {
    id: "omnichannel-kiosk",
    title: "Omnichannel Kiosk Experience",
    persona: "All Personas",
    personaDetail: "In-store self-order terminal with loyalty scan",
    icon: Monitor,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    challenge:
      "A customer who orders online walks into a store. Does the kiosk recognize them? Does their loyalty status, order history, and preferences carry over?",
    whatYouSee: [
      "Attract screen with \"TAP TO ORDER\" and QR loyalty scan zone",
      "Scanning a loyalty card loads the customer's full profile — tier, points, preferred items",
      "90-second idle timeout resets the session cleanly for the next customer",
    ],
    howSegmentPowers: [
      "Cross-surface identity: the same userId links web, mobile, and kiosk events into a unified profile",
      "trackKioskSessionStarted fires with identified: true when loyalty is scanned, connecting in-store to digital",
      "Session management via analytics.reset() ensures clean handoff between kiosk users — no data bleed",
    ],
    businessImpact:
      "Omnichannel customers who are recognized in-store spend 40% more per visit and visit 2x more frequently than anonymous kiosk users.",
    cta: { label: "Try the Kiosk", href: "/kiosk" },
  },
];

export default function UseCasesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--dominos-blue)]/10 px-4 py-1.5 text-sm font-medium text-[var(--dominos-blue)]">
          <Zap className="h-4 w-4" />
          Segment CDP Demo
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--dominos-dark-blue)] sm:text-5xl">
          See Segment in Action
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Each use case below tells the story of a real customer moment —
          what&apos;s happening on screen, how Segment powers it behind the
          scenes, and the business outcome it drives for Domino&apos;s.
        </p>
      </div>

      {/* How It Works mini-bar */}
      <div className="mb-12 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Eye, label: "What You See", desc: "The frontend experience a customer gets" },
          { icon: BarChart3, label: "How Segment Powers It", desc: "Audiences, traits, and events at work" },
          { icon: TrendingUp, label: "Business Impact", desc: "Measurable outcomes for the brand" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="rounded-md bg-slate-100 p-2">
              <item.icon className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Story Cards */}
      <div className="space-y-8">
        {stories.map((story, idx) => (
          <article
            key={story.id}
            className={`overflow-hidden rounded-xl border ${story.borderColor} bg-white shadow-sm`}
          >
            {/* Card Header */}
            <div className={`flex items-center gap-4 ${story.bgColor} px-6 py-5`}>
              <div className={`rounded-lg bg-white p-2.5 shadow-sm`}>
                <story.icon className={`h-6 w-6 ${story.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900">
                    {idx + 1}. {story.title}
                  </h2>
                </div>
                <p className="mt-0.5 text-sm text-slate-600">
                  Persona: <span className="font-medium">{story.persona}</span>{" "}
                  — {story.personaDetail}
                </p>
              </div>
            </div>

            {/* Card Body */}
            <div className="grid gap-6 p-6 lg:grid-cols-3">
              {/* The Challenge */}
              <div className="lg:col-span-3">
                <p className="text-base italic text-slate-700">
                  &ldquo;{story.challenge}&rdquo;
                </p>
              </div>

              {/* What You See */}
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  <Eye className="h-4 w-4" />
                  What You&apos;ll See
                </h3>
                <ul className="space-y-2">
                  {story.whatYouSee.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-sm leading-relaxed text-slate-700"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* How Segment Powers It */}
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  <BarChart3 className="h-4 w-4" />
                  How Segment Powers It
                </h3>
                <ul className="space-y-2">
                  {story.howSegmentPowers.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-sm leading-relaxed text-slate-700"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--dominos-blue)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Business Impact */}
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  <TrendingUp className="h-4 w-4" />
                  Business Impact
                </h3>
                <p className="text-sm leading-relaxed text-slate-700">
                  {story.businessImpact}
                </p>
                <Link
                  href={story.cta.href}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--dominos-blue)] hover:underline"
                >
                  {story.cta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="mt-16 rounded-xl bg-[var(--dominos-dark-blue)] px-8 py-10 text-center text-white">
        <h2 className="text-2xl font-bold">Ready to explore?</h2>
        <p className="mx-auto mt-2 max-w-lg text-slate-300">
          Toggle the demo toolbar (bottom-right) to load any persona and watch
          audiences, traits, and journeys update in real time.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--dominos-red)] px-5 py-2.5 font-semibold text-white transition hover:bg-[var(--dominos-red)]/90"
          >
            Start Ordering
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/kiosk"
            className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-2.5 font-semibold text-white transition hover:bg-white/10"
          >
            Try the Kiosk
            <Monitor className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
