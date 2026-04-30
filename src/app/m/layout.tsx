import { MobileDeviceFrame } from "@/components/mobile/mobile-device-frame";
import { MobileAppShell } from "@/components/mobile/mobile-app-shell";

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileDeviceFrame>
      <MobileAppShell>{children}</MobileAppShell>
    </MobileDeviceFrame>
  );
}
