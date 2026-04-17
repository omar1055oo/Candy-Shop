import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types";
import { effectiveStockUnits, type CartStockResult } from "@/lib/cartStock";

interface CartStore {
  items: CartItem[];
  addToOrderId: string | null;
  addItem: (product: Product) => CartStockResult;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => CartStockResult;
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
      addItem: (product) => {
        const max = effectiveStockUnits(product);
        if (max <= 0) {
          return { ok: false, productName: product.product_name, available: 0 };
        }
        const state = get();
        const existing = state.items.find((i) => i.product.products_id === product.products_id);
        if (existing) {
          if (existing.quantity + 1 > max) {
            return {
              ok: false,
              productName: product.product_name,
              available: max,
            };
          }
          set({
            items: state.items.map((i) =>
              i.product.products_id === product.products_id ? { ...i, quantity: i.quantity + 1 } : i,
            ),
          });
          return { ok: true };
        }
        set({ items: [...state.items, { product, quantity: 1 }] });
        return { ok: true };
      },
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.product.products_id !== productId),
        })),
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set((state) => ({
            items: state.items.filter((i) => i.product.products_id !== productId),
          }));
          return { ok: true };
        }
        const state = get();
        const item = state.items.find((i) => i.product.products_id === productId);
        if (!item) return { ok: true };
        const max = effectiveStockUnits(item.product);
        if (quantity > max) {
          return {
            ok: false,
            productName: item.product.product_name,
            available: max,
          };
        }
        set({
          items: state.items.map((i) =>
            i.product.products_id === productId ? { ...i, quantity } : i,
          ),
        });
        return { ok: true };
      },
      clearCart: () => set({ items: [], addToOrderId: null }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.product.product_price * i.quantity, 0),
    }),
    { name: "cart-storage" }
  )
);
