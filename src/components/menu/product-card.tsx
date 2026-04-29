"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCartStore } from "@/stores/cart-store";
import {
  trackProductViewed,
  trackProductClicked,
  trackProductAdded,
} from "@/lib/analytics/events";
import type { Product } from "@/types/menu";

function getLowestPrice(prices: Product["prices"]): number {
  const values = Object.values(prices).filter(
    (v): v is number => typeof v === "number"
  );
  return values.length > 0 ? Math.min(...values) : 0;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const lowestPrice = getLowestPrice(product.prices);
  const isPizza = product.category === "pizzas";
  const cardRef = useRef<HTMLDivElement>(null);
  const viewedRef = useRef(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || viewedRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !viewedRef.current) {
          viewedRef.current = true;
          trackProductViewed({
            product_id: product.slug,
            name: product.name,
            category: product.category,
            price: lowestPrice,
            quantity: 1,
            image_url: product.image,
          });
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [
    product.slug,
    product.name,
    product.category,
    product.image,
    lowestPrice,
  ]);

  function handleCardClick() {
    trackProductClicked({
      product_id: product.slug,
      name: product.name,
      category: product.category,
      price: lowestPrice,
      quantity: 1,
      image_url: product.image,
    });
  }

  function handleAddToCart() {
    const unitPrice = product.prices.single ?? lowestPrice;
    const item = {
      id: `${product.slug}-${Date.now()}`,
      productSlug: product.slug,
      productName: product.name,
      category: product.category,
      image: product.image,
      quantity: 1,
      unitPrice,
    };
    addItem(item);
    trackProductAdded({
      product_id: product.slug,
      name: product.name,
      category: product.category,
      price: unitPrice,
      quantity: 1,
      image_url: product.image,
    });
  }

  return (
    <Card
      ref={cardRef}
      className="group flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      onClick={handleCardClick}
    >
      {/* Image area */}
      <div className="relative h-44 overflow-hidden">
        <ProductImage
          src={product.image}
          alt={product.name}
          slug={product.slug}
          category={product.category}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {/* Badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {product.isNew && (
            <Badge className="bg-[var(--dominos-green)] text-white hover:bg-[var(--dominos-green)]/90">
              New
            </Badge>
          )}
          {product.isPopular && (
            <Badge className="bg-[var(--dominos-orange)] text-white hover:bg-[var(--dominos-orange)]/90">
              Popular
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="pb-0">
        <CardTitle className="text-base font-bold leading-tight">
          {product.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {product.description}
        </p>
        <p className="mt-2 text-base font-bold text-[var(--dominos-red)]">
          From ${lowestPrice.toFixed(2)}
        </p>
      </CardContent>

      <CardFooter>
        {isPizza ? (
          <Button
            className="w-full bg-[var(--dominos-red)] font-semibold text-white hover:bg-[var(--dominos-red)]/90"
            size="lg"
            asChild
          >
            <Link
              href={`/product/${product.slug}`}
              onClick={(e) => e.stopPropagation()}
            >
              Customise
            </Link>
          </Button>
        ) : (
          <Button
            className="w-full bg-[var(--dominos-red)] font-semibold text-white hover:bg-[var(--dominos-red)]/90"
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
          >
            Add to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <Skeleton className="h-44 w-full rounded-none" />
      <CardHeader className="pb-0">
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent className="flex-1">
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="mt-1.5 h-4 w-2/3" />
        <Skeleton className="mt-3 h-5 w-20" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full rounded-md" />
      </CardFooter>
    </Card>
  );
}
