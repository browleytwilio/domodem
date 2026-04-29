"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProductImage } from "@/components/ui/product-image";
import { trackPromotionClicked } from "@/lib/analytics/events";
import dealsData from "@/data/deals.json";

interface Deal {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  products: string[];
  badge: string | null;
  code: string;
}

const gradients = [
  "from-[var(--dominos-red)] to-[#A0101F]",
  "from-[var(--dominos-blue)] to-[var(--dominos-dark-blue)]",
  "from-[var(--dominos-dark-blue)] to-[#061E2F]",
  "from-[var(--dominos-orange)] to-[#CC5200]",
  "from-[var(--dominos-green)] to-[#006600]",
  "from-[var(--dominos-red)] to-[var(--dominos-dark-blue)]",
];

const badgeColors: Record<string, string> = {
  "Best Seller": "bg-[var(--dominos-orange)]",
  "Popular": "bg-[var(--dominos-red)]",
  "Best Value": "bg-[var(--dominos-green)]",
  "Lunch Only": "bg-amber-500",
  "VIP Only": "bg-purple-600",
  "Free Delivery": "bg-[var(--dominos-blue)]",
};

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export function DealsGrid() {
  const deals = (dealsData as Deal[]).slice(0, 6);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6"
    >
      {deals.map((deal, idx) => (
        <motion.div
          key={deal.id}
          variants={cardVariants}
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className="group relative overflow-hidden rounded-xl shadow-md transition-shadow hover:shadow-xl"
        >
          {/* Gradient background */}
          <div
            className={`bg-gradient-to-br ${gradients[idx % gradients.length]} relative min-h-[220px] p-5 sm:p-6`}
          >
            {/* Decorative circle */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/[0.06]" />
            <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/[0.04]" />

            {/* Floating product image */}
            <div className="absolute -bottom-2 -right-2 h-24 w-24 overflow-hidden rounded-full opacity-40 transition-all duration-300 group-hover:opacity-60 group-hover:scale-110 sm:h-28 sm:w-28 lg:h-32 lg:w-32">
              <ProductImage
                src={deal.image}
                alt={deal.name}
                slug={deal.id}
                category="deals"
                fill
                sizes="128px"
                className="rounded-full"
              />
            </div>

            {/* Badge */}
            {deal.badge && (
              <span
                className={`relative z-10 mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white ${
                  badgeColors[deal.badge] || "bg-white/20"
                }`}
              >
                {deal.badge}
              </span>
            )}

            {/* Content */}
            <div className="relative z-10">
              <h3 className="line-clamp-2 text-lg font-bold leading-snug text-white sm:text-xl">
                {deal.name}
              </h3>
              <p className="mt-2 line-clamp-3 max-w-[70%] text-sm leading-relaxed text-white/80">
                {deal.description}
              </p>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-2">
                {deal.price > 0 ? (
                  <>
                    <span className="text-2xl font-black text-white">
                      ${deal.price.toFixed(2)}
                    </span>
                    {deal.originalPrice > deal.price && (
                      <span className="text-sm text-white/50 line-through">
                        ${deal.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-2xl font-black text-white">FREE</span>
                )}
              </div>

              {/* CTA */}
              <div className="mt-5">
                <Link
                  href={`/deals?code=${deal.code}`}
                  onClick={() =>
                    trackPromotionClicked(deal.id, deal.name, idx + 1, {
                      discount_value: deal.originalPrice - deal.price,
                      creative: deal.badge ?? `gradient-${idx % 6}`,
                      destination_url: `/deals?code=${deal.code}`,
                    })
                  }
                  className="inline-flex items-center rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-[var(--dominos-red)] shadow transition-all hover:scale-105 hover:shadow-lg active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20"
                >
                  Order Deal
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
