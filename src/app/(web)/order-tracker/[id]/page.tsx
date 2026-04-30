"use client";

import { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Timer, WifiOff, AlertTriangle } from "lucide-react";
import { TrackerProgress } from "@/components/order-tracker/tracker-progress";
import { TrackerDetails } from "@/components/order-tracker/tracker-details";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/stores/order-store";
import {
  trackOrderTrackerViewed,
  trackOrderStatusChanged,
} from "@/lib/analytics/events";
import type { Order, OrderStatus } from "@/types/order";

// --------------------------------------------------------------------------
// Status progression sequence
// --------------------------------------------------------------------------

const DELIVERY_SEQUENCE: OrderStatus[] = [
  "placed",
  "preparing",
  "oven",
  "quality_check",
  "out_for_delivery",
  "delivered",
];

const PICKUP_SEQUENCE: OrderStatus[] = [
  "placed",
  "preparing",
  "oven",
  "quality_check",
  "ready_for_pickup",
];

function getSequence(method: "delivery" | "pickup"): OrderStatus[] {
  return method === "delivery" ? DELIVERY_SEQUENCE : PICKUP_SEQUENCE;
}

// --------------------------------------------------------------------------
// ETA helper
// --------------------------------------------------------------------------

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Arriving now!";
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  if (minutes > 0) {
    return `${minutes} min ${seconds.toString().padStart(2, "0")} sec`;
  }
  return `${seconds} sec`;
}

// --------------------------------------------------------------------------
// Page component
// --------------------------------------------------------------------------

export default function OrderTrackerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const storedOrder = useOrderStore((s) => s.currentOrder);
  const orderHistory = useOrderStore((s) => s.orderHistory);
  const setCurrentOrder = useOrderStore((s) => s.setCurrentOrder);

  // Resolve the order: current order first, then history
  const baseOrder =
    storedOrder?.id === id
      ? storedOrder
      : orderHistory.find((o) => o.id === id) ?? null;

  // Local order state for simulation
  const [order, setOrder] = useState<Order | null>(baseOrder);
  const [countdown, setCountdown] = useState("");
  const trackedRef = useRef(false);
  const prevStatusRef = useRef<OrderStatus | null>(null);

  const updateOrderInHistory = useOrderStore((s) => s.updateOrderInHistory);
  const [isOffline, setIsOffline] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const lastSuccessRef = useRef(Date.now());
  const backoffRef = useRef(5_000);

  // Sync base order into local state
  useEffect(() => {
    if (baseOrder && !order) {
      setOrder(baseOrder);
    }
  }, [baseOrder, order]);

  // --------------------------------------------------------------------------
  // Analytics: track view on mount
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (order && !trackedRef.current) {
      trackedRef.current = true;
      trackOrderTrackerViewed(order.id, order.status);
      prevStatusRef.current = order.status;
    }
  }, [order]);

  // --------------------------------------------------------------------------
  // Offline detection
  // --------------------------------------------------------------------------

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    setIsOffline(!navigator.onLine);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  // --------------------------------------------------------------------------
  // Server polling (every 10s, replaces client-side simulation)
  // --------------------------------------------------------------------------

  useEffect(() => {
    const isTerminal =
      order?.status === "delivered" || order?.status === "ready_for_pickup";
    if (isTerminal) return;
    if (isOffline) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok || cancelled) return;

        const data: Order = await res.json();
        backoffRef.current = 5_000;
        lastSuccessRef.current = Date.now();
        setIsStale(false);

        if (prevStatusRef.current && prevStatusRef.current !== data.status) {
          const createdAt = new Date(data.createdAt).getTime();
          const elapsedMinutes = Math.round((Date.now() - createdAt) / 60_000);
          trackOrderStatusChanged(
            data.id,
            prevStatusRef.current,
            data.status,
            elapsedMinutes,
            {
              delivery_method: data.deliveryMethod,
              store_id: data.storeId,
              total: data.total,
              estimated_delivery: data.estimatedDelivery,
            },
          );
        }
        prevStatusRef.current = data.status;

        setOrder(data);
        setCurrentOrder(data);
        updateOrderInHistory(data);
      } catch {
        backoffRef.current = Math.min(backoffRef.current * 2, 30_000);
        if (Date.now() - lastSuccessRef.current > 60_000) {
          setIsStale(true);
        }
      }
    };

    poll();
    const interval = setInterval(poll, 10_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id, order?.status, isOffline, setCurrentOrder, updateOrderInHistory]);

  // --------------------------------------------------------------------------
  // ETA countdown
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (!order?.estimatedDelivery) return;

    function tick() {
      const remaining =
        new Date(order!.estimatedDelivery!).getTime() - Date.now();
      setCountdown(formatCountdown(remaining));
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [order?.estimatedDelivery]);

  // --------------------------------------------------------------------------
  // Not found state
  // --------------------------------------------------------------------------

  if (!order) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Clock className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h1 className="text-2xl font-bold">Order Not Found</h1>
        <p className="max-w-md text-center text-muted-foreground">
          We couldn&apos;t find an order with that ID. It may have expired or
          the link might be incorrect.
        </p>
        <Button
          className="bg-[var(--dominos-red)] hover:bg-[var(--dominos-red)]/90"
          size="lg"
          asChild
        >
          <Link href="/menu">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Menu
          </Link>
        </Button>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Determine if complete
  // --------------------------------------------------------------------------

  const sequence = getSequence(order.deliveryMethod);
  const isComplete = order.status === sequence[sequence.length - 1];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      {/* Back link */}
        <Link
          href="/menu"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Menu
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            {isComplete
              ? order.deliveryMethod === "delivery"
                ? "Order Delivered!"
                : "Ready for Pickup!"
              : "Tracking Your Order"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* ETA countdown */}
        {!isComplete && order.estimatedDelivery && (
          <div className="mb-8 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-[var(--dominos-blue)]/10 px-6 py-3">
              <Timer className="h-5 w-5 text-[var(--dominos-blue)]" />
              <span className="text-sm font-medium text-muted-foreground">
                Estimated{" "}
                {order.deliveryMethod === "delivery"
                  ? "delivery"
                  : "ready"}{" "}
                in
              </span>
              <span className="text-lg font-bold text-[var(--dominos-blue)]">
                {countdown}
              </span>
            </div>
          </div>
        )}

        {isComplete && (
          <div className="mb-8 flex justify-center">
            <div className="flex items-center gap-2 rounded-full bg-[var(--dominos-green)]/10 px-6 py-3">
              <span className="text-lg font-bold text-[var(--dominos-green)]">
                {order.deliveryMethod === "delivery"
                  ? "Your order has been delivered. Enjoy!"
                  : "Your order is ready for collection!"}
              </span>
            </div>
          </div>
        )}

        {/* Connection banners */}
        {isOffline && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
            <WifiOff className="h-4 w-4 shrink-0" />
            You&apos;re offline. We&apos;ll resume tracking when you&apos;re back online.
          </div>
        )}
        {isStale && !isOffline && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Having trouble reaching our servers. Your order is still being prepared.
          </div>
        )}

        {/* Progress tracker */}
        <div className="mb-10 rounded-xl border bg-card p-6 shadow-sm md:p-8">
          <TrackerProgress
            status={order.status}
            timestamps={order.statusTimestamps}
            deliveryMethod={order.deliveryMethod}
          />
        </div>

        {/* Order details */}
        <TrackerDetails order={order} />
    </div>
  );
}
