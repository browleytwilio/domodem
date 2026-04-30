"use client";

import { useRouter, usePathname } from "next/navigation";
import { Monitor, Smartphone, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackModeSwitched } from "@/lib/analytics/events";
import { resolveSourceFromPath, type AppSource } from "@/lib/segment/source";

const MODES: { value: AppSource; label: string; href: string; Icon: typeof Monitor }[] = [
  { value: "web", label: "Web", href: "/", Icon: Monitor },
  { value: "mobile", label: "Mobile", href: "/m", Icon: Smartphone },
  { value: "kiosk", label: "Kiosk", href: "/kiosk", Icon: Store },
];

const SECTION_HEADER =
  "text-xs font-semibold uppercase tracking-wider text-muted-foreground";

export function ModeSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const active = resolveSourceFromPath(pathname);

  function handleClick(target: (typeof MODES)[number]) {
    if (target.value === active) return;
    trackModeSwitched(active, target.value);
    router.push(target.href);
  }

  return (
    <section className="flex flex-col gap-3 p-4">
      <h3 className={SECTION_HEADER}>Mode</h3>
      <div
        role="tablist"
        aria-label="Demo experience"
        className="grid grid-cols-3 gap-1 rounded-lg border bg-muted/50 p-1"
      >
        {MODES.map((mode) => {
          const isActive = active === mode.value;
          const Icon = mode.Icon;
          return (
            <button
              key={mode.value}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleClick(mode)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md px-2 py-2 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dominos-red)]/40",
                isActive
                  ? "bg-[var(--dominos-red)] text-white shadow-sm"
                  : "text-muted-foreground hover:bg-background hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {mode.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
