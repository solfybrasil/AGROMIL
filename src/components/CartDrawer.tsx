"use client";

import { useCartStore } from "@/lib/cart-store";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartDrawer() {
  const { items, isOpen, toggleCart, updateQuantity, removeItem, getCartTotal } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#2B1D19]/40 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => toggleCart(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-[#FAF7F2] shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8DFD8] p-5 bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[#A04728]" />
            <h2 className="text-base font-serif font-bold text-[#2B1D19]">Sacola de Compras</h2>
            <span className="rounded-full bg-[#F7EFEA] px-2.5 py-0.5 text-xs font-bold text-[#5C2818]">
              {items.length} {items.length === 1 ? "peça" : "peças"}
            </span>
          </div>
          <button
            onClick={() => toggleCart(false)}
            className="rounded-full p-1.5 text-gray-400 hover:bg-[#F7EFEA] hover:text-[#5C2818] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="rounded-full bg-[#F7EFEA] p-6 mb-4 border border-[#E8DFD8]">
                <ShoppingBag className="h-10 w-10 text-[#A04728]" />
              </div>
              <h3 className="text-base font-serif font-bold text-[#2B1D19]">Sua sacola está vazia</h3>
              <p className="text-xs text-gray-500 max-w-[250px] mt-1">
                Explore a coleção SILUET e encontre suas novas peças favoritas.
              </p>
              <button
                onClick={() => toggleCart(false)}
                className="mt-6 rounded-full bg-[#A04728] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#5C2818] transition-colors"
              >
                Explorar Tendências
              </button>
            </div>
          ) : (
            items.map((item) => {
              const product = item.product;
              const hasPromo = product.promoPrice !== null && product.promoPrice !== undefined;
              const price = hasPromo ? Number(product.promoPrice) : Number(product.price);

              return (
                <div
                  key={product.id}
                  className="flex gap-4 border-b border-[#E8DFD8] pb-4 last:border-b-0 last:pb-0 bg-white p-3 rounded-2xl shadow-2xs"
                >
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[#FAF7F2] border border-[#E8DFD8] flex items-center justify-center">
                    {product.images?.[0] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBag className="h-6 w-6 text-gray-300" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#2B1D19] truncate">
                      {product.name}
                    </h4>
                    <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
                      Tamanho: M • Cor: Terracota
                    </p>

                    {/* Prices */}
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-sm font-bold text-[#5C2818]">
                        R$ {price.toFixed(2)}
                      </span>
                      {hasPromo && (
                        <span className="text-xs text-gray-400 line-through">
                          R$ {Number(product.price).toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Qty Actions */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-[#E8DFD8] rounded-lg bg-[#FAF7F2]">
                        <button
                          onClick={() => updateQuantity(product.id, item.quantity - 1)}
                          className="p-1 text-gray-500 hover:text-[#5C2818] transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-[#2B1D19]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, item.quantity + 1)}
                          className="p-1 text-gray-500 hover:text-[#5C2818] transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(product.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#E8DFD8] p-5 bg-white space-y-4">
            <div className="flex justify-between items-center text-[#2B1D19]">
              <span className="text-xs font-bold uppercase tracking-wider">Subtotal</span>
              <span className="text-lg font-bold text-[#5C2818]">
                R$ {getCartTotal().toFixed(2)}
              </span>
            </div>
            <p className="text-[10px] text-gray-500">
              Frete grátis em compras acima de R$ 159.00
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Link
                href="/carrinho"
                onClick={() => toggleCart(false)}
                className="w-full text-center rounded-full border border-[#5C2818] text-[#5C2818] px-4 py-2.5 text-xs font-bold hover:bg-[#F7EFEA] transition-colors"
              >
                Ver Sacola
              </Link>
              <Link
                href="/checkout"
                onClick={() => toggleCart(false)}
                className="w-full text-center rounded-full bg-[#A04728] text-white px-4 py-2.5 text-xs font-bold hover:bg-[#5C2818] shadow-sm transition-all flex items-center justify-center gap-1"
              >
                <span>Finalizar</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
