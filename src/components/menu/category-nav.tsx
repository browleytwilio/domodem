"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const categories = [
  { value: "all", label: "All" },
  { value: "pizzas", label: "Pizzas" },
  { value: "sides", label: "Sides" },
  { value: "drinks", label: "Drinks" },
  { value: "desserts", label: "Desserts" },
  { value: "pastas", label: "Pastas" },
  { value: "chicken", label: "Chicken" },
  { value: "vegan", label: "Vegan" },
] as const;

interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryNav({
  activeCategory,
  onCategoryChange,
}: CategoryNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const button = activeRef.current;
      const scrollLeft =
        button.offsetLeft -
        container.offsetWidth / 2 +
        button.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [activeCategory]);

  return (
    <div className="sticky top-[60px] z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:top-[100px]">
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative">
          <div
            ref={scrollRef}
            className="scrollbar-none flex items-center gap-2 overflow-x-auto py-3"
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  ref={isActive ? activeRef : undefined}
                  onClick={() => onCategoryChange(cat.value)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full py-1 pl-1 pr-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dominos-red)]/50 focus-visible:ring-offset-2 active:scale-95",
                    isActive
                      ? "bg-[var(--dominos-red)] text-white shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "relative flex h-7 w-7 overflow-hidden rounded-full ring-1",
                      isActive ? "ring-white/40" : "ring-black/5"
                    )}
                  >
                    <Image
                      src={`/images/categories/${cat.value}.webp`}
                      alt=""
                      fill
                      sizes="28px"
                      className="object-cover"
                    />
                  </span>
                  {cat.label}
                </button>
              );
            })}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background to-transparent sm:hidden" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background to-transparent sm:hidden" />
        </div>
      </div>
    </div>
  );
}
