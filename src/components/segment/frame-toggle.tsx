"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useUIStore } from "@/stores/ui-store";

export function FrameToggle() {
  const frameEnabled = useUIStore((s) => s.frameEnabled);
  const setFrameEnabled = useUIStore((s) => s.setFrameEnabled);

  return (
    <>
      <section className="flex items-center justify-between gap-4 p-4">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="frame-toggle" className="text-sm font-medium">
            Show device frame
          </Label>
          <p className="text-[11px] leading-snug text-muted-foreground">
            Wraps mobile and kiosk shells in a simulated device bezel.
          </p>
        </div>
        <Switch
          id="frame-toggle"
          checked={frameEnabled}
          onCheckedChange={setFrameEnabled}
        />
      </section>
      <Separator />
    </>
  );
}
