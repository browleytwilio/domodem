"use client";

import { UserCircle, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSegmentStore } from "@/stores/segment-store";

export function IdentityPanel() {
  const userId = useSegmentStore((s) => s.userId);
  const anonymousId = useSegmentStore((s) => s.anonymousId);
  const traits = useSegmentStore((s) => s.traits);
  const events = useSegmentStore((s) => s.events);
  const [copied, setCopied] = useState<string | null>(null);

  const identifyEvents = events.filter((e) => e.kind === "identify");
  const aliasEvents = events.filter((e) => e.kind === "alias");

  function copy(value: string, label: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(label);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(null), 1200);
    });
  }

  const traitEntries = Object.entries(traits);

  return (
    <div className="flex flex-col gap-4 p-4 text-sm">
      <section className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <UserCircle className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Identity</h3>
          <Badge
            variant="secondary"
            className={userId ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}
          >
            {userId ? "Identified" : "Anonymous"}
          </Badge>
        </div>

        <dl className="space-y-2">
          <div className="grid grid-cols-[120px_1fr_auto] items-center gap-2">
            <dt className="text-muted-foreground">userId</dt>
            <dd className="truncate font-mono text-xs">{userId ?? "— (not set)"}</dd>
            {userId && (
              <button
                onClick={() => copy(userId, "userId")}
                className="rounded p-1 hover:bg-muted"
                aria-label="Copy userId"
              >
                {copied === "userId" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>

          <div className="grid grid-cols-[120px_1fr_auto] items-center gap-2">
            <dt className="text-muted-foreground">anonymousId</dt>
            <dd className="truncate font-mono text-xs">
              {anonymousId ?? "— (not set)"}
            </dd>
            {anonymousId && (
              <button
                onClick={() => copy(anonymousId, "anonymousId")}
                className="rounded p-1 hover:bg-muted"
                aria-label="Copy anonymousId"
              >
                {copied === "anonymousId" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
        </dl>
      </section>

      <section className="rounded-lg border bg-card p-4">
        <h3 className="mb-3 font-semibold">Traits ({traitEntries.length})</h3>
        {traitEntries.length === 0 ? (
          <p className="text-xs text-muted-foreground">No traits yet. Call <code>analytics.identify()</code> to set them.</p>
        ) : (
          <div className="divide-y">
            {traitEntries.map(([key, value]) => (
              <div key={key} className="grid grid-cols-[160px_1fr] gap-3 py-1.5">
                <span className="font-mono text-xs text-muted-foreground">{key}</span>
                <span className="font-mono text-xs break-words">{formatValue(value)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg border bg-card p-4">
        <h3 className="mb-3 font-semibold">Identity timeline</h3>
        {identifyEvents.length === 0 && aliasEvents.length === 0 ? (
          <p className="text-xs text-muted-foreground">No identify/alias calls yet.</p>
        ) : (
          <ol className="space-y-2 text-xs">
            {[...identifyEvents, ...aliasEvents]
              .sort((a, b) => a.receivedAt - b.receivedAt)
              .map((e) => (
                <li key={e.id} className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5 font-mono uppercase">
                    {e.kind}
                  </Badge>
                  <div className="flex-1">
                    <div className="font-mono">{e.userId ?? "—"}</div>
                    <div className="text-muted-foreground">
                      {new Date(e.timestamp).toLocaleTimeString()}
                      {e.previousId ? ` · from ${e.previousId}` : ""}
                    </div>
                  </div>
                </li>
              ))}
          </ol>
        )}
      </section>

      <Separator />
      <p className="text-[11px] text-muted-foreground">
        In production, Segment resolves identities across devices via the Identity Graph — connecting anonymousId → userId merges.
      </p>
    </div>
  );
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "null";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}
