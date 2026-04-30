"use client";

import { MapPin } from "lucide-react";
import type { Store } from "@/types/store";
import { cn } from "@/lib/utils";

interface StoreMapProps {
  stores: Store[];
  selectedStore?: Store | null;
  onStoreSelect: (store: Store) => void;
}

/**
 * Map placeholder that visualises store locations as positioned markers inside
 * a styled container. A real implementation would replace this with the Google
 * Maps JavaScript API (or Mapbox, Leaflet, etc.).
 */
export function StoreMap({
  stores,
  selectedStore,
  onStoreSelect,
}: StoreMapProps) {
  // Calculate bounding box so we can position markers proportionally.
  const lats = stores.map((s) => s.lat);
  const lngs = stores.map((s) => s.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;

  return (
    <div className="relative flex h-full min-h-[400px] flex-col overflow-hidden rounded-xl border bg-gradient-to-br from-blue-50 to-sky-100">
      {/* Map surface */}
      <div className="relative flex-1">
        {/* Grid lines for map-like appearance */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute left-0 right-0 border-t border-[var(--dominos-blue)]"
              style={{ top: `${(i + 1) * 11.1}%` }}
            />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute bottom-0 top-0 border-l border-[var(--dominos-blue)]"
              style={{ left: `${(i + 1) * 11.1}%` }}
            />
          ))}
        </div>

        {/* Store markers */}
        {stores.map((store) => {
          // Normalise lat/lng to 0-100% within the bounding box, with 10%
          // padding on each edge.
          const x = ((store.lng - minLng) / lngRange) * 80 + 10;
          // Latitude is inverted (higher latitude = further north = higher on
          // screen, which means lower CSS top%).
          const y = ((maxLat - store.lat) / latRange) * 80 + 10;
          const isSelected = selectedStore?.id === store.id;

          return (
            <button
              key={store.id}
              type="button"
              onClick={() => onStoreSelect(store)}
              className={cn(
                "group absolute z-10 -translate-x-1/2 -translate-y-full transition-transform hover:scale-110",
                isSelected && "z-20 scale-110"
              )}
              style={{ left: `${x}%`, top: `${y}%` }}
              title={store.name}
            >
              <MapPin
                className={cn(
                  "h-8 w-8 drop-shadow-md transition-colors",
                  isSelected
                    ? "fill-[var(--dominos-red)] text-[var(--dominos-red)]"
                    : "fill-[var(--dominos-blue)] text-[var(--dominos-blue)] group-hover:fill-[var(--dominos-red)] group-hover:text-[var(--dominos-red)]"
                )}
              />
              {/* Tooltip on hover */}
              <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-[var(--dominos-dark-blue)] px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {store.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="border-t border-[var(--dominos-blue)]/10 bg-white/60 px-4 py-2 backdrop-blur-sm">
        <p className="text-center text-xs text-muted-foreground">
          Map requires Google Maps API key for full functionality
        </p>
      </div>
    </div>
  );
}
