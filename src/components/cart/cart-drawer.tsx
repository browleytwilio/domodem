"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { RemoveItemButton } from "@/components/cart/remove-item-button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import {
  trackCartViewed,
  trackProductRemoved,
  toSegmentProduct,
} from "@/lib/analytics/events";
import type { CartItem } from "@/types/order";

export function CartDrawer() {
  const { isCartOpen, setCartOpen } = useUIStore();
  const { items, removeItem, updateQuantity, getSubtotal, getDeliveryFee, getTotal, couponCode, couponDiscount } =
    useCartStore();

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  function handleOpenChange(open: boolean) {
    setCartOpen(open);
    if (open && items.length > 0) {
      trackCartViewed(
        "cart-drawer",
        items.map((item, idx) => toSegmentProduct(item, idx + 1)),
        subtotal,
      );
    }
  }

  function handleRemove(item: CartItem) {
    trackProductRemoved(item.productSlug, item.productName, item.quantity, {
      category: item.category,
      price: item.unitPrice,
    });
    removeItem(item.id);
  }

  return (
    <Sheet open={isCartOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold">
            <ShoppingBag className="h-5 w-5" />
            Your Order ({items.length})
          </SheetTitle>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
            <div className="relative h-48 w-48 overflow-hidden rounded-full bg-muted">
              <Image
                src="/images/empty-cart.webp"
                alt=""
                fill
                sizes="192px"
                className="object-cover opacity-90"
              />
            </div>
            <p className="text-lg font-medium text-muted-foreground">
              Your cart is empty
            </p>
            <Button
              className="bg-[var(--dominos-red)] hover:bg-[var(--dominos-red)]/90"
              onClick={() => setCartOpen(false)}
              render={<Link href="/menu" />}
            >
              Browse Menu
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="divide-y py-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                      <ProductImage
                        src={item.image}
                        alt={item.productName}
                        slug={item.productSlug}
                        category={item.category}
                        width={64}
                        height={64}
                        sizes="64px"
                        className="rounded-lg"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="line-clamp-2 min-w-0 text-sm font-semibold">{item.productName}</h4>
                        <RemoveItemButton
                          itemName={item.productName}
                          onConfirm={() => handleRemove(item)}
                        />
                      </div>
                      {(item.size || item.crust) && (
                        <p className="text-xs text-muted-foreground">
                          {[item.size, item.crust].filter(Boolean).join(" • ")}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-full border">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dominos-blue)]/40 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 sm:h-7 sm:w-7"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-[1.5rem] text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dominos-blue)]/40 active:scale-90 sm:h-7 sm:w-7"
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
            </ScrollArea>

            <div className="border-t p-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>{deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`}</span>
                </div>
                {couponCode && (
                  <div className="flex justify-between text-[var(--dominos-green)]">
                    <span>Discount ({couponCode})</span>
                    <span>-${couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <Button
                className="mt-4 w-full bg-[var(--dominos-red)] text-base font-bold hover:bg-[var(--dominos-red)]/90 focus-visible:ring-[var(--dominos-red)]/40 active:scale-[0.98]"
                size="lg"
                render={<Link href="/checkout" />}
                onClick={() => setCartOpen(false)}
              >
                Checkout · ${total.toFixed(2)}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
