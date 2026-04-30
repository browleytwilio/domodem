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

const CATEGORY_ICONS: Record<string, string> = {
  pizzas: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14l-3-3 1.41-1.41L11 13.17l4.59-4.59L17 10l-6 6z",
  sides: "M4 18h16v2H4v-2zm0-4h10v2H4v-2zm0-4h16v2H4v-2zm0-4h10v2H4V6z",
  drinks: "M6 2v6c0 2.76 2.24 5 5 5h2c2.76 0 5-2.24 5-5V2H6zm10 4H8V4h8v2zm-3 14H7v-2h6v2zm4-4H3v-2h14v2z",
  desserts: "M12 2C8.69 2 6 4.69 6 8c0 2.62 1.69 4.85 4.03 5.65l-.85 6.35h5.64l-.85-6.35C16.31 12.85 18 10.62 18 8c0-3.31-2.69-6-6-6z",
  chicken: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  pastas: "M2 17h20v2H2v-2zm3-4h4v3H5v-3zm6 0h4v3h-4v-3zm6 0h4v3h-4v-3zM3 8h18l-1.5 5H4.5L3 8z",
  deals: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  hero: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
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
