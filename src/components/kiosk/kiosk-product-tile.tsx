"use client";

import Link from "next/link";
import { ProductImage } from "@/components/ui/product-image";
import type { Product } from "@/types/menu";

export function KioskProductTile({ product }: { product: Product }) {
  const price = Math.min(
    ...Object.values(product.prices).filter(
      (v): v is number => typeof v === "number",
    ),
  );
  return (
    <Link
      href={`/kiosk/product/${product.slug}`}
      className="flex flex-col overflow-hidden rounded-2xl border-2 border-slate-100 bg-white transition-transform hover:scale-[1.015] hover:border-[var(--dominos-red)]/60"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        <ProductImage
          src={product.image}
          alt={product.name}
          slug={product.slug}
          category={product.category}
          fill
          sizes="240px"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-bold leading-tight">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
          {product.description}
        </p>
        <div className="mt-auto flex items-end justify-between pt-3">
          <span className="text-sm font-semibold text-slate-500">From</span>
          <span className="text-2xl font-black text-[var(--dominos-red)]">
            ${price.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}
