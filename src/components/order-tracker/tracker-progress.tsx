"use client";

import {
  Check,
  ClipboardList,
  ChefHat,
  Flame,
  ShieldCheck,
  Truck,
  Store,
} from "lucide-react";
import { motion } from "framer-motion";
import type { OrderStatus, DeliveryMethod } from "@/types/order";
import { cn } from "@/lib/utils";

interface Step {
  key: OrderStatus;
  label: string;
  icon: React.ElementType;
}

function getSteps(deliveryMethod: DeliveryMethod): Step[] {
  return [
    { key: "placed", label: "Order Placed", icon: ClipboardList },
    { key: "preparing", label: "Prep Station", icon: ChefHat },
    { key: "oven", label: "In the Oven", icon: Flame },
    { key: "quality_check", label: "Quality Check", icon: ShieldCheck },
    {
      key: deliveryMethod === "delivery" ? "out_for_delivery" : "ready_for_pickup",
      label: deliveryMethod === "delivery" ? "Out for Delivery" : "Ready for Pickup",
      icon: deliveryMethod === "delivery" ? Truck : Store,
    },
  ];
}

const STATUS_ORDER: OrderStatus[] = [
  "placed",
  "preparing",
  "oven",
  "quality_check",
  "out_for_delivery",
  "delivered",
  "ready_for_pickup",
];

function statusIndex(status: OrderStatus): number {
  return STATUS_ORDER.indexOf(status);
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface TrackerProgressProps {
  status: OrderStatus;
  timestamps: Partial<Record<OrderStatus, string>>;
  deliveryMethod: DeliveryMethod;
}

export function TrackerProgress({
  status,
  timestamps,
  deliveryMethod,
}: TrackerProgressProps) {
  const steps = getSteps(deliveryMethod);
  const currentIdx = statusIndex(status);

  return (
    <div className="w-full">
      {/* ---- Desktop: horizontal ---- */}
      <div className="hidden md:block">
        <div className="relative flex items-start justify-between">
          {/* Connecting line behind circles */}
          <div className="absolute left-0 right-0 top-5 z-0 mx-[40px] h-0.5 bg-muted" />
          <div
            className="absolute left-0 top-5 z-0 ml-[40px] h-0.5 bg-[var(--dominos-green)] transition-all duration-700"
            style={{
              width: `calc(${Math.min(
                ((steps.findIndex((s) => statusIndex(s.key) >= currentIdx)
                  === -1
                  ? steps.length - 1
                  : steps.findIndex((s) => statusIndex(s.key) >= currentIdx)) /
                  (steps.length - 1)) *
                  100,
                100,
              )}% - 80px)`,
            }}
          />

          {steps.map((step) => {
            const stepIdx = statusIndex(step.key);
            const isCompleted = stepIdx < currentIdx;
            const isCurrent = stepIdx === currentIdx;
            const isFuture = stepIdx > currentIdx;
            const Icon = step.icon;
            const ts = timestamps[step.key];

            return (
              <div
                key={step.key}
                className="relative z-10 flex flex-col items-center gap-2"
                style={{ width: `${100 / steps.length}%` }}
              >
                {/* Circle */}
                {isCurrent ? (
                  <motion.div
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--dominos-blue)] text-white shadow-lg"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-500",
                      isCompleted
                        ? "bg-[var(--dominos-green)] text-white"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                )}

                {/* Label */}
                <span
                  className={cn(
                    "text-center text-xs font-semibold leading-tight",
                    isCurrent
                      ? "text-[var(--dominos-blue)]"
                      : isCompleted
                        ? "text-[var(--dominos-green)]"
                        : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>

                {/* Timestamp */}
                {ts && (
                  <span className="text-[10px] text-muted-foreground">
                    {formatTimestamp(ts)}
                  </span>
                )}
                {isFuture && !ts && (
                  <span className="text-[10px] text-muted-foreground/50">
                    --:--
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ---- Mobile: vertical ---- */}
      <div className="md:hidden">
        <div className="relative ml-5 space-y-0">
          {steps.map((step, i) => {
            const stepIdx = statusIndex(step.key);
            const isCompleted = stepIdx < currentIdx;
            const isCurrent = stepIdx === currentIdx;
            const Icon = step.icon;
            const ts = timestamps[step.key];
            const isLast = i === steps.length - 1;

            return (
              <div key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
                {/* Vertical line */}
                {!isLast && (
                  <div
                    className={cn(
                      "absolute left-[19px] top-10 h-[calc(100%-32px)] w-0.5",
                      isCompleted
                        ? "bg-[var(--dominos-green)]"
                        : "bg-muted",
                    )}
                  />
                )}

                {/* Circle */}
                {isCurrent ? (
                  <motion.div
                    className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--dominos-blue)] text-white shadow-lg"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <div
                    className={cn(
                      "relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-500",
                      isCompleted
                        ? "bg-[var(--dominos-green)] text-white"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                )}

                {/* Label + timestamp */}
                <div className="flex flex-col justify-center pt-1.5">
                  <span
                    className={cn(
                      "text-sm font-semibold leading-tight",
                      isCurrent
                        ? "text-[var(--dominos-blue)]"
                        : isCompleted
                          ? "text-[var(--dominos-green)]"
                          : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                  {ts && (
                    <span className="mt-0.5 text-xs text-muted-foreground">
                      {formatTimestamp(ts)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
