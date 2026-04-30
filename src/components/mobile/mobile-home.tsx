"use client";

import Link from "next/link";
import { PersonalizationBanner } from "@/components/segment/personalization-banner";
import { MobileReorderStrip } from "./mobile-reorder-strip";
import { ProductImage } from "@/components/ui/product-image";
import menuData from "@/data/menu.json";
import type { Product } from "@/types/menu";

const allProducts = menuData as unknown as Product[];

export function MobileHome() {
  const popular = allProducts.filter((p) => p.isPopular).slice(0, 4);
  return (
    <div className="px-4 pt-3 pb-24">
      <PersonalizationBanner />

      <Link
        href="/m/offers"
        className="mt-3 flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--dominos-red)] to-[var(--dominos-dark-blue)] p-5 text-white shadow-lg"
      >
        <span className="inline-block self-start rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          Today
        </span>
        <h1 className="mt-2 text-2xl font-black leading-tight">
          Any 3 Pizzas
          <br />
          from $29.95
        </h1>
        <p className="mt-1 text-xs text-white/85">
          Mix &amp; match. Pickup or delivery.
        </p>
        <span className="mt-3 inline-block self-start rounded-lg bg-white px-3.5 py-1.5 text-xs font-bold text-[var(--dominos-red)]">
          Order now →
        </span>
      </Link>

      <MobileReorderStrip />

      <section className="mt-6">
        <h2 className="mb-2 px-1 text-base font-bold">Popular right now</h2>
        <div className="flex flex-col gap-2.5">
          {popular.map((p) => {
            const price = Math.min(
              ...Object.values(p.prices).filter(
                (v): v is number => typeof v === "number",
              ),
            );
            return (
              <Link
                key={p.slug}
                href={`/m/product/${p.slug}`}
                className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background p-2.5"
              >
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
                  <ProductImage
                    src={p.image}
                    alt={p.name}
                    slug={p.slug}
                    category={p.category}
                    fill
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.description}
                  </p>
                </div>
                <span className="text-sm font-bold text-[var(--dominos-red)]">
                  ${price.toFixed(2)}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-dashed border-border/80 bg-muted/30 p-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          In-store
        </p>
        <p className="mt-1 text-sm font-semibold">
          Scan a store QR to order at the counter
        </p>
      </section>
    </div>
  );
}
