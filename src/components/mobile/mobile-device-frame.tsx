"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/stores/ui-store";

function useIsRealMobile() {
  const [isRealMobile, setIsRealMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse) and (max-width: 640px)");
    const update = () => setIsRealMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isRealMobile;
}

export function MobileDeviceFrame({ children }: { children: React.ReactNode }) {
  const frameEnabled = useUIStore((s) => s.frameEnabled);
  const isRealMobile = useIsRealMobile();
  const showFrame = frameEnabled && !isRealMobile;

  if (!showFrame) {
    return <div className="min-h-svh bg-background">{children}</div>;
  }

  return (
    <div className="min-h-svh bg-slate-900 py-8">
      <div className="mx-auto flex w-[420px] flex-col overflow-hidden rounded-[44px] border-[10px] border-slate-950 bg-background shadow-2xl">
        <div className="relative flex h-8 items-center justify-between bg-background px-6 text-[11px] font-semibold">
          <span>9:41</span>
          <div
            className="absolute left-1/2 top-1 h-5 w-24 -translate-x-1/2 rounded-full bg-slate-950"
            aria-hidden
          />
          <div className="flex items-center gap-1">
            <span aria-hidden>▪▪▪</span>
            <span aria-hidden>📶</span>
            <span aria-hidden>🔋</span>
          </div>
        </div>
        <div className="h-[844px] overflow-y-auto overflow-x-hidden">{children}</div>
      </div>
    </div>
  );
}
