import { pgTable, uuid, text, integer, numeric, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const orderStatusEnum = pgEnum("order_status", [
  "placed", "preparing", "oven", "quality_check", "out_for_delivery", "delivered", "ready_for_pickup"
]);
export const deliveryMethodEnum = pgEnum("delivery_method", ["delivery", "pickup"]);
export const loyaltyTierEnum = pgEnum("loyalty_tier", ["bronze", "silver", "gold", "vip"]);
export const loyaltyTransactionTypeEnum = pgEnum("loyalty_transaction_type", ["earned", "redeemed", "bonus"]);

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  storeId: text("store_id").notNull(),
  status: orderStatusEnum("status").default("placed").notNull(),
  deliveryMethod: deliveryMethodEnum("delivery_method").notNull(),
  deliveryAddress: text("delivery_address"),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: numeric("delivery_fee", { precision: 10, scale: 2 }).default("0").notNull(),
  discount: numeric("discount", { precision: 10, scale: 2 }).default("0").notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  couponCode: text("coupon_code"),
  specialInstructions: text("special_instructions"),
  estimatedDelivery: timestamp("estimated_delivery"),
  statusTimestamps: jsonb("status_timestamps").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  productSlug: text("product_slug").notNull(),
  productName: text("product_name").notNull(),
  size: text("size"),
  crust: text("crust"),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  customizations: jsonb("customizations"),
});

export const loyaltyAccounts = pgTable("loyalty_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique(),
  points: integer("points").default(0).notNull(),
  tier: loyaltyTierEnum("tier").default("bronze").notNull(),
  lifetimePoints: integer("lifetime_points").default(0).notNull(),
  lifetimeOrders: integer("lifetime_orders").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const loyaltyTransactions = pgTable("loyalty_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  loyaltyAccountId: uuid("loyalty_account_id").references(() => loyaltyAccounts.id).notNull(),
  orderId: uuid("order_id").references(() => orders.id),
  points: integer("points").notNull(),
  type: loyaltyTransactionTypeEnum("type").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const savedAddresses = pgTable("saved_addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  label: text("label").notNull(),
  street: text("street").notNull(),
  suburb: text("suburb").notNull(),
  state: text("state").notNull(),
  postcode: text("postcode").notNull(),
  isDefault: integer("is_default").default(0).notNull(),
  lat: numeric("lat", { precision: 10, scale: 7 }),
  lng: numeric("lng", { precision: 10, scale: 7 }),
});

// Relations
export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));

export const loyaltyAccountsRelations = relations(loyaltyAccounts, ({ many }) => ({
  transactions: many(loyaltyTransactions),
}));

export const loyaltyTransactionsRelations = relations(loyaltyTransactions, ({ one }) => ({
  account: one(loyaltyAccounts, { fields: [loyaltyTransactions.loyaltyAccountId], references: [loyaltyAccounts.id] }),
}));
