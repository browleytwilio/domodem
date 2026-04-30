"use client";

import { useState } from "react";
import Image from "next/image";
import { getPlaceholderImage } from "@/lib/image-placeholder";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src: string;
  alt: string;
  slug: string;
  category: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

export function ProductImage({
  src,
  alt,
  slug,
  category,
  fill,
  width,
  height,
  sizes,
  priority,
  className,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const placeholder = getPlaceholderImage(slug, alt, category, width || 400, height || 300);

  const imgSrc = hasError ? placeholder.src : src;

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
        priority={priority}
        className={cn(
          "object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
        placeholder="blur"
        blurDataURL={placeholder.blurDataURL}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setHasError(true);
          setLoaded(true);
        }}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width || 400}
      height={height || 300}
      sizes={sizes}
      priority={priority}
      className={cn(
        "object-cover transition-opacity duration-300",
        loaded ? "opacity-100" : "opacity-0",
        className,
      )}
      placeholder="blur"
      blurDataURL={placeholder.blurDataURL}
      onLoad={() => setLoaded(true)}
      onError={() => {
        setHasError(true);
        setLoaded(true);
      }}
    />
  );
}
