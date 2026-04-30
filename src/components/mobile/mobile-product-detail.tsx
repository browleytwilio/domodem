"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProductImage } from "@/components/ui/product-image";
import { MobileStackedHeader } from "./mobile-stacked-header";
import { useCartStore } from "@/stores/cart-store";
import {
  BRAND,
  toSegmentProduct,
  trackProductAdded,
  trackProductViewed,
} from "@/lib/analytics/events";
import menuData from "@/data/menu.json";
import type { Product, PizzaSize, CrustType } from "@/types/menu";
import { cn } from "@/lib/utils";

const products = menuData as unknown as Product[];

const SIZES: PizzaSize[] = ["personal", "value", "large", "extra-large"];
const CRUSTS: CrustType[] = ["classic", "thin-crispy", "deep-pan", "cheesy-crust"];

export function MobileProductDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const product = useMemo(() => products.find((p) => p.slug === slug), [slug]);
  const addItem = useCartStore((s) => s.addItem);
  const [size, setSize] = useState<PizzaSize>("large");
  const [crust, setCrust] = useState<CrustType>("classic");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!product) return;
    const price = product.prices[size] ?? product.prices.single ?? 0;
    trackProductViewed({
      product_id: product.slug,
      name: product.name,
      category: product.category,
      price,
      quantity: 1,
      image_url: product.image,
      brand: BRAND,
      url: `/m/product/${product.slug}`,
    });
  }, [product, size]);

  if (!product) notFound();

  const isPizza = product.category === "pizzas";
  const unitPrice =
    (isPizza ? product.prices[size] : product.prices.single) ?? 0;
  const total = unitPrice * qty;

  function handleAdd() {
    const item = {
      id: `${product!.slug}-${Date.now()}`,
      productSlug: product!.slug,
      productName: product!.name,
      category: product!.category,
      image: product!.image,
      quantity: qty,
      unitPrice,
      ...(isPizza && { size, crust }),
    };
    addItem(item);
    trackProductAdded(toSegmentProduct(item));
    toast.success(`${product!.name} added to cart`);
    router.back();
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <MobileStackedHeader title={product.name} />
      <div className="relative h-60 w-full">
        <ProductImage
          src={product.image}
          alt={product.name}
          slug={product.slug}
          category={product.category}
          fill
          sizes="420px"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-5 px-4 py-4">
        <div>
          <h1 className="text-xl font-bold">{product.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {product.description}
          </p>
        </div>

        {isPizza && (
          <>
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Size
              </h2>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {SIZES.map((s) => {
                  const price = product.prices[s];
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      disabled={price === undefined}
                      className={cn(
                        "flex flex-col items-center rounded-xl border px-2 py-2 text-sm font-semibold transition-colors disabled:opacity-30",
                        size === s
                          ? "border-[var(--dominos-red)] bg-[var(--dominos-red)]/10 text-[var(--dominos-red)]"
                          : "border-border text-foreground/80",
                      )}
                    >
                      <span className="capitalize">{s}</span>
                      {price !== undefined && (
                        <span className="mt-0.5 text-xs text-muted-foreground">
                          ${price.toFixed(2)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Crust
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {CRUSTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCrust(c)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors",
                      crust === c
                        ? "border-[var(--dominos-red)] bg-[var(--dominos-red)] text-white"
                        : "border-border text-foreground/80",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quantity
          </h2>
          <div className="mt-2 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-lg"
            >
              −
            </button>
            <span className="min-w-8 text-center text-lg font-semibold">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-lg"
            >
              +
            </button>
          </div>
        </section>
      </div>

      <div className="sticky bottom-0 border-t border-border/60 bg-background/95 p-3 backdrop-blur">
        <button
          type="button"
          onClick={handleAdd}
          className="flex w-full items-center justify-center rounded-xl bg-[var(--dominos-red)] py-3.5 text-sm font-bold text-white shadow-lg active:scale-[0.99]"
        >
          Add to cart · ${total.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
