"use client";

import { useCartStore } from "@/lib/cart-store";
import { X, Plus, Minus, ShoppingBag, ShieldCheck, Truck, Star } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProductDetailsModal() {
  const { isProductModalOpen, activeProduct, closeProductModal, addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [mounted, setMounted] = useState(false);

  // Reset quantity when modal opens or product changes
  useEffect(() => {
    if (activeProduct) {
      setQuantity(1);
    }
  }, [activeProduct]);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isProductModalOpen || !activeProduct) return null;

  const product = activeProduct;
  const hasPromo = product.promoPrice !== null && product.promoPrice !== undefined;
  const unitPrice = hasPromo ? Number(product.promoPrice) : Number(product.price);
  const totalPrice = unitPrice * quantity;

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    // Cap at stock if stock is configured
    if (product.stock > 0 && quantity >= product.stock) return;
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    closeProductModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 select-none">
      {/* Dark overlay backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={closeProductModal}
      />

      {/* Modal Content Drawer (Bottom Sheet on mobile, Centered Modal on desktop) */}
      <div className="relative w-full h-[90vh] sm:h-auto sm:max-h-[85vh] sm:max-w-3xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform translate-y-0 animate-slide-up sm:animate-scale-in">
        
        {/* Absolute Close Button (iFood circular close btn style) */}
        <button
          onClick={closeProductModal}
          className="absolute top-4 right-4 z-10 rounded-full bg-white/80 backdrop-blur-md p-2 text-gray-500 hover:text-gray-800 hover:bg-white shadow-sm border border-gray-100 transition-all active:scale-90"
          title="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Scrollable body content */}
        <div className="flex-1 overflow-y-auto p-6 pb-28 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-start">
          
          {/* Left: Product Image */}
          <div className="w-full aspect-square relative rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
            {product.images?.[0] ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <ShoppingBag className="h-14 w-14 text-gray-200" />
                <span className="text-xs text-gray-400 mt-2">Sem imagem</span>
              </div>
            )}
            {hasPromo && (
              <span className="absolute top-3 left-3 bg-[#e2b13c] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-xs">
                PROMOÇÃO
              </span>
            )}
          </div>

          {/* Right: Info Area */}
          <div className="space-y-4 md:space-y-5">
            {/* SKU and Badge */}
            <div className="flex items-center gap-2.5 text-[10px] font-extrabold text-primary select-none">
              <span className="bg-primary-light px-2.5 py-1 rounded-full uppercase tracking-wider">Agromil</span>
              {product.sku && <span className="text-gray-400 tracking-wider">SKU: {product.sku}</span>}
            </div>

            {/* Title */}
            <h2 className="font-serif text-xl sm:text-2xl font-extrabold text-[#1b4332] leading-tight">
              {product.name}
            </h2>

            {/* Stars rating */}
            <div className="flex items-center gap-1 select-none">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-current" />
              ))}
              <span className="text-[10px] font-bold text-gray-500 ml-1">5.0 (Excelente)</span>
            </div>

            {/* Pricing Box */}
            <div className="bg-[#fcfcf9] border border-gray-150 rounded-xl p-4 select-none">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-primary">R$ {unitPrice.toFixed(2)}</span>
                {hasPromo && (
                  <span className="text-xs text-gray-400 line-through">R$ {Number(product.price).toFixed(2)}</span>
                )}
              </div>
              <p className="text-[9px] text-gray-450 font-bold mt-1 uppercase tracking-wider">
                Preço por {product.unit} • Embalagem original
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Descrição</h4>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                {product.description}
              </p>
            </div>

            {/* Micro badges features */}
            <div className="pt-4 border-t border-gray-150 flex flex-wrap gap-4 text-[10px] font-bold text-gray-500 select-none">
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Origem Garantida</span>
              </div>
              <div className="flex items-center gap-1">
                <Truck className="h-4 w-4 text-primary" />
                <span>Entrega Itu/SP</span>
              </div>
            </div>

          </div>
        </div>

        {/* Persistent Bottom Bar (iFood style footer: Quantity selector + Add to cart btn) */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex items-center justify-between gap-4 z-20 shadow-lg">
          {/* Quantity Selector */}
          <div className="flex items-center border border-gray-300 rounded-xl bg-white h-12 shadow-2xs">
            <button
              onClick={handleDecrease}
              className="px-4 h-full text-gray-500 hover:text-primary transition-colors border-r border-gray-250 active:bg-gray-50"
              title="Diminuir"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center text-sm font-black text-gray-800">
              {quantity}
            </span>
            <button
              onClick={handleIncrease}
              className="px-4 h-full text-gray-500 hover:text-primary transition-colors border-l border-gray-250 active:bg-gray-50"
              title="Aumentar"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary-dark text-white font-extrabold text-xs sm:text-sm flex items-center justify-between px-6 shadow-md hover:shadow-lg transition-all active:scale-98"
          >
            <span>Adicionar</span>
            <span>R$ {totalPrice.toFixed(2)}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
