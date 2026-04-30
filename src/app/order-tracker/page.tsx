"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, Search, ArrowRight, Pizza } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrderStore } from "@/stores/order-store";

export default function OrderTrackerLandingPage() {
  const router = useRouter();
  const currentOrder = useOrderStore((s) => s.currentOrder);
  const [orderNumber, setOrderNumber] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  // If there is a current active order, redirect automatically
  useEffect(() => {
    if (currentOrder && currentOrder.status !== "delivered" && currentOrder.status !== "ready_for_pickup") {
      setRedirecting(true);
      router.replace(`/order-tracker/${currentOrder.id}`);
    }
  }, [currentOrder, router]);

  function handleTrackOrder() {
    const trimmed = orderNumber.trim();
    if (trimmed) {
      router.push(`/order-tracker/${trimmed}`);
    }
  }

  // Show nothing briefly while redirecting
  if (redirecting) {
    return (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--dominos-blue)] border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Redirecting to your order...
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="w-full text-center">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--dominos-blue)]/10">
            <Clock className="h-10 w-10 text-[var(--dominos-blue)]" />
          </div>

          <h1 className="mb-2 text-3xl font-bold">Track Your Order</h1>
          <p className="mb-8 text-muted-foreground">
            Enter your order number below to see real-time updates on your
            order.
          </p>

          {/* Search form */}
          <div className="mx-auto max-w-md">
            <div className="space-y-3">
              <Label htmlFor="order-number" className="sr-only">
                Order Number
              </Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="order-number"
                    placeholder="Enter order number..."
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleTrackOrder();
                    }}
                    autoComplete="off"
                    inputMode="text"
                    className="h-12 pl-10 text-base"
                  />
                </div>
                <Button
                  onClick={handleTrackOrder}
                  disabled={!orderNumber.trim()}
                  className="h-12 bg-[var(--dominos-blue)] px-6 font-semibold hover:bg-[var(--dominos-blue)]/90 focus-visible:ring-[var(--dominos-blue)]/40 active:scale-[0.98] sm:w-auto"
                >
                  Track
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* No active orders message */}
          <div className="mt-12 rounded-xl border bg-card p-8 text-center shadow-sm">
            <Pizza className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <h2 className="mb-2 text-lg font-semibold">No Active Orders</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              You don&apos;t have any orders being tracked right now. Ready to
              start a new order?
            </p>
            <Button
              className="bg-[var(--dominos-red)] hover:bg-[var(--dominos-red)]/90"
              size="lg"
              asChild
            >
              <Link href="/menu">Start a New Order</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
