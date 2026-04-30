"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MobileStackedHeader } from "./mobile-stacked-header";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import { useOrderStore } from "@/stores/order-store";
import {
  trackCheckoutStarted,
  trackOrderCompleted,
  toSegmentProduct,
} from "@/lib/analytics/events";
import type { Order } from "@/types/order";

export function MobileCheckout() {
  const router = useRouter();
  const {
    items,
    getSubtotal,
    getDeliveryFee,
    getTotal,
    clearCart,
    couponCode,
    couponDiscount,
  } = useCartStore();
  const { deliveryMethod, selectedStore, deliveryAddress, setDeliveryAddress } =
    useUIStore();
  const { setCurrentOrder, addToHistory } = useOrderStore();

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  const [address, setAddress] = useState(deliveryAddress);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/m/cart");
      return;
    }
    trackCheckoutStarted(
      "mobile-checkout",
      items.map((item, idx) => toSegmentProduct(item, idx + 1)),
      subtotal,
      {
        coupon: couponCode ?? undefined,
        currency: "AUD",
        value: total,
        shipping: deliveryFee,
        tax: 0,
        discount: couponDiscount,
      },
    );
  }, [items, subtotal, deliveryFee, total, couponCode, couponDiscount, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    if (deliveryMethod === "delivery") {
      setDeliveryAddress(address);
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items,
          deliveryMethod,
          deliveryAddress: deliveryMethod === "delivery" ? address : null,
          subtotal,
          deliveryFee,
          discount: couponDiscount,
          total,
          couponCode,
          specialInstructions: notes,
          storeId: selectedStore?.id ?? "store-001",
        }),
      });
      if (!res.ok) throw new Error(`checkout failed (${res.status})`);
      const order = (await res.json()) as Order;
      setCurrentOrder(order);
      addToHistory(order);
      trackOrderCompleted({
        order_id: order.id,
        revenue: subtotal,
        tax: 0,
        shipping: deliveryFee,
        total,
        currency: "AUD",
        coupon: couponCode ?? undefined,
        discount: couponDiscount > 0 ? couponDiscount : undefined,
        products: items.map((item, idx) => toSegmentProduct(item, idx + 1)),
        payment_method: "pay_at_store",
        delivery_method: deliveryMethod,
        store_id: order.storeId,
        ...(deliveryMethod === "delivery" && address.trim() && {
          delivery_address: address.trim(),
        }),
        ...(order.estimatedDelivery && {
          estimated_delivery: order.estimatedDelivery,
        }),
      });
      clearCart();
      toast.success("Order placed");
      router.replace(`/m/order/${order.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Could not place order");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col bg-background">
      <MobileStackedHeader title="Checkout" />
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Method
          </h2>
          <p className="text-sm font-medium capitalize">{deliveryMethod}</p>
        </section>

        {deliveryMethod === "delivery" && (
          <section className="mt-4 flex flex-col gap-2">
            <Label htmlFor="m-address">Delivery address</Label>
            <Input
              id="m-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="42 Wallaby Way, Sydney NSW 2000"
              required
              autoComplete="street-address"
            />
          </section>
        )}

        <section className="mt-4 flex flex-col gap-2">
          <Label htmlFor="m-notes">Notes (optional)</Label>
          <Textarea
            id="m-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Leave at door, etc."
            rows={3}
          />
        </section>

        <section className="mt-6 flex flex-col gap-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery</span>
            <span>{deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`}</span>
          </div>
          {couponCode && (
            <div className="flex justify-between text-[var(--dominos-green)]">
              <span>Discount ({couponCode})</span>
              <span>−${couponDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between text-base font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </section>
      </div>

      <div className="sticky bottom-0 border-t border-border/60 bg-background/95 p-3 backdrop-blur">
        <button
          type="submit"
          disabled={submitting || (deliveryMethod === "delivery" && !address)}
          className="flex w-full items-center justify-center rounded-xl bg-[var(--dominos-red)] py-3.5 text-sm font-bold text-white shadow-lg disabled:opacity-60"
        >
          {submitting ? "Placing order..." : `Place order · $${total.toFixed(2)}`}
        </button>
      </div>
    </form>
  );
}
