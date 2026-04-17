import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types";

interface CartStore {
  items: CartItem[];
  addToOrderId: string | null;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setAddToOrderId: (id: string | null) => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addToOrderId: null,
      setAddToOrderId: (id) => set({ addToOrderId: id }),
      addItem: (product) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.product.products_id === product.products_id
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.products_id === product.products_id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, quantity: 1 }] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.product.products_id !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.product.products_id !== productId)
              : state.items.map((i) =>
                  i.product.products_id === productId ? { ...i, quantity } : i
                ),
        })),
      clearCart: () => set({ items: [], addToOrderId: null }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.product.product_price * i.quantity, 0),
    }),
    { name: "cart-storage" }
  )
);
