export type AppSource = "web" | "mobile" | "kiosk";

const APP_NAMES: Record<AppSource, string> = {
  web: "Dominos Web",
  mobile: "Dominos Mobile",
  kiosk: "Dominos Kiosk",
};

export function resolveSourceFromPath(pathname: string | null | undefined): AppSource {
  if (!pathname) return "web";
  if (pathname === "/m" || pathname.startsWith("/m/")) return "mobile";
  if (pathname === "/kiosk" || pathname.startsWith("/kiosk/")) return "kiosk";
  return "web";
}

export function appNameForSource(source: AppSource): string {
  return APP_NAMES[source];
}
