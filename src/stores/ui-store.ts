import { create } from "zustand";
import type { DeliveryMethod } from "@/types/order";
import type { Store } from "@/types/store";

interface UIState {
  deliveryMethod: DeliveryMethod;
  selectedStore: Store | null;
  deliveryAddress: string;
  isCartOpen: boolean;
  isMobileNavOpen: boolean;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  setSelectedStore: (store: Store | null) => void;
  setDeliveryAddress: (address: string) => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
  setMobileNavOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  deliveryMethod: "delivery",
  selectedStore: null,
  deliveryAddress: "",
  isCartOpen: false,
  isMobileNavOpen: false,
  setDeliveryMethod: (method) => set({ deliveryMethod: method }),
  setSelectedStore: (store) => set({ selectedStore: store }),
  setDeliveryAddress: (address) => set({ deliveryAddress: address }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  setCartOpen: (open) => set({ isCartOpen: open }),
  toggleMobileNav: () =>
    set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),
  setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),
}));
