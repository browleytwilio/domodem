"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PizzaSize, CrustType } from "@/types/menu";
import type { ToppingSelection } from "@/types/menu";
import { cn } from "@/lib/utils";

interface BuilderCanvasProps {
  toppings: ToppingSelection[];
  size: PizzaSize;
  crust: CrustType;
}

const SIZE_MAP: Record<PizzaSize, { container: string; pizza: number }> = {
  personal: {
    container: "aspect-square w-[min(70vw,220px)] sm:w-[260px] md:w-[280px]",
    pizza: 220,
  },
  value: {
    container: "aspect-square w-[min(78vw,260px)] sm:w-[300px] md:w-[320px]",
    pizza: 260,
  },
  large: {
    container: "aspect-square w-[min(84vw,300px)] sm:w-[340px] md:w-[380px]",
    pizza: 300,
  },
  "extra-large": {
    container: "aspect-square w-[min(90vw,340px)] sm:w-[380px] md:w-[420px]",
    pizza: 340,
  },
};

const CRUST_BORDER: Record<CrustType, string> = {
  classic: "border-[var(--dominos-orange)]/70",
  "thin-crispy": "border-amber-400/70",
  "deep-pan": "border-amber-700/70",
  "cheesy-crust": "border-yellow-400/80",
};

const CRUST_WIDTH: Record<CrustType, string> = {
  classic: "border-[12px] sm:border-[16px]",
  "thin-crispy": "border-[6px] sm:border-[8px]",
  "deep-pan": "border-[16px] sm:border-[22px]",
  "cheesy-crust": "border-[14px] sm:border-[18px]",
};

const TOPPING_COLORS: Record<string, string> = {
  pepperoni: "bg-red-700",
  ham: "bg-pink-400",
  bacon: "bg-red-800",
  beef: "bg-amber-900",
  chicken: "bg-orange-300",
  "italian-sausage": "bg-red-900",
  prawns: "bg-orange-400",
  anchovies: "bg-gray-500",
  mushroom: "bg-stone-400",
  onion: "bg-purple-300",
  capsicum: "bg-green-600",
  pineapple: "bg-yellow-400",
  olives: "bg-gray-800",
  jalapenos: "bg-green-700",
  spinach: "bg-green-500",
  tomato: "bg-red-500",
  "roasted-garlic": "bg-amber-200",
  mozzarella: "bg-yellow-100",
  parmesan: "bg-amber-100",
  feta: "bg-white",
  cheddar: "bg-yellow-500",
};

/**
 * Deterministic pseudo-random number from a seed string so topping
 * positions are stable across re-renders.
 */
function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h = (h ^ (h >>> 16)) * 0x45d9f3b;
    h = (h ^ (h >>> 16)) * 0x45d9f3b;
    h = h ^ (h >>> 16);
    return (h >>> 0) / 4294967296;
  };
}

interface DotPosition {
  top: string;
  left: string;
}

function generateDotPositions(
  slug: string,
  placement: "left" | "right" | "whole",
  count: number
): DotPosition[] {
  const rng = seededRandom(slug + placement);
  const positions: DotPosition[] = [];

  for (let i = 0; i < count; i++) {
    // Generate points within the pizza circle
    const angle = rng() * Math.PI * 2;
    const radius = Math.sqrt(rng()) * 0.38; // keep inside the crust

    let x = 0.5 + radius * Math.cos(angle);
    const y = 0.5 + radius * Math.sin(angle);

    // Constrain to half if needed
    if (placement === "left" && x > 0.5) {
      x = 0.5 - (x - 0.5);
    } else if (placement === "right" && x < 0.5) {
      x = 0.5 + (0.5 - x);
    }

    positions.push({
      top: `${(y * 100).toFixed(1)}%`,
      left: `${(x * 100).toFixed(1)}%`,
    });
  }

  return positions;
}

export function BuilderCanvas({ toppings, size, crust }: BuilderCanvasProps) {
  const sizeConfig = SIZE_MAP[size];

  const toppingDots = useMemo(() => {
    return toppings.flatMap((sel) => {
      const dotsPerTopping = sel.placement === "whole" ? 6 : 3;
      const positions = generateDotPositions(
        sel.topping.slug,
        sel.placement,
        dotsPerTopping
      );
      return positions.map((pos, i) => ({
        key: `${sel.topping.slug}-${sel.placement}-${i}`,
        slug: sel.topping.slug,
        ...pos,
      }));
    });
  }, [toppings]);

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className={cn("relative", sizeConfig.container)}
        animate={{ scale: 1 }}
        initial={{ scale: 0.85 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        key={size}
      >
        {/* Pizza base */}
        <div
          className={cn(
            "relative h-full w-full rounded-full shadow-xl",
            CRUST_BORDER[crust],
            CRUST_WIDTH[crust]
          )}
          style={{
            background:
              "radial-gradient(circle at 40% 35%, #e8a849 0%, #d4893a 40%, #c47830 70%, #b86d28 100%)",
          }}
        >
          {/* Sauce layer */}
          <div
            className="absolute inset-1 rounded-full opacity-80"
            style={{
              background:
                "radial-gradient(circle at 45% 40%, #cc3333 0%, #aa2222 60%, #991111 100%)",
            }}
          />

          {/* Half divider line (only when mixed placements exist) */}
          {toppings.some((t) => t.placement !== "whole") && (
            <div className="absolute left-1/2 top-[8%] h-[84%] w-px -translate-x-1/2 bg-white/20" />
          )}

          {/* Topping dots */}
          <AnimatePresence mode="popLayout">
            {toppingDots.map((dot) => (
              <motion.div
                key={dot.key}
                className={cn(
                  "absolute h-2.5 w-2.5 rounded-full shadow-sm sm:h-3 sm:w-3",
                  TOPPING_COLORS[dot.slug] ?? "bg-gray-400"
                )}
                style={{
                  top: dot.top,
                  left: dot.left,
                  transform: "translate(-50%, -50%)",
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 15,
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Size label */}
      <p className="text-sm font-medium capitalize text-muted-foreground">
        {size.replace("-", " ")} &middot;{" "}
        {crust.replace("-", " ")}
      </p>
    </div>
  );
}
