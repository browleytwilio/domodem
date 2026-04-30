"use client";

import { Suspense, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { StoreSearch } from "@/components/store/store-search";
import { DeliveryPickupToggle } from "@/components/store/delivery-pickup-toggle";
import { StoreCard } from "@/components/store/store-card";
import { StoreMap } from "@/components/store/store-map";
import { useUIStore } from "@/stores/ui-store";
import {
  trackStoreSearchInitiated,
  trackStoreSelected,
} from "@/lib/analytics/events";
import type { Store } from "@/types/store";
import storesData from "@/data/stores.json";

// ---------------------------------------------------------------------------
// Haversine distance (km) between two lat/lng coordinate pairs
// ---------------------------------------------------------------------------
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ---------------------------------------------------------------------------
// Type-cast the static JSON import so TypeScript treats it as Store[]
// ---------------------------------------------------------------------------
const allStores: Store[] = storesData as Store[];

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
function StoreLocatorInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [filteredStores, setFilteredStores] = useState<Store[]>(allStores);
  const [searchCoords, setSearchCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const { selectedStore, setSelectedStore, deliveryMethod } = useUIStore();

  function updateUrlQuery(q: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (q) next.set("q", q);
    else next.delete("q");
    const qs = next.toString();
    router.replace(qs ? `/store-locator?${qs}` : "/store-locator", { scroll: false });
  }

  // -----------------------------------------------------------------------
  // Search handler — filter stores by name, suburb, state, or postcode
  // -----------------------------------------------------------------------
  const handleSearch = useCallback((query: string) => {
    updateUrlQuery(query);
    const q = query.toLowerCase();
    const matched = allStores.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.suburb.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q) ||
        s.postcode.includes(q)
    );

    trackStoreSearchInitiated(query, "text", {
      results_count: matched.length,
    });

    // If there is an exact postcode/suburb match, use that store's coords to
    // calculate distance for all results.
    const anchor = matched.find(
      (s) =>
        s.postcode === query ||
        s.suburb.toLowerCase() === q
    );

    if (anchor) {
      const coords = { lat: anchor.lat, lng: anchor.lng };
      setSearchCoords(coords);

      const withDistance = matched
        .map((s) => ({
          store: s,
          dist: haversineDistance(coords.lat, coords.lng, s.lat, s.lng),
        }))
        .sort((a, b) => a.dist - b.dist)
        .map((x) => x.store);

      setFilteredStores(withDistance);
    } else {
      setSearchCoords(null);
      setFilteredStores(matched);
    }

    if (matched.length === 0) {
      toast.info("No stores found", {
        description: `We couldn't find any stores matching "${query}".`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------------------------------------------------
  // Use-my-location handler
  // -----------------------------------------------------------------------
  const handleUseLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported", {
        description: "Your browser does not support location services.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        const coords = { lat: latitude, lng: longitude };
        setSearchCoords(coords);

        const sorted = [...allStores]
          .map((s) => ({
            store: s,
            dist: haversineDistance(coords.lat, coords.lng, s.lat, s.lng),
          }))
          .sort((a, b) => a.dist - b.dist)
          .map((x) => x.store);

        trackStoreSearchInitiated(
          `${latitude.toFixed(4)},${longitude.toFixed(4)}`,
          "geolocation",
          {
            results_count: sorted.length,
            latitude,
            longitude,
          },
        );

        setFilteredStores(sorted);
        toast.success("Location found", {
          description: "Showing nearest stores to your location.",
        });
      },
      () => {
        toast.error("Location access denied", {
          description:
            "Please allow location access or search by suburb / postcode.",
        });
      }
    );
  }, []);

  // -----------------------------------------------------------------------
  // Store selection handler
  // -----------------------------------------------------------------------
  const handleSelectStore = useCallback(
    (store: Store) => {
      const distance = searchCoords
        ? haversineDistance(searchCoords.lat, searchCoords.lng, store.lat, store.lng)
        : 0;

      setSelectedStore(store);
      trackStoreSelected(
        store.id,
        store.name,
        parseFloat(distance.toFixed(1)),
        {
          suburb: store.suburb,
          postcode: store.postcode,
          state: store.state,
          delivery_method: deliveryMethod,
        },
      );
      toast.success("Store selected", {
        description: `${store.name} has been set as your store.`,
      });
    },
    [searchCoords, setSelectedStore, deliveryMethod],
  );

  // -----------------------------------------------------------------------
  // Distance helper for rendering
  // -----------------------------------------------------------------------
  function getDistance(store: Store): number | undefined {
    if (!searchCoords) return undefined;
    return haversineDistance(
      searchCoords.lat,
      searchCoords.lng,
      store.lat,
      store.lng
    );
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--dominos-dark-blue)]">
            Find a Store
          </h1>
          <p className="mt-1 text-muted-foreground">
            Search for your nearest Domino&apos;s to start your order.
          </p>
        </div>

        {/* Search + toggle row */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full max-w-xl">
            <StoreSearch
              onSearch={handleSearch}
              onUseLocation={handleUseLocation}
              initialQuery={initialQuery}
            />
          </div>
          <div className="flex justify-center sm:justify-end">
            <DeliveryPickupToggle />
          </div>
        </div>

        {/* Results: map + store list */}
        <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:gap-8 lg:grid-cols-2">
          {/* Map (left on desktop, top on mobile) */}
          <div className="h-[320px] sm:h-[420px] md:sticky md:top-28 md:h-[calc(100vh-8rem)] md:self-start md:min-h-[520px]">
            <StoreMap
              stores={filteredStores}
              selectedStore={selectedStore}
              onStoreSelect={handleSelectStore}
            />
          </div>

          {/* Store list (right on desktop, bottom on mobile) */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">
              {filteredStores.length}{" "}
              {filteredStores.length === 1 ? "store" : "stores"} found
            </p>

            <div className="space-y-3">
              {filteredStores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  distance={getDistance(store)}
                  onSelect={handleSelectStore}
                />
              ))}
            </div>

            {filteredStores.length === 0 && (
              <div className="rounded-xl border border-dashed bg-muted/50 py-16 text-center">
                <p className="text-lg font-medium text-muted-foreground">
                  No stores match your search
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different suburb, postcode, or store name.
                </p>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}

export default function StoreLocatorPage() {
  return (
    <Suspense fallback={null}>
      <StoreLocatorInner />
    </Suspense>
  );
}
