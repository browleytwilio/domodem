import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { OrderStatus } from "@/types/order";

const VALID_STATUSES: OrderStatus[] = [
  "placed", "preparing", "oven", "quality_check", "out_for_delivery", "delivered", "ready_for_pickup",
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const { status } = body as { status: string };

  if (!status || !VALID_STATUSES.includes(status as OrderStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const existing = await db.query.orders.findFirst({
    where: eq(orders.id, id),
  });

  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const now = new Date();
  const timestamps = existing.statusTimestamps as Record<string, string>;
  const updatedTimestamps = { ...timestamps, [status]: now.toISOString() };

  const [updated] = await db
    .update(orders)
    .set({
      status: status as OrderStatus,
      statusTimestamps: updatedTimestamps,
      updatedAt: now,
    })
    .where(eq(orders.id, id))
    .returning();

  return NextResponse.json({
    id: updated.id,
    status: updated.status,
    statusTimestamps: updated.statusTimestamps,
    updatedAt: updated.updatedAt.toISOString(),
  });
}
