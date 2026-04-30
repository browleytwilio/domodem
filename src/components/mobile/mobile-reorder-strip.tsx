"use client";

import Link from "next/link";
import { ProductImage } from "@/components/ui/product-image";
import { useSegmentStore } from "@/stores/segment-store";
import menuData from "@/data/menu.json";
import type { Product } from "@/types/menu";

const allProducts = menuData as unknown as Product[];

export function MobileReorderStrip() {
  const events = useSegmentStore((s) => s.events);
  const userId = useSegmentStore((s) => s.userId);

  if (!userId) return null;

  const slugCounts = new Map<string, number>();
  for (const e of events) {
    if (e.kind !== "track" || e.name !== "Order Completed") continue;
    const products =
      (e.properties?.products as Array<{ product_id?: string }>) ?? [];
    for (const p of products) {
      if (!p.product_id) continue;
      slugCounts.set(p.product_id, (slugCounts.get(p.product_id) ?? 0) + 1);
    }
  }

  const topSlugs = [...slugCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([slug]) => slug);

  const items = topSlugs
    .map((slug) => allProducts.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p));

  if (items.length === 0) return null;

  return (
    <section className="mt-5">
      <div className="mb-2 flex items-baseline justify-between px-1">
        <h2 className="text-base font-bold">Reorder in one tap</h2>
        <Link
          href="/m/orders"
          className="text-xs font-semibold text-[var(--dominos-red)]"
        >
          See all
        </Link>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((p) => (
          <Link
            key={p.slug}
            href={`/m/product/${p.slug}`}
            className="flex w-32 flex-shrink-0 flex-col rounded-2xl border border-border/70 bg-background p-2"
          >
            <div className="relative h-20 w-full overflow-hidden rounded-xl">
              <ProductImage
                src={p.image}
                alt={p.name}
                slug={p.slug}
                category={p.category}
                fill
                sizes="128px"
              />
            </div>
            <p className="mt-1.5 truncate text-xs font-bold">{p.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
