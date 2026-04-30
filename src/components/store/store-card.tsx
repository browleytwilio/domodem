"use client";

import Image from "next/image";
import { MapPin, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Store } from "@/types/store";

interface StoreCardProps {
  store: Store;
  distance?: number;
  onSelect: (store: Store) => void;
}

function getTodayHoursKey(): keyof Store["hours"] {
  const day = new Date().getDay();
  if (day === 0) return "sun";
  if (day >= 5) return "fri-sat";
  return "mon-thu";
}

function getTodayLabel(): string {
  const day = new Date().getDay();
  if (day === 0) return "Sun";
  if (day === 6) return "Sat";
  if (day === 5) return "Fri";
  return ["Mon", "Tue", "Wed", "Thu"][day - 1];
}

const featureColors: Record<string, string> = {
  delivery:
    "bg-[var(--dominos-blue)]/10 text-[var(--dominos-blue)] border-[var(--dominos-blue)]/20",
  pickup:
    "bg-[var(--dominos-green)]/10 text-[var(--dominos-green)] border-[var(--dominos-green)]/20",
  "dine-in":
    "bg-[var(--dominos-orange)]/10 text-[var(--dominos-orange)] border-[var(--dominos-orange)]/20",
};

export function StoreCard({ store, distance, onSelect }: StoreCardProps) {
  const hoursKey = getTodayHoursKey();
  const todayHours = store.hours[hoursKey];
  const todayLabel = getTodayLabel();

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      {store.image && (
        <div className="relative aspect-[16/9] w-full bg-muted">
          <Image
            src={store.image}
            alt={`${store.name} storefront`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-foreground">
            {store.name}
          </h3>

          <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {store.address}, {store.suburb} {store.state} {store.postcode}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              <span>{store.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                {todayLabel}: {todayHours}
              </span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {store.features.map((feature) => (
              <Badge
                key={feature}
                variant="outline"
                className={`text-xs capitalize ${featureColors[feature] ?? ""}`}
              >
                {feature}
              </Badge>
            ))}
          </div>
        </div>

        {distance !== undefined && (
          <div className="shrink-0 text-right">
            <span className="text-2xl font-bold text-[var(--dominos-blue)]">
              {distance.toFixed(1)}
            </span>
            <span className="block text-xs text-muted-foreground">km</span>
          </div>
        )}
      </div>

      <Button
        className="mt-4 w-full bg-[var(--dominos-blue)] font-semibold text-white hover:bg-[var(--dominos-blue)]/90"
        onClick={() => onSelect(store)}
      >
        Select Store
      </Button>
      </div>
    </div>
  );
}
