"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { SurfaceId } from "@/lib/tour/types";

const SURFACES: { id: SurfaceId; label: string; href: string }[] = [
  { id: "web", label: "Web", href: "/" },
  { id: "mobile", label: "Mobile app", href: "/m" },
  { id: "kiosk", label: "Kiosk", href: "/kiosk" },
];

interface Props {
  focus: SurfaceId;
}

export function TourMultiSurface({ focus }: Props) {
  const [wide, setWide] = useState(false);

  useEffect(() => {
    function check() {
      setWide(window.innerWidth >= 1280);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!wide) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border bg-amber-50 p-6 text-sm text-amber-900">
        <p className="mb-2 font-semibold">Triptych unavailable at this size.</p>
        <p>
          For the multi-surface view, expand this window to 1280px or wider. You can
          also open <code>/m</code> and <code>/kiosk</code> in adjacent tabs and follow along.
        </p>
      </div>
    );
  }

  const primary = SURFACES.find((s) => s.id === focus)!;
  const secondaries = SURFACES.filter((s) => s.id !== focus);

  return (
    <div className="grid h-[calc(100vh-8rem)] gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
      <SurfacePane href={primary.href} label={primary.label} dominant />
      <div className="grid gap-3" style={{ gridTemplateRows: "1fr 1fr" }}>
        {secondaries.map((s) => (
          <SurfacePane key={s.id} href={s.href} label={s.label} />
        ))}
      </div>
    </div>
  );
}

function SurfacePane({
  href,
  label,
  dominant,
}: {
  href: string;
  label: string;
  dominant?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-white",
        dominant && "shadow-lg",
      )}
    >
      <div className="absolute right-2 top-2 z-10 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white">
        {label}
      </div>
      <iframe
        src={href}
        title={label}
        className="h-full w-full"
        sandbox="allow-same-origin allow-scripts allow-forms"
      />
    </div>
  );
}
