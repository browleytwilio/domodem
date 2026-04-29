"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Home, RotateCcw } from "lucide-react";
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
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-10 w-10 text-destructive" />
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
        <Button asChild className="gap-1.5 bg-[var(--dominos-red)] hover:bg-[var(--dominos-red)]/90">
          <Link href="/">
            <Home className="h-4 w-4" />
            Home
          </Link>
        </Button>
      </div>
    </main>
  );
}
