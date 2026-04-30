"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, QrCode } from "lucide-react";

export function KioskThanks() {
  const router = useRouter();
  const params = useSearchParams();
  const orderId = params?.get("id") ?? "";
  const method = params?.get("method") ?? "counter";
  const [remaining, setRemaining] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(timer);
          router.replace("/kiosk");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 pt-14">
      <CheckCircle2 className="h-24 w-24 text-[var(--dominos-green)]" />
      <div className="text-center">
        <h1 className="text-5xl font-black">Order placed</h1>
        <p className="mt-2 text-lg text-slate-500">
          {method === "card"
            ? "Payment received."
            : "Please pay at the counter."}
        </p>
      </div>

      <div className="rounded-3xl border-2 border-slate-200 bg-white px-10 py-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
          Your order number
        </p>
        <p className="mt-1 font-mono text-3xl font-black">
          #{orderId.slice(0, 8).toUpperCase()}
        </p>
      </div>

      <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
        <QrCode className="h-16 w-16 text-slate-700" />
        <div>
          <p className="text-sm font-bold">Track on your phone</p>
          <p className="text-xs text-slate-500">Scan to follow updates</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        Returning to home in {remaining}s...
      </p>
    </div>
  );
}
