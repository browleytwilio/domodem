"use client";

import { cn } from "@/lib/utils";
import type { PizzaSize, ProductPrices } from "@/types/menu";

const sizeOptions: { value: PizzaSize; label: string }[] = [
  { value: "personal", label: "Personal" },
  { value: "value", label: "Value" },
  { value: "large", label: "Large" },
  { value: "extra-large", label: "Extra Large" },
];

interface SizeSelectorProps {
  prices: ProductPrices;
  selectedSize: PizzaSize;
  onSizeChange: (size: PizzaSize) => void;
}

export function SizeSelector({
  prices,
  selectedSize,
  onSizeChange,
}: SizeSelectorProps) {
  const availableSizes = sizeOptions.filter(
    (opt) => prices[opt.value] != null
  );

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {availableSizes.map((opt) => {
        const isSelected = selectedSize === opt.value;
        const price = prices[opt.value];
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSizeChange(opt.value)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 text-sm font-medium transition-all",
              isSelected
                ? "border-[var(--dominos-red)] bg-[var(--dominos-red)]/5 text-[var(--dominos-red)]"
                : "border-border bg-background text-foreground hover:border-muted-foreground/40"
            )}
          >
            <span className="font-semibold">{opt.label}</span>
            {price != null && (
              <span
                className={cn(
                  "text-xs",
                  isSelected
                    ? "text-[var(--dominos-red)]"
                    : "text-muted-foreground"
                )}
              >
                ${price.toFixed(2)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
