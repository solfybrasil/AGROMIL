"use client";

import { useCartStore, Product } from "@/lib/cart-store";
import { useAddToCart } from "@/lib/useAddToCart";
import { Plus, Minus, ShoppingBag, Check, AlertCircle } from "lucide-react";
import { useState } from "react";

interface AddToCartSectionProps {
  product: Product;
}

export default function AddToCartSection({ product }: AddToCartSectionProps) {
  const addToCart = useAddToCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

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
    if (product.stock <= 0) return;
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="space-y-4 pt-6 border-t border-[#EDE3D3] select-none">
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        {/* Quantity selector */}
        {!isOutOfStock && (
          <div className="flex items-center justify-between border border-[#EDE3D3] rounded-2xl bg-white h-13 px-2 w-full sm:w-36 flex-shrink-0 shadow-3xs">
            <button
              onClick={handleDecrease}
              className="w-10 h-10 flex items-center justify-center text-[#5C5346] hover:text-[#1A1A1A] hover:bg-[#FAF7F2] rounded-xl transition-colors"
              title="Diminuir"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-sm font-black text-[#2B2620]">
              {quantity}
            </span>
            <button
              onClick={handleIncrease}
              className="w-10 h-10 flex items-center justify-center text-[#5C5346] hover:text-[#1A1A1A] hover:bg-[#FAF7F2] rounded-xl transition-colors"
              title="Aumentar"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Primary Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex-1 h-13 flex items-center justify-center gap-2.5 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-md ${
            isOutOfStock
              ? "bg-[#E5E0D8] text-[#9E9589] cursor-not-allowed border border-[#D5CFC5]"
              : justAdded
              ? "bg-[#2d6a4f] text-white animate-cart-pop"
              : "bg-[#1A1A1A] hover:bg-[#8B5E3C] text-white active:scale-[0.99] cursor-pointer"
          }`}
        >
          {justAdded ? (
            <>
              <Check className="h-4.5 w-4.5" />
              <span>Adicionado à Sacola</span>
            </>
          ) : (
            <>
              <ShoppingBag className="h-4.5 w-4.5" />
              <span>{isOutOfStock ? "Indisponível no Momento" : "Adicionar à Sacola"}</span>
            </>
          )}
        </button>
      </div>

      {/* Stock warning */}
      <div className="flex items-center gap-2 text-xs font-medium">
        {product.stock > 0 ? (
          <p className="text-[#2d6a4f] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2d6a4f] inline-block animate-pulse" />
            <span>Em Estoque — envio imediato ({product.stock} disponíveis)</span>
          </p>
        ) : (
          <p className="text-rose-600 flex items-center gap-1.5 font-semibold">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Produto Esgotado — entre em contato para reserva.</span>
          </p>
        )}
      </div>
    </div>
  );
}
