"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail } from "lucide-react";

export function TourInboxModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handler() {
      setOpen(true);
    }
    window.addEventListener("tour:open-inbox", handler as EventListener);
    return () => window.removeEventListener("tour:open-inbox", handler as EventListener);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4 text-[var(--dominos-red)]" />
            Inbox · Dan Kelly
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 rounded-lg border bg-slate-50 p-4 text-sm">
          <div className="flex items-start justify-between gap-4 border-b pb-2">
            <div>
              <div className="font-semibold">Domino&apos;s</div>
              <div className="text-xs text-slate-500">noreply@dominos.demo</div>
            </div>
            <div className="text-xs text-slate-500">just now</div>
          </div>
          <div className="text-sm">
            <p className="mb-2 font-semibold">Don&apos;t forget your cart!</p>
            <p className="text-slate-700">
              Complete your order in the next 10 min for free garlic bread.
            </p>
          </div>
          <p className="text-[11px] text-slate-500">
            Triggered by: <code>Cart Abandoner</code> audience via Segment Engage.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
