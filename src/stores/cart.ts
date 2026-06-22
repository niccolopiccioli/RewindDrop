import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  image: string;
  size?: string;
  color?: string;
  colorHex?: string;
  price: number;
  quantity: number;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  unavailableVariantIds: string[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
  setUnavailableVariantIds: (variantIds: string[]) => void;
  syncAvailability: () => Promise<void>;
  isUnavailable: (variantId: string) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      unavailableVariantIds: [],

      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.variantId === item.variantId
          );

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
                  : i
              ),
            };
          }

          return {
            items: [...state.items, { ...item, id: crypto.randomUUID() }],
          };
        });
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }));
      },

      updateQuantity: (variantId, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.min(quantity, i.stock) }
              : i
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], unavailableVariantIds: [] });
      },

      setUnavailableVariantIds: (variantIds) => {
        set({ unavailableVariantIds: variantIds });
      },

      syncAvailability: async () => {
        const { items } = get();
        if (items.length === 0) {
          set({ unavailableVariantIds: [] });
          return;
        }

        try {
          const res = await fetch("/api/cart/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: items.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
              })),
            }),
          });
          const data = await res.json();
          set({ unavailableVariantIds: data.unavailableVariantIds ?? [] });
        } catch {
          set({ unavailableVariantIds: [] });
        }
      },

      isUnavailable: (variantId) => {
        return get().unavailableVariantIds.includes(variantId);
      },

      getSubtotal: () => {
        const { items, unavailableVariantIds } = get();
        return items.reduce((sum, item) => {
          if (unavailableVariantIds.includes(item.variantId)) return sum;
          return sum + item.price * item.quantity;
        }, 0);
      },

      getItemCount: () => {
        const { items, unavailableVariantIds } = get();
        return items.reduce((sum, item) => {
          if (unavailableVariantIds.includes(item.variantId)) return sum;
          return sum + item.quantity;
        }, 0);
      },
    }),
    {
      name: "eshop-cart",
      partialize: (state) => ({ items: state.items }),
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
    }
  )
);
