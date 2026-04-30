"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function MobileStackedHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-border/60 bg-background/95 px-2 backdrop-blur">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 hover:bg-muted"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <h1 className="min-w-0 flex-1 truncate text-base font-semibold">{title}</h1>
    </header>
  );
}
