"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  MapPin,
  Crown,
  LogOut,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { trackSignedOut, identifyUser } from "@/lib/analytics/events";
import { useSegmentStore } from "@/stores/segment-store";

const accountCards = [
  {
    title: "Order History",
    description: "View your past orders and reorder favourites.",
    href: "/account/orders",
    icon: ClipboardList,
  },
  {
    title: "Saved Addresses",
    description: "Manage your delivery addresses.",
    href: "/account/addresses",
    icon: MapPin,
  },
  {
    title: "VIP Loyalty",
    description: "Check your points, tier and available rewards.",
    href: "/account/loyalty",
    icon: Crown,
  },
];

export default function AccountPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const currentIdentityId = useSegmentStore((s) => s.userId);

  useEffect(() => {
    if (!session?.user) return;
    // Skip if we've already identified this user (e.g. persona seeded richer
    // traits that we don't want to overwrite with the bronze defaults below).
    if (currentIdentityId === session.user.id) return;
    identifyUser(session.user.id, {
      email: session.user.email ?? "",
      name: session.user.name ?? "",
      created_at: new Date().toISOString(),
      loyalty_tier: "bronze",
      loyalty_points: 0,
      lifetime_orders: 0,
      lifetime_spend: 0,
      has_saved_address: false,
    });
  }, [session?.user, currentIdentityId]);

  async function handleSignOut() {
    await authClient.signOut();
    trackSignedOut();
    router.push("/login");
  }

  return (
    <div className="bg-[var(--dominos-light-gray)]">
      <AuthGuard>
          <div className="mx-auto max-w-4xl px-4 py-10">
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {session?.user?.name ?? "there"}!
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your account and see your recent activity.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {accountCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link key={card.href} href={card.href} className="group">
                    <Card className="h-full transition-shadow group-hover:shadow-md">
                      <CardHeader>
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--dominos-blue)]/10">
                          <Icon className="h-5 w-5 text-[var(--dominos-blue)]" />
                        </div>
                        <CardTitle>{card.title}</CardTitle>
                        <CardDescription>{card.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <div className="mt-10 flex justify-center">
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </AuthGuard>
    </div>
  );
}
