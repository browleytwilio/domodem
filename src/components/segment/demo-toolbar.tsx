"use client";

import { useState } from "react";
import { Settings2, ChevronDown, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PERSONAS } from "@/lib/segment/personas";
import { useSegmentStore } from "@/stores/segment-store";

export function DemoToolbar() {
  const demoMode = useSegmentStore((s) => s.demoModeEnabled);
  const setDemoMode = useSegmentStore((s) => s.setDemoMode);
  const clear = useSegmentStore((s) => s.clear);
  const [running, setRunning] = useState<string | null>(null);

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

  return (
    <div className="pointer-events-none fixed top-3 right-3 z-40 flex items-center gap-1.5 [&>*]:pointer-events-auto">
      <Popover>
        <PopoverTrigger
          render={
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1 bg-background/80 backdrop-blur-sm"
            />
          }
        >
          <Settings2 className="h-3.5 w-3.5" />
          Segment Demo
          <ChevronDown className="h-3 w-3" />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 space-y-3 p-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="demo-mode" className="text-sm font-medium">
              Demo overlays
            </Label>
            <Switch
              id="demo-mode"
              checked={demoMode}
              onCheckedChange={setDemoMode}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Toggle the inspector FAB and personalization widgets on/off to show the &ldquo;before&rdquo; state.
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Load a persona
            </div>
            <div className="flex flex-col gap-1.5">
              {PERSONAS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => runPersona(p.id)}
                  disabled={running !== null}
                  className="flex flex-col items-start rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted disabled:opacity-60"
                >
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-muted-foreground">{p.description}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5 text-xs text-destructive hover:text-destructive"
            onClick={() => {
              clear();
              toast.success("Demo state reset");
            }}
          >
            <RotateCcw className="h-3 w-3" />
            Reset demo state
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
