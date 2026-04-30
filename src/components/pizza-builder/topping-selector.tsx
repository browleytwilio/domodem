"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Check } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Topping, ToppingSelection, ToppingPlacement } from "@/types/menu";
import allToppings from "@/data/toppings.json";

interface ToppingSelectorProps {
  selectedToppings: ToppingSelection[];
  onToppingsChange: (toppings: ToppingSelection[]) => void;
}

const CATEGORIES = [
  { key: "meats", label: "Meats" },
  { key: "veggies", label: "Veggies" },
  { key: "cheese", label: "Cheese" },
  { key: "seafood", label: "Seafood" },
] as const;

const PLACEMENTS: { value: ToppingPlacement; label: string }[] = [
  { value: "left", label: "Left Half" },
  { value: "right", label: "Right Half" },
  { value: "whole", label: "Whole" },
];

// Filter out sauces since they are handled by sauce-selector
const selectableToppings: Topping[] = (allToppings as Topping[]).filter(
  (t) => t.category !== "sauces"
);

export function ToppingSelector({
  selectedToppings,
  onToppingsChange,
}: ToppingSelectorProps) {
  const [expandedTopping, setExpandedTopping] = useState<string | null>(null);

  const selectedSlugs = useMemo(
    () => new Set(selectedToppings.map((s) => s.topping.slug)),
    [selectedToppings]
  );

  const toppingsByCategory = useMemo(() => {
    const map = new Map<string, Topping[]>();
    for (const cat of CATEGORIES) {
      map.set(
        cat.key,
        selectableToppings.filter((t) => t.category === cat.key)
      );
    }
    return map;
  }, []);

  function handleToggleTopping(topping: Topping) {
    if (selectedSlugs.has(topping.slug)) {
      // Remove
      onToppingsChange(
        selectedToppings.filter((s) => s.topping.slug !== topping.slug)
      );
      setExpandedTopping(null);
    } else {
      // Show placement picker
      setExpandedTopping(topping.slug);
    }
  }

  function handlePlacementSelect(topping: Topping, placement: ToppingPlacement) {
    const existing = selectedToppings.filter(
      (s) => s.topping.slug !== topping.slug
    );
    onToppingsChange([...existing, { topping, placement }]);
    setExpandedTopping(null);
  }

  function handlePlacementChange(slug: string, placement: ToppingPlacement) {
    onToppingsChange(
      selectedToppings.map((s) =>
        s.topping.slug === slug ? { ...s, placement } : s
      )
    );
  }

  function getPlacement(slug: string): ToppingPlacement | null {
    const sel = selectedToppings.find((s) => s.topping.slug === slug);
    return sel ? sel.placement : null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Toppings
        </h3>
        <Badge
          variant="secondary"
          className="bg-[var(--dominos-blue)] text-white"
        >
          {selectedToppings.length} selected
        </Badge>
      </div>

      <Tabs defaultValue="meats">
        <TabsList variant="line" className="w-full">
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.key} value={cat.key}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((cat) => (
          <TabsContent key={cat.key} value={cat.key}>
            <div className="grid grid-cols-2 gap-2 pt-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
              {(toppingsByCategory.get(cat.key) ?? []).map((topping) => {
                const isSelected = selectedSlugs.has(topping.slug);
                const isExpanded = expandedTopping === topping.slug;
                const currentPlacement = getPlacement(topping.slug);

                return (
                  <div key={topping.slug} className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleTopping(topping)}
                      className={cn(
                        "relative flex items-center gap-2.5 rounded-lg border-2 px-2.5 py-2 text-left transition-all",
                        isSelected
                          ? "border-[var(--dominos-green)] bg-[var(--dominos-green)]/5"
                          : "border-border hover:border-muted-foreground/30 hover:bg-muted/50",
                        isExpanded && !isSelected && "border-[var(--dominos-blue)]/50"
                      )}
                    >
                      <span className="relative flex h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border/70">
                        {topping.image && (
                          <Image
                            src={topping.image}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </span>
                      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                        <span
                          className={cn(
                            "truncate text-sm font-semibold leading-tight",
                            isSelected && "text-[var(--dominos-green)]"
                          )}
                        >
                          {topping.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ${topping.price.toFixed(2)}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-colors",
                          isSelected
                            ? "bg-[var(--dominos-green)] text-white"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {isSelected ? (
                          <Minus className="h-3.5 w-3.5" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </button>

                    {/* Placement selector for newly added topping */}
                    <AnimatePresence>
                      {isExpanded && !isSelected && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div className="flex gap-1 rounded-md border bg-muted/30 p-1">
                            {PLACEMENTS.map((p) => (
                              <button
                                key={p.value}
                                type="button"
                                onClick={() =>
                                  handlePlacementSelect(topping, p.value)
                                }
                                className="flex min-h-9 flex-1 items-center justify-center rounded px-1.5 py-1 text-[11px] font-medium transition-colors hover:bg-[var(--dominos-blue)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dominos-blue)]/50 active:scale-95"
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Placement changer for already selected topping */}
                    {isSelected && currentPlacement && (
                      <div className="flex gap-1 rounded-md border bg-muted/30 p-1">
                        {PLACEMENTS.map((p) => (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() =>
                              handlePlacementChange(topping.slug, p.value)
                            }
                            className={cn(
                              "flex min-h-9 flex-1 items-center justify-center gap-0.5 rounded px-1.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dominos-blue)]/50 active:scale-95",
                              currentPlacement === p.value
                                ? "bg-[var(--dominos-blue)] text-white"
                                : "hover:bg-muted"
                            )}
                          >
                            {currentPlacement === p.value && (
                              <Check className="h-2.5 w-2.5" />
                            )}
                            {p.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
