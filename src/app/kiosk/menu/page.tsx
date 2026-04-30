import { KioskMenuGrid } from "@/components/kiosk/kiosk-menu-grid";
import { KioskPersonalizationBanner } from "@/components/kiosk/kiosk-personalization-banner";

export default function KioskMenuPage() {
  return (
    <>
      <KioskPersonalizationBanner />
      <KioskMenuGrid />
    </>
  );
}
