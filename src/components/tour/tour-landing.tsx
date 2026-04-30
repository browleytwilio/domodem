"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Sparkles, Users, Target, MailCheck, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { allAdventures } from "@/lib/tour/registry";
import { useTourStore } from "@/stores/tour-store";
import { useSegmentStore } from "@/stores/segment-store";
import { trackTourStarted } from "@/lib/analytics/events";
import type { Adventure } from "@/lib/tour/types";

const ICON_MAP = {
  identity: User,
  audience: Users,
  tracking: Target,
  rescue: MailCheck,
} as const;

export function TourLanding({ guestName }: { guestName: string }) {
  const router = useRouter();
  const active = useTourStore((s) => s.active);
  const completed = useTourStore((s) => s.completed);
  const start = useTourStore((s) => s.startAdventure);
  const setDemoMode = useSegmentStore((s) => s.setDemoMode);

  useEffect(() => {
    if (!guestName) return;
    if (useTourStore.getState().guestName === guestName) return;
    useTourStore.setState({ guestName });
  }, [guestName]);

  function handleStart(a: Adventure) {
    setDemoMode(true);
    start(a.id, guestName || undefined);
    trackTourStarted({ adventure_id: a.id, guest_name: guestName || "guest" });
    router.push(`/tour/${a.id}`);
  }

  const greeting = guestName ? `, ${guestName}` : "";

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-10 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-rose-400">
          <Sparkles className="h-3.5 w-3.5" />
          Self-demo tour
        </div>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          Welcome{greeting}. Let&apos;s show you your data in motion.
        </h1>
        <p className="max-w-2xl text-slate-300">
          Pick a path. Each one walks you through one slice of the Segment story —
          live, on this site, using your real event stream. About three minutes each.
        </p>
      </div>

      {active && (
        <div className="mb-8 flex items-center justify-between rounded-xl border border-rose-400/30 bg-rose-500/10 p-4">
          <span className="text-sm">
            You&apos;re mid-tour.{" "}
            <span className="font-semibold">
              {allAdventures().find((a) => a.id === active)?.title}
            </span>
          </span>
          <Link
            href={`/tour/${active}`}
            className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:opacity-90"
          >
            Resume
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {allAdventures().map((a) => {
          const Icon = ICON_MAP[a.icon];
          const done = completed.includes(a.id);
          return (
            <Card
              key={a.id}
              className="group relative border-white/10 bg-slate-900/60 text-white"
            >
              {done && (
                <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-emerald-400" />
              )}
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-300">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  <p className="text-xs text-slate-400">{a.tagline}</p>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3 pt-0">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Badge variant="outline" className="border-white/10 text-slate-200">
                    {a.estMinutes} min
                  </Badge>
                  <Badge variant="outline" className="border-white/10 text-slate-200">
                    {a.difficulty}
                  </Badge>
                </div>
                <Button
                  onClick={() => handleStart(a)}
                  className="bg-[var(--dominos-red)] text-white hover:opacity-90"
                  size="sm"
                >
                  Start
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/"
          className="text-xs text-slate-400 underline-offset-4 hover:underline"
        >
          Skip the tour, just explore &rarr;
        </Link>
      </div>
    </div>
  );
}
