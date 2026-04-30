// scripts/seed-demo-users.mjs
// One-time, idempotent seed for demo users + history.
// Run locally:  node --env-file=.env.local scripts/seed-demo-users.mjs
// Run in prod:  DATABASE_URL=... DATABASE_URL_UNPOOLED=... node scripts/seed-demo-users.mjs
//
// This script is safely re-runnable:
//   * better-auth `signUpEmail` errors are swallowed; the existing user is looked up.
//   * `loyalty_accounts` uses upsert on the `user_id` unique constraint.
//   * `saved_addresses` is only inserted if no row with the same (user_id, label) exists.
//   * `orders` for a persona are keyed with coupon_code = 'DEMO-SEED-<personaId>',
//     and we skip inserting more once count(*) reaches the target.

import { Pool } from "@neondatabase/serverless";
import { betterAuth } from "better-auth";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// --------------------------------------------------------------------------
// Env loading (no dotenv dependency). Prefers `node --env-file=.env.local`,
// but also parses `.env.local` manually if invoked without that flag so the
// script stays friendly on older Node versions.
// --------------------------------------------------------------------------

function loadDotEnvLocal() {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const envPath = resolve(here, "..", ".env.local");
    const contents = readFileSync(envPath, "utf8");
    for (const rawLine of contents.split("\n")) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env.local is optional; ignore if missing.
  }
}

loadDotEnvLocal();

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!connectionString) {
  console.error(
    "DATABASE_URL or DATABASE_URL_UNPOOLED must be set (checked process.env and .env.local).",
  );
  process.exit(1);
}

// --------------------------------------------------------------------------
// Clients
// --------------------------------------------------------------------------

const pool = new Pool({ connectionString });
const auth = betterAuth({
  database: pool,
  emailAndPassword: { enabled: true },
  session: { expiresIn: 60 * 60 * 24 * 7 },
});

const PASSWORD = "demo1234";

const USERS = [
  {
    personaId: "sarah_vip",
    email: "sarah.vip@dominosdemo.com",
    name: "Sarah Thompson",
    tier: "gold",
    points: 1280,
    lifetimeOrders: 12,
    address: {
      label: "Home",
      street: "42 Wallaby Way",
      suburb: "Sydney",
      state: "NSW",
      postcode: "2000",
    },
  },
  {
    personaId: "dan_abandoner",
    email: "dan.abandoner@dominosdemo.com",
    name: "Dan Roberts",
    tier: "bronze",
    points: 0,
    lifetimeOrders: 0,
    address: null,
  },
  {
    personaId: "alex_deals",
    email: "alex.deals@dominosdemo.com",
    name: "Alex Ng",
    tier: "silver",
    points: 520,
    lifetimeOrders: 4,
    address: {
      label: "Home",
      street: "19 Brunswick St",
      suburb: "Fitzroy",
      state: "VIC",
      postcode: "3065",
    },
  },
  {
    personaId: "jamie_new",
    email: "jamie.new@dominosdemo.com",
    name: "Jamie Patel",
    tier: "bronze",
    points: 0,
    lifetimeOrders: 0,
    address: null,
  },
];

// --------------------------------------------------------------------------
// Seed helpers
// --------------------------------------------------------------------------

async function ensureUser(u) {
  // better-auth's signUpEmail throws (APIError) if user exists; catch that and
  // fall through to the lookup path below.
  try {
    const result = await auth.api.signUpEmail({
      body: { email: u.email, password: PASSWORD, name: u.name },
    });
    if (result?.user?.id) {
      console.log(`[seed] Created user ${u.email} (${result.user.id})`);
      return result.user.id;
    }
  } catch {
    // Existing user is expected on re-runs — swallow and reuse.
  }

  const existing = await pool.query(
    `select id from "user" where email = $1 limit 1`,
    [u.email],
  );
  if (existing.rows[0]?.id) {
    console.log(`[seed] Reusing existing user ${u.email} (${existing.rows[0].id})`);
    return existing.rows[0].id;
  }
  throw new Error(`Could not create or find user ${u.email}`);
}

async function seedLoyalty(userId, u) {
  await pool.query(
    `insert into loyalty_accounts (user_id, points, tier, lifetime_points, lifetime_orders)
     values ($1, $2, $3, $4, $5)
     on conflict (user_id) do update set
       points = excluded.points,
       tier = excluded.tier,
       lifetime_points = excluded.lifetime_points,
       lifetime_orders = excluded.lifetime_orders`,
    [userId, u.points, u.tier, u.points, u.lifetimeOrders],
  );
}

async function seedAddress(userId, u) {
  if (!u.address) return;
  const existing = await pool.query(
    `select id from saved_addresses where user_id = $1 and label = $2 limit 1`,
    [userId, u.address.label],
  );
  if (existing.rows[0]?.id) return;
  await pool.query(
    `insert into saved_addresses (user_id, label, street, suburb, state, postcode, is_default)
     values ($1, $2, $3, $4, $5, $6, 1)`,
    [
      userId,
      u.address.label,
      u.address.street,
      u.address.suburb,
      u.address.state,
      u.address.postcode,
    ],
  );
}

async function seedOrderHistory(userId, u) {
  if (u.lifetimeOrders === 0) return;
  const seedTag = `DEMO-SEED-${u.personaId}`;
  const existing = await pool.query(
    `select count(*)::int as n from orders where user_id = $1 and coupon_code = $2`,
    [userId, seedTag],
  );
  const already = existing.rows[0]?.n ?? 0;
  if (already >= u.lifetimeOrders) {
    console.log(`[seed] ${u.email} already has seeded order history (${already} rows)`);
    return;
  }

  const now = new Date();
  const toInsert = u.lifetimeOrders - already;
  for (let i = already; i < u.lifetimeOrders; i++) {
    const placedAt = new Date(now.getTime() - (i + 1) * 86_400_000 * 3);
    const deliveredAt = new Date(placedAt.getTime() + 40 * 60_000);
    const subtotal = 28 + (i % 4) * 4;
    const total = subtotal + 7.95;
    const result = await pool.query(
      `insert into orders (user_id, store_id, status, delivery_method, delivery_address,
         subtotal, delivery_fee, discount, total, coupon_code, status_timestamps, created_at, updated_at)
       values ($1, 'store-001', 'delivered', 'delivery', '42 Wallaby Way, Sydney NSW 2000',
         $2, '7.95', '0', $3, $4, $5, $6, $6) returning id`,
      [
        userId,
        String(subtotal),
        String(total),
        seedTag,
        JSON.stringify({
          placed: placedAt.toISOString(),
          delivered: deliveredAt.toISOString(),
        }),
        placedAt,
      ],
    );
    const orderId = result.rows[0].id;
    await pool.query(
      `insert into order_items (order_id, product_slug, product_name, size, crust, quantity, unit_price, total_price)
       values ($1, 'meat-lovers', 'Meat Lovers', 'large', 'classic', 1, '16.99', '16.99'),
              ($1, 'garlic-bread', 'Garlic Bread', null, null, 1, '6.95', '6.95')`,
      [orderId],
    );
  }
  console.log(`[seed] ${u.email}: inserted ${toInsert} historical orders`);
}

// --------------------------------------------------------------------------
// Main
// --------------------------------------------------------------------------

async function main() {
  for (const u of USERS) {
    const userId = await ensureUser(u);
    await seedLoyalty(userId, u);
    await seedAddress(userId, u);
    await seedOrderHistory(userId, u);
  }
  await pool.end();
  console.log("[seed] done.");
}

main().catch(async (e) => {
  console.error(e);
  try {
    await pool.end();
  } catch {}
  process.exit(1);
});
