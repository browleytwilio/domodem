import { readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const CATEGORY_THEMES = {
  pizzas: { bg: ["#E85D04", "#DC2F02"], accent: "#FAA307" },
  sides: { bg: ["#F48C06", "#E85D04"], accent: "#FFBA08" },
  drinks: { bg: ["#0077B6", "#023E8A"], accent: "#48CAE4" },
  desserts: { bg: ["#6D4C3D", "#4A2C17"], accent: "#D4A373" },
  chicken: { bg: ["#BC6C25", "#7F5539"], accent: "#DDA15E" },
  pastas: { bg: ["#588157", "#344E41"], accent: "#A3B18A" },
  deals: { bg: ["#E31837", "#9D0208"], accent: "#FAA307" },
};

function seededRandom(seed) {
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

function generateSVG(slug, name, category, width, height) {
  const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES.pizzas;
  const rand = seededRandom(slug);

  const circles = Array.from({ length: 8 }, () => ({
    cx: rand() * width,
    cy: rand() * height,
    r: 20 + rand() * 80,
    opacity: 0.06 + rand() * 0.12,
  }));

  const displayName = name.length > 22 ? name.slice(0, 20) + "…" : name;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bg[0]}"/>
      <stop offset="100%" stop-color="${theme.bg[1]}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="35%" r="50%">
      <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>
  ${circles.map((c) => `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="white" opacity="${c.opacity}"/>`).join("\n  ")}
  <text x="50%" y="42%" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.round(Math.min(width, height) * 0.11)}" font-weight="800" fill="white" opacity="0.95">${escapeXml(displayName)}</text>
  <text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.round(Math.min(width, height) * 0.055)}" fill="white" opacity="0.5">${category.charAt(0).toUpperCase() + category.slice(1)}</text>
</svg>`;
}

function escapeXml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function generateImage(slug, name, category, outputPath, width, height) {
  if (existsSync(outputPath)) {
    console.log(`  skip: ${outputPath} (exists)`);
    return;
  }

  const svg = generateSVG(slug, name, category, width, height);
  const dir = dirname(outputPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  await sharp(Buffer.from(svg))
    .webp({ quality: 85 })
    .toFile(outputPath);

  console.log(`  done: ${outputPath}`);
}

async function main() {
  console.log("Generating placeholder images...\n");

  const menuData = JSON.parse(readFileSync(join(root, "src/data/menu.json"), "utf-8"));
  const dealsData = JSON.parse(readFileSync(join(root, "src/data/deals.json"), "utf-8"));

  console.log(`Menu items: ${menuData.length}`);
  for (const item of menuData) {
    const filename = item.image.replace("/images/", "");
    const outputPath = join(root, "public/images", filename);
    await generateImage(item.slug, item.name, item.category, outputPath, 400, 300);
  }

  console.log(`\nDeals: ${dealsData.length}`);
  for (const deal of dealsData) {
    const filename = deal.image.replace("/images/", "");
    const outputPath = join(root, "public/images", filename);
    await generateImage(deal.id, deal.name, "deals", outputPath, 760, 480);
  }

  console.log("\nDone!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
