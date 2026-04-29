"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DeliveryBanner } from "@/components/layout/delivery-banner";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CategoryNav } from "@/components/menu/category-nav";
import { ProductGrid } from "@/components/menu/product-grid";
import { NextBestOffer } from "@/components/segment/next-best-offer";
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

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const heading = categoryLabels[activeCategory] ?? "Menu";
  const count = filteredProducts.length;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <DeliveryBanner />
      <CartDrawer />

      <CategoryNav
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main className="flex-1">
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
      </main>

      <Footer />
    </div>
  );
}
