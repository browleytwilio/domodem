"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import menuData from "@/data/menu.json";

interface MenuItem {
  slug: string;
  name: string;
  description: string;
  category: string;
  image: string;
  prices: Record<string, number>;
  isPopular: boolean;
  isNew: boolean;
}


function getLowestPrice(prices: Record<string, number>): number {
  return Math.min(...Object.values(prices));
}

export function PopularItems() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const popularItems = (menuData as unknown as MenuItem[]).filter(
    (item) => item.isPopular
  );

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }

  return (
    <section className="py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section header */}
        <div className="mb-6 flex items-end justify-between sm:mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Most Popular
            </h2>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Our customers&apos; top picks, ordered again and again
            </p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className="h-9 w-9 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className="h-9 w-9 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable row */}
        <div className="relative">
          {/* Left fade */}
          {canScrollLeft && (
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-background to-transparent" />
          )}
          {/* Right fade */}
          {canScrollRight && (
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-background to-transparent" />
          )}

          <div
            ref={scrollRef}
            className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-none sm:gap-5"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {popularItems.map((item, idx) => (
              <motion.div
                key={item.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.35 }}
                className="w-[180px] flex-shrink-0 snap-start sm:w-[210px] lg:w-[240px]"
              >
                <div className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                  {/* Image area */}
                  <Link
                    href={`/product/${item.slug}`}
                    className="relative block h-36 overflow-hidden sm:h-40"
                  >
                    <ProductImage
                      src={item.image}
                      alt={item.name}
                      slug={item.slug}
                      category={item.category}
                      fill
                      sizes="(max-width: 640px) 180px, (max-width: 1024px) 210px, 240px"
                      priority={idx < 3}
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                    {item.isNew && (
                      <span className="absolute left-2 top-2 z-10 rounded-full bg-[var(--dominos-orange)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        New
                      </span>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex flex-1 flex-col p-3 sm:p-4">
                    <Link
                      href={`/product/${item.slug}`}
                      className="line-clamp-1 text-sm font-semibold text-foreground transition-colors hover:text-[var(--dominos-red)]"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      from ${getLowestPrice(item.prices).toFixed(2)}
                    </p>
                    <div className="mt-auto pt-3">
                      <Link
                        href={`/product/${item.slug}`}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--dominos-red)] px-3 py-2 text-xs font-bold text-white transition-all hover:bg-[var(--dominos-red)]/90 active:scale-[0.98] sm:text-sm"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
