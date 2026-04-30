"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Tag, ArrowRight, Percent, Flame, Copy } from "lucide-react";
import { toast } from "sonner";
import { ProductImage } from "@/components/ui/product-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  trackDealViewed,
  trackPromotionViewed,
  trackPromotionClicked,
} from "@/lib/analytics/events";
import dealsData from "@/data/deals.json";

interface Deal {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  products: string[];
  badge: string | null;
  code: string;
}

const deals = dealsData as Deal[];

// --------------------------------------------------------------------------
// Badge colour mapping
// --------------------------------------------------------------------------

function badgeClasses(badge: string): string {
  switch (badge) {
    case "Best Seller":
      return "bg-[var(--dominos-red)]/10 text-[var(--dominos-red)]";
    case "Popular":
      return "bg-[var(--dominos-orange)]/10 text-[var(--dominos-orange)]";
    case "Best Value":
    case "Family Favourite":
      return "bg-[var(--dominos-green)]/10 text-[var(--dominos-green)]";
    case "VIP Only":
      return "bg-purple-100 text-purple-700";
    case "Lunch Only":
    case "Students":
      return "bg-[var(--dominos-blue)]/10 text-[var(--dominos-blue)]";
    case "Free Delivery":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-muted text-muted-foreground";
  }
}

// --------------------------------------------------------------------------
// Savings percentage
// --------------------------------------------------------------------------

function savingsPercent(original: number, current: number): number {
  if (original <= 0 || current <= 0) return 0;
  return Math.round(((original - current) / original) * 100);
}

// --------------------------------------------------------------------------
// Deal card
// --------------------------------------------------------------------------

function DealCard({ deal, index }: { deal: Deal; index: number }) {
  const savings = savingsPercent(deal.originalPrice, deal.price);
  const firstProduct = deal.products[0] ?? "";
  const position = index + 1;

  function handleCopyCode() {
    navigator.clipboard.writeText(deal.code).then(() => {
      toast.success(`Copied code: ${deal.code}`);
    });
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      {/* Image */}
      <div className="relative h-40 overflow-hidden sm:h-48 md:h-52 lg:h-56">
        <ProductImage
          src={deal.image}
          alt={deal.name}
          slug={deal.id}
          category="deals"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

        {/* Badge */}
        {deal.badge && (
          <Badge
            className={`absolute left-3 top-3 z-10 ${badgeClasses(deal.badge)}`}
          >
            {deal.badge}
          </Badge>
        )}

        {/* Savings pill */}
        {savings > 0 && (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-[var(--dominos-green)] px-2.5 py-1 text-xs font-bold text-white">
            <Percent className="h-3 w-3" />
            Save {savings}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="mb-1 line-clamp-2 text-base font-bold leading-tight sm:text-lg">{deal.name}</h3>
        <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {deal.description}
        </p>

        {/* Code chip */}
        <button
          onClick={handleCopyCode}
          className="mb-4 flex w-fit items-center gap-1.5 rounded-md border border-dashed border-[var(--dominos-blue)]/30 bg-[var(--dominos-blue)]/5 px-3 py-1.5 text-xs font-semibold text-[var(--dominos-blue)] transition-colors hover:bg-[var(--dominos-blue)]/10"
        >
          <Tag className="h-3 w-3" />
          {deal.code}
          <Copy className="h-3 w-3 opacity-50" />
        </button>

        {/* Price */}
        <div className="mb-4 flex items-baseline gap-2">
          {deal.price > 0 ? (
            <>
              <span className="text-2xl font-bold text-[var(--dominos-red)]">
                ${deal.price.toFixed(2)}
              </span>
              {deal.originalPrice > deal.price && (
                <span className="text-sm text-muted-foreground line-through">
                  ${deal.originalPrice.toFixed(2)}
                </span>
              )}
            </>
          ) : (
            <span className="text-2xl font-bold text-[var(--dominos-green)]">
              FREE
            </span>
          )}
        </div>

        {/* CTA */}
        <Button
          className="w-full bg-[var(--dominos-red)] font-semibold hover:bg-[var(--dominos-red)]/90"
          size="lg"
          render={
            <Link
              href={firstProduct ? `/menu?deal=${deal.code}` : "/menu"}
              onClick={() =>
                trackPromotionClicked(deal.id, deal.name, position, {
                  discount_value: deal.originalPrice - deal.price,
                  creative: deal.badge ?? undefined,
                  destination_url: firstProduct
                    ? `/menu?deal=${deal.code}`
                    : "/menu",
                })
              }
            />
          }
        >
          Order Now
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Page component
// --------------------------------------------------------------------------

export default function DealsPage() {
  const trackedRef = useRef(false);

  // Track deal views on mount
  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;

    deals.forEach((deal, idx) => {
      const discountValue = deal.originalPrice - deal.price;
      trackDealViewed(deal.id, deal.name, discountValue);
      trackPromotionViewed(deal.id, deal.name, idx + 1, {
        discount_value: discountValue,
        creative: deal.badge ?? undefined,
      });
    });
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      {/* Page header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--dominos-red)]/10">
            <Flame className="h-7 w-7 text-[var(--dominos-red)]" />
          </div>
          <h1 className="mb-2 text-3xl font-bold">Today&apos;s Deals</h1>
          <p className="mx-auto max-w-lg text-muted-foreground">
            Grab one of our hot deals and save big on your favourite Domino&apos;s
            pizzas, sides, and combos. Limited time offers!
          </p>
        </div>

        {/* Deals grid */}
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {deals.map((deal, index) => (
            <DealCard key={deal.id} deal={deal} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-xl bg-gradient-to-r from-[var(--dominos-blue)] to-[var(--dominos-dark-blue)] p-8 text-center text-white">
          <h2 className="mb-2 text-2xl font-bold">
            Can&apos;t find the right deal?
          </h2>
          <p className="mb-6 text-white/80">
            Browse our full menu and build your perfect order from scratch.
          </p>
          <Button
            className="bg-white font-bold text-[var(--dominos-blue)] hover:bg-white/90"
            size="lg"
            render={<Link href="/menu" />}
          >
            View Full Menu
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
    </div>
  );
}
