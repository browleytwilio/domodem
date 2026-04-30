"use client";

import { Suspense } from "react";
import { useScrollRestoration } from "@/lib/use-scroll-restoration";

function Inner() {
  useScrollRestoration();
  return null;
}

export function ScrollRestoration() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
