"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  Tag,
  Truck,
  Store,
  MapPin,
  FileText,
  CreditCard,
  ArrowLeft,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import { useOrderStore } from "@/stores/order-store";
import {
  trackCheckoutStarted,
  trackOrderCompleted,
  trackCouponApplied,
  trackCouponDenied,
  trackCouponEntered,
  trackCouponRemoved,
  trackCheckoutStepViewed,
  trackCheckoutStepCompleted,
  trackPaymentInfoEntered,
  trackFormAbandoned,
  toSegmentProduct,
} from "@/lib/analytics/events";
import type { Order } from "@/types/order";


export default function CheckoutPage() {
  const router = useRouter();

  // Cart state
  const {
    items,
    removeItem,
    updateQuantity,
    getSubtotal,
    getDeliveryFee,
    getTotal,
    clearCart,
    couponCode: appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  // UI state
  const { deliveryMethod, selectedStore, deliveryAddress, setDeliveryAddress } =
    useUIStore();

  // Order state
  const { setCurrentOrder, addToHistory } = useOrderStore();

  // Local form state
  const [localAddress, setLocalAddress] = useState(deliveryAddress);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  // Track checkout started on mount
  useEffect(() => {
    if (items.length > 0) {
      trackCheckoutStarted(
        "checkout",
        items.map((i, idx) => toSegmentProduct(i, idx + 1)),
        subtotal,
        {
          coupon: appliedCoupon ?? undefined,
          currency: "AUD",
          value: total,
          shipping: deliveryFee,
          tax: 0,
          discount: couponDiscount,
        },
      );
      trackCheckoutStepViewed(1, "contact_and_delivery");
    }
    // Only fire once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track abandonment on beforeunload (only if order hasn't been placed)
  useEffect(() => {
    function handler() {
      if (isSubmitting || items.length === 0) return;
      const totalFields = 3; // address, special instructions, coupon
      const fieldsFilled =
        (localAddress.trim() ? 1 : 0) +
        (specialInstructions.trim() ? 1 : 0) +
        (appliedCoupon ? 1 : 0);
      if (fieldsFilled < totalFields) {
        trackFormAbandoned("checkout", fieldsFilled, totalFields);
      }
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isSubmitting, items.length, localAddress, specialInstructions, appliedCoupon]);

  // --------------------------------------------------------------------------
  // Coupon handling
  // --------------------------------------------------------------------------

  const handleApplyCoupon = useCallback(async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    trackCouponEntered(code);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal, deliveryFee }),
      });
      const data = await res.json();

      if (res.ok && data.valid) {
        applyCoupon(code, data.discount);
        setCouponError("");
        setCouponInput("");
        trackCouponApplied(code, data.discount);
        toast.success(`Coupon applied: ${data.type}`);
      } else {
        setCouponError(data.error || "Invalid coupon code. Please try again.");
        trackCouponDenied(code, data.error ?? "invalid_code");
      }
    } catch {
      setCouponError("Unable to validate coupon. Please try again.");
    }
  }, [couponInput, subtotal, deliveryFee, applyCoupon]);

  const handleRemoveCoupon = useCallback(() => {
    if (appliedCoupon) {
      trackCouponRemoved(appliedCoupon, couponDiscount);
    }
    removeCoupon();
    toast("Coupon removed.");
  }, [appliedCoupon, couponDiscount, removeCoupon]);

  // --------------------------------------------------------------------------
  // Place order
  // --------------------------------------------------------------------------

  const handlePlaceOrder = useCallback(async () => {
    if (deliveryMethod === "delivery" && !localAddress.trim()) {
      toast.error("Please enter a delivery address.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (deliveryMethod === "delivery") {
        setDeliveryAddress(localAddress.trim());
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: selectedStore?.id ?? "store-001",
          deliveryMethod,
          deliveryAddress:
            deliveryMethod === "delivery" ? localAddress.trim() : undefined,
          items: [...items],
          subtotal,
          deliveryFee,
          discount: couponDiscount,
          total,
          couponCode: appliedCoupon ?? undefined,
          specialInstructions: specialInstructions.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to place order");
      }

      const order: Order = await res.json();

      setCurrentOrder(order);
      addToHistory(order);

      trackCheckoutStepCompleted(1, "contact_and_delivery", {
        delivery_method: deliveryMethod,
        has_delivery_address: Boolean(localAddress.trim()),
      });
      trackPaymentInfoEntered("pay_at_store");

      trackOrderCompleted({
        order_id: order.id,
        revenue: subtotal,
        tax: 0,
        shipping: deliveryFee,
        total,
        currency: "AUD",
        coupon: appliedCoupon ?? undefined,
        discount: couponDiscount > 0 ? couponDiscount : undefined,
        products: items.map((i, idx) => toSegmentProduct(i, idx + 1)),
        payment_method: "pay_at_store",
        delivery_method: deliveryMethod,
        store_id: order.storeId,
        ...(deliveryMethod === "delivery" && localAddress.trim() && {
          delivery_address: localAddress.trim(),
        }),
        ...(order.estimatedDelivery && {
          estimated_delivery: order.estimatedDelivery,
        }),
      });

      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/order-tracker/${order.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast.error(message);
      setIsSubmitting(false);
    }
  }, [
    deliveryMethod,
    localAddress,
    setDeliveryAddress,
    selectedStore,
    items,
    subtotal,
    deliveryFee,
    couponDiscount,
    total,
    appliedCoupon,
    specialInstructions,
    setCurrentOrder,
    addToHistory,
    clearCart,
    router,
  ]);

  // --------------------------------------------------------------------------
  // Empty cart state
  // --------------------------------------------------------------------------

  if (items.length === 0) {
    return (
      <>
        <Header />
        <CartDrawer />
        <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24">
          <ShoppingBag className="h-20 w-20 text-muted-foreground/30" />
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="max-w-md text-center text-muted-foreground">
            Looks like you haven&apos;t added any items yet. Head over to the
            menu and build your perfect order.
          </p>
          <Button
            className="bg-[var(--dominos-red)] hover:bg-[var(--dominos-red)]/90"
            size="lg"
            asChild
          >
            <Link href="/menu">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Menu
            </Link>
          </Button>
        </main>
        <Footer />
      </>
    );
  }

  // --------------------------------------------------------------------------
  // Checkout form
  // --------------------------------------------------------------------------

  return (
    <>
      <Header />
      <CartDrawer />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        {/* Back link */}
        <Link
          href="/menu"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>

        <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          {/* ---- Left column: form sections ---- */}
          <div className="space-y-8">
            {/* Delivery / Pickup info */}
            <section className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                {deliveryMethod === "delivery" ? (
                  <Truck className="h-5 w-5 text-[var(--dominos-blue)]" />
                ) : (
                  <Store className="h-5 w-5 text-[var(--dominos-blue)]" />
                )}
                <h2 className="text-lg font-bold">
                  {deliveryMethod === "delivery"
                    ? "Delivery Address"
                    : "Pickup Details"}
                </h2>
                <Badge
                  variant="secondary"
                  className="ml-auto bg-[var(--dominos-blue)]/10 text-[var(--dominos-blue)]"
                >
                  {deliveryMethod === "delivery" ? "Delivery" : "Pickup"}
                </Badge>
              </div>

              {deliveryMethod === "delivery" ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="address" className="mb-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      Street Address
                    </Label>
                    <Input
                      id="address"
                      placeholder="123 George St, Sydney NSW 2000"
                      value={localAddress}
                      onChange={(e) => setLocalAddress(e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 text-[var(--dominos-blue)]" />
                    <div>
                      <p className="font-semibold">
                        {selectedStore?.name ?? "No store selected"}
                      </p>
                      {selectedStore ? (
                        <p className="text-sm text-muted-foreground">
                          {selectedStore.address}, {selectedStore.suburb}{" "}
                          {selectedStore.state} {selectedStore.postcode}
                        </p>
                      ) : (
                        <Link
                          href="/store-locator"
                          className="text-sm font-medium text-[var(--dominos-blue)] hover:underline"
                        >
                          Select a pickup store
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Special instructions */}
            <section className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--dominos-blue)]" />
                <h2 className="text-lg font-bold">Special Instructions</h2>
              </div>
              <Textarea
                placeholder="Any special requests? e.g. Ring the doorbell, leave at the door..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="min-h-24 resize-none"
                maxLength={500}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {specialInstructions.length}/500 characters
              </p>
            </section>

            {/* Coupon */}
            <section className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5 text-[var(--dominos-blue)]" />
                <h2 className="text-lg font-bold">Coupon Code</h2>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-lg border border-[var(--dominos-green)]/30 bg-[var(--dominos-green)]/5 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[var(--dominos-green)]" />
                    <span className="text-sm font-semibold text-[var(--dominos-green)]">
                      {appliedCoupon}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      (-${couponDiscount.toFixed(2)})
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleApplyCoupon();
                      }}
                      className="h-10 uppercase"
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      variant="outline"
                      className="h-10 px-6 font-semibold"
                    >
                      Apply
                    </Button>
                  </div>
                  {couponError && (
                    <p className="mt-2 text-sm text-destructive">
                      {couponError}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Enter a valid coupon code to get a discount
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* ---- Right column: order summary ---- */}
          <div className="lg:sticky lg:top-36 lg:self-start">
            <div className="rounded-xl border bg-card shadow-sm">
              <div className="border-b px-6 py-4">
                <h2 className="flex items-center gap-2 text-lg font-bold">
                  <ShoppingBag className="h-5 w-5" />
                  Order Summary ({items.length}{" "}
                  {items.length === 1 ? "item" : "items"})
                </h2>
              </div>

              {/* Items */}
              <div className="max-h-[400px] overflow-y-auto px-6">
                <div className="divide-y py-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 py-3 first:pt-2 last:pb-2"
                    >
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-xl">
                        {item.category === "pizza"
                          ? "🍕"
                          : item.category === "sides"
                            ? "🍟"
                            : item.category === "drinks"
                              ? "🥤"
                              : "🍔"}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-semibold leading-tight">
                            {item.productName}
                          </h4>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-2 flex-shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {(item.size || item.crust) && (
                          <p className="text-xs text-muted-foreground">
                            {[item.size, item.crust].filter(Boolean).join(" | ")}
                          </p>
                        )}
                        <div className="mt-1.5 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 rounded-full border">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-muted"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="min-w-[1.25rem] text-center text-xs font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-muted"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="text-sm font-semibold tabular-nums">
                            ${(item.unitPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t px-6 py-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="tabular-nums">
                      {deliveryFee === 0
                        ? "FREE"
                        : `$${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  {appliedCoupon && couponDiscount > 0 && (
                    <div className="flex justify-between text-[var(--dominos-green)]">
                      <span>Discount ({appliedCoupon})</span>
                      <span className="tabular-nums">
                        -${couponDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="tabular-nums">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="mt-4 h-12 w-full bg-[var(--dominos-red)] text-base font-bold hover:bg-[var(--dominos-red)]/90 disabled:opacity-50"
                  size="lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Placing Order...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Place Order - ${total.toFixed(2)}
                    </span>
                  )}
                </Button>

                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Payment will be collected at{" "}
                  {deliveryMethod === "delivery" ? "delivery" : "pickup"}.
                  No online payment required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
