"use client";

import { Suspense, useState, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CategoryNav } from "@/components/menu/category-nav";
import { ProductGrid } from "@/components/menu/product-grid";
import { NextBestOffer } from "@/components/segment/next-best-offer";
import {
  trackProductListViewed,
  trackProductListFiltered,
} from "@/lib/analytics/events";
import menuData from "@/data/menu.json";
import type { Product } from "@/types/menu";

const products = menuData as unknown as Product[];

const categoryLabels: Record<string, string> = {
  all: "All Items",
  pizzas: "Pizzas",
  sides: "Sides",
  drinks: "Drinks",
  desserts: "Desserts",
  pastas: "Pastas",
  chicken: "Chicken",
  vegan: "Vegan",
};

const validCategories = new Set([
  "all",
  "pizzas",
  "sides",
  "drinks",
  "desserts",
  "pastas",
  "chicken",
  "vegan",
]);

function MenuPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "all";
  const [activeCategory, setActiveCategory] = useState(
    validCategories.has(initialCategory) ? initialCategory : "all",
  );
  const firstRenderRef = useRef(true);

  // Keep URL in sync with category
  useEffect(() => {
    const next = new URLSearchParams(searchParams.toString());
    if (activeCategory === "all") {
      next.delete("category");
    } else {
      next.set("category", activeCategory);
    }
    const queryString = next.toString();
    const url = queryString ? `/menu?${queryString}` : "/menu";
    router.replace(url, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const heading = categoryLabels[activeCategory] ?? "Menu";
  const count = filteredProducts.length;

  useEffect(() => {
    const productsPayload = filteredProducts.map((p, idx) => ({
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
    trackProductListViewed(activeCategory, productsPayload);

    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    trackProductListFiltered("menu", activeCategory, filteredProducts.length);
  }, [activeCategory, filteredProducts]);

  return (
    <>
      <CategoryNav
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <div className="mx-auto max-w-7xl px-4 py-6">
        <NextBestOffer />

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {heading}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {count} {count === 1 ? "item" : "items"}
          </p>
        </div>

        <ProductGrid products={filteredProducts} />
      </div>
    </>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={null}>
      <MenuPageInner />
    </Suspense>
  );
}
