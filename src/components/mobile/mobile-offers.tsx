"use client";

import Image from "next/image";
import Link from "next/link";
import { NextBestOffer } from "@/components/segment/next-best-offer";
import { Badge } from "@/components/ui/badge";
import dealsData from "@/data/deals.json";
import type { Deal } from "@/types/menu";

const deals = dealsData as Deal[];

export function MobileOffers() {
  return (
    <div className="px-4 pt-3 pb-24">
      <NextBestOffer />

      <h1 className="mt-4 text-xl font-bold">Today&apos;s deals</h1>
      <div className="mt-3 flex flex-col gap-3">
        {deals.map((deal) => (
          <Link
            key={deal.id}
            href="/m/menu"
            className="flex gap-3 rounded-2xl border border-border/70 bg-background p-3"
          >
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
              <Image
                src={deal.image}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <h2 className="truncate text-sm font-bold">{deal.name}</h2>
                {deal.badge && (
                  <Badge className="bg-[var(--dominos-orange)] px-1.5 py-0 text-[10px] text-white">
                    {deal.badge}
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {deal.description}
              </p>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-sm font-black text-[var(--dominos-red)]">
                  ${deal.price.toFixed(2)}
                </span>
                {deal.originalPrice && (
                  <span className="text-[11px] text-muted-foreground line-through">
                    ${deal.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
