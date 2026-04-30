import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order } from "@/types/order";

interface OrderState {
  currentOrder: Order | null;
  orderHistory: Order[];
  setCurrentOrder: (order: Order | null) => void;
  addToHistory: (order: Order) => void;
  updateOrderInHistory: (order: Order) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      currentOrder: null,
      orderHistory: [],
      setCurrentOrder: (order) => set({ currentOrder: order }),
      addToHistory: (order) =>
        set((state) => ({
          orderHistory: [order, ...state.orderHistory],
        })),
      updateOrderInHistory: (order) =>
        set((state) => ({
          orderHistory: state.orderHistory.map((o) =>
            o.id === order.id ? order : o
          ),
        })),
    }),
    { name: "dominos-orders" }
  )
);
