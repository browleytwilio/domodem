"use client";

import { useEffect, useRef, useState } from "react";
import {
  Settings2,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Crown,
  ShoppingCart,
  Tag,
  UserRound,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PERSONAS, type PersonaIcon } from "@/lib/segment/personas";
import { useSegmentStore } from "@/stores/segment-store";
import { cn } from "@/lib/utils";

const ICONS: Record<PersonaIcon, LucideIcon> = {
  crown: Crown,
  cart: ShoppingCart,
  tag: Tag,
  user: UserRound,
};

const ICON_COLORS: Record<PersonaIcon, string> = {
  crown: "text-amber-600 bg-amber-100",
  cart: "text-orange-600 bg-orange-100",
  tag: "text-rose-600 bg-rose-100",
  user: "text-sky-600 bg-sky-100",
};

const SECTION_HEADER =
  "text-xs font-semibold uppercase tracking-wider text-muted-foreground";

const CONFIRM_WINDOW_MS = 3000;

export function DemoToolbar() {
  const demoMode = useSegmentStore((s) => s.demoModeEnabled);
  const setDemoMode = useSegmentStore((s) => s.setDemoMode);
  const clear = useSegmentStore((s) => s.clear);
  const [running, setRunning] = useState<string | null>(null);
  const [resetArmed, setResetArmed] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  async function runPersona(id: string) {
    const persona = PERSONAS.find((p) => p.id === id);
    if (!persona) return;
    setRunning(id);
    toast.loading(`Loading persona: ${persona.name}`, { id: "persona" });
    try {
      await persona.seed();
      toast.success(`Loaded ${persona.name}`, { id: "persona" });
    } catch {
      toast.error(`Failed to load persona`, { id: "persona" });
    } finally {
      setRunning(null);
    }
  }

  function handleResetClick() {
    if (!resetArmed) {
      setResetArmed(true);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setResetArmed(false);
        resetTimerRef.current = null;
      }, CONFIRM_WINDOW_MS);
      return;
    }
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    setResetArmed(false);
    clear();
    toast.success("Demo state reset");
  }

  // When overlays are off, the FAB is hidden, so the toolbar claims the
  // bottom-right slot. Otherwise it sits above the FAB.
  const positionClass = demoMode ? "bottom-[5.5rem] right-5" : "bottom-5 right-5";

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-40 flex items-center gap-1.5 [&>*]:pointer-events-auto",
        positionClass,
      )}
    >
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className="h-9 gap-2 rounded-full bg-background/95 px-4 text-sm font-medium shadow-lg backdrop-blur-sm"
            />
          }
        >
          <span
            className={cn(
              "inline-block h-2 w-2 rounded-full",
              demoMode ? "bg-emerald-500" : "bg-slate-400",
            )}
            aria-hidden
          />
          <Settings2 className="h-3.5 w-3.5" />
          Segment Demo
          <ChevronUp className="h-3.5 w-3.5 opacity-70" />
        </PopoverTrigger>

        <PopoverContent side="top" align="end" sideOffset={8} className="w-80 p-0">
          {/* Overlays */}
          <section className="flex flex-col gap-3 p-4">
            <h3 className={SECTION_HEADER}>Overlays</h3>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="demo-mode" className="text-sm font-medium">
                  Show demo widgets
                </Label>
                <p className="text-[11px] leading-snug text-muted-foreground">
                  Toggle inspector, FAB, and personalization surfaces.
                </p>
              </div>
              <Switch
                id="demo-mode"
                checked={demoMode}
                onCheckedChange={setDemoMode}
              />
            </div>
          </section>

          <Separator />

          {/* Load persona */}
          <section className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <h3 className={SECTION_HEADER}>Load persona</h3>
            </div>
            <div className="flex flex-col gap-2">
              {PERSONAS.map((p) => {
                const Icon = ICONS[p.icon];
                const isRunning = running === p.id;
                const isDisabled = running !== null;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => runPersona(p.id)}
                    disabled={isDisabled}
                    className={cn(
                      "group flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-all",
                      isRunning
                        ? "border-foreground/20 bg-muted/60"
                        : "border-border hover:border-foreground/20 hover:bg-muted/50",
                      isDisabled && !isRunning && "opacity-50",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                        ICON_COLORS[p.icon],
                      )}
                    >
                      {isRunning ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </span>
                    <span className="flex flex-1 flex-col gap-0.5">
                      <span className="text-sm font-semibold leading-tight">
                        {p.name}
                      </span>
                      <span className="text-[11px] leading-snug text-muted-foreground">
                        {p.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <Separator />

          {/* Reset */}
          <section className="flex flex-col gap-2 p-4">
            <h3 className={SECTION_HEADER}>Reset</h3>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "w-full gap-1.5 text-xs transition-colors",
                resetArmed
                  ? "border-destructive bg-destructive text-white hover:bg-destructive/90 hover:text-white"
                  : "text-destructive hover:bg-destructive/10 hover:text-destructive",
              )}
              onClick={handleResetClick}
            >
              {resetArmed ? (
                <>
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Click to confirm reset
                </>
              ) : (
                <>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset demo state
                </>
              )}
            </Button>
            <p className="text-[11px] leading-snug text-muted-foreground">
              Clears the event log, audience memberships, journey stage, and identity.
            </p>
          </section>
        </PopoverContent>
      </Popover>
    </div>
  );
}
