// src/lib/segment/personas.ts
import { analytics } from "@/lib/segment/bus";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import storesData from "@/data/stores.json";
import type { Store } from "@/types/store";

const stores = storesData as Store[];

export type PersonaIcon = "crown" | "cart" | "tag" | "user";

export interface Persona {
  id: string;
  name: string;
  description: string;
  icon: PersonaIcon;
  userId: string;
  email: string;
  traits: Record<string, unknown>;
  seed: () => Promise<void>;
}

async function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function findStore(id: string): Store | null {
  return stores.find((s) => s.id === id) ?? null;
}

function resetDemoEnvironment() {
  // Clear any carry-over UX state from a previously loaded persona.
  useCartStore.getState().clearCart();
  const ui = useUIStore.getState();
  ui.setSelectedStore(null);
  ui.setDeliveryAddress("");
  ui.setDeliveryMethod("delivery");
}

export const PERSONAS: Persona[] = [
  // ---------------------------------------------------------------------------
  // Sarah — VIP Customer
  // ---------------------------------------------------------------------------
  {
    id: "sarah_vip",
    name: "Sarah — VIP Customer",
    description: "Gold tier, 12 past orders, Sydney CBD",
    icon: "crown",
    userId: "user-sarah-vip",
    email: "sarah.vip@dominosdemo.com",
    traits: {
      email: "sarah.vip@dominosdemo.com",
      name: "Sarah Thompson",
      loyalty_tier: "gold",
      loyalty_points: 1280,
      lifetime_orders: 12,
      lifetime_spend: 386.4,
      preferred_delivery_method: "delivery",
      preferred_store_id: "store-001",
    },
    async seed() {
      resetDemoEnvironment();

      // Set up Sarah's on-site environment: delivery to her saved Sydney address,
      // home store pinned, cart primed with her usual large Meat Lovers.
      const ui = useUIStore.getState();
      const cart = useCartStore.getState();
      ui.setDeliveryMethod("delivery");
      ui.setDeliveryAddress("42 Wallaby Way, Sydney NSW 2000");
      const homeStore = findStore("store-001");
      if (homeStore) ui.setSelectedStore(homeStore);
      cart.addItem({
        id: `persona-sarah-${Date.now()}`,
        productSlug: "meat-lovers",
        productName: "Meat Lovers",
        category: "pizzas",
        image: "/images/menu/meat-lovers.webp",
        size: "large",
        crust: "classic",
        quantity: 1,
        unitPrice: 16.99,
      });

      // Analytics: identify + 12 historical orders so lifetime traits land on VIP.
      await analytics.identify("user-sarah-vip", {
        email: "sarah.vip@dominosdemo.com",
        name: "Sarah Thompson",
        loyalty_tier: "gold",
        loyalty_points: 1280,
        lifetime_orders: 12,
        lifetime_spend: 386.4,
      });
      for (let i = 0; i < 12; i++) {
        await analytics.track("Order Completed", {
          order_id: `hist-order-${i + 1}`,
          total: 32 + (i % 4) * 4,
          revenue: 30 + (i % 4) * 4,
          currency: "AUD",
          category: "pizzas",
          store_id: "store-001",
          products: [
            { product_id: "meat-lovers", name: "Meat Lovers", category: "pizzas", price: 16.99, quantity: 1 },
            { product_id: "garlic-bread", name: "Garlic Bread", category: "sides", price: 6.95, quantity: 1 },
          ],
        });
        await wait(20);
      }
      await analytics.page(undefined, "Home", { url: "/", path: "/" });
    },
  },

  // ---------------------------------------------------------------------------
  // Dan — Cart Abandoner
  // ---------------------------------------------------------------------------
  {
    id: "dan_abandoner",
    name: "Dan — Cart Abandoner",
    description: "Bronze tier, 1 item in cart, left before checkout",
    icon: "cart",
    userId: "user-dan-abandoner",
    email: "dan.abandoner@dominosdemo.com",
    traits: {
      email: "dan.abandoner@dominosdemo.com",
      name: "Dan Kelly",
      loyalty_tier: "bronze",
      loyalty_points: 40,
      lifetime_orders: 0,
      lifetime_spend: 0,
    },
    async seed() {
      resetDemoEnvironment();

      // Dan's environment: pickup from Bondi, cart primed with a Pepperoni +
      // Coke, but no order placed yet. This matches the Cart Abandoner audience.
      const ui = useUIStore.getState();
      const cart = useCartStore.getState();
      ui.setDeliveryMethod("pickup");
      const bondi = findStore("store-002");
      if (bondi) ui.setSelectedStore(bondi);
      cart.addItem({
        id: `persona-dan-pizza-${Date.now()}`,
        productSlug: "pepperoni",
        productName: "Pepperoni",
        category: "pizzas",
        image: "/images/menu/pepperoni.webp",
        size: "large",
        crust: "classic",
        quantity: 1,
        unitPrice: 14.99,
      });
      cart.addItem({
        id: `persona-dan-drink-${Date.now() + 1}`,
        productSlug: "coca-cola-1.25l",
        productName: "Coca-Cola 1.25L",
        category: "drinks",
        image: "/images/menu/coca-cola-1.25l.webp",
        quantity: 1,
        unitPrice: 5.5,
      });

      await analytics.identify("user-dan-abandoner", {
        email: "dan.abandoner@dominosdemo.com",
        name: "Dan Kelly",
        loyalty_tier: "bronze",
      });
      await analytics.track("Product List Viewed", { category: "pizzas" });
      await wait(40);
      await analytics.track("Product Viewed", {
        product_id: "pepperoni",
        name: "Pepperoni",
        category: "pizzas",
        price: 14.99,
        quantity: 1,
      });
      await wait(40);
      await analytics.track("Product Added", {
        product_id: "pepperoni",
        name: "Pepperoni",
        category: "pizzas",
        price: 14.99,
        quantity: 1,
      });
      await wait(40);
      await analytics.track("Delivery Method Selected", {
        method: "pickup",
        store_id: "store-002",
      });
      await wait(40);
      await analytics.track("Checkout Started", {
        cart_id: "cart-dan-1",
        revenue: 20.49,
        products: [
          { product_id: "pepperoni", name: "Pepperoni", category: "pizzas", price: 14.99, quantity: 1 },
          { product_id: "coca-cola-1.25l", name: "Coca-Cola 1.25L", category: "drinks", price: 5.5, quantity: 1 },
        ],
      });
    },
  },

  // ---------------------------------------------------------------------------
  // Mia — Deal Hunter
  // ---------------------------------------------------------------------------
  {
    id: "mia_dealhunter",
    name: "Mia — Deal Hunter",
    description: "Silver tier, lunch combo + coupon applied",
    icon: "tag",
    userId: "user-mia-deals",
    email: "mia.deals@dominosdemo.com",
    traits: {
      email: "mia.deals@dominosdemo.com",
      name: "Mia Nguyen",
      loyalty_tier: "silver",
      loyalty_points: 320,
      lifetime_orders: 2,
      lifetime_spend: 38.9,
    },
    async seed() {
      resetDemoEnvironment();

      // Mia's environment: delivery to her uni address in Parramatta, lunch combo
      // in cart with the LUNCH1295 coupon applied.
      const ui = useUIStore.getState();
      const cart = useCartStore.getState();
      ui.setDeliveryMethod("delivery");
      ui.setDeliveryAddress("180 Church St, Parramatta NSW 2150");
      const parra = findStore("store-003");
      if (parra) ui.setSelectedStore(parra);
      cart.addItem({
        id: `persona-mia-pizza-${Date.now()}`,
        productSlug: "hawaiian",
        productName: "Hawaiian",
        category: "pizzas",
        image: "/images/menu/hawaiian.webp",
        size: "personal",
        crust: "classic",
        quantity: 1,
        unitPrice: 5.99,
      });
      cart.addItem({
        id: `persona-mia-side-${Date.now() + 1}`,
        productSlug: "oven-baked-chips",
        productName: "Oven Baked Chips",
        category: "sides",
        image: "/images/menu/oven-baked-chips.webp",
        quantity: 1,
        unitPrice: 4.95,
      });
      cart.addItem({
        id: `persona-mia-drink-${Date.now() + 2}`,
        productSlug: "water-600ml",
        productName: "Water 600ml",
        category: "drinks",
        image: "/images/menu/water-600ml.webp",
        quantity: 1,
        unitPrice: 2.95,
      });
      cart.applyCoupon("LUNCH1295", 4);

      await analytics.identify("user-mia-deals", {
        email: "mia.deals@dominosdemo.com",
        name: "Mia Nguyen",
        loyalty_tier: "silver",
        loyalty_points: 320,
        lifetime_orders: 2,
        lifetime_spend: 38.9,
      });
      await analytics.page(undefined, "Deals", { url: "/deals", path: "/deals" });
      await wait(30);
      await analytics.track("Deal Viewed", { deal_id: "deal-005", deal_name: "Lunch Combo", discount_value: 7 });
      await wait(30);
      await analytics.track("Product Added", {
        product_id: "hawaiian",
        name: "Hawaiian",
        category: "pizzas",
        price: 5.99,
        quantity: 1,
      });
      await wait(30);
      await analytics.track("Coupon Applied", { coupon_code: "LUNCH1295", discount: 4 });
    },
  },

  // ---------------------------------------------------------------------------
  // Anon — New Visitor
  // ---------------------------------------------------------------------------
  {
    id: "anon_visitor",
    name: "Anon — New Visitor",
    description: "Anonymous session, browsing the home page",
    icon: "user",
    userId: "",
    email: "",
    traits: {},
    async seed() {
      resetDemoEnvironment();

      await analytics.reset();
      await analytics.page(undefined, "Home", { url: "/", path: "/" });
      await wait(30);
      await analytics.track("Product List Viewed", { category: "pizzas" });
      await wait(30);
      await analytics.track("Hero Banner Clicked", {
        banner_id: "banner-1",
        banner_name: "Any 3 Pizzas from $29.95",
        position: 1,
      });
    },
  },
];

export function findPersona(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id);
}
