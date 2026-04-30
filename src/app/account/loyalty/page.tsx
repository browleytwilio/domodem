"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Crown, Gift, Star } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { trackLoyaltyProgramViewed } from "@/lib/analytics/events";

// -- Mock loyalty data --

const POINTS_BALANCE = 350;

const tiers = [
  { name: "Bronze", min: 0, color: "bg-amber-700 text-white" },
  { name: "Silver", min: 250, color: "bg-gray-400 text-white" },
  { name: "Gold", min: 750, color: "bg-yellow-500 text-white" },
  { name: "VIP", min: 1500, color: "bg-[var(--dominos-red)] text-white" },
] as const;

function getCurrentTier(points: number) {
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (points >= tiers[i].min) return tiers[i];
  }
  return tiers[0];
}

function getNextTier(points: number) {
  for (const tier of tiers) {
    if (points < tier.min) return tier;
  }
  return null;
}

interface Reward {
  id: string;
  name: string;
  points: number;
  image: string;
}

const rewards: Reward[] = [
  { id: "r1", name: "Free Garlic Bread", points: 200, image: "/images/menu/garlic-bread.webp" },
  { id: "r2", name: "Free Drink", points: 150, image: "/images/menu/coca-cola.webp" },
  { id: "r3", name: "Free Classic Pizza", points: 500, image: "/images/menu/pepperoni.webp" },
  { id: "r4", name: "Free Premium Pizza", points: 800, image: "/images/menu/godfather.webp" },
];

function AnimatedPoints({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf: number;
    const duration = 800;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplay(Math.round(eased * target));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return <span>{display.toLocaleString()}</span>;
}

export default function LoyaltyPage() {
  const currentTier = getCurrentTier(POINTS_BALANCE);
  const nextTier = getNextTier(POINTS_BALANCE);
  const progressPercent = nextTier
    ? ((POINTS_BALANCE - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  useEffect(() => {
    trackLoyaltyProgramViewed(currentTier.name, POINTS_BALANCE);
  }, [currentTier.name]);

  return (
    <>
      <Header />
      <CartDrawer />
      <main className="flex-1 bg-[var(--dominos-light-gray)]">
        <AuthGuard>
          <div className="mx-auto max-w-3xl px-4 py-10">
            <h1 className="text-2xl font-bold">VIP Loyalty Club</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Earn points on every order and redeem for free food.
            </p>

            {/* Points balance and tier */}
            <Card className="mt-8">
              <CardContent className="flex flex-col items-center gap-4 py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--dominos-blue)]/10">
                  <Crown className="h-8 w-8 text-[var(--dominos-blue)]" />
                </div>
                <div className="text-center">
                  <p className="text-5xl font-black tabular-nums text-foreground">
                    <AnimatedPoints target={POINTS_BALANCE} />
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">Points Balance</p>
                </div>
                <Badge className={currentTier.color}>
                  <Star className="mr-1 h-3 w-3" />
                  {currentTier.name} Tier
                </Badge>

                {/* Progress bar */}
                {nextTier && (
                  <div className="mt-2 w-full max-w-xs">
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>{currentTier.name}</span>
                      <span>{nextTier.name}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-[var(--dominos-blue)] transition-all duration-700"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-center text-xs text-muted-foreground">
                      {nextTier.min - POINTS_BALANCE} more points to {nextTier.name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available rewards */}
            <h2 className="mt-10 text-lg font-bold">Available Rewards</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {rewards.map((reward) => {
                const canRedeem = POINTS_BALANCE >= reward.points;
                return (
                  <Card key={reward.id}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <span className="relative flex h-12 w-12 flex-shrink-0 overflow-hidden rounded-full ring-1 ring-border">
                          <Image
                            src={reward.image}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </span>
                        <div>
                          <CardTitle className="text-sm">{reward.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <Gift className="h-3 w-3" />
                            {reward.points} pts
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        disabled={!canRedeem}
                        className="w-full bg-[var(--dominos-red)] text-white hover:bg-[var(--dominos-red)]/90 disabled:opacity-50"
                        size="sm"
                      >
                        {canRedeem ? "Redeem" : `Need ${reward.points - POINTS_BALANCE} more pts`}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* How it works */}
            <div className="mt-10">
              <Accordion>
                <AccordionItem value="how-it-works">
                  <AccordionTrigger>How It Works</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>
                        <strong className="text-foreground">Earn points:</strong> Get 1
                        point for every $1 you spend on any order through our website or
                        app.
                      </p>
                      <p>
                        <strong className="text-foreground">Climb tiers:</strong> Move
                        from Bronze to Silver (250 pts), Gold (750 pts), and VIP (1,500
                        pts) to unlock bonus multipliers and exclusive offers.
                      </p>
                      <p>
                        <strong className="text-foreground">Redeem rewards:</strong> Use
                        your points to claim free items from the rewards menu. Points are
                        deducted at checkout.
                      </p>
                      <p>
                        <strong className="text-foreground">Stay active:</strong> Points
                        expire after 12 months of inactivity. Keep ordering to maintain
                        your balance and tier status.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="tier-benefits">
                  <AccordionTrigger>Tier Benefits</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>
                        <strong className="text-foreground">Bronze:</strong> 1x points on
                        all orders.
                      </p>
                      <p>
                        <strong className="text-foreground">Silver:</strong> 1.25x points
                        multiplier + free delivery on orders over $30.
                      </p>
                      <p>
                        <strong className="text-foreground">Gold:</strong> 1.5x points
                        multiplier + free delivery on all orders + birthday reward.
                      </p>
                      <p>
                        <strong className="text-foreground">VIP:</strong> 2x points
                        multiplier + free delivery + birthday reward + early access to new
                        menu items.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </AuthGuard>
      </main>
      <Footer />
    </>
  );
}
