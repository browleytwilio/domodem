"use client";

import { useState, useEffect, useMemo, useCallback, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { BuilderCanvas } from "@/components/pizza-builder/builder-canvas";
import { CrustSelector, CRUST_PRICE_MODIFIERS } from "@/components/pizza-builder/crust-selector";
import { SauceSelector } from "@/components/pizza-builder/sauce-selector";
import { ToppingSelector } from "@/components/pizza-builder/topping-selector";
import { BuilderSummary } from "@/components/pizza-builder/builder-summary";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import {
  trackPizzaBuilderOpened,
  trackPizzaSizeSelected,
  trackPizzaCrustSelected,
  trackPizzaToppingAdded,
  trackPizzaToppingRemoved,
  trackPizzaBuilderCompleted,
  trackProductAdded,
  toSegmentProduct,
} from "@/lib/analytics/events";

import type { Product, PizzaSize, CrustType, Topping, ToppingSelection } from "@/types/menu";
import menuData from "@/data/menu.json";
import allToppingsData from "@/data/toppings.json";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const products = menuData as unknown as Product[];
const allToppings = allToppingsData as Topping[];

function findProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

function resolveDefaultToppings(product: Product): ToppingSelection[] {
  if (!product.defaultToppings) return [];
  const result: ToppingSelection[] = [];
  for (const slug of product.defaultToppings) {
    const topping = allToppings.find((t) => t.slug === slug);
    if (topping) {
      result.push({ topping, placement: "whole" });
    }
  }
  return result;
}

function findDefaultSauce(product: Product): string {
  const sauceSlugs = ["tomato-sauce", "bbq-sauce", "garlic-aioli", "peri-peri"];
  const found = product.defaultToppings?.find((slug) =>
    sauceSlugs.includes(slug)
  );
  return found ?? "tomato-sauce";
}

// ---------------------------------------------------------------------------
// Size selector (inline since it's small)
// ---------------------------------------------------------------------------

const SIZE_OPTIONS: { value: PizzaSize; label: string }[] = [
  { value: "personal", label: "Personal" },
  { value: "value", label: "Value" },
  { value: "large", label: "Large" },
  { value: "extra-large", label: "Extra Large" },
];

function SizeSelector({
  product,
  selectedSize,
  onSizeChange,
}: {
  product: Product;
  selectedSize: PizzaSize;
  onSizeChange: (size: PizzaSize) => void;
}) {
  const availableSizes = SIZE_OPTIONS.filter(
    (s) => product.prices[s.value] !== undefined
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        Choose Your Size
      </h3>
      <div className="flex flex-wrap gap-2">
        {availableSizes.map((option) => {
          const isSelected = selectedSize === option.value;
          const price = product.prices[option.value];
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSizeChange(option.value)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg border-2 px-4 py-2.5 transition-all",
                isSelected
                  ? "border-[var(--dominos-blue)] bg-[var(--dominos-blue)]/5 shadow-sm"
                  : "border-border hover:border-[var(--dominos-blue)]/40 hover:bg-muted/50"
              )}
            >
              <span
                className={cn(
                  "text-sm font-semibold",
                  isSelected ? "text-[var(--dominos-blue)]" : "text-foreground"
                )}
              >
                {option.label}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                ${price?.toFixed(2)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const product = findProduct(slug);

  // Must always call all hooks in the same order, so these are called
  // unconditionally. We redirect below if product is missing.
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  const [size, setSize] = useState<PizzaSize>("large");
  const [crust, setCrust] = useState<CrustType>("classic");
  const [sauce, setSauce] = useState<string>("tomato-sauce");
  const [selectedToppings, setSelectedToppings] = useState<ToppingSelection[]>(
    []
  );
  const [quantity, setQuantity] = useState(1);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize state from product defaults once
  useEffect(() => {
    if (!product || hasInitialized) return;
    const defaultSize: PizzaSize =
      product.prices.large !== undefined ? "large" : "value";
    setSize(defaultSize);
    setSelectedToppings(resolveDefaultToppings(product));
    setSauce(findDefaultSauce(product));
    setHasInitialized(true);
  }, [product, hasInitialized]);

  // Track builder opened on mount
  useEffect(() => {
    if (!product || !hasInitialized) return;
    trackPizzaBuilderOpened(product.slug, size, "/menu");
    // Only fire once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasInitialized]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    if (!product) return 0;
    const basePrice = product.prices[size] ?? 0;
    const crustMod = CRUST_PRICE_MODIFIERS[crust];

    // Default toppings are free; extras cost their listed price
    const defaultSlugs = new Set(product.defaultToppings ?? []);
    const extraToppingsPrice = selectedToppings
      .filter((sel) => !defaultSlugs.has(sel.topping.slug))
      .reduce((sum, sel) => sum + sel.topping.price, 0);

    return basePrice + crustMod + extraToppingsPrice;
  }, [product, size, crust, selectedToppings]);

  // Event-tracked handlers
  const handleSizeChange = useCallback(
    (newSize: PizzaSize) => {
      setSize(newSize);
      if (product) {
        trackPizzaSizeSelected(
          product.slug,
          newSize,
          product.prices[newSize] ?? 0
        );
      }
    },
    [product]
  );

  const handleCrustChange = useCallback(
    (newCrust: CrustType) => {
      setCrust(newCrust);
      if (product) {
        trackPizzaCrustSelected(
          product.slug,
          newCrust,
          CRUST_PRICE_MODIFIERS[newCrust]
        );
      }
    },
    [product]
  );

  const handleSauceChange = useCallback((newSauce: string) => {
    setSauce(newSauce);
  }, []);

  const handleToppingsChange = useCallback(
    (newToppings: ToppingSelection[]) => {
      if (!product) return;

      // Detect added toppings for analytics
      const oldSlugs = new Set(selectedToppings.map((s) => s.topping.slug));
      const addedToppings = newToppings.filter(
        (t) => !oldSlugs.has(t.topping.slug)
      );
      for (const added of addedToppings) {
        trackPizzaToppingAdded(
          product.slug,
          added.topping.slug,
          added.placement,
          added.topping.price
        );
      }

      // Detect removed toppings for analytics
      const newSlugs = new Set(newToppings.map((s) => s.topping.slug));
      const removedToppings = selectedToppings.filter(
        (t) => !newSlugs.has(t.topping.slug)
      );
      for (const removed of removedToppings) {
        trackPizzaToppingRemoved(product.slug, removed.topping.slug);
      }

      setSelectedToppings(newToppings);
    },
    [product, selectedToppings]
  );

  const handleAddToCart = useCallback(() => {
    if (!product) return;

    const cartItem = {
      id: crypto.randomUUID(),
      productSlug: product.slug,
      productName: product.name,
      category: product.category,
      image: product.image,
      size,
      crust,
      quantity,
      unitPrice: totalPrice,
      customizations: {
        toppings: selectedToppings,
        sauce,
      },
    };

    addItem(cartItem);

    trackPizzaBuilderCompleted(
      product.slug,
      totalPrice,
      selectedToppings.length,
      crust,
      size
    );

    trackProductAdded({
      ...toSegmentProduct(cartItem),
      customizations: {
        toppings: selectedToppings.map((s) => s.topping.slug),
        sauce,
      },
    });

    toast.success(`${product.name} added to cart`, {
      description: `${quantity}x ${size} with ${crust.replace("-", " ")} crust`,
    });
    setCartOpen(true);
  }, [product, size, crust, sauce, selectedToppings, quantity, totalPrice, addItem, setCartOpen]);

  // Handle unknown product after hooks
  if (!product) {
    notFound();
  }

  // Non-pizza products shouldn't use the builder
  const isPizza = product.category === "pizzas";

  // Filter toppings that are not sauces for the canvas
  const canvasToppings = selectedToppings.filter(
    (s) => s.topping.category !== "sauces"
  );

  return (
    <>
      {/* Back button */}
      <div className="mx-auto max-w-7xl px-4 pt-4">
          <Button
            variant="ghost"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            render={<Link href="/menu" />}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Menu
          </Button>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6 pb-28 md:pb-6">
          {isPizza ? (
            <div className="grid gap-6 md:grid-cols-[1fr_340px] md:gap-8 lg:grid-cols-[1fr_380px]">
              {/* Left column: Canvas + Controls */}
              <div className="space-y-8">
                {/* Pizza Canvas */}
                <motion.div
                  className="flex justify-center rounded-xl border bg-gradient-to-br from-muted/30 to-muted/60 py-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <BuilderCanvas
                    toppings={canvasToppings}
                    size={size}
                    crust={crust}
                  />
                </motion.div>

                {/* Controls */}
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <SizeSelector
                    product={product}
                    selectedSize={size}
                    onSizeChange={handleSizeChange}
                  />

                  <CrustSelector
                    selectedCrust={crust}
                    onCrustChange={handleCrustChange}
                  />

                  <SauceSelector
                    selectedSauce={sauce}
                    onSauceChange={handleSauceChange}
                  />

                  <ToppingSelector
                    selectedToppings={selectedToppings.filter(
                      (s) => s.topping.category !== "sauces"
                    )}
                    onToppingsChange={handleToppingsChange}
                  />
                </motion.div>
              </div>

              {/* Right column: Summary (fixed bottom on mobile, sticky sidebar on md+) */}
              <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background p-4 shadow-[0_-6px_20px_rgba(0,0,0,0.06)] md:static md:border-0 md:p-0 md:shadow-none md:self-start md:sticky md:top-28">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <BuilderSummary
                    product={product}
                    size={size}
                    crust={crust}
                    sauce={sauce}
                    toppings={selectedToppings}
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                    onAddToCart={handleAddToCart}
                    totalPrice={totalPrice}
                  />
                </motion.div>
              </div>
            </div>
          ) : (
            /* Non-pizza product: simple display */
            <div className="mx-auto max-w-md space-y-6 text-center">
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <p className="text-muted-foreground">{product.description}</p>
              <p className="text-xl font-bold text-[var(--dominos-red)]">
                ${(product.prices.single ?? 0).toFixed(2)}
              </p>
              <Button
                className="w-full bg-[var(--dominos-red)] text-white hover:bg-[var(--dominos-red)]/90"
                size="lg"
                onClick={() => {
                  addItem({
                    id: crypto.randomUUID(),
                    productSlug: product.slug,
                    productName: product.name,
                    category: product.category,
                    image: product.image,
                    quantity: 1,
                    unitPrice: product.prices.single ?? 0,
                  });
                  toast.success(`${product.name} added to cart`);
                  setCartOpen(true);
                }}
              >
                Add to Cart
              </Button>
            </div>
          )}
        </div>
    </>
  );
}
