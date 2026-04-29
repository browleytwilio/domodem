"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { trackHeroBannerClicked } from "@/lib/analytics/events";

interface Slide {
  id: number;
  headline: string;
  subtext: string;
  price: string;
  cta: string;
  href: string;
  bgFrom: string;
  bgTo: string;
}

const slides: Slide[] = [
  {
    id: 1,
    headline: "Any 3 Pizzas from $29.95",
    subtext: "Mix & match your favourite Traditional pizzas. Pickup or delivery.",
    price: "$29.95",
    cta: "Order Now",
    href: "/deals",
    bgFrom: "from-[var(--dominos-red)]",
    bgTo: "to-[#A0101F]",
  },
  {
    id: 2,
    headline: "FREE Delivery Over $30",
    subtext: "Spend $30 or more and we'll deliver straight to your door — no code needed.",
    price: "FREE",
    cta: "Start Your Order",
    href: "/menu",
    bgFrom: "from-[var(--dominos-blue)]",
    bgTo: "to-[var(--dominos-dark-blue)]",
  },
  {
    id: 3,
    headline: "New BBQ Loaded Pizza",
    subtext: "Smoky BBQ sauce, double beef, bacon, onion rings & mozzarella. Try it today.",
    price: "$16.99",
    cta: "Try It Now",
    href: "/menu",
    bgFrom: "from-[var(--dominos-red)]",
    bgTo: "to-[#8B0E1E]",
  },
  {
    id: 4,
    headline: "VIP Deals — Join Now",
    subtext: "Exclusive offers, early access to new menu items & birthday rewards. It's free!",
    price: "FREE",
    cta: "Join VIP Club",
    href: "/account/loyalty",
    bgFrom: "from-[var(--dominos-dark-blue)]",
    bgTo: "to-[var(--dominos-blue)]",
  },
  {
    id: 5,
    headline: "Lunch Combo $9.95",
    subtext: "Personal pizza + a side + drink. Available 11am-4pm every day.",
    price: "$9.95",
    cta: "Grab Lunch",
    href: "/deals",
    bgFrom: "from-[var(--dominos-red)]",
    bgTo: "to-[var(--dominos-dark-blue)]",
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

export function HeroCarousel() {
  const [[current, direction], setCurrent] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);

  const paginate = useCallback(
    (newDirection: number) => {
      setCurrent(([prev]) => {
        const next =
          (prev + newDirection + slides.length) % slides.length;
        return [next, newDirection];
      });
    },
    []
  );

  const goToSlide = useCallback(
    (index: number) => {
      setCurrent(([prev]) => {
        const dir = index > prev ? 1 : -1;
        return [index, dir];
      });
    },
    []
  );

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => paginate(1), 5000);
    return () => clearInterval(timer);
  }, [isPaused, paginate]);

  const slide = slides[current];

  return (
    <section
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured deals"
    >
      <div className="relative h-[240px] touch-pan-y sm:h-[320px] md:h-[420px] lg:h-[480px]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={slide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              const threshold = 80;
              if (info.offset.x < -threshold) paginate(1);
              else if (info.offset.x > threshold) paginate(-1);
            }}
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 },
            }}
            className={`absolute inset-0 flex cursor-grab items-center bg-gradient-to-br active:cursor-grabbing ${slide.bgFrom} ${slide.bgTo}`}
            aria-roledescription="slide"
            aria-label={`Slide ${current + 1} of ${slides.length}: ${slide.headline}`}
          >
            {/* Background food imagery */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40"
              style={{ backgroundImage: `url(/images/hero/hero-${current}.webp)` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />

            {/* Decorative background shapes */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/5" />
              <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/5" />
              <div className="absolute right-1/4 top-1/3 h-40 w-40 rotate-45 rounded-3xl bg-white/[0.03]" />
            </div>

            <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
              <div className="flex max-w-md flex-col gap-3 sm:max-w-lg sm:gap-5 md:max-w-xl md:gap-6 lg:max-w-2xl">
                {/* Price pill */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                >
                  <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm sm:px-4 sm:py-1.5 sm:text-base">
                    {slide.price === "FREE" ? "FREE" : `From ${slide.price}`}
                  </span>
                </motion.div>

                {/* Headline */}
                <motion.h2
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  className="text-[1.6rem] font-black leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl"
                >
                  {slide.headline}
                </motion.h2>

                {/* Subtext */}
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                  className="line-clamp-2 max-w-lg text-sm leading-relaxed text-white/85 sm:line-clamp-none sm:text-base md:text-lg"
                >
                  {slide.subtext}
                </motion.p>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.4 }}
                >
                  <Link
                    href={slide.href}
                    onClick={() =>
                      trackHeroBannerClicked(
                        `slide-${slide.id}`,
                        slide.headline,
                        current + 1,
                        slide.href,
                      )
                    }
                    className="inline-flex items-center rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-[var(--dominos-red)] shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20 sm:px-8 sm:py-3.5 sm:text-base"
                  >
                    {slide.cta}
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2 sm:bottom-6">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => goToSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            aria-current={idx === current ? "true" : undefined}
            className={`h-2.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/30 active:scale-90 ${
              idx === current
                ? "w-8 bg-white"
                : "w-2.5 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      {/* Left/Right arrows */}
      <button
        onClick={() => paginate(-1)}
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-black/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:scale-90 sm:left-4 sm:flex"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        onClick={() => paginate(1)}
        aria-label="Next slide"
        className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-black/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:scale-90 sm:right-4 sm:flex"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </section>
  );
}
