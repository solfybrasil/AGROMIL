"use client";

import { useCartStore } from "@/lib/cart-store";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartDrawer() {
  const { items, isOpen, toggleCart, updateQuantity, removeItem, getCartTotal } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => toggleCart(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-[#1a2f23]">Seu Carrinho</h2>
            <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-semibold text-primary">
              {items.length} {items.length === 1 ? "item" : "itens"}
            </span>
          </div>
          <button
            onClick={() => toggleCart(false)}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="rounded-full bg-primary-light p-6 mb-4">
                <ShoppingBag className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-base font-bold text-gray-800">Carrinho Vazio</h3>
              <p className="text-sm text-gray-500 max-w-[250px] mt-1">
                Adicione produtos da nossa agropecuária para começar suas compras.
              </p>
              <button
                onClick={() => toggleCart(false)}
                className="mt-6 rounded-md bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
              >
                Continuar Navegando
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
                  className="flex gap-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                >
                  {/* Mock Image Placeholder */}
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-primary font-bold text-xs p-1">
                    {product.images?.[0] ? (
                      <span className="text-center break-words">{product.name.split(" ")[0]}</span>
                    ) : (
                      <ShoppingBag className="h-6 w-6 text-gray-300" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-800 truncate">
                      {product.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Unidade: {product.unit}
                    </p>
                    
                    {/* Prices */}
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-sm font-bold text-primary">
                        R$ {price.toFixed(2)}
                      </span>
                      {hasPromo && (
                        <span className="text-xs text-gray-400 line-through">
                          R$ {Number(product.price).toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Qty Actions */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-md bg-white">
                        <button
                          onClick={() => updateQuantity(product.id, item.quantity - 1)}
                          className="p-1 text-gray-500 hover:text-primary transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, item.quantity + 1)}
                          className="p-1 text-gray-500 hover:text-primary transition-colors"
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
          <div className="border-t border-gray-100 p-5 bg-[#fafafa] space-y-4">
            <div className="flex justify-between items-center text-gray-700">
              <span className="text-sm font-semibold">Subtotal</span>
              <span className="text-lg font-bold text-primary">
                R$ {getCartTotal().toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Frete e taxas de entrega serão calculados no checkout.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href="/carrinho"
                onClick={() => toggleCart(false)}
                className="w-full text-center rounded-md border border-primary text-primary px-4 py-2.5 text-sm font-bold hover:bg-primary-light transition-colors"
              >
                Ver Carrinho
              </Link>
              <Link
                href="/checkout"
                onClick={() => toggleCart(false)}
                className="w-full text-center rounded-md bg-primary text-white px-4 py-2.5 text-sm font-bold hover:bg-primary-dark shadow-sm hover:shadow transition-all"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
