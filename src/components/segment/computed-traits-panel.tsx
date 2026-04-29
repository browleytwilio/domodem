"use client";

import { Calculator } from "lucide-react";
import { useSegmentStore } from "@/stores/segment-store";

export function ComputedTraitsPanel() {
  const c = useSegmentStore((s) => s.computedTraits);

  const rows: { label: string; value: string }[] = [
    { label: "Lifetime orders", value: String(c.lifetime_orders) },
    { label: "Lifetime spend", value: `$${c.lifetime_spend.toFixed(2)}` },
    { label: "Avg order value", value: `$${c.avg_order_value.toFixed(2)}` },
    {
      label: "Days since last order",
      value:
        c.days_since_last_order !== undefined
          ? String(c.days_since_last_order)
          : "—",
    },
    { label: "Favorite category", value: c.favorite_category ?? "—" },
    { label: "Cart items", value: String(c.cart_item_count) },
    { label: "Cart value", value: `$${c.cart_value.toFixed(2)}` },
    { label: "Events this session", value: String(c.session_event_count) },
    { label: "Applied a coupon", value: c.has_applied_coupon ? "Yes" : "No" },
    { label: "Viewed deals", value: c.has_viewed_deals ? "Yes" : "No" },
  ];

  return (
    <div className="flex flex-col gap-3 p-6 text-sm">
      <div className="flex items-center gap-2">
        <Calculator className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">Computed Traits</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        These traits are derived client-side from the event log. In production, Segment&apos;s CDP computes equivalent traits server-side and syncs them to every destination.
      </p>
      <dl className="grid grid-cols-1 gap-x-6 rounded-lg border bg-card px-4 py-2 lg:grid-cols-2">
        {rows.map((r) => (
          <div
            key={r.label}
            className="grid grid-cols-[1fr_auto] gap-3 border-b py-2 last:border-b-0 lg:[&:nth-last-child(-n+2)]:border-b-0"
          >
            <dt className="text-muted-foreground">{r.label}</dt>
            <dd className="font-mono text-xs font-semibold">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
