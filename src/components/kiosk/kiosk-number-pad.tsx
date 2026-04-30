"use client";

import { Minus, Plus } from "lucide-react";

interface Props {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
}

export function KioskNumberPad({ value, onChange, min = 1, max = 20 }: Props) {
  return (
    <div className="inline-flex items-center gap-4 rounded-full border-2 border-slate-200 bg-white px-2 py-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 disabled:opacity-40"
      >
        <Minus className="h-6 w-6" />
      </button>
      <span className="min-w-[2.5rem] text-center text-2xl font-black">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--dominos-red)] text-white disabled:opacity-40"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
