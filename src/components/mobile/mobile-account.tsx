"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronRight,
  LogOut,
  MapPin,
  Package,
  Sparkles,
  CreditCard,
  UserRound,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { trackSignedOut } from "@/lib/analytics/events";

const ROWS = [
  { href: "/m/orders", label: "Orders", Icon: Package },
  { href: "/m/account", label: "Addresses", Icon: MapPin },
  { href: "/m/account", label: "Loyalty", Icon: Sparkles },
  { href: "/m/account", label: "Payment", Icon: CreditCard },
];

export function MobileAccount() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  async function handleSignOut() {
    await authClient.signOut();
    trackSignedOut();
    toast.success("Signed out");
    router.refresh();
  }

  if (isPending) {
    return (
      <div className="px-4 pt-6 text-sm text-muted-foreground">Loading...</div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex flex-col gap-4 px-6 pt-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <UserRound className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold">Your Domino&apos;s account</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to earn rewards, see orders, and save addresses.
        </p>
        <Link
          href="/m/login"
          className="inline-flex items-center justify-center rounded-xl bg-[var(--dominos-red)] py-3 text-sm font-bold text-white"
        >
          Sign in
        </Link>
        <Link
          href="/m/register"
          className="text-sm font-semibold text-[var(--dominos-red)]"
        >
          Create account
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24">
      <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--dominos-red)]/15 text-[var(--dominos-red)]">
          <UserRound className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">
            {session.user.name ?? session.user.email}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {session.user.email}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-col divide-y divide-border/60 rounded-2xl border border-border/70 bg-background">
        {ROWS.map(({ href, label, Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-muted/40"
          >
            <Icon className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1">{label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold text-destructive"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );
}
