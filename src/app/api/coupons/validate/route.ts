import { NextResponse } from "next/server";
import dealsData from "@/data/deals.json";

interface Deal {
  name: string;
  price: number;
  originalPrice: number;
  code: string;
}

interface Coupon {
  discount: number;
  type: string;
  kind?: "freeDelivery";
}

const COUPONS: Record<string, Coupon> = {
  VALUE599: { discount: 4, type: "$4.00 off" },
  MEGA2999: { discount: 10, type: "$10.00 off" },
  FREEDEL: { discount: 0, type: "Free delivery", kind: "freeDelivery" },
};

for (const deal of dealsData as Deal[]) {
  const code = deal.code.toUpperCase();
  if (COUPONS[code]) continue;
  if (deal.price === 0) {
    COUPONS[code] = { discount: 0, type: deal.name, kind: "freeDelivery" };
    continue;
  }
  const savings = Math.max(0, deal.originalPrice - deal.price);
  const rounded = Math.round(savings * 100) / 100;
  COUPONS[code] = { discount: rounded, type: deal.name };
}

export async function POST(request: Request) {
  const body = await request.json();
  const { code, deliveryFee } = body as {
    code: string;
    subtotal: number;
    deliveryFee: number;
  };

  if (!code) {
    return NextResponse.json(
      { valid: false, error: "Coupon code is required" },
      { status: 400 },
    );
  }

  const normalized = code.toUpperCase();
  const coupon = COUPONS[normalized];
  if (!coupon) {
    return NextResponse.json(
      { valid: false, error: "Invalid coupon code" },
      { status: 400 },
    );
  }

  const discount =
    coupon.kind === "freeDelivery" ? deliveryFee || 7.95 : coupon.discount;

  return NextResponse.json({
    valid: true,
    code: normalized,
    discount,
    type: coupon.type,
  });
}
