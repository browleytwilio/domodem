"use client";

import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useIsHydrated } from "@/lib/use-is-hydrated";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function resolveTarget(tourId: string): Element | null {
  if (typeof document === "undefined") return null;
  // Sonner toasts + other portal content tag themselves with a className
  // prefixed `tour-audience-toast`. For anything else, match data-tour-id.
  if (tourId.startsWith("tour-audience-toast")) {
    return document.querySelector(`.${tourId}`) ?? document.querySelector(".tour-audience-toast");
  }
  return document.querySelector(`[data-tour-id="${tourId}"]`);
}

export interface SpotlightOverlayProps {
  target: string;
  copy: string;
  onNext?: () => void;
  waitingForEvent?: boolean;
}

export function SpotlightOverlay({
  target,
  copy,
  onNext,
  waitingForEvent,
}: SpotlightOverlayProps) {
  const [rect, setRect] = useState<Rect | null>(null);
  const mounted = useIsHydrated();

  useLayoutEffect(() => {
    let rafId = 0;
    function measure() {
      const el = resolveTarget(target);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      // If off-screen, scroll into view once, then re-measure next frame.
      if (r.bottom < 0 || r.top > window.innerHeight) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        rafId = requestAnimationFrame(measure);
        return;
      }
      setRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      });
    }

    measure();
    const onScrollResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onScrollResize, true);
    window.addEventListener("resize", onScrollResize);

    const interval = window.setInterval(measure, 500);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScrollResize, true);
      window.removeEventListener("resize", onScrollResize);
      window.clearInterval(interval);
    };
  }, [target]);

  if (!mounted) return null;
  if (!rect) return null;

  const pad = 12;
  const boxTop = rect.top - pad;
  const boxLeft = rect.left - pad;
  const boxW = rect.width + pad * 2;
  const boxH = rect.height + pad * 2;

  const calloutWidth = 320;
  const viewportW = window.innerWidth;
  const calloutLeft = Math.min(
    Math.max(8, boxLeft),
    viewportW - calloutWidth - 8,
  );
  const calloutTop = boxTop + boxH + 12;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[60]">
      <svg
        className="pointer-events-auto absolute inset-0 h-full w-full"
        role="presentation"
      >
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={boxLeft}
              y={boxTop}
              width={boxW}
              height={boxH}
              rx={16}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.55)"
          mask="url(#spotlight-mask)"
        />
      </svg>
      <div
        className="pointer-events-auto absolute rounded-2xl border-2 border-white/80 shadow-[0_0_0_4px_rgba(255,255,255,0.12)]"
        style={{ top: boxTop, left: boxLeft, width: boxW, height: boxH }}
      />
      <div
        className="pointer-events-auto absolute rounded-lg bg-white p-4 text-sm text-slate-900 shadow-xl"
        style={{ top: calloutTop, left: calloutLeft, width: calloutWidth }}
      >
        <p className="mb-3 leading-snug">{copy}</p>
        {waitingForEvent ? (
          <p className="text-xs font-medium text-slate-500">Waiting for your click…</p>
        ) : onNext ? (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center rounded-md bg-[var(--dominos-red)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
          >
            Next →
          </button>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
