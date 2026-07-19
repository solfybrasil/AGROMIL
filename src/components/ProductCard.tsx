"use client";

import { useCartStore, Product } from "@/lib/cart-store";
import { Star, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import FavoriteButton from "@/components/FavoriteButton";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, openProductModal } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasPromo = product.promoPrice !== null && product.promoPrice !== undefined;
  const price = hasPromo ? Number(product.promoPrice) : Number(product.price);
  const discountPercentage = hasPromo
    ? Math.round(((Number(product.price) - Number(product.promoPrice)) / Number(product.price)) * 100)
    : 0;

  return (
    <div
      onClick={() => mounted && openProductModal(product)}
      className="group bg-white rounded-xl border border-gray-100 flex flex-col overflow-hidden relative cursor-pointer hover-lift animate-fade-in-up"
    >
      {/* Discount Badge */}
      {hasPromo && (
        <span className="absolute top-3 left-3 bg-[#e2b13c] text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-xs">
          -{discountPercentage}%
        </span>
      )}

      {/* Wishlist Button */}
      {mounted && (
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton productId={product.id} size="sm" />
        </div>
      )}

      {/* Featured Tag */}
      {product.featured && !hasPromo && (
        <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-xs">
          Destaque
        </span>
      )}

      {/* Product Image Area */}
      <div className="aspect-square bg-gray-50 flex items-center justify-center border-b border-gray-100 overflow-hidden relative">
        {product.images?.[0] ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-550 group-hover:scale-106"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#fcfcf9] p-3 text-center select-none">
            <ShoppingCart className="h-8 w-8 text-gray-300" />
            <span className="text-[10px] text-gray-450 mt-2">Sem imagem</span>
          </div>
        )}

        {/* Hover overlay zoom effect */}
        <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Info Area */}
      <div className="p-2 sm:p-4 flex-1 flex flex-col">
        {/* Stars */}
        <div className="hidden sm:flex items-center gap-0.5 mb-1.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < 5 ? "text-amber-400 fill-current" : "text-gray-200"
              }`}
            />
          ))}
          <span className="text-[10px] text-gray-400 font-semibold ml-1">
            (5.0)
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-primary transition-colors min-h-[32px] sm:min-h-[40px] leading-tight mb-1.5">
          {product.name}
        </h3>

        {/* Short description */}
        <p className="hidden sm:block text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {product.shortDesc || product.description}
        </p>

        {/* Price & Cart row */}
        <div className="mt-auto pt-1 sm:pt-2 flex items-end justify-between gap-1.5">
          <div className="flex flex-col min-w-0">
            {hasPromo && (
              <span className="text-[8px] sm:text-[10px] text-gray-400 line-through">
                R$ {Number(product.price).toFixed(2)}
              </span>
            )}
            <span className="text-xs sm:text-base font-extrabold text-primary leading-none">
              R$ {price.toFixed(2)}
            </span>
            <span className="text-[8px] sm:text-[9px] text-gray-400 font-semibold mt-0.5">
              por {product.unit}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (product.stock <= 0) return;
              if (mounted) addItem(product);
            }}
            disabled={product.stock <= 0}
            className={`flex items-center justify-center gap-1 rounded-lg p-2 sm:py-2 sm:px-3.5 shadow-xs transition-all flex-shrink-0 ${
              product.stock <= 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-[#1b4332] text-white active-pop"
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs font-bold">
              {product.stock <= 0 ? "Esgotado" : "Comprar"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
