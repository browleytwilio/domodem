import { useCartStore } from "@/stores/cart-store";
import type { CartItem } from "@/types/order";

const CHANNEL_NAME = "dominos-cart-sync";

interface CartSyncMessage {
  senderId: string;
  items: CartItem[];
  couponCode: string | null;
  couponDiscount: number;
}

function newSenderId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function setupCartBroadcast(): () => void {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return () => {};
  }
  const channel = new BroadcastChannel(CHANNEL_NAME);
  const senderId = newSenderId();

  let suppressNextPublish = false;

  channel.onmessage = (ev: MessageEvent<CartSyncMessage>) => {
    const msg = ev.data;
    if (!msg || msg.senderId === senderId) return;
    suppressNextPublish = true;
    useCartStore.setState({
      items: msg.items,
      couponCode: msg.couponCode,
      couponDiscount: msg.couponDiscount,
    });
  };

  const unsubscribe = useCartStore.subscribe((state) => {
    if (suppressNextPublish) {
      suppressNextPublish = false;
      return;
    }
    const message: CartSyncMessage = {
      senderId,
      items: state.items,
      couponCode: state.couponCode,
      couponDiscount: state.couponDiscount,
    };
    channel.postMessage(message);
  });

  return () => {
    unsubscribe();
    channel.close();
  };
}
