"use client";

import { useState, useMemo, useEffect, use } from "react";
import { notFound } from "next/navigation";
import { CategoryNav } from "@/components/menu/category-nav";
import { ProductGrid } from "@/components/menu/product-grid";
import { trackProductListViewed } from "@/lib/analytics/events";
import menuData from "@/data/menu.json";
import type { Product } from "@/types/menu";

const products = menuData as unknown as Product[];

const validCategories: Record<string, string> = {
  pizzas: "Pizzas",
  sides: "Sides",
  drinks: "Drinks",
  desserts: "Desserts",
  pastas: "Pastas",
  chicken: "Chicken",
  vegan: "Vegan",
};

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { category } = use(params);

  if (!(category in validCategories)) {
    notFound();
  }

  const [activeCategory, setActiveCategory] = useState(category);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const heading =
    activeCategory === "all"
      ? "All Items"
      : (validCategories[activeCategory] ?? "Menu");
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
  }, [activeCategory, filteredProducts]);

  return (
    <>
      <CategoryNav
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <div className="mx-auto max-w-7xl px-4 py-6">
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
