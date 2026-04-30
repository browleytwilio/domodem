"use client";

import { usePathname } from "next/navigation";
import { MobileTopBar } from "./mobile-top-bar";
import { MobileTabBar, isTabRoute } from "./mobile-tab-bar";

export function MobileAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/m";
  const onTabRoute = isTabRoute(pathname);

  return (
    <div className="flex min-h-full flex-col bg-background">
      {onTabRoute && <MobileTopBar />}
      <div className="flex-1">{children}</div>
      {onTabRoute && <MobileTabBar />}
    </div>
  );
}
