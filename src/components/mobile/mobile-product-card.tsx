"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart-store";
import {
  trackProductAdded,
  toSegmentProduct,
  BRAND,
  trackProductClicked,
} from "@/lib/analytics/events";
import type { Product } from "@/types/menu";

function lowest(prices: Product["prices"]): number {
  const values = Object.values(prices).filter(
    (v): v is number => typeof v === "number",
  );
  return values.length > 0 ? Math.min(...values) : 0;
}

export function MobileProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const price = lowest(product.prices);
  const isPizza = product.category === "pizzas";

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const unitPrice = product.prices.single ?? price;
    const item = {
      id: `${product.slug}-${Date.now()}`,
      productSlug: product.slug,
      productName: product.name,
      category: product.category,
      image: product.image,
      quantity: 1,
      unitPrice,
    };
    addItem(item);
    trackProductAdded(toSegmentProduct(item));
  }

  function handleClick() {
    trackProductClicked({
      product_id: product.slug,
      name: product.name,
      category: product.category,
      price,
      quantity: 1,
      image_url: product.image,
      brand: BRAND,
      url: `/m/product/${product.slug}`,
    });
  }

  return (
    <Link
      href={`/m/product/${product.slug}`}
      onClick={handleClick}
      className="relative flex gap-3 rounded-2xl border border-border/70 bg-background p-3 transition-colors hover:border-foreground/20"
    >
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl">
        <ProductImage
          src={product.image}
          alt={product.name}
          slug={product.slug}
          category={product.category}
          fill
          sizes="96px"
        />
        {(product.isNew || product.isPopular) && (
          <div className="absolute left-1 top-1">
            {product.isNew ? (
              <Badge className="bg-[var(--dominos-green)] px-1.5 py-0 text-[10px] text-white">
                New
              </Badge>
            ) : (
              <Badge className="bg-[var(--dominos-orange)] px-1.5 py-0 text-[10px] text-white">
                Popular
              </Badge>
            )}
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="truncate text-sm font-bold">{product.name}</h3>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {product.description}
        </p>
        <div className="mt-auto flex items-end justify-between">
          <span className="text-sm font-bold text-[var(--dominos-red)]">
            From ${price.toFixed(2)}
          </span>
          {!isPizza && (
            <button
              type="button"
              onClick={handleAdd}
              aria-label={`Add ${product.name}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--dominos-red)] text-white shadow-md transition-transform active:scale-90"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
