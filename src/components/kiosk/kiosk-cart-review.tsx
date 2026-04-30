"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { KioskNumberPad } from "./kiosk-number-pad";
import { useCartStore } from "@/stores/cart-store";
import {
  trackCartViewed,
  trackProductRemoved,
  toSegmentProduct,
} from "@/lib/analytics/events";

export function KioskCartReview() {
  const {
    items,
    updateQuantity,
    removeItem,
    getSubtotal,
    getDeliveryFee,
    getTotal,
  } = useCartStore();
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  useEffect(() => {
    if (items.length === 0) return;
    trackCartViewed(
      "kiosk-cart",
      items.map((item, idx) => toSegmentProduct(item, idx + 1)),
      subtotal,
    );
  }, [items, subtotal]);

  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 pt-14">
        <ShoppingBag className="h-20 w-20 text-slate-300" />
        <h1 className="text-3xl font-black">Your cart is empty</h1>
        <Link
          href="/kiosk/menu"
          className="rounded-2xl bg-[var(--dominos-red)] px-8 py-4 text-lg font-bold text-white shadow"
        >
          Browse menu
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full pt-14">
      <div className="flex w-3/5 flex-col overflow-y-auto border-r border-slate-100 px-8 py-6">
        <h1 className="text-3xl font-black">Your order</h1>
        <div className="mt-4 flex flex-col divide-y divide-slate-100">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-4 py-4">
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-50">
                <ProductImage
                  src={item.image}
                  alt={item.productName}
                  slug={item.productSlug}
                  category={item.category}
                  fill
                  sizes="96px"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold leading-tight">
                    {item.productName}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      trackProductRemoved(
                        item.productSlug,
                        item.productName,
                        item.quantity,
                        { category: item.category, price: item.unitPrice },
                      );
                      removeItem(item.id);
                    }}
                    className="text-sm font-semibold text-slate-500 underline-offset-2 hover:underline"
                  >
                    Remove
                  </button>
                </div>
                {(item.size || item.crust) && (
                  <p className="text-sm text-slate-500">
                    {[item.size, item.crust].filter(Boolean).join(" · ")}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <KioskNumberPad
                    value={item.quantity}
                    onChange={(q) => updateQuantity(item.id, q)}
                  />
                  <span className="text-xl font-black">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex w-2/5 flex-col bg-slate-50 px-8 py-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
          Summary
        </h2>
        <div className="mt-3 flex flex-col gap-2 text-base">
          <div className="flex justify-between">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Delivery fee</span>
            <span className="font-semibold">
              {deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`}
            </span>
          </div>
          <div className="mt-1 flex justify-between border-t border-slate-200 pt-3 text-2xl font-black">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <Link
            href="/kiosk/checkout"
            className="flex items-center justify-center rounded-3xl bg-[var(--dominos-red)] py-6 text-2xl font-black text-white shadow-xl"
          >
            Continue to pay
          </Link>
          <Link
            href="/kiosk/menu"
            className="flex items-center justify-center rounded-3xl border-2 border-slate-300 py-4 text-base font-bold text-slate-700"
          >
            Add more items
          </Link>
        </div>
      </div>
    </div>
  );
}
