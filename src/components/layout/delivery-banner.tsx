"use client";

import { Truck, Store } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";

export function DeliveryBanner() {
  const { deliveryMethod, selectedStore, deliveryAddress } = useUIStore();

  const hasRelevantLocation =
    deliveryMethod === "delivery" ? Boolean(deliveryAddress) : Boolean(selectedStore);
  if (!hasRelevantLocation) return null;

  return (
    <div className="border-b bg-[var(--dominos-light-gray)]">
      <div className="mx-auto flex min-h-9 max-w-7xl items-center justify-center gap-2 px-4 py-1.5 text-xs sm:text-sm">
        {deliveryMethod === "delivery" ? (
          <>
            <Truck className="h-4 w-4 flex-shrink-0 text-[var(--dominos-blue)]" />
            <span className="min-w-0 truncate text-muted-foreground">
              Delivering to:{" "}
              <span className="font-medium text-foreground">
                {deliveryAddress}
              </span>
            </span>
          </>
        ) : (
          <>
            <Store className="h-4 w-4 flex-shrink-0 text-[var(--dominos-blue)]" />
            <span className="min-w-0 truncate text-muted-foreground">
              Pickup from:{" "}
              <span className="font-medium text-foreground">
                {selectedStore?.name}
              </span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
