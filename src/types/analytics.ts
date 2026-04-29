export interface ProductProperties {
  product_id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  sku?: string;
  image_url?: string;
  url?: string;
  brand?: string;
  position?: number;
  variant?: string;
}

export interface OrderProperties {
  order_id: string;
  revenue: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  coupon?: string;
  discount?: number;
  products: ProductProperties[];
  payment_method: string;
  delivery_method: string;
  store_id: string;
  delivery_address?: string;
  estimated_delivery?: string;
}

export interface UserTraits {
  email: string;
  name: string;
  created_at: string;
  loyalty_tier: "bronze" | "silver" | "gold" | "vip";
  loyalty_points: number;
  lifetime_orders: number;
  lifetime_spend: number;
  last_order_date?: string;
  last_order_store_id?: string;
  preferred_delivery_method?: "delivery" | "pickup";
  preferred_store_id?: string;
  days_since_last_order?: number;
  avg_order_value?: number;
  favorite_category?: string;
  has_saved_address: boolean;
}
