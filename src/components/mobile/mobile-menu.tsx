"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  MobileCategoryChips,
  type MobileCategory,
} from "./mobile-category-chips";
import { MobileProductCard } from "./mobile-product-card";
import {
  trackProductListViewed,
  trackProductListFiltered,
} from "@/lib/analytics/events";
import menuData from "@/data/menu.json";
import type { Product } from "@/types/menu";

const products = menuData as unknown as Product[];

export function MobileMenu() {
  const [active, setActive] = useState<MobileCategory>("all");
  const first = useRef(true);

  const filtered = useMemo(() => {
    if (active === "all") return products;
    return products.filter((p) => p.category === active);
  }, [active]);

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
    trackProductListFiltered("mobile-menu", active, filtered.length);
  }, [active, filtered]);

  return (
    <div className="px-4 pt-2 pb-24">
      <MobileCategoryChips active={active} onChange={setActive} />
      <div className="mt-3 flex flex-col gap-3">
        {filtered.map((p) => (
          <MobileProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
