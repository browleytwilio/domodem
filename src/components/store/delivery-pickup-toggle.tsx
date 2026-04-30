"use client";

import { useUIStore } from "@/stores/ui-store";
import { trackDeliveryMethodSelected } from "@/lib/analytics/events";
import type { DeliveryMethod } from "@/types/order";
import { cn } from "@/lib/utils";

export function DeliveryPickupToggle() {
  const { deliveryMethod, setDeliveryMethod, selectedStore } = useUIStore();

  function handleChange(method: DeliveryMethod) {
    if (method === deliveryMethod) return;
    setDeliveryMethod(method);
    trackDeliveryMethodSelected(method, selectedStore?.id ?? "none");
  }

  return (
    <div className="inline-flex rounded-full border border-border bg-muted p-1">
      <button
        type="button"
        onClick={() => handleChange("delivery")}
        className={cn(
          "rounded-full px-6 py-2 text-sm font-semibold transition-colors",
          deliveryMethod === "delivery"
            ? "bg-[var(--dominos-red)] text-white shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Delivery
      </button>
      <button
        type="button"
        onClick={() => handleChange("pickup")}
        className={cn(
          "rounded-full px-6 py-2 text-sm font-semibold transition-colors",
          deliveryMethod === "pickup"
            ? "bg-[var(--dominos-red)] text-white shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Pickup
      </button>
    </div>
  );
}
