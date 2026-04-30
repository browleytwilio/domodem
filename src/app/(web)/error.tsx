"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackError } from "@/lib/analytics/events";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    trackError(error.message, {
      digest: error.digest,
      stack: error.stack,
      location: typeof window !== "undefined" ? window.location.pathname : "unknown",
    });
  }, [error]);

  return (
    <div role="alert" className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24">
      <div className="relative h-48 w-64 overflow-hidden rounded-2xl bg-muted shadow-lg">
        <Image
          src="/images/error.webp"
          alt=""
          fill
          sizes="256px"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="max-w-md text-center text-muted-foreground">
        We&apos;ve logged this issue. Try again, or head back to the menu.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset} variant="outline" className="gap-1.5">
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
        <Button
          render={<Link href="/" />}
          className="gap-1.5 bg-[var(--dominos-red)] hover:bg-[var(--dominos-red)]/90"
        >
          <Home className="h-4 w-4" />
          Home
        </Button>
      </div>
    </div>
  );
}
