"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home as HomeIcon,
  UtensilsCrossed,
  BadgePercent,
  Package,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabDef {
  href: string;
  label: string;
  Icon: LucideIcon;
  matches: (pathname: string) => boolean;
}

const TABS: TabDef[] = [
  { href: "/m", label: "Home", Icon: HomeIcon, matches: (p) => p === "/m" },
  {
    href: "/m/menu",
    label: "Menu",
    Icon: UtensilsCrossed,
    matches: (p) => p === "/m/menu" || p.startsWith("/m/menu/"),
  },
  {
    href: "/m/offers",
    label: "Offers",
    Icon: BadgePercent,
    matches: (p) => p.startsWith("/m/offers"),
  },
  {
    href: "/m/orders",
    label: "Orders",
    Icon: Package,
    matches: (p) => p.startsWith("/m/orders") || p.startsWith("/m/order/"),
  },
  {
    href: "/m/account",
    label: "Account",
    Icon: UserRound,
    matches: (p) =>
      p.startsWith("/m/account") ||
      p.startsWith("/m/login") ||
      p.startsWith("/m/register"),
  },
];

export function MobileTabBar() {
  const pathname = usePathname() ?? "/m";
  return (
    <nav
      aria-label="App tabs"
      className="sticky bottom-0 z-20 flex w-full items-stretch justify-around gap-1 border-t border-border/60 bg-background/95 px-2 pb-[calc(env(safe-area-inset-bottom)+4px)] pt-1 backdrop-blur"
    >
      {TABS.map(({ href, label, Icon, matches }) => {
        const isActive = matches(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-[10px] font-medium transition-colors",
              isActive
                ? "bg-[var(--dominos-red)]/10 text-[var(--dominos-red)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export const MOBILE_TAB_ROUTES = new Set<string>([
  "/m",
  "/m/menu",
  "/m/offers",
  "/m/orders",
  "/m/account",
]);

export function isTabRoute(pathname: string): boolean {
  return MOBILE_TAB_ROUTES.has(pathname);
}
