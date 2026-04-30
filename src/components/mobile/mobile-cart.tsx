"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { MobileStackedHeader } from "./mobile-stacked-header";
import { useCartStore } from "@/stores/cart-store";
import {
  trackProductRemoved,
  toSegmentProduct,
  trackCartViewed,
} from "@/lib/analytics/events";

export function MobileCart() {
  const {
    items,
    removeItem,
    updateQuantity,
    getSubtotal,
    getDeliveryFee,
    getTotal,
    couponCode,
    couponDiscount,
  } = useCartStore();

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  useEffect(() => {
    if (items.length === 0) return;
    trackCartViewed(
      "mobile-cart",
      items.map((item, idx) => toSegmentProduct(item, idx + 1)),
      subtotal,
    );
  }, [items, subtotal]);

  return (
    <div className="flex h-full flex-col bg-background">
      <MobileStackedHeader title={`Your cart (${items.length})`} />

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/60" />
          <p className="text-base font-medium text-muted-foreground">
            Your cart is empty
          </p>
          <Link
            href="/m/menu"
            className="inline-flex items-center rounded-xl bg-[var(--dominos-red)] px-6 py-2.5 text-sm font-bold text-white"
          >
            Browse menu
          </Link>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4">
            <div className="flex flex-col divide-y divide-border/60">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 py-3 first:pt-0">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                    <ProductImage
                      src={item.image}
                      alt={item.productName}
                      slug={item.productSlug}
                      category={item.category}
                      fill
                      sizes="64px"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate text-sm font-semibold">
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
                        aria-label={`Remove ${item.productName}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {(item.size || item.crust) && (
                      <p className="text-xs text-muted-foreground">
                        {[item.size, item.crust].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border border-border">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          aria-label="Decrease"
                          className="flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-40"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-[1.5rem] text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          aria-label="Increase"
                          className="flex h-8 w-8 items-center justify-center rounded-full"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 border-t border-border/60 bg-background/95 p-4 backdrop-blur">
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>
                  {deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`}
                </span>
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
            </div>
            <Link
              href="/m/checkout"
              className="mt-3 flex w-full items-center justify-center rounded-xl bg-[var(--dominos-red)] py-3.5 text-sm font-bold text-white shadow-lg active:scale-[0.99]"
            >
              Checkout · ${total.toFixed(2)}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
