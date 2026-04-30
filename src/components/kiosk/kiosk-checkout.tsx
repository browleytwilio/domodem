"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Banknote, CreditCard, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import { useOrderStore } from "@/stores/order-store";
import {
  toSegmentProduct,
  trackCheckoutStarted,
  trackOrderCompleted,
  trackPaymentInfoEntered,
} from "@/lib/analytics/events";
import type { Order } from "@/types/order";

type PayMethod = "counter" | "card";
type Phase = "choose" | "card-inserting" | "submitting";

export function KioskCheckout() {
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
  const { selectedStore } = useUIStore();
  const { setCurrentOrder, addToHistory } = useOrderStore();

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  const [phase, setPhase] = useState<Phase>("choose");

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/kiosk/cart");
      return;
    }
    trackCheckoutStarted(
      "kiosk-checkout",
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

  async function submitOrder(method: PayMethod) {
    setPhase("submitting");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items,
          deliveryMethod: "pickup",
          deliveryAddress: null,
          subtotal,
          deliveryFee: 0,
          discount: couponDiscount,
          total,
          couponCode,
          specialInstructions: `Kiosk order · paid ${method}`,
          storeId: selectedStore?.id ?? "store-001",
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const order = (await res.json()) as Order;
      setCurrentOrder(order);
      addToHistory(order);
      trackPaymentInfoEntered(method === "card" ? "card" : "cash");
      trackOrderCompleted({
        order_id: order.id,
        revenue: subtotal,
        tax: 0,
        shipping: 0,
        total,
        currency: "AUD",
        coupon: couponCode ?? undefined,
        discount: couponDiscount > 0 ? couponDiscount : undefined,
        products: items.map((item, idx) => toSegmentProduct(item, idx + 1)),
        payment_method: method === "card" ? "card" : "pay_at_store",
        delivery_method: "pickup",
        store_id: order.storeId,
        ...(order.estimatedDelivery && {
          estimated_delivery: order.estimatedDelivery,
        }),
      });
      clearCart();
      router.replace(`/kiosk/thanks?id=${order.id}&method=${method}`);
    } catch (e) {
      console.error(e);
      toast.error("Could not place order");
      setPhase("choose");
    }
  }

  function handlePayCounter() {
    submitOrder("counter");
  }

  function handlePayCard() {
    setPhase("card-inserting");
    setTimeout(() => submitOrder("card"), 2000);
  }

  if (phase === "card-inserting") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 bg-slate-950 pt-14 text-white">
        <div className="flex h-64 w-80 items-center justify-center rounded-3xl border-4 border-slate-700 bg-slate-900">
          <CreditCard className="h-24 w-24 animate-pulse text-slate-300" />
        </div>
        <h1 className="text-3xl font-black">Insert or tap card</h1>
        <p className="text-base text-slate-400">Processing...</p>
      </div>
    );
  }

  if (phase === "submitting") {
    return (
      <div className="flex h-full items-center justify-center pt-14">
        <Loader2 className="h-16 w-16 animate-spin text-[var(--dominos-red)]" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center pt-20">
      <h1 className="text-4xl font-black">Choose payment</h1>
      <p className="mt-2 text-base text-slate-500">
        Total to pay:{" "}
        <span className="font-black">${total.toFixed(2)}</span>
      </p>

      <div className="mt-10 grid w-full max-w-4xl grid-cols-2 gap-6 px-10">
        <button
          type="button"
          onClick={handlePayCounter}
          className="flex flex-col items-center gap-5 rounded-3xl border-4 border-slate-200 bg-white p-10 transition-colors hover:border-[var(--dominos-red)]"
        >
          <Banknote className="h-16 w-16 text-slate-700" />
          <span className="text-2xl font-black">Pay at counter</span>
          <span className="text-sm text-slate-500">
            Cash or card at the register
          </span>
        </button>

        <button
          type="button"
          onClick={handlePayCard}
          className="flex flex-col items-center gap-5 rounded-3xl bg-[var(--dominos-red)] p-10 text-white transition-transform hover:scale-[1.01]"
        >
          <CreditCard className="h-16 w-16" />
          <span className="text-2xl font-black">Pay by card</span>
          <span className="text-sm text-white/80">Tap, insert, or swipe</span>
        </button>
      </div>
    </div>
  );
}
