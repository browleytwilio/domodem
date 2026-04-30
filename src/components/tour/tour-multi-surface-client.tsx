"use client";

import dynamic from "next/dynamic";

// Dynamic import keeps iframe pane out of the initial bundle until used.
export const TourMultiSurface = dynamic(
  () => import("./tour-multi-surface").then((m) => m.TourMultiSurface),
  { ssr: false },
);
