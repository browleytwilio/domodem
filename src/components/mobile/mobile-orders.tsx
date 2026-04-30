"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import type { Order } from "@/types/order";

export function MobileOrders() {
  const { data: session, isPending } = authClient.useSession();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      setOrders([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Order[];
        if (!cancelled) setOrders(data);
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session, isPending]);

  if (!isPending && !session?.user) {
    return (
      <div className="flex flex-col items-center gap-4 px-6 pt-16 text-center">
        <h1 className="text-xl font-bold">Sign in to see your orders</h1>
        <p className="text-sm text-muted-foreground">
          Track live orders and see your history.
        </p>
        <Link
          href="/m/login"
          className="inline-flex items-center rounded-xl bg-[var(--dominos-red)] px-6 py-2.5 text-sm font-bold text-white"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (orders === null) {
    return (
      <div className="px-4 pt-6 text-sm text-muted-foreground">
        Loading orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 pt-6 text-sm text-destructive">
        Could not load orders.
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="px-4 pt-6">
        <h1 className="text-xl font-bold">Orders</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You haven&apos;t placed any orders yet.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24">
      <h1 className="text-xl font-bold">Orders</h1>
      <div className="mt-3 flex flex-col gap-2">
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/m/order/${o.id}`}
            className="flex items-center justify-between rounded-2xl border border-border/70 bg-background p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                Order #{o.id.slice(0, 8)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {new Date(o.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                {o.status.replace(/_/g, " ")}
              </span>
              <span className="text-sm font-bold">${o.total.toFixed(2)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
