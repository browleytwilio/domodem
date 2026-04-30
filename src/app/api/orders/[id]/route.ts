import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Order, OrderStatus, CartItem } from "@/types/order";

export const dynamic = "force-dynamic";

const DELIVERY_SEQUENCE: OrderStatus[] = [
  "placed", "preparing", "oven", "quality_check", "out_for_delivery", "delivered",
];
const PICKUP_SEQUENCE: OrderStatus[] = [
  "placed", "preparing", "oven", "quality_check", "ready_for_pickup",
];

function getNextStatus(current: OrderStatus, method: "delivery" | "pickup"): OrderStatus | null {
  const seq = method === "delivery" ? DELIVERY_SEQUENCE : PICKUP_SEQUENCE;
  const idx = seq.indexOf(current);
  if (idx === -1 || idx >= seq.length - 1) return null;
  return seq[idx + 1];
}

function isTerminal(status: OrderStatus): boolean {
  return status === "delivered" || status === "ready_for_pickup";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const row = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { items: true },
  });

  if (!row) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Kitchen simulator: auto-advance status if enabled
  if (process.env.SIMULATE_KITCHEN === "true" && !isTerminal(row.status)) {
    const timestamps = row.statusTimestamps as Record<string, string>;
    const lastTimestamp = timestamps[row.status];
    if (lastTimestamp) {
      const elapsed = Date.now() - new Date(lastTimestamp).getTime();
      if (elapsed > 20_000) {
        const next = getNextStatus(row.status, row.deliveryMethod);
        if (next) {
          const now = new Date();
          const updatedTimestamps = { ...timestamps, [next]: now.toISOString() };
          await db
            .update(orders)
            .set({
              status: next,
              statusTimestamps: updatedTimestamps,
              updatedAt: now,
            })
            .where(eq(orders.id, id));
          row.status = next;
          row.statusTimestamps = updatedTimestamps;
          row.updatedAt = now;
        }
      }
    }
  }

  const order: Order = {
    id: row.id,
    userId: row.userId,
    storeId: row.storeId,
    status: row.status,
    deliveryMethod: row.deliveryMethod,
    deliveryAddress: row.deliveryAddress || undefined,
    items: row.items.map((item) => ({
      id: item.id,
      productSlug: item.productSlug,
      productName: item.productName,
      category: "",
      image: "",
      size: item.size as CartItem["size"],
      crust: item.crust as CartItem["crust"],
      quantity: item.quantity,
      unitPrice: parseFloat(item.unitPrice),
      customizations: item.customizations as CartItem["customizations"],
    })),
    subtotal: parseFloat(row.subtotal),
    deliveryFee: parseFloat(row.deliveryFee),
    discount: parseFloat(row.discount),
    total: parseFloat(row.total),
    couponCode: row.couponCode || undefined,
    specialInstructions: row.specialInstructions || undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    estimatedDelivery: row.estimatedDelivery?.toISOString(),
    statusTimestamps: row.statusTimestamps as Order["statusTimestamps"],
  };

  return NextResponse.json(order);
}
