"use client";

import { useMemo, useState } from "react";
import { Trash2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EventRow } from "./event-row";
import { EventDetail } from "./event-detail";
import { useSegmentStore } from "@/stores/segment-store";
import { cn } from "@/lib/utils";
import type { EventKind, LoggedEvent } from "@/lib/segment/types";

const KIND_OPTIONS: { value: EventKind | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "track", label: "Track" },
  { value: "identify", label: "Identify" },
  { value: "page", label: "Page" },
  { value: "group", label: "Group" },
  { value: "alias", label: "Alias" },
];

export function EventStream() {
  const events = useSegmentStore((s) => s.events);
  const clear = useSegmentStore((s) => s.clear);

  const [kind, setKind] = useState<EventKind | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<LoggedEvent | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...events]
      .reverse()
      .filter((e) => {
        if (kind !== "all" && e.kind !== kind) return false;
        if (!q) return true;
        const hay = [
          e.name,
          e.userId,
          e.anonymousId,
          JSON.stringify(e.properties ?? {}),
          JSON.stringify(e.traits ?? {}),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
  }, [events, kind, query]);

  return (
    <div className="grid h-full grid-cols-1 @3xl/inspector:grid-cols-[360px_1fr]">
      {/* Left: list + filters */}
      <div
        className={cn(
          "flex h-full min-h-0 flex-col border-r",
          selected && "hidden @3xl/inspector:flex"
        )}
      >
        <div className="flex flex-col gap-2 border-b p-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter events..."
                className="h-8 pl-7 text-xs"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear filter"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-xs"
              onClick={() => {
                clear();
                setSelected(null);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {KIND_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setKind(opt.value)}
                className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
                  kind === opt.value
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {filtered.length} of {events.length} events
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-0.5 p-2">
            {filtered.length === 0 ? (
              <p className="p-6 text-center text-xs text-muted-foreground">
                No events match your filter.
              </p>
            ) : (
              filtered.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  selected={selected?.id === event.id}
                  onClick={() => setSelected(event)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right: detail */}
      <div
        className={cn(
          "min-h-0 bg-muted/20",
          !selected && "hidden @3xl/inspector:block"
        )}
      >
        <EventDetail event={selected} onBack={() => setSelected(null)} />
      </div>
    </div>
  );
}
