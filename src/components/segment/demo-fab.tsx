"use client";

import { Radio } from "lucide-react";
import { motion } from "framer-motion";
import { useSegmentStore } from "@/stores/segment-store";

export function DemoFab() {
  const demoMode = useSegmentStore((s) => s.demoModeEnabled);
  const open = useSegmentStore((s) => s.inspectorOpen);
  const setOpen = useSegmentStore((s) => s.setInspectorOpen);
  const count = useSegmentStore((s) => s.events.length);

  if (!demoMode || open) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => setOpen(true)}
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-xl ring-1 ring-black/10"
      aria-label="Open Segment Inspector"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </span>
      <Radio className="h-4 w-4" />
      Segment
      <span className="rounded-full bg-background/20 px-2 py-0.5 text-xs tabular-nums">
        {count}
      </span>
    </motion.button>
  );
}
