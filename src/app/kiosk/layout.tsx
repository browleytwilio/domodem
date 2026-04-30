import { KioskDeviceFrame } from "@/components/kiosk/kiosk-device-frame";
import { KioskIdleWatchdog } from "@/components/kiosk/kiosk-idle-watchdog";
import { KioskTopChrome } from "@/components/kiosk/kiosk-top-chrome";
import { KioskProgressDots } from "@/components/kiosk/kiosk-progress-dots";

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <KioskDeviceFrame>
      <KioskIdleWatchdog>
        <div className="relative h-full">
          <KioskTopChrome />
          {children}
          <KioskProgressDots />
        </div>
      </KioskIdleWatchdog>
    </KioskDeviceFrame>
  );
}
