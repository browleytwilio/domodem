"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Crown,
  ShoppingCart,
  Tag,
  UserRound,
  Loader2,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { PERSONAS, type PersonaIcon } from "@/lib/segment/personas";
import { trackKioskSessionStarted } from "@/lib/analytics/events";

const ICONS: Record<PersonaIcon, LucideIcon> = {
  crown: Crown,
  cart: ShoppingCart,
  tag: Tag,
  user: UserRound,
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export function KioskPersonaPicker({ open, onClose }: Props) {
  const router = useRouter();
  const [running, setRunning] = useState<string | null>(null);

  async function handlePick(id: string) {
    const persona = PERSONAS.find((p) => p.id === id);
    if (!persona) return;
    setRunning(id);
    toast.loading(`Recognized ${persona.name}`, { id: "kiosk-persona" });
    try {
      await persona.seed();
      trackKioskSessionStarted({ identified: true, persona_id: persona.id });
      toast.success(`Welcome back, ${persona.name.split(" — ")[0]}!`, {
        id: "kiosk-persona",
      });
      onClose();
      router.push("/kiosk/menu");
    } catch {
      toast.error("Could not load profile", { id: "kiosk-persona" });
    } finally {
      setRunning(null);
    }
  }

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="w-[680px] rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-black">Scan loyalty code</h2>
            <p className="mt-1 text-sm text-slate-500">
              Pick a simulated scan to continue the demo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {PERSONAS.map((p) => {
            const Icon = ICONS[p.icon];
            const isRunning = running === p.id;
            const isDisabled = running !== null;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePick(p.id)}
                disabled={isDisabled}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-left transition-colors hover:border-[var(--dominos-red)] disabled:opacity-50"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                  {isRunning ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-bold leading-tight">
                    {p.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {p.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
