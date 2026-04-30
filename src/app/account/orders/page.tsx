"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Package, RotateCcw, MapPin, AlertCircle, RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Order, OrderStatus } from "@/types/order";

function getDisplayStatus(status: OrderStatus): "Delivered" | "In Progress" | "Cancelled" {
  if (status === "delivered" || status === "ready_for_pickup") return "Delivered";
  return "In Progress";
}

const statusColor = {
  Delivered: "bg-[var(--dominos-green)]/10 text-[var(--dominos-green)]",
  "In Progress": "bg-[var(--dominos-orange)]/10 text-[var(--dominos-orange)]",
  Cancelled: "bg-destructive/10 text-destructive",
};

function OrderCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-3 w-28" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex items-center justify-between border-t pt-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      const msg =
        err instanceof TypeError
          ? "Connection issue — check your network and try again."
          : "We couldn't load your orders. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <>
      <Header />
      <CartDrawer />
      <main className="flex-1 bg-[var(--dominos-light-gray)]">
        <AuthGuard>
          <div className="mx-auto max-w-3xl px-4 py-10">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Order History</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  View and manage your past orders.
                </p>
              </div>
              <Button asChild className="bg-[var(--dominos-red)] text-white hover:bg-[var(--dominos-red)]/90">
                <Link href="/menu">Order Again</Link>
              </Button>
            </div>

            {loading ? (
              <div className="space-y-4">
                <OrderCardSkeleton />
                <OrderCardSkeleton />
                <OrderCardSkeleton />
              </div>
            ) : error ? (
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                  <AlertCircle className="h-10 w-10 text-destructive" />
                  <p className="text-base font-semibold text-foreground">
                    Couldn&apos;t load your orders
                  </p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <Button
                    variant="outline"
                    className="gap-1.5"
                    onClick={fetchOrders}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try again
                  </Button>
                </CardContent>
              </Card>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-4 py-16">
                  <Package className="h-16 w-16 text-muted-foreground/30" />
                  <p className="text-lg font-medium text-muted-foreground">
                    No orders yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your order history will appear here once you place your first order.
                  </p>
                  <Button
                    asChild
                    className="bg-[var(--dominos-red)] text-white hover:bg-[var(--dominos-red)]/90"
                  >
                    <Link href="/menu">Browse Menu</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const displayStatus = getDisplayStatus(order.status);
                  const isActive = displayStatus === "In Progress";
                  const dateStr = new Date(order.createdAt).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <Card key={order.id}>
                      <CardHeader className="pb-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <CardTitle className="text-sm font-semibold">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </CardTitle>
                          <Badge
                            className={statusColor[displayStatus]}
                            variant="secondary"
                          >
                            {displayStatus}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">{dateStr}</p>
                        <ul className="mt-2 space-y-1">
                          {order.items.map((item) => (
                            <li key={item.id} className="text-sm text-foreground">
                              {item.quantity}x {item.productName}
                              {item.size ? ` (${item.size})` : ""}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-4">
                          <span className="text-base font-bold">
                            ${order.total.toFixed(2)}
                          </span>
                          <div className="flex gap-2">
                            {!isActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                asChild
                              >
                                <Link href="/menu">
                                  <RotateCcw className="h-3.5 w-3.5" />
                                  Reorder
                                </Link>
                              </Button>
                            )}
                            {isActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                asChild
                              >
                                <Link href={`/order-tracker/${order.id}`}>
                                  <MapPin className="h-3.5 w-3.5" />
                                  Track Order
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </AuthGuard>
      </main>
      <Footer />
    </>
  );
}
