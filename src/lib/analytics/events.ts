import { analytics } from "@/lib/analytics/segment";
import type {
  ProductProperties,
  OrderProperties,
  UserTraits,
} from "@/types/analytics";

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

export function trackSignedUp(method: string, email: string): void {
  analytics.track("Signed Up", { method, email });
}

export function trackSignedIn(method: string): void {
  analytics.track("Signed In", { method });
}

export function trackSignedOut(): void {
  analytics.track("Signed Out");
}

export function identifyUser(userId: string, traits: UserTraits): void {
  analytics.identify(userId, traits);
}

// ---------------------------------------------------------------------------
// E-Commerce Core (Segment Spec v2)
// ---------------------------------------------------------------------------

export function trackProductListViewed(
  category: string,
  products: ProductProperties[],
): void {
  analytics.track("Product List Viewed", { category, products });
}

export function trackProductViewed(product: ProductProperties): void {
  analytics.track("Product Viewed", { ...product });
}

export function trackProductAdded(
  product: ProductProperties & { variant?: string; customizations?: unknown },
): void {
  analytics.track("Product Added", { ...product });
}

export function trackProductRemoved(
  productId: string,
  name: string,
  quantity: number,
  extras?: { category?: string; price?: number; variant?: string },
): void {
  analytics.track("Product Removed", {
    product_id: productId,
    name,
    quantity,
    ...extras,
  });
}

export function trackCartViewed(
  cartId: string,
  products: ProductProperties[],
  cartTotal: number,
): void {
  analytics.track("Cart Viewed", {
    cart_id: cartId,
    products,
    cart_total: cartTotal,
  });
}

export function trackCheckoutStarted(
  cartId: string,
  products: ProductProperties[],
  revenue: number,
  options: {
    coupon?: string;
    currency?: string;
    value?: number;
    shipping?: number;
    tax?: number;
    discount?: number;
  } = {},
): void {
  analytics.track("Checkout Started", {
    order_id: cartId,
    products,
    revenue,
    currency: options.currency ?? "AUD",
    ...(options.value !== undefined && { value: options.value }),
    ...(options.shipping !== undefined && { shipping: options.shipping }),
    ...(options.tax !== undefined && { tax: options.tax }),
    ...(options.discount !== undefined && { discount: options.discount }),
    ...(options.coupon !== undefined && { coupon: options.coupon }),
  });
}

export function trackOrderCompleted(props: OrderProperties): void {
  analytics.track("Order Completed", { ...props });
}

export function trackCouponApplied(
  couponCode: string,
  discount: number,
): void {
  analytics.track("Coupon Applied", {
    coupon_code: couponCode,
    discount,
  });
}

export function trackCouponDenied(couponCode: string, reason: string): void {
  analytics.track("Coupon Denied", {
    coupon_code: couponCode,
    reason,
  });
}

// ---------------------------------------------------------------------------
// Pizza Builder
// ---------------------------------------------------------------------------

export function trackPizzaBuilderOpened(
  baseProduct: string,
  size: string,
  sourcePage: string,
): void {
  analytics.track("Pizza Builder Opened", {
    base_product: baseProduct,
    size,
    source_page: sourcePage,
  });
}

export function trackPizzaSizeSelected(
  productId: string,
  size: string,
  price: number,
): void {
  analytics.track("Pizza Size Selected", {
    product_id: productId,
    size,
    price,
  });
}

export function trackPizzaCrustSelected(
  productId: string,
  crustType: string,
  priceModifier: number,
): void {
  analytics.track("Pizza Crust Selected", {
    product_id: productId,
    crust_type: crustType,
    price_modifier: priceModifier,
  });
}

export function trackPizzaToppingAdded(
  productId: string,
  topping: string,
  placement: string,
  priceModifier: number,
): void {
  analytics.track("Pizza Topping Added", {
    product_id: productId,
    topping,
    placement,
    price_modifier: priceModifier,
  });
}

export function trackPizzaToppingRemoved(
  productId: string,
  topping: string,
): void {
  analytics.track("Pizza Topping Removed", {
    product_id: productId,
    topping,
  });
}

export function trackPizzaBuilderCompleted(
  productId: string,
  totalPrice: number,
  toppingsCount: number,
  crust: string,
  size: string,
): void {
  analytics.track("Pizza Builder Completed", {
    product_id: productId,
    total_price: totalPrice,
    toppings_count: toppingsCount,
    crust,
    size,
  });
}

export function trackPizzaBuilderAbandoned(
  productId: string,
  timeSpentSeconds: number,
  toppingsSelected: number,
): void {
  analytics.track("Pizza Builder Abandoned", {
    product_id: productId,
    time_spent_seconds: timeSpentSeconds,
    toppings_selected: toppingsSelected,
  });
}

// ---------------------------------------------------------------------------
// Store & Delivery
// ---------------------------------------------------------------------------

export function trackStoreSearchInitiated(
  query: string,
  method: string,
): void {
  analytics.track("Store Search Initiated", { query, method });
}

export function trackStoreSelected(
  storeId: string,
  storeName: string,
  distanceKm: number,
): void {
  analytics.track("Store Selected", {
    store_id: storeId,
    store_name: storeName,
    distance_km: distanceKm,
  });
}

export function trackDeliveryMethodSelected(
  method: string,
  storeId: string,
): void {
  analytics.track("Delivery Method Selected", {
    method,
    store_id: storeId,
  });
}

export function trackDeliveryAddressEntered(
  suburb: string,
  state: string,
  postcode: string,
): void {
  analytics.track("Delivery Address Entered", { suburb, state, postcode });
}

// ---------------------------------------------------------------------------
// Order Tracker
// ---------------------------------------------------------------------------

export function trackOrderTrackerViewed(
  orderId: string,
  currentStatus: string,
): void {
  analytics.track("Order Tracker Viewed", {
    order_id: orderId,
    current_status: currentStatus,
  });
}

export function trackOrderStatusChanged(
  orderId: string,
  previousStatus: string,
  newStatus: string,
  elapsedMinutes: number,
): void {
  analytics.track("Order Status Changed", {
    order_id: orderId,
    previous_status: previousStatus,
    new_status: newStatus,
    elapsed_minutes: elapsedMinutes,
  });
}

// ---------------------------------------------------------------------------
// Loyalty
// ---------------------------------------------------------------------------

export function trackLoyaltyProgramViewed(
  currentTier: string,
  pointsBalance: number,
): void {
  analytics.track("Loyalty Program Viewed", {
    current_tier: currentTier,
    points_balance: pointsBalance,
  });
}

export function trackLoyaltyPointsEarned(
  orderId: string,
  pointsEarned: number,
  newBalance: number,
): void {
  analytics.track("Loyalty Points Earned", {
    order_id: orderId,
    points_earned: pointsEarned,
    new_balance: newBalance,
  });
}

export function trackLoyaltyPointsRedeemed(
  pointsRedeemed: number,
  rewardName: string,
  newBalance: number,
): void {
  analytics.track("Loyalty Points Redeemed", {
    points_redeemed: pointsRedeemed,
    reward_name: rewardName,
    new_balance: newBalance,
  });
}

export function trackLoyaltyTierChanged(
  previousTier: string,
  newTier: string,
  lifetimePoints: number,
): void {
  analytics.track("Loyalty Tier Changed", {
    previous_tier: previousTier,
    new_tier: newTier,
    lifetime_points: lifetimePoints,
  });
}

// ---------------------------------------------------------------------------
// Engagement
// ---------------------------------------------------------------------------

export function trackDealViewed(
  dealId: string,
  dealName: string,
  discountValue: number,
): void {
  analytics.track("Deal Viewed", {
    deal_id: dealId,
    deal_name: dealName,
    discount_value: discountValue,
  });
}

export function trackDealApplied(
  dealId: string,
  dealName: string,
  discountValue: number,
  productsAffected: number,
): void {
  analytics.track("Deal Applied", {
    deal_id: dealId,
    deal_name: dealName,
    discount_value: discountValue,
    products_affected: productsAffected,
  });
}

export function trackSearchPerformed(
  query: string,
  resultsCount: number,
): void {
  analytics.track("Search Performed", {
    query,
    results_count: resultsCount,
  });
}

export function trackHeroBannerClicked(
  bannerId: string,
  bannerName: string,
  position: number,
): void {
  analytics.track("Hero Banner Clicked", {
    banner_id: bannerId,
    banner_name: bannerName,
    position,
  });
}

// ---------------------------------------------------------------------------
// Spec v2 — Identity + Business (new for Segment demo)
// ---------------------------------------------------------------------------

export function trackGroup(
  groupId: string,
  name: string,
  traits?: Record<string, unknown>,
): void {
  analytics.group(groupId, { name, ...traits });
}

export function trackAlias(newUserId: string, previousId?: string): void {
  analytics.alias(newUserId, previousId);
}

export function trackNewsletterSubscribed(
  email: string,
  source: string,
): void {
  analytics.track("Newsletter Subscribed", { email, source });
}

export function trackVideoPlayed(
  assetId: string,
  assetName: string,
  position: number,
): void {
  analytics.track("Video Playback Started", {
    asset_id: assetId,
    asset_name: assetName,
    position,
  });
}

export function trackFormAbandoned(
  formName: string,
  fieldsFilled: number,
  totalFields: number,
): void {
  analytics.track("Form Abandoned", {
    form_name: formName,
    fields_filled: fieldsFilled,
    total_fields: totalFields,
    completion_pct: totalFields > 0
      ? Math.round((fieldsFilled / totalFields) * 100)
      : 0,
  });
}

export function trackError(
  message: string,
  context: Record<string, unknown> = {},
): void {
  analytics.track("Error Encountered", { message, ...context });
}

// ---------------------------------------------------------------------------
// Spec v2 — browsing + promotions + checkout steps (gap fill)
// ---------------------------------------------------------------------------

export function trackProductListFiltered(
  category: string,
  filter: string,
  resultsCount: number,
): void {
  analytics.track("Product List Filtered", {
    category,
    filters: [{ type: "category", value: filter }],
    results_count: resultsCount,
  });
}

export function trackProductClicked(
  product: ProductProperties,
  position?: number,
): void {
  analytics.track("Product Clicked", {
    ...product,
    ...(position !== undefined && { position }),
  });
}

export function trackPromotionViewed(
  promotionId: string,
  promotionName: string,
  position?: number,
): void {
  analytics.track("Promotion Viewed", {
    promotion_id: promotionId,
    name: promotionName,
    ...(position !== undefined && { position }),
  });
}

export function trackPromotionClicked(
  promotionId: string,
  promotionName: string,
  position?: number,
): void {
  analytics.track("Promotion Clicked", {
    promotion_id: promotionId,
    name: promotionName,
    ...(position !== undefined && { position }),
  });
}

export function trackCouponEntered(couponCode: string): void {
  analytics.track("Coupon Entered", { coupon_code: couponCode });
}

export function trackCouponRemoved(couponCode: string, discount: number): void {
  analytics.track("Coupon Removed", { coupon_code: couponCode, discount });
}

export function trackCheckoutStepViewed(
  stepNumber: number,
  stepName: string,
): void {
  analytics.track("Checkout Step Viewed", {
    step: stepNumber,
    step_name: stepName,
  });
}

export function trackCheckoutStepCompleted(
  stepNumber: number,
  stepName: string,
  properties: Record<string, unknown> = {},
): void {
  analytics.track("Checkout Step Completed", {
    step: stepNumber,
    step_name: stepName,
    ...properties,
  });
}

export function trackPaymentInfoEntered(paymentMethod: string): void {
  analytics.track("Payment Info Entered", { payment_method: paymentMethod });
}
