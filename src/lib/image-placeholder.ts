const CATEGORY_THEMES: Record<string, { bg: [string, string]; accent: string }> = {
  pizzas: { bg: ["#E85D04", "#DC2F02"], accent: "#FAA307" },
  sides: { bg: ["#F48C06", "#E85D04"], accent: "#FFBA08" },
  drinks: { bg: ["#0077B6", "#023E8A"], accent: "#48CAE4" },
  desserts: { bg: ["#6D4C3D", "#4A2C17"], accent: "#D4A373" },
  chicken: { bg: ["#BC6C25", "#7F5539"], accent: "#DDA15E" },
  pastas: { bg: ["#588157", "#344E41"], accent: "#A3B18A" },
  deals: { bg: ["#E31837", "#9D0208"], accent: "#FAA307" },
  hero: { bg: ["#0C3A5B", "#006491"], accent: "#E31837" },
};

function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return () => {
    hash = Math.imul(hash ^ (hash >>> 15), hash | 1);
    hash ^= hash + Math.imul(hash ^ (hash >>> 7), hash | 61);
    return ((hash ^ (hash >>> 14)) >>> 0) / 4294967296;
  };
}

function generateSVG(slug: string, name: string, category: string, width: number, height: number): string {
  const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES.pizzas;
  const rand = seededRandom(slug);

  const circles = Array.from({ length: 6 }, () => ({
    cx: rand() * width,
    cy: rand() * height,
    r: 20 + rand() * 60,
    opacity: 0.08 + rand() * 0.12,
  }));

  const displayName = name.length > 20 ? name.slice(0, 18) + "…" : name;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bg-${slug}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${theme.bg[0]}"/>
        <stop offset="100%" stop-color="${theme.bg[1]}"/>
      </linearGradient>
      <radialGradient id="glow-${slug}" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg-${slug})"/>
    <rect width="${width}" height="${height}" fill="url(#glow-${slug})"/>
    ${circles.map((c) => `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="white" opacity="${c.opacity}"/>`).join("")}
    <text x="50%" y="45%" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif" font-size="${Math.min(width, height) * 0.12}" font-weight="700" fill="white" opacity="0.9">${displayName}</text>
    <text x="50%" y="60%" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif" font-size="${Math.min(width, height) * 0.06}" fill="white" opacity="0.5">${category.charAt(0).toUpperCase() + category.slice(1)}</text>
  </svg>`;
}

function svgToDataUri(svg: string): string {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  return `data:image/svg+xml,${encoded}`;
}

function generateBlurSVG(category: string): string {
  const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES.pizzas;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8">
    <rect width="8" height="8" fill="${theme.bg[0]}"/>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export function getPlaceholderImage(
  slug: string,
  name: string,
  category: string,
  width = 400,
  height = 300,
): { src: string; blurDataURL: string } {
  const svg = generateSVG(slug, name, category, width, height);
  return {
    src: svgToDataUri(svg),
    blurDataURL: generateBlurSVG(category),
  };
}

export function getHeroPlaceholder(index: number): { src: string; blurDataURL: string } {
  const titles = ["Fresh & Hot", "Best Deals", "Family Feast", "New Flavours", "Fast Delivery"];
  return getPlaceholderImage(`hero-${index}`, titles[index] || "Domino's", "hero", 1920, 960);
}
