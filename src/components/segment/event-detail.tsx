"use client";

import { Copy, Code2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LoggedEvent } from "@/lib/segment/types";

export function EventDetail({
  event,
  onBack,
}: {
  event: LoggedEvent | null;
  onBack?: () => void;
}) {
  if (!event) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div className="max-w-xs">
          <Code2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Select an event to see its full JSON payload — the same shape Segment would send to downstream destinations.
          </p>
        </div>
      </div>
    );
  }

  const payload = {
    type: event.kind,
    event: event.name,
    userId: event.userId,
    anonymousId: event.anonymousId,
    properties: event.properties,
    traits: event.traits,
    groupId: event.groupId,
    previousId: event.previousId,
    timestamp: event.timestamp,
  };

  const json = JSON.stringify(payload, null, 2);

  function handleCopy() {
    navigator.clipboard.writeText(json).then(() => {
      toast.success("Event JSON copied");
    });
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 h-8 gap-1 px-2 text-xs @3xl/inspector:hidden"
              onClick={onBack}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono uppercase">
                {event.kind}
              </Badge>
              <h3 className="truncate font-semibold">{event.name ?? event.kind}</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(event.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopy}>
          <Copy className="h-3.5 w-3.5" />
          Copy JSON
        </Button>
      </header>

      <pre className="flex-1 overflow-auto bg-muted/40 p-4 text-xs leading-relaxed">
        {json}
      </pre>
    </div>
  );
}
