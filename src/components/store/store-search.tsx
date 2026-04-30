"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StoreSearchProps {
  onSearch: (query: string) => void;
  onUseLocation: () => void;
  initialQuery?: string;
}

export function StoreSearch({ onSearch, onUseLocation, initialQuery = "" }: StoreSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [locating, setLocating] = useState(false);
  const hasPreSearched = useRef(false);

  // Fire the initial search exactly once on mount if we arrived with a query.
  useEffect(() => {
    if (initialQuery && !hasPreSearched.current) {
      hasPreSearched.current = true;
      onSearch(initialQuery);
    }
  }, [initialQuery, onSearch]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  }

  function handleUseLocation() {
    setLocating(true);
    onUseLocation();
    // Reset locating state after a short delay — the parent will handle the
    // actual geolocation result asynchronously.
    setTimeout(() => setLocating(false), 3000);
  }

  return (
    <div className="w-full space-y-3">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter suburb, postcode, or store name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search stores by suburb, postcode, or name"
            autoComplete="off"
            className="h-11 pl-10 sm:h-10"
          />
        </div>
        <Button
          type="submit"
          className="h-11 bg-[var(--dominos-red)] font-semibold text-white hover:bg-[var(--dominos-red)]/90 focus-visible:ring-[var(--dominos-red)]/40 active:scale-[0.98] sm:h-10"
        >
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </form>

      <Button
        type="button"
        variant="outline"
        onClick={handleUseLocation}
        disabled={locating}
        className="w-full border-[var(--dominos-blue)] text-[var(--dominos-blue)] hover:bg-[var(--dominos-blue)]/5"
      >
        {locating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <MapPin className="mr-2 h-4 w-4" />
        )}
        {locating ? "Detecting location..." : "Use My Location"}
      </Button>
    </div>
  );
}
