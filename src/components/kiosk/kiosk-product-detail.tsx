"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProductImage } from "@/components/ui/product-image";
import { KioskNumberPad } from "./kiosk-number-pad";
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
const CRUSTS: CrustType[] = [
  "classic",
  "thin-crispy",
  "deep-pan",
  "cheesy-crust",
];

export function KioskProductDetail({ slug }: { slug: string }) {
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
      url: `/kiosk/product/${product.slug}`,
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
    toast.success(`Added ${qty} × ${product!.name}`);
    router.push("/kiosk/menu");
  }

  return (
    <div className="flex h-full pt-14">
      <div className="w-1/2 bg-slate-50 p-8">
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl">
          <ProductImage
            src={product.image}
            alt={product.name}
            slug={product.slug}
            category={product.category}
            fill
            sizes="640px"
          />
        </div>
      </div>
      <div className="flex w-1/2 flex-col p-10">
        <h1 className="text-4xl font-black">{product.name}</h1>
        <p className="mt-3 text-base text-slate-500">{product.description}</p>

        {isPizza && (
          <div className="mt-8 space-y-6">
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Size
              </h2>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {SIZES.map((s) => {
                  const price = product.prices[s];
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      disabled={price === undefined}
                      className={cn(
                        "flex flex-col items-center rounded-2xl border-2 px-2 py-3 text-sm font-bold transition-colors disabled:opacity-30",
                        size === s
                          ? "border-[var(--dominos-red)] bg-[var(--dominos-red)]/10 text-[var(--dominos-red)]"
                          : "border-slate-200 text-slate-700",
                      )}
                    >
                      <span className="capitalize">{s.replace("-", " ")}</span>
                      {price !== undefined && (
                        <span className="mt-1 text-xs text-slate-500">
                          ${price.toFixed(2)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Crust
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {CRUSTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCrust(c)}
                    className={cn(
                      "rounded-full border-2 px-5 py-2.5 text-sm font-bold capitalize transition-colors",
                      crust === c
                        ? "border-[var(--dominos-red)] bg-[var(--dominos-red)] text-white"
                        : "border-slate-200 text-slate-700",
                    )}
                  >
                    {c.replace("-", " ")}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        <section className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            Quantity
          </h2>
          <div className="mt-2">
            <KioskNumberPad value={qty} onChange={setQty} />
          </div>
        </section>

        <button
          type="button"
          onClick={handleAdd}
          className="mt-auto flex items-center justify-center rounded-3xl bg-[var(--dominos-red)] py-6 text-2xl font-black text-white shadow-xl active:scale-[0.99]"
        >
          Add to cart · ${total.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
