export type PizzaSize = "personal" | "value" | "large" | "extra-large";
export type CrustType = "classic" | "thin-crispy" | "deep-pan" | "cheesy-crust";
export type ToppingPlacement = "left" | "right" | "whole";
export type MenuCategory =
  | "pizzas"
  | "sides"
  | "drinks"
  | "desserts"
  | "pastas"
  | "chicken"
  | "vegan";

export interface Topping {
  slug: string;
  name: string;
  category: "meats" | "veggies" | "cheese" | "sauces" | "seafood";
  price: number;
  image: string;
  isDefault?: boolean;
}

export interface ToppingSelection {
  topping: Topping;
  placement: ToppingPlacement;
}

export interface ProductPrices {
  personal?: number;
  value?: number;
  large?: number;
  "extra-large"?: number;
  single?: number; // for non-pizza items
}

export interface Product {
  slug: string;
  name: string;
  description: string;
  category: MenuCategory;
  image: string;
  prices: ProductPrices;
  crusts?: CrustType[];
  defaultToppings?: string[];
  isPopular?: boolean;
  isNew?: boolean;
  isVegan?: boolean;
  kj?: Record<string, number>;
  allergens?: string[];
}

export interface Deal {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  products: string[]; // product slugs
  badge?: string;
  validUntil?: string;
  code?: string;
}
