"use client";

import { Minus, Plus, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Product, PizzaSize, CrustType, ToppingSelection } from "@/types/menu";

interface BuilderSummaryProps {
  product: Product;
  size: PizzaSize;
  crust: CrustType;
  sauce: string;
  toppings: ToppingSelection[];
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  totalPrice: number;
}

const SIZE_LABELS: Record<PizzaSize, string> = {
  personal: "Personal",
  value: "Value",
  large: "Large",
  "extra-large": "Extra Large",
};

const CRUST_LABELS: Record<CrustType, string> = {
  classic: "Classic Crust",
  "thin-crispy": "Thin & Crispy",
  "deep-pan": "Deep Pan",
  "cheesy-crust": "Cheesy Crust",
};

const CRUST_PRICES: Record<CrustType, number> = {
  classic: 0,
  "thin-crispy": 0,
  "deep-pan": 1.0,
  "cheesy-crust": 2.5,
};

const SAUCE_LABELS: Record<string, string> = {
  "tomato-sauce": "Tomato Sauce",
  "bbq-sauce": "BBQ Sauce",
  "garlic-aioli": "Garlic Aioli",
  "peri-peri": "Peri Peri",
};

export function BuilderSummary({
  product,
  size,
  crust,
  sauce,
  toppings,
  quantity,
  onQuantityChange,
  onAddToCart,
  totalPrice,
}: BuilderSummaryProps) {
  const basePrice = product.prices[size] ?? 0;
  const crustModifier = CRUST_PRICES[crust];

  // Default toppings are included in the base price; extra toppings cost extra
  const defaultSlugs = new Set(product.defaultToppings ?? []);
  const extraToppings = toppings.filter(
    (t) => !defaultSlugs.has(t.topping.slug)
  );
  const defaultToppings = toppings.filter((t) =>
    defaultSlugs.has(t.topping.slug)
  );

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <h3 className="text-lg font-bold text-foreground">{product.name}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {product.description}
        </p>
      </div>

      <div className="space-y-3 px-5 py-4 text-sm">
        {/* Size */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{SIZE_LABELS[size]}</span>
          <span className="font-semibold">${basePrice.toFixed(2)}</span>
        </div>

        {/* Crust */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{CRUST_LABELS[crust]}</span>
          <span className="font-semibold">
            {crustModifier > 0 ? `+$${crustModifier.toFixed(2)}` : "Included"}
          </span>
        </div>

        {/* Sauce */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            {SAUCE_LABELS[sauce] ?? sauce}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Included
          </span>
        </div>

        <Separator />

        {/* Default toppings */}
        {defaultToppings.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Included Toppings
            </p>
            {defaultToppings.map((sel) => (
              <div
                key={sel.topping.slug}
                className="flex items-center justify-between py-0.5"
              >
                <span className="text-muted-foreground">
                  {sel.topping.name}
                  {sel.placement !== "whole" && (
                    <span className="ml-1 text-xs text-muted-foreground/70">
                      ({sel.placement} half)
                    </span>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">Included</span>
              </div>
            ))}
          </div>
        )}

        {/* Extra toppings */}
        {extraToppings.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Extra Toppings
            </p>
            {extraToppings.map((sel) => (
              <div
                key={sel.topping.slug}
                className="flex items-center justify-between py-0.5"
              >
                <span className="text-muted-foreground">
                  {sel.topping.name}
                  {sel.placement !== "whole" && (
                    <span className="ml-1 text-xs text-muted-foreground/70">
                      ({sel.placement} half)
                    </span>
                  )}
                </span>
                <span className="font-medium text-[var(--dominos-green)]">
                  +${sel.topping.price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* Total */}
        <motion.div
          className="flex items-center justify-between"
          key={totalPrice}
          initial={{ scale: 1.04 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <span className="text-base font-bold">Total (each)</span>
          <span className="text-lg font-bold text-[var(--dominos-red)]">
            ${totalPrice.toFixed(2)}
          </span>
        </motion.div>
      </div>

      {/* Quantity + Add to Cart */}
      <div className="border-t px-5 py-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Quantity
          </span>
          <div className="flex items-center gap-3 rounded-full border px-1">
            <button
              type="button"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[2rem] text-center text-sm font-bold">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(Math.min(10, quantity + 1))}
              disabled={quantity >= 10}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Button
          type="button"
          onClick={onAddToCart}
          className="w-full gap-2 bg-[var(--dominos-red)] py-6 text-base font-bold text-white hover:bg-[var(--dominos-red)]/90"
          size="lg"
        >
          <ShoppingCart className="h-5 w-5" />
          Add to Cart &mdash; ${(totalPrice * quantity).toFixed(2)}
        </Button>
      </div>
    </div>
  );
}
