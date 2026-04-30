"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    key: "menu",
    label: "Menu",
    match: (p: string) =>
      p.startsWith("/kiosk/menu") || p.startsWith("/kiosk/product"),
  },
  {
    key: "cart",
    label: "Cart",
    match: (p: string) => p.startsWith("/kiosk/cart"),
  },
  {
    key: "pay",
    label: "Pay",
    match: (p: string) => p.startsWith("/kiosk/checkout"),
  },
  {
    key: "done",
    label: "Done",
    match: (p: string) => p.startsWith("/kiosk/thanks"),
  },
];

export function KioskProgressDots() {
  const pathname = usePathname() ?? "";
  if (pathname === "/kiosk") return null;

  const activeIdx = STEPS.findIndex((s) => s.match(pathname));

  return (
    <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center">
      <div className="flex items-center gap-3 rounded-full bg-white/90 px-5 py-2 shadow backdrop-blur">
        {STEPS.map((step, idx) => {
          const isActive = idx === activeIdx;
          const isDone = idx < activeIdx;
          return (
            <div key={step.key} className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-colors",
                  isActive
                    ? "bg-[var(--dominos-red)]"
                    : isDone
                      ? "bg-[var(--dominos-red)]/40"
                      : "bg-slate-300",
                )}
              />
              <span
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider",
                  isActive ? "text-[var(--dominos-red)]" : "text-slate-500",
                )}
              >
                {step.label}
              </span>
              {idx < STEPS.length - 1 && (
                <span className="text-slate-300">›</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
