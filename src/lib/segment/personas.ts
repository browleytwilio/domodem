// src/lib/segment/personas.ts
import { analytics } from "@/lib/segment/bus";

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

export const PERSONAS: Persona[] = [
  {
    id: "sarah_vip",
    name: "Sarah — VIP Customer",
    description: "5 past orders, loyalty Gold, pizzas lover, Sydney",
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
      await analytics.identify("user-sarah-vip", {
        email: "sarah.vip@dominosdemo.com",
        name: "Sarah Thompson",
        loyalty_tier: "gold",
        loyalty_points: 1280,
        lifetime_orders: 12,
        lifetime_spend: 386.4,
      });
      for (let i = 0; i < 5; i++) {
        await analytics.track("Order Completed", {
          order_id: `hist-order-${i + 1}`,
          total: 35 + i * 3,
          revenue: 32 + i * 3,
          currency: "AUD",
          category: "pizzas",
          products: [
            { product_id: "meat-lovers", name: "Meat Lovers", category: "pizzas", price: 16.99, quantity: 1 },
          ],
        });
        await wait(30);
      }
    },
  },
  {
    id: "dan_abandoner",
    name: "Dan — Cart Abandoner",
    description: "Browses, adds to cart, leaves",
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
      await analytics.track("Checkout Started", {
        cart_id: "cart-dan-1",
        revenue: 14.99,
        products: [
          { product_id: "pepperoni", name: "Pepperoni", category: "pizzas", price: 14.99, quantity: 1 },
        ],
      });
    },
  },
  {
    id: "mia_dealhunter",
    name: "Mia — Deal Hunter",
    description: "Loves coupons & deals, lunch lover",
    icon: "tag",
    userId: "user-mia-deals",
    email: "mia.deals@dominosdemo.com",
    traits: {
      email: "mia.deals@dominosdemo.com",
      name: "Mia Nguyen",
      loyalty_tier: "silver",
      loyalty_points: 320,
    },
    async seed() {
      await analytics.identify("user-mia-deals", {
        email: "mia.deals@dominosdemo.com",
        name: "Mia Nguyen",
        loyalty_tier: "silver",
      });
      await analytics.track("Deal Viewed", { deal_id: "deal-005", deal_name: "Lunch Combo", discount_value: 7 });
      await wait(30);
      await analytics.track("Coupon Applied", { coupon_code: "LUNCH1295", discount: 4 });
    },
  },
  {
    id: "anon_visitor",
    name: "Anon — New Visitor",
    description: "Anonymous session, just browsing",
    icon: "user",
    userId: "",
    email: "",
    traits: {},
    async seed() {
      await analytics.reset();
      await analytics.page(undefined, "Home", { url: "/", path: "/" });
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
