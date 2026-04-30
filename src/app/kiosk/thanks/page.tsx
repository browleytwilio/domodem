import { Suspense } from "react";
import { KioskThanks } from "@/components/kiosk/kiosk-thanks";

export default function KioskThanksPage() {
  return (
    <Suspense fallback={null}>
      <KioskThanks />
    </Suspense>
  );
}
