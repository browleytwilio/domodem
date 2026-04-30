"use client";

import Image from "next/image";
import type { CrustType } from "@/types/menu";
import { cn } from "@/lib/utils";

interface CrustSelectorProps {
  selectedCrust: CrustType;
  onCrustChange: (crust: CrustType) => void;
}

const CRUST_OPTIONS: {
  value: CrustType;
  label: string;
  priceModifier: number;
  image: string;
}[] = [
  { value: "classic", label: "Classic Crust", priceModifier: 0, image: "/images/crusts/classic.webp" },
  { value: "thin-crispy", label: "Thin & Crispy", priceModifier: 0, image: "/images/crusts/thin-crispy.webp" },
  { value: "deep-pan", label: "Deep Pan", priceModifier: 1.0, image: "/images/crusts/deep-pan.webp" },
  { value: "cheesy-crust", label: "Cheesy Crust", priceModifier: 2.5, image: "/images/crusts/cheesy-crust.webp" },
];

export function CrustSelector({
  selectedCrust,
  onCrustChange,
}: CrustSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        Choose Your Crust
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CRUST_OPTIONS.map((option) => {
          const isSelected = selectedCrust === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onCrustChange(option.value)}
              className={cn(
                "relative flex flex-col items-center gap-2 overflow-hidden rounded-lg border-2 p-2 text-center transition-all",
                isSelected
                  ? "border-[var(--dominos-blue)] bg-[var(--dominos-blue)]/5 shadow-sm"
                  : "border-border hover:border-[var(--dominos-blue)]/40 hover:bg-muted/50"
              )}
            >
              <span className="relative block h-16 w-full overflow-hidden rounded-md bg-muted">
                <Image
                  src={option.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                />
              </span>
              <span
                className={cn(
                  "text-sm font-semibold leading-tight",
                  isSelected ? "text-[var(--dominos-blue)]" : "text-foreground"
                )}
              >
                {option.label}
              </span>
              {option.priceModifier > 0 && (
                <span className="text-xs font-medium text-muted-foreground">
                  +${option.priceModifier.toFixed(2)}
                </span>
              )}
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--dominos-blue)] text-white">
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const CRUST_PRICE_MODIFIERS: Record<CrustType, number> = {
  classic: 0,
  "thin-crispy": 0,
  "deep-pan": 1.0,
  "cheesy-crust": 2.5,
};
