"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface SauceSelectorProps {
  selectedSauce: string;
  onSauceChange: (sauce: string) => void;
}

const SAUCE_OPTIONS = [
  { slug: "tomato-sauce", label: "Tomato", image: "/images/toppings/tomato-sauce.webp" },
  { slug: "bbq-sauce", label: "BBQ", image: "/images/toppings/bbq-sauce.webp" },
  { slug: "garlic-aioli", label: "Garlic Aioli", image: "/images/toppings/garlic-aioli.webp" },
  { slug: "peri-peri", label: "Peri Peri", image: "/images/toppings/peri-peri.webp" },
];

export function SauceSelector({
  selectedSauce,
  onSauceChange,
}: SauceSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        Sauce Base
      </h3>
      <div className="flex flex-wrap gap-2">
        {SAUCE_OPTIONS.map((sauce) => {
          const isSelected = selectedSauce === sauce.slug;
          return (
            <button
              key={sauce.slug}
              type="button"
              onClick={() => onSauceChange(sauce.slug)}
              className={cn(
                "group flex items-center gap-2 rounded-full border-2 py-1 pl-1 pr-4 text-sm font-medium transition-all",
                isSelected
                  ? "border-[var(--dominos-blue)] bg-[var(--dominos-blue)] text-white"
                  : "border-border text-foreground hover:border-[var(--dominos-blue)]/40 hover:bg-muted/50"
              )}
            >
              <span className="relative flex h-7 w-7 overflow-hidden rounded-full bg-white/70 ring-1 ring-black/5">
                <Image
                  src={sauce.image}
                  alt=""
                  fill
                  sizes="28px"
                  className="object-cover"
                />
              </span>
              {sauce.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
