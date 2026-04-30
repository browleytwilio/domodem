import type { PizzaSize, CrustType, ToppingSelection } from "./menu";

export type OrderStatus =
  | "placed"
  | "preparing"
  | "oven"
  | "quality_check"
  | "out_for_delivery"
  | "delivered"
  | "ready_for_pickup";
export type DeliveryMethod = "delivery" | "pickup";

export interface CartItemCustomizations {
  toppings?: ToppingSelection[];
  sauce?: string;
  extras?: string[];
}

export interface CartItem {
  id: string;
  productSlug: string;
  productName: string;
  category: string;
  image: string;
  size?: PizzaSize;
  crust?: CrustType;
  quantity: number;
  unitPrice: number;
  customizations?: CartItemCustomizations;
}

export interface Order {
  id: string;
  userId: string;
  storeId: string;
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  statusTimestamps: Partial<Record<OrderStatus, string>>;
}
