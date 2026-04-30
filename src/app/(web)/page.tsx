import { HeroCarousel } from "@/components/home/hero-carousel";
import { DealsGrid } from "@/components/home/deals-grid";
import { PopularItems } from "@/components/home/popular-items";
import { AppDownloadBanner } from "@/components/home/app-download-banner";
import { PersonalizationBanner } from "@/components/segment/personalization-banner";

export default function Home() {
  return (
    <>
      <PersonalizationBanner />
      <HeroCarousel />

      {/* Today's Deals */}
      <section className="py-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Today&apos;s Deals
            </h2>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Great value combos and offers, updated daily
            </p>
          </div>
          <DealsGrid />
        </div>
      </section>

      <PopularItems />

      <AppDownloadBanner />
    </>
  );
}
