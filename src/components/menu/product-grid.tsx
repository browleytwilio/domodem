"use client";

import { motion } from "framer-motion";
import { ProductCard } from "@/components/menu/product-card";
import type { Product } from "@/types/menu";

interface ProductGridProps {
  products: Product[];
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/40 py-16 text-center"
      >
        <span className="text-5xl" role="img" aria-label="empty">
          🍽️
        </span>
        <p className="mt-4 text-lg font-medium text-muted-foreground">
          No products found in this category.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4"
    >
      {products.map((product) => (
        <motion.div key={product.slug} variants={itemVariants}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}
