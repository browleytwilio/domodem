"use client";

import {
  Pizza,
  Sandwich,
  CupSoda,
  IceCreamCone,
  Wheat,
  Drumstick,
  Leaf,
  LayoutGrid,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const KIOSK_CATEGORIES = [
  { value: "all", label: "All", Icon: LayoutGrid },
  { value: "pizzas", label: "Pizzas", Icon: Pizza },
  { value: "sides", label: "Sides", Icon: Sandwich },
  { value: "drinks", label: "Drinks", Icon: CupSoda },
  { value: "desserts", label: "Desserts", Icon: IceCreamCone },
  { value: "pastas", label: "Pastas", Icon: Wheat },
  { value: "chicken", label: "Chicken", Icon: Drumstick },
  { value: "vegan", label: "Vegan", Icon: Leaf },
] as const satisfies ReadonlyArray<{
  value: string;
  label: string;
  Icon: LucideIcon;
}>;

export type KioskCategory = (typeof KIOSK_CATEGORIES)[number]["value"];

interface Props {
  active: KioskCategory;
  onChange: (next: KioskCategory) => void;
}

export function KioskCategoryRail({ active, onChange }: Props) {
  return (
    <nav
      aria-label="Categories"
      className="flex h-full w-56 flex-col gap-2 overflow-y-auto border-r border-slate-100 bg-slate-50 p-4"
    >
      {KIOSK_CATEGORIES.map(({ value, label, Icon }) => {
        const isActive = value === active;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-base font-bold transition-colors",
              isActive
                ? "bg-[var(--dominos-red)] text-white shadow"
                : "bg-white text-slate-700 hover:bg-slate-100",
            )}
          >
            <Icon className="h-6 w-6" />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
