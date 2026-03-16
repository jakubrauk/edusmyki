"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (ebookId: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  isInCart: (ebookId: number) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find((i) => i.ebookId === item.ebookId);
        if (!existing) {
          set((state) => ({ items: [...state.items, item] }));
        }
      },

      removeItem: (ebookId) => {
        set((state) => ({
          items: state.items.filter((i) => i.ebookId !== ebookId),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.length,

      totalPrice: () =>
        get().items.reduce((sum, item) => sum + item.price, 0),

      isInCart: (ebookId) =>
        get().items.some((i) => i.ebookId === ebookId),
    }),
    {
      name: "edusmyki-cart",
    }
  )
);
