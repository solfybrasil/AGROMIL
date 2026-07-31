"use client";

import { useCartStore } from "@/lib/cart-store";
import { useAddToCart } from "@/lib/useAddToCart";
import { X, Plus, Minus, ShoppingBag, ShieldCheck, Truck, Star, Sparkles, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import FavoriteButton from "@/components/FavoriteButton";

export default function ProductDetailsModal() {
  const { isProductModalOpen, activeProduct, closeProductModal } = useCartStore();
  const addToCart = useAddToCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (activeProduct) {
      setQuantity(1);
      setSelectedSize("M");
    }
  }, [activeProduct]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isProductModalOpen || !activeProduct) return null;

  const product = activeProduct;
  const hasPromo = product.promoPrice !== null && product.promoPrice !== undefined;
  const unitPrice = hasPromo ? Number(product.promoPrice) : Number(product.price);
  const totalPrice = unitPrice * quantity;

  const sizes = ["P", "M", "G", "GG"];

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
    closeProductModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 select-none">
      {/* Dark overlay backdrop */}
      <div
        className="absolute inset-0 bg-[#2B1D19]/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={closeProductModal}
      />

      {/* Modal Sheet */}
      <div className="relative w-full h-[90vh] sm:h-auto sm:max-h-[85vh] sm:max-w-3xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform translate-y-0 animate-slide-up sm:animate-scale-in">
        
        {/* Close Button */}
        <button
          onClick={closeProductModal}
          className="absolute top-4 right-4 z-10 rounded-full bg-white/90 backdrop-blur-md p-2 text-gray-500 hover:text-[#5C2818] shadow-sm border border-[#E8DFD8] transition-all active:scale-90"
          title="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Scrollable body content */}
        <div className="flex-1 overflow-y-auto p-6 pb-28 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-start">
          
          {/* Left: Product Image */}
          <div className="w-full aspect-[3/4] relative rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#E8DFD8] flex items-center justify-center">
            {product.images?.[0] ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <ShoppingBag className="h-14 w-14 text-gray-300" />
                <span className="text-xs text-gray-400 mt-2">Sem imagem</span>
              </div>
            )}
            {hasPromo && (
              <span className="absolute top-3 left-3 bg-[#A04728] text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-xs">
                OFERTA FLASH
              </span>
            )}
            <div className="absolute top-3 right-3">
              <FavoriteButton productId={product.id} size="md" />
            </div>
          </div>

          {/* Right: Info Area */}
          <div className="space-y-4 md:space-y-5">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#A04728] uppercase tracking-widest">
              <span className="bg-[#F7EFEA] px-2.5 py-1 rounded-full">SILUET FASHION</span>
              {product.sku && <span className="text-gray-400">REF: {product.sku}</span>}
            </div>

            {/* Title */}
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2B1D19] leading-tight">
              {product.name}
            </h2>

            {/* Stars rating */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 text-[#C86D51] fill-current" />
              ))}
              <span className="text-xs font-semibold text-gray-500 ml-1">4.9 (128 avaliações)</span>
            </div>

            {/* Pricing Box */}
            <div className="bg-[#FAF7F2] border border-[#E8DFD8] rounded-xl p-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#5C2818]">R$ {unitPrice.toFixed(2)}</span>
                {hasPromo && (
                  <span className="text-xs text-gray-400 line-through">R$ {Number(product.price).toFixed(2)}</span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 font-medium mt-1">
                em até 6x de R$ {(unitPrice / 6).toFixed(2)} sem juros ou R$ {(unitPrice * 0.95).toFixed(2)} no PIX (5% OFF)
              </p>
            </div>

            {/* Size Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-[#2B1D19]">
                <span>Tamanho Disponível:</span>
                <span className="text-[#A04728] underline cursor-pointer text-[11px]">Guia de Medidas</span>
              </div>
              <div className="flex gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`w-11 h-11 rounded-xl text-xs font-bold transition-all border ${
                      selectedSize === s
                        ? "bg-[#5C2818] text-white border-[#5C2818] shadow-xs"
                        : "bg-white text-[#2B1D19] border-[#E8DFD8] hover:border-[#A04728]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 pt-2">
              <h4 className="text-xs font-bold text-[#2B1D19] uppercase tracking-wider">Detalhes da Peça</h4>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                {product.description}
              </p>
            </div>

            {/* Features Badges */}
            <div className="pt-3 border-t border-[#E8DFD8] flex flex-wrap gap-4 text-[10px] font-bold text-gray-500">
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-[#A04728]" />
                <span>Troca Grátis 30 Dias</span>
              </div>
              <div className="flex items-center gap-1">
                <Truck className="h-4 w-4 text-[#A04728]" />
                <span>Envio em 24 Horas</span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#E8DFD8] p-4 flex items-center justify-between gap-4 z-20 shadow-lg">
          {product.stock > 0 ? (
            <div className="flex items-center border border-[#E8DFD8] rounded-xl bg-white h-12">
              <button
                onClick={handleDecrease}
                className="px-4 h-full text-gray-500 hover:text-[#5C2818] transition-colors border-r border-[#E8DFD8]"
                title="Diminuir"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-bold text-[#2B1D19]">
                {quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="px-4 h-full text-gray-500 hover:text-[#5C2818] transition-colors border-l border-[#E8DFD8]"
                title="Aumentar"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="text-[10px] text-red-500 font-bold uppercase tracking-wider bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl">
              Esgotado
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`flex-1 h-12 rounded-full text-white font-bold text-xs sm:text-sm flex items-center justify-between px-6 shadow-md transition-all ${
              product.stock <= 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#A04728] hover:bg-[#5C2818] active:scale-98"
            }`}
          >
            <span>{product.stock <= 0 ? "Indisponível" : `Adicionar à Sacola (${selectedSize})`}</span>
            {product.stock > 0 && <span>R$ {totalPrice.toFixed(2)}</span>}
          </button>
        </div>

      </div>
    </div>
  );
}
