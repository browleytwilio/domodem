"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Adventure, Beat } from "@/lib/tour/types";

export interface NarratorPanelProps {
  adventure: Adventure;
  beatIndex: number;
  beat: Beat;
  collapsed: boolean;
  canAdvanceByClick: boolean;
  onNext: () => void;
  onExit: () => void;
  onToggleCollapse: () => void;
}

export function NarratorPanel({
  adventure,
  beatIndex,
  beat,
  collapsed,
  canAdvanceByClick,
  onNext,
  onExit,
  onToggleCollapse,
}: NarratorPanelProps) {
  const total = adventure.beats.length;
  const progress = Math.min(100, Math.round(((beatIndex + 1) / total) * 100));

  return (
    <motion.aside
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={cn(
        "pointer-events-auto fixed right-6 top-6 z-[70] flex max-h-[calc(100vh-3rem)] w-[420px] flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl",
        "max-lg:inset-x-4 max-lg:right-4 max-lg:top-auto max-lg:bottom-4 max-lg:w-auto max-lg:max-h-[60vh]",
        collapsed && "h-auto max-lg:max-h-none",
      )}
      role="dialog"
      aria-label="Tour narrator"
    >
      <header className="flex items-center justify-between gap-2 border-b bg-slate-50 px-4 py-3">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-xs font-semibold uppercase tracking-wider text-slate-500">
            {adventure.title}
          </span>
          <span className="truncate text-[11px] text-slate-500">
            Beat {beatIndex + 1} of {total}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand narrator" : "Collapse narrator"}
          >
            {collapsed ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            aria-label="Exit tour"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="h-1 w-full bg-slate-100">
        <div
          className="h-full bg-[var(--dominos-red)] transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {!collapsed && (
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4 text-sm leading-relaxed text-slate-800">
          {beat.kind === "recap" ? (
            <RecapBody beat={beat} onExit={onExit} />
          ) : (
            <>
              <p className="whitespace-pre-wrap">{"copy" in beat ? beat.copy : ""}</p>
              {beat.kind === "multi-surface" && (
                <Badge variant="outline" className="w-fit">
                  Focus: {beat.focus}
                </Badge>
              )}
            </>
          )}

          {canAdvanceByClick && beat.kind !== "recap" && (
            <Button
              className="w-fit"
              onClick={onNext}
              style={{ backgroundColor: "var(--dominos-red)" }}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
          {!canAdvanceByClick && beat.kind !== "recap" && (
            <p className="text-xs font-medium text-slate-500">
              Waiting for the expected event…
            </p>
          )}
        </div>
      )}
    </motion.aside>
  );
}

function RecapBody({
  beat,
  onExit,
}: {
  beat: Extract<Beat, { kind: "recap" }>;
  onExit: () => void;
}) {
  return (
    <>
      <h3 className="text-base font-semibold text-slate-900">What you just saw</h3>
      <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
        {beat.bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2 pt-2">
        {beat.ctas.map((cta) => {
          if (cta.external) {
            return (
              <a
                key={cta.label}
                href={cta.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
              >
                {cta.label}
              </a>
            );
          }
          return (
            <Link
              key={cta.label}
              href={cta.href}
              onClick={onExit}
              className="inline-flex items-center rounded-md bg-[var(--dominos-red)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
            >
              {cta.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
