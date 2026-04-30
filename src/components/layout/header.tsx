"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  User,
  MapPin,
  Menu,
  Search,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import { useIsHydrated } from "@/lib/use-is-hydrated";
import { cn } from "@/lib/utils";
import { TourResumePill } from "@/components/tour/tour-resume-pill";

const mainNav = [
  { label: "Menu", href: "/menu" },
  { label: "Deals", href: "/deals" },
  { label: "Stores", href: "/store-locator" },
  { label: "Tracker", href: "/order-tracker" },
  { label: "VIP Club", href: "/account/loyalty" },
  { label: "Use Cases", href: "/use-cases" },
];

export function Header() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.getItemCount());
  const { deliveryMethod, setDeliveryMethod, selectedStore, setCartOpen } =
    useUIStore();
  const mounted = useIsHydrated();

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top delivery/pickup bar */}
      <div className="bg-[var(--dominos-dark-blue)] text-white">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-2 px-3 sm:h-10 sm:px-4">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={() => setDeliveryMethod("delivery")}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:px-4 sm:text-xs",
                deliveryMethod === "delivery"
                  ? "bg-white text-[var(--dominos-dark-blue)]"
                  : "text-white/80 hover:text-white"
              )}
            >
              Delivery
            </button>
            <button
              onClick={() => setDeliveryMethod("pickup")}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:px-4 sm:text-xs",
                deliveryMethod === "pickup"
                  ? "bg-white text-[var(--dominos-dark-blue)]"
                  : "text-white/80 hover:text-white"
              )}
            >
              Pickup
            </button>
          </div>

          <Link
            href="/store-locator"
            className="flex min-w-0 items-center gap-1.5 text-[11px] text-white/80 transition-colors hover:text-white sm:text-xs"
          >
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            {selectedStore ? (
              <span className="min-w-0 max-w-[140px] truncate sm:max-w-[220px]">
                {selectedStore.name}
              </span>
            ) : (
              <span className="whitespace-nowrap">Select a store</span>
            )}
            <ChevronDown className="h-3 w-3 flex-shrink-0" />
          </Link>
        </div>
      </div>

      {/* Main navigation */}
      <div className="border-b bg-[var(--dominos-blue)] shadow-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open navigation menu"
                  className="text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60 md:hidden"
                />
              }
            >
              <Menu className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-[var(--dominos-blue)] p-0 text-white">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <div className="flex h-16 items-center border-b border-white/10 px-6">
                <Link href="/" aria-label="Domino's home">
                  <Image
                    src="/logos/dominos-horizontal-white.svg"
                    alt="Domino's"
                    width={140}
                    height={29}
                    priority
                    className="h-7 w-auto"
                  />
                </Link>
              </div>
              <nav className="flex flex-col p-4">
                {mainNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-white/15 text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" aria-label="Domino's home" className="flex items-center">
            <Image
              src="/logos/dominos-tile-white.svg"
              alt=""
              width={40}
              height={40}
              priority
              className="h-9 w-9 md:hidden"
            />
            <Image
              src="/logos/dominos-horizontal-white.svg"
              alt="Domino's"
              width={170}
              height={35}
              priority
              className="hidden h-9 w-auto md:block"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 lg:px-4",
                  pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href))
                    ? "bg-white/20 text-white"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <TourResumePill />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search menu"
              className="text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60 active:scale-95"
              render={<Link href="/menu" />}
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              aria-label="Account"
              className="text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60 active:scale-95"
              render={<Link href="/account" />}
            >
              <User className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              aria-label={`Open cart${mounted && itemCount > 0 ? `, ${itemCount} item${itemCount === 1 ? "" : "s"}` : ""}`}
              className="relative text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60 active:scale-95"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {mounted && itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className="absolute -right-1 -top-1"
                >
                  <Badge className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--dominos-red)] p-0 text-[10px] font-bold text-white">
                    {itemCount}
                  </Badge>
                </motion.span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
