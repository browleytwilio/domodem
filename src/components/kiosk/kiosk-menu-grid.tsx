"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import {
  KioskCategoryRail,
  type KioskCategory,
} from "./kiosk-category-rail";
import { KioskProductTile } from "./kiosk-product-tile";
import { useCartStore } from "@/stores/cart-store";
import {
  trackProductListViewed,
  trackProductListFiltered,
} from "@/lib/analytics/events";
import menuData from "@/data/menu.json";
import type { Product } from "@/types/menu";

const products = menuData as unknown as Product[];

export function KioskMenuGrid() {
  const [active, setActive] = useState<KioskCategory>("all");
  const count = useCartStore((s) => s.getItemCount());
  const total = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
  );
  const first = useRef(true);

  const filtered = useMemo(
    () =>
      active === "all"
        ? products
        : products.filter((p) => p.category === active),
    [active],
  );

  useEffect(() => {
    const payload = filtered.map((p, idx) => ({
      product_id: p.slug,
      name: p.name,
      category: p.category,
      price: Math.min(
        ...Object.values(p.prices).filter(
          (v): v is number => typeof v === "number",
        ),
      ),
      quantity: 1,
      position: idx + 1,
      image_url: p.image,
    }));
    trackProductListViewed(active, payload);
    if (first.current) {
      first.current = false;
      return;
    }
    trackProductListFiltered("kiosk-menu", active, filtered.length);
  }, [active, filtered]);

  return (
    <div className="flex h-full">
      <KioskCategoryRail active={active} onChange={setActive} />
      <div className="flex min-w-0 flex-1 flex-col pt-14">
        <div className="flex items-center justify-between px-6 pb-3">
          <h1 className="text-3xl font-black capitalize">
            {active === "all" ? "Full menu" : active}
          </h1>
          {count > 0 && (
            <Link
              href="/kiosk/cart"
              className="flex items-center gap-3 rounded-full bg-[var(--dominos-red)] px-5 py-3 text-base font-bold text-white shadow"
            >
              <ShoppingCart className="h-5 w-5" />
              Review cart · {count} · ${total.toFixed(2)}
            </Link>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-16">
          <div className="grid grid-cols-3 gap-5">
            {filtered.map((p) => (
              <KioskProductTile key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
