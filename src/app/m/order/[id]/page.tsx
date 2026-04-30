"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MobileStackedHeader } from "@/components/mobile/mobile-stacked-header";
import type { Order } from "@/types/order";

export default function MobileOrderTrackerPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Order;
        if (!cancelled) setOrder(data);
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="flex h-full flex-col bg-background">
      <MobileStackedHeader title="Order tracker" />
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {error && (
          <p className="text-sm text-destructive">Could not load order.</p>
        )}
        {!order && !error && (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )}
        {order && (
          <>
            <h1 className="text-xl font-bold">Order #{order.id.slice(0, 8)}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Status:{" "}
              <span className="font-semibold capitalize">
                {order.status.replace(/_/g, " ")}
              </span>
            </p>
            <p className="mt-3 text-sm">
              ETA:{" "}
              {order.estimatedDelivery
                ? new Date(order.estimatedDelivery).toLocaleTimeString()
                : "—"}
            </p>
            <div className="mt-4 flex flex-col divide-y divide-border/60">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between py-2 text-sm"
                >
                  <span>
                    {item.quantity} × {item.productName}
                  </span>
                  <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between text-base font-bold">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
            <Link
              href="/m/orders"
              className="mt-6 inline-flex items-center text-sm font-semibold text-[var(--dominos-red)]"
            >
              Back to orders →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
