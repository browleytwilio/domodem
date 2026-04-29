"use client";

import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LoggedEvent } from "@/lib/segment/types";

const kindColor: Record<LoggedEvent["kind"], string> = {
  track: "bg-emerald-100 text-emerald-700",
  identify: "bg-sky-100 text-sky-700",
  page: "bg-violet-100 text-violet-700",
  group: "bg-amber-100 text-amber-700",
  alias: "bg-pink-100 text-pink-700",
  reset: "bg-muted text-muted-foreground",
};

export function EventRow({
  event,
  selected,
  onClick,
}: {
  event: LoggedEvent;
  selected: boolean;
  onClick: () => void;
}) {
  const label = event.name ?? event.kind;
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors",
        selected ? "bg-muted" : "hover:bg-muted/60",
      )}
    >
      <Badge variant="secondary" className={cn("font-mono uppercase", kindColor[event.kind])}>
        {event.kind}
      </Badge>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{label}</div>
        <div className="truncate text-xs text-muted-foreground">
          {new Date(event.timestamp).toLocaleTimeString()}
          {event.userId ? ` · ${event.userId.slice(0, 12)}` : " · anon"}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
