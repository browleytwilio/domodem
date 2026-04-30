"use client";

import {
  Package,
  MapPin,
  Store,
  Calendar,
  Hash,
  Truck,
  ShoppingBag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Order } from "@/types/order";

interface TrackerDetailsProps {
  order: Order;
}

export function TrackerDetails({ order }: TrackerDetailsProps) {
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTime = new Date(order.createdAt).toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
      <h3 className="mb-4 text-lg font-bold">Order Details</h3>

      {/* Meta info */}
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Hash className="h-4 w-4 flex-shrink-0" />
          <span>
            Order{" "}
            <span className="font-mono font-semibold text-foreground">
              {order.id.slice(0, 8).toUpperCase()}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span>
            {formattedDate} at {formattedTime}
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Store className="h-4 w-4 flex-shrink-0" />
          <span>Store {order.storeId}</span>
        </div>

        <div className="flex items-center gap-2">
          {order.deliveryMethod === "delivery" ? (
            <Truck className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          ) : (
            <ShoppingBag className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          )}
          <Badge
            variant="secondary"
            className={
              order.deliveryMethod === "delivery"
                ? "bg-[var(--dominos-blue)]/10 text-[var(--dominos-blue)]"
                : "bg-[var(--dominos-green)]/10 text-[var(--dominos-green)]"
            }
          >
            {order.deliveryMethod === "delivery" ? "Delivery" : "Pickup"}
          </Badge>
        </div>

        {order.deliveryAddress && (
          <div className="flex items-start gap-2 text-muted-foreground sm:col-span-2">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{order.deliveryAddress}</span>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      {/* Items */}
      <div className="space-y-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold">
          <Package className="h-4 w-4" />
          Items
        </h4>

        {order.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No item details available.
          </p>
        ) : (
          <ul className="space-y-2">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-2 text-sm"
              >
                <div className="flex-1">
                  <span className="font-medium">{item.productName}</span>
                  {(item.size || item.crust) && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({[item.size, item.crust].filter(Boolean).join(", ")})
                    </span>
                  )}
                  {item.quantity > 1 && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      x{item.quantity}
                    </span>
                  )}
                </div>
                <span className="font-medium tabular-nums">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Separator className="my-4" />

      {/* Totals */}
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="tabular-nums">${order.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery Fee</span>
          <span className="tabular-nums">
            {order.deliveryFee === 0
              ? "FREE"
              : `$${order.deliveryFee.toFixed(2)}`}
          </span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-[var(--dominos-green)]">
            <span>
              Discount{order.couponCode ? ` (${order.couponCode})` : ""}
            </span>
            <span className="tabular-nums">
              -${order.discount.toFixed(2)}
            </span>
          </div>
        )}
        <Separator className="my-1.5" />
        <div className="flex justify-between text-base font-bold">
          <span>Total</span>
          <span className="tabular-nums">${order.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Special instructions */}
      {order.specialInstructions && (
        <>
          <Separator className="my-4" />
          <div>
            <h4 className="mb-1 text-sm font-semibold">
              Special Instructions
            </h4>
            <p className="text-sm text-muted-foreground">
              {order.specialInstructions}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
