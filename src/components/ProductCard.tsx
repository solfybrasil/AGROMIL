"use client";

import { useRouter } from "next/navigation";
import { useCartStore, Product } from "@/lib/cart-store";
import { useAddToCart } from "@/lib/useAddToCart";
import { ShoppingBag, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import FavoriteButton from "@/components/FavoriteButton";
import { trackInteraction, getCurrentUserId } from "@/lib/recommendation-engine";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const addToCart = useAddToCart();
  const [mounted, setMounted] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const hasPromo = product.promoPrice !== null && product.promoPrice !== undefined;
  const price = hasPromo ? Number(product.promoPrice) : Number(product.price);
  const discountPct = hasPromo
    ? Math.round(((Number(product.price) - Number(product.promoPrice)) / Number(product.price)) * 100)
    : 0;

  const handleCardClick = () => {
    if (mounted && product?.id) {
      const userId = getCurrentUserId();
      const slug = (product as any).categorySlug || (product as any).categoryId || "";
      trackInteraction(userId, product.id, slug, "click");
      router.push(`/produto/${product.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-2xl border border-[#E8DFD8] flex flex-col overflow-hidden relative cursor-pointer hover-lift animate-fade-in-up shadow-xs"
    >
      {/* Discount badge */}
      {hasPromo && (
        <span className="absolute top-2 left-2 bg-[#A04728] text-white text-[9px] font-black px-2 py-0.5 rounded-full z-10 shadow-xs tracking-wider">
          -{discountPct}%
        </span>
      )}

      {/* Wishlist */}
      {mounted && (
        <div className="absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-xs rounded-full p-0.5 shadow-xs">
          <FavoriteButton productId={product.id} size="sm" />
        </div>
      )}

      {/* Featured tag */}
      {product.featured && !hasPromo && (
        <span className="absolute top-2 left-2 bg-[#5C2818] text-[#EFE3D3] text-[9px] font-bold px-2 py-0.5 rounded-full z-10 shadow-xs uppercase tracking-wider">
          Tendência
        </span>
      )}

      {/* Image — square on mobile, 3:4 on sm+ */}
      <div className="aspect-square sm:aspect-[3/4] bg-[#FAF7F2] flex items-center justify-center border-b border-[#E8DFD8] overflow-hidden relative">
        {product.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF7F2] text-center select-none">
            <ShoppingBag className="h-6 w-6 text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-[#5C2818]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Info — compact on mobile */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col gap-1 sm:gap-0">

        {/* Name — 1 line mobile, 2 lines desktop */}
        <h3 className="text-[11px] sm:text-sm font-semibold text-[#2B1D19] line-clamp-1 sm:line-clamp-2 group-hover:text-[#A04728] transition-colors leading-snug">
          {product.name}
        </h3>

        {/* Price row */}
        <div className="mt-auto pt-1.5 flex items-center justify-between gap-1">
          <div className="flex flex-col min-w-0">
            {hasPromo && (
              <span className="text-[9px] text-gray-400 line-through leading-none hidden sm:block">
                R$ {Number(product.price).toFixed(2)}
              </span>
            )}
            <span className="text-xs sm:text-sm font-bold text-[#5C2818] leading-none">
              R$ {price.toFixed(2)}
            </span>
            {/* Installment — desktop only */}
            <span className="hidden sm:block text-[9px] text-gray-400 mt-0.5">
              6x de R$ {(price / 6).toFixed(2)}
            </span>
          </div>

          {/* Add to cart */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (product.stock <= 0 || !mounted) return;
              addToCart(product);
              setJustAdded(true);
              const userId = getCurrentUserId();
              const slug = (product as any).categorySlug || (product as any).categoryId || "";
              trackInteraction(userId, product.id, slug, "cart");
              window.setTimeout(() => setJustAdded(false), 600);
            }}
            disabled={product.stock <= 0}
            aria-label="Adicionar ao carrinho"
            className={`flex items-center justify-center rounded-full p-2 sm:py-2 sm:px-3.5 shadow-xs transition-all flex-shrink-0 active:scale-90 ${
              product.stock <= 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : justAdded
                ? "bg-[#5C2818] text-white animate-cart-pop"
                : "bg-[#A04728] hover:bg-[#5C2818] text-white"
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline text-xs font-bold ml-1.5">
              {product.stock <= 0 ? "Esgotado" : "Adicionar"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
