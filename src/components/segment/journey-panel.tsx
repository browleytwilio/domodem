"use client";

import { Route, CheckCircle2, Circle } from "lucide-react";
import { JOURNEY_STAGES } from "@/lib/segment/journey";
import { useSegmentStore } from "@/stores/segment-store";

export function JourneyPanel() {
  const journey = useSegmentStore((s) => s.journey);
  const currentIdx = JOURNEY_STAGES.findIndex((s) => s.stage === journey.stage);

  return (
    <div className="flex flex-col gap-4 p-6 text-sm">
      <div className="flex items-center gap-2">
        <Route className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">Customer Journey</h3>
      </div>

      <div className="grid gap-6 @3xl/inspector:grid-cols-[1fr_1fr]">
      <ol className="relative ml-3 border-l-2 border-muted">
        {JOURNEY_STAGES.map((s, idx) => {
          const reached = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <li key={s.stage} className="relative pb-5 pl-6 last:pb-0">
              <span
                className={`absolute -left-[11px] top-0 flex h-5 w-5 items-center justify-center rounded-full ${
                  isCurrent
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : reached
                      ? "bg-emerald-500 text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {reached ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </span>
              <div className="flex flex-col">
                <span className={`font-semibold ${isCurrent ? "text-primary" : ""}`}>
                  {s.label}
                </span>
                <span className="text-xs text-muted-foreground">{s.description}</span>
              </div>
            </li>
          );
        })}
      </ol>

      <section className="rounded-lg border bg-card p-3">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Stage history
        </h4>
        <ol className="space-y-1">
          {journey.history.map((h) => (
            <li key={`${h.stage}-${h.at}`} className="flex justify-between text-xs">
              <span className="font-medium capitalize">{h.stage.replace("_", " ")}</span>
              <span className="text-muted-foreground">
                {new Date(h.at).toLocaleTimeString()}
              </span>
            </li>
          ))}
        </ol>
      </section>
      </div>
    </div>
  );
}
