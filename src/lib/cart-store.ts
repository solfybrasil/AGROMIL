import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Product {
  id: string;
  name: string;
  description: string;
  shortDesc?: string | null;
  price: number;
  promoPrice?: number | null;
  categoryId: string;
  images: string[];
  stock: number;
  unit: string;
  sku?: string | null;
  active: boolean;
  featured: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type AddItemResult = "added" | "exists" | "out_of_stock";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  activeProduct: Product | null;
  isProductModalOpen: boolean;
  addItem: (product: Product, quantity?: number) => AddItemResult;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: (open?: boolean) => void;
  openProductModal: (product: Product) => void;
  closeProductModal: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      activeProduct: null,
      isProductModalOpen: false,
      
      addItem: (product, quantity = 1) => {
        if (product.stock <= 0) return "out_of_stock";
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex(
          (item) => item.product.id === product.id
        );

        if (existingIndex > -1) {
          const updatedItems = [...currentItems];
          const newQty = updatedItems[existingIndex].quantity + quantity;
          // Cap quantity at product stock if stock exists
          const finalQty = product.stock > 0 ? Math.min(newQty, product.stock) : newQty;
          updatedItems[existingIndex].quantity = finalQty;
          set({ items: updatedItems }); // Do not auto-open cart
          return "exists";
        } else {
          set({
            items: [...currentItems, { product, quantity: Math.min(quantity, product.stock > 0 ? product.stock : 99) }],
          });
          return "added";
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.product.id !== productId),
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        const updatedItems = get().items.map((item) => {
          if (item.product.id === productId) {
            const finalQty = item.product.stock > 0 ? Math.min(quantity, item.product.stock) : quantity;
            return { ...item, quantity: finalQty };
          }
          return item;
        });
        
        set({ items: updatedItems });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: (open) =>
        set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen })),

      openProductModal: (product) => {
        set({ activeProduct: product, isProductModalOpen: true });
      },

      closeProductModal: () => {
        set({ activeProduct: null, isProductModalOpen: false });
      },

      getCartTotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.promoPrice !== null && item.product.promoPrice !== undefined
            ? Number(item.product.promoPrice)
            : Number(item.product.price);
          return total + price * item.quantity;
        }, 0);
      },

      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "agromil-cart-storage",
      partialize: (state) => ({ items: state.items }), // Persist only items
    }
  )
);
