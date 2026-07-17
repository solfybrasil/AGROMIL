"use client";

import { useCartStore, Product } from "@/lib/cart-store";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useState } from "react";

interface AddToCartSectionProps {
  product: Product;
}

export default function AddToCartSection({ product }: AddToCartSectionProps) {
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (product.stock > 0 && quantity >= product.stock) return;
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="space-y-4 pt-4 border-t border-gray-100 select-none">
      <div className="flex flex-wrap items-center gap-4">
        {/* Quantity control */}
        {!isOutOfStock && (
          <div className="flex items-center border border-gray-300 rounded-lg bg-white h-12">
            <button
              onClick={handleDecrease}
              className="px-3.5 h-full text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors rounded-l-lg border-r border-gray-200"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-sm font-extrabold text-gray-800">
              {quantity}
            </span>
            <button
              onClick={handleIncrease}
              className="px-3.5 h-full text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors rounded-r-lg border-l border-gray-200"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Add button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex-1 h-12 flex items-center justify-center gap-2 rounded-lg font-bold text-sm shadow-sm transition-all ${
            isOutOfStock
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-primary hover:bg-primary-dark text-white hover:shadow-md active:scale-98"
          }`}
        >
          <ShoppingCart className="h-5 w-5" />
          <span>{isOutOfStock ? "Indisponível" : "Adicionar ao Carrinho"}</span>
        </button>
      </div>

      {/* Stock warning */}
      {product.stock > 0 ? (
        <p className="text-[11px] text-[#2d6a4f] font-semibold">
          ✓ Em estoque: {product.stock} unidades disponíveis.
        </p>
      ) : (
        <p className="text-[11px] text-red-500 font-semibold">
          ✗ Produto esgotado. Entre em contato para previsão de chegada.
        </p>
      )}
    </div>
  );
}
