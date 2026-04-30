import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import type { Order, CartItem } from "@/types/order";

export async function POST(request: Request) {
  const body = await request.json();

  const { items, deliveryMethod, deliveryAddress, subtotal, deliveryFee, discount, total, couponCode, specialInstructions, storeId } = body;

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Order must contain at least one item" }, { status: 400 });
  }
  if (deliveryMethod !== "delivery" && deliveryMethod !== "pickup") {
    return NextResponse.json({ error: "Invalid delivery method" }, { status: 400 });
  }
  if (deliveryMethod === "delivery" && !deliveryAddress) {
    return NextResponse.json({ error: "Delivery address is required" }, { status: 400 });
  }

  let userId = "guest";
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (session?.user?.id) {
      userId = session.user.id;
    }
  } catch {
    // Guest checkout
  }

  const now = new Date();
  const estimatedMinutes = deliveryMethod === "delivery" ? 35 : 20;
  const estimatedDelivery = new Date(now.getTime() + estimatedMinutes * 60_000);

  const [inserted] = await db
    .insert(orders)
    .values({
      userId,
      storeId: storeId || "store-001",
      status: "placed",
      deliveryMethod,
      deliveryAddress: deliveryAddress || null,
      subtotal: String(subtotal),
      deliveryFee: String(deliveryFee || 0),
      discount: String(discount || 0),
      total: String(total),
      couponCode: couponCode || null,
      specialInstructions: specialInstructions || null,
      estimatedDelivery,
      statusTimestamps: { placed: now.toISOString() },
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  const orderItemValues = items.map((item: CartItem) => ({
    orderId: inserted.id,
    productSlug: item.productSlug,
    productName: item.productName,
    size: item.size || null,
    crust: item.crust || null,
    quantity: item.quantity,
    unitPrice: String(item.unitPrice),
    totalPrice: String(item.unitPrice * item.quantity),
    customizations: item.customizations || null,
  }));

  await db.insert(orderItems).values(orderItemValues);

  const order: Order = {
    id: inserted.id,
    userId,
    storeId: inserted.storeId,
    status: "placed",
    deliveryMethod,
    deliveryAddress: deliveryAddress || undefined,
    items,
    subtotal,
    deliveryFee: deliveryFee || 0,
    discount: discount || 0,
    total,
    couponCode: couponCode || undefined,
    specialInstructions: specialInstructions || undefined,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    estimatedDelivery: estimatedDelivery.toISOString(),
    statusTimestamps: { placed: now.toISOString() },
  };

  return NextResponse.json(order, { status: 201 });
}

export async function GET(request: Request) {
  let userId: string | null = null;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (session?.user?.id) {
      userId = session.user.id;
    }
  } catch {
    // Not authenticated
  }

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const results = await db.query.orders.findMany({
    where: eq(orders.userId, userId),
    with: { items: true },
    orderBy: [desc(orders.createdAt)],
    limit: 20,
  });

  const mapped: Order[] = results.map((row) => ({
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
  }));

  return NextResponse.json(mapped);
}
