"use client";

import { Users, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AUDIENCES } from "@/lib/segment/audiences";
import { useSegmentStore } from "@/stores/segment-store";

export function AudiencesPanel() {
  const audiences = useSegmentStore((s) => s.audiences);
  const events = useSegmentStore((s) => s.events);
  const active = new Set(audiences.map((a) => a.id));

  const recentTransitions = events
    .filter(
      (e) =>
        e.kind === "track" &&
        (e.name === "Audience Entered" || e.name === "Audience Exited"),
    )
    .slice(-6)
    .reverse();

  return (
    <div className="flex flex-col gap-3 p-4 text-sm">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">
          Audiences ({active.size} / {AUDIENCES.length} matched)
        </h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Evaluated live from this session&apos;s events + computed traits. Crossing an audience boundary fires an <code>Audience Entered</code> / <code>Audience Exited</code> track call.
      </p>

      <div className="flex flex-col gap-2">
        {AUDIENCES.map((def) => {
          const isMember = active.has(def.id);
          const membership = audiences.find((a) => a.id === def.id);
          return (
            <div
              key={def.id}
              className={`rounded-lg border p-3 transition-colors ${
                isMember ? "border-emerald-300 bg-emerald-50/40" : "bg-card"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${def.color}`} aria-hidden />
                  <span className="font-semibold">{def.name}</span>
                </div>
                {isMember ? (
                  <Badge
                    variant="secondary"
                    className="gap-1 bg-emerald-100 text-emerald-700"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Member
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Not matched
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{def.description}</p>
              {isMember && membership && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Entered {new Date(membership.enteredAt).toLocaleTimeString()}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <section className="mt-4 rounded-lg border bg-card p-3">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Recent transitions
        </h4>
        {recentTransitions.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No audience transitions yet.
          </p>
        ) : (
          <ul className="space-y-1">
            {recentTransitions.map((e) => (
              <li key={e.id} className="flex justify-between text-xs">
                <span className="font-medium">
                  {e.name === "Audience Entered" ? "→ " : "← "}
                  {(e.properties?.audience_name as string) ?? "audience"}
                </span>
                <span className="text-muted-foreground">
                  {new Date(e.timestamp).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
