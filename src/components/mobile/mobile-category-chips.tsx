"use client";

import { cn } from "@/lib/utils";

export const MOBILE_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "pizzas", label: "Pizzas" },
  { value: "sides", label: "Sides" },
  { value: "drinks", label: "Drinks" },
  { value: "desserts", label: "Desserts" },
  { value: "pastas", label: "Pastas" },
  { value: "chicken", label: "Chicken" },
  { value: "vegan", label: "Vegan" },
] as const;

export type MobileCategory = (typeof MOBILE_CATEGORIES)[number]["value"];

interface Props {
  active: MobileCategory;
  onChange: (next: MobileCategory) => void;
}

export function MobileCategoryChips({ active, onChange }: Props) {
  return (
    <div className="sticky top-11 z-20 -mx-4 flex gap-2 overflow-x-auto bg-background/95 px-4 py-2 backdrop-blur [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {MOBILE_CATEGORIES.map((cat) => {
        const isActive = cat.value === active;
        return (
          <button
            key={cat.value}
            type="button"
            onClick={() => onChange(cat.value)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              isActive
                ? "border-[var(--dominos-red)] bg-[var(--dominos-red)] text-white"
                : "border-border bg-background text-foreground/80 hover:border-foreground/30",
            )}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
