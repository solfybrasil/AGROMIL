"use client";

import { useCallback } from "react";
import { useCartStore, Product, AddItemResult } from "@/lib/cart-store";
import { useCartToast } from "@/components/CartToast";

export function useAddToCart() {
  const addItem = useCartStore((s) => s.addItem);
  const { notify } = useCartToast();

  const addToCart = useCallback(
    (product: Product, quantity = 1): AddItemResult => {
      const result = addItem(product, quantity);
      if (result === "out_of_stock") return result;
      notify(result === "added" ? "added" : "exists", product.name);
      return result;
    },
    [addItem, notify]
  );

  return addToCart;
}
