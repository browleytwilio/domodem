import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DeliveryMethod } from "@/types/order";
import type { Store } from "@/types/store";

interface UIState {
  deliveryMethod: DeliveryMethod;
  selectedStore: Store | null;
  deliveryAddress: string;
  isCartOpen: boolean;
  isMobileNavOpen: boolean;
  frameEnabled: boolean;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  setSelectedStore: (store: Store | null) => void;
  setDeliveryAddress: (address: string) => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
  setMobileNavOpen: (open: boolean) => void;
  setFrameEnabled: (enabled: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      deliveryMethod: "delivery",
      selectedStore: null,
      deliveryAddress: "",
      isCartOpen: false,
      isMobileNavOpen: false,
      frameEnabled: true,
      setDeliveryMethod: (method) => set({ deliveryMethod: method }),
      setSelectedStore: (store) => set({ selectedStore: store }),
      setDeliveryAddress: (address) => set({ deliveryAddress: address }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      setCartOpen: (open) => set({ isCartOpen: open }),
      toggleMobileNav: () =>
        set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),
      setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),
      setFrameEnabled: (enabled) => set({ frameEnabled: enabled }),
    }),
    {
      name: "dominos-ui",
      partialize: (state) => ({
        deliveryMethod: state.deliveryMethod,
        selectedStore: state.selectedStore,
        deliveryAddress: state.deliveryAddress,
        frameEnabled: state.frameEnabled,
      }),
    },
  ),
);
