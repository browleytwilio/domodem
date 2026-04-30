"use client";

import Link from "next/link";
import { ChevronDown, MapPin, Search, ShoppingBag } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { useCartStore } from "@/stores/cart-store";

export function MobileTopBar() {
  const deliveryMethod = useUIStore((s) => s.deliveryMethod);
  const selectedStore = useUIStore((s) => s.selectedStore);
  const itemCount = useCartStore((s) => s.getItemCount());

  return (
    <header className="sticky top-0 z-30 flex h-11 items-center justify-between border-b border-border/60 bg-background/95 px-3 backdrop-blur">
      <Link
        href="/m/account"
        className="flex min-w-0 items-center gap-1.5 rounded-full bg-muted/70 px-2.5 py-1 text-[11px] font-semibold"
      >
        <MapPin className="h-3.5 w-3.5 text-[var(--dominos-red)]" />
        <span className="uppercase tracking-wide">{deliveryMethod}</span>
        <span className="min-w-0 truncate text-muted-foreground">
          · {selectedStore ? selectedStore.name : "Pick a store"}
        </span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </Link>
      <div className="flex items-center gap-1">
        <Link
          href="/m/menu"
          aria-label="Search menu"
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted"
        >
          <Search className="h-5 w-5" />
        </Link>
        <Link
          href="/m/cart"
          aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted"
        >
          <ShoppingBag className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--dominos-red)] px-1 text-[10px] font-bold text-white">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
