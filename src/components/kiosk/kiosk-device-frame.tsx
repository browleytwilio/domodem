"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/stores/ui-store";

function useIsRealMobile() {
  const [v, setV] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse) and (max-width: 640px)");
    const u = () => setV(mq.matches);
    u();
    mq.addEventListener("change", u);
    return () => mq.removeEventListener("change", u);
  }, []);
  return v;
}

export function KioskDeviceFrame({ children }: { children: React.ReactNode }) {
  const frameEnabled = useUIStore((s) => s.frameEnabled);
  const isRealMobile = useIsRealMobile();
  const showFrame = frameEnabled && !isRealMobile;

  if (!showFrame) {
    return <div className="min-h-svh bg-background">{children}</div>;
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-900 p-6">
      <div className="relative w-full max-w-[1280px] overflow-hidden rounded-[28px] border-[16px] border-slate-950 bg-background shadow-2xl">
        <div className="flex h-6 items-center justify-center bg-slate-950 text-[10px] font-semibold text-slate-400">
          Domino&apos;s Self-Order · Touch anywhere to continue
        </div>
        <div className="h-[800px] overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
