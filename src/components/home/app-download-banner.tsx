import Image from "next/image";

export function AppDownloadBanner() {
  return (
    <section className="bg-gradient-to-br from-[var(--dominos-blue)] via-[var(--dominos-blue)] to-[var(--dominos-dark-blue)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:py-20">
        <div className="flex flex-col items-center gap-6 sm:gap-8 md:flex-row md:gap-10 lg:gap-16">
          {/* Phone mockup */}
          <div className="flex flex-shrink-0 items-center justify-center">
            <div className="relative h-48 w-24 overflow-hidden rounded-[1.75rem] border-4 border-white/20 bg-black/20 shadow-2xl backdrop-blur-sm sm:h-64 sm:w-32 md:h-72 md:w-36 lg:h-80 lg:w-40">
              <Image
                src="/images/app-mockup.webp"
                alt="Domino's app screenshot"
                fill
                sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, 160px"
                className="object-cover"
                priority
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center pt-2">
                <div className="h-4 w-12 rounded-full bg-black/40" />
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
                <div className="h-1 w-10 rounded-full bg-white/60" />
              </div>
            </div>
          </div>

          {/* Text content */}
          <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Download the App
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80 sm:mt-4 sm:text-lg">
              Order faster, unlock exclusive deals, and track your order in
              real-time. Everything you love about Domino&apos;s, now in your
              pocket.
            </p>

            {/* Features list */}
            <ul className="mt-5 flex flex-col gap-2 text-sm leading-snug text-white/75 sm:mt-6 sm:gap-2.5 sm:text-base">
              {[
                "Lightning-fast reordering with saved favourites",
                "App-only exclusive deals & offers",
                "Live GPS order tracking to your door",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--dominos-green)]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            {/* Store buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:mt-8 sm:justify-start sm:gap-4">
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-xl bg-black px-5 py-3 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-[0.98]"
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-[10px] leading-none opacity-70">
                    Download on the
                  </span>
                  <span className="text-sm font-semibold leading-tight">
                    App Store
                  </span>
                </div>
              </a>
              <a
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-xl bg-black px-5 py-3 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-[0.98]"
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.396 12l2.302-2.492zM5.864 2.658L16.8 9.09l-2.302 2.203L5.864 2.658z" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-[10px] leading-none opacity-70">
                    Get it on
                  </span>
                  <span className="text-sm font-semibold leading-tight">
                    Google Play
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
