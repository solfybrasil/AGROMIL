"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryMenu from "@/components/CategoryMenu";
import CartDrawer from "@/components/CartDrawer";
import { useCartStore } from "@/lib/cart-store";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight, ShieldCheck, Lightbulb } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getCartTotal } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = getCartTotal();
  const deliveryFee = subtotal >= 150 || subtotal === 0 ? 0 : 15;
  const total = subtotal + deliveryFee;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Horizontal Nav Categories */}
      <CategoryMenu />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-serif text-3xl font-extrabold text-[#1b4332] mb-8">Meu Carrinho</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-150 rounded-2xl p-8 max-w-xl mx-auto shadow-2xs">
            <div className="rounded-full bg-primary-light p-6 w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Seu carrinho está vazio</h2>
            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
              Você ainda não adicionou produtos. Visite nossas categorias para encontrar as melhores opções de jardinagem, rações e ferramentas.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white px-8 py-3.5 text-sm font-bold shadow-xs hover:shadow transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Explorar Produtos</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            
            {/* Left: Items list */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-2xs">
                <div className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const product = item.product;
                    const hasPromo = product.promoPrice !== null && product.promoPrice !== undefined;
                    const price = hasPromo ? Number(product.promoPrice) : Number(product.price);
                    
                    return (
                      <div
                        key={product.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-5 first:pt-0 last:pb-0"
                      >
                        {/* Image + Title */}
                        <div className="flex gap-4 items-center min-w-0 flex-1">
                          <div className="h-16 w-16 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden relative flex-shrink-0 select-none">
                            {product.images?.[0] ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ShoppingBag className="h-6 w-6 text-gray-250" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-gray-800 leading-tight">
                              {product.name}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">
                              Unitário: R$ {price.toFixed(2)} ({product.unit})
                            </p>
                          </div>
                        </div>

                        {/* Quantity controls + Total */}
                        <div className="flex items-center justify-between w-full sm:w-auto gap-8">
                          <div className="flex items-center border border-gray-300 rounded-lg bg-white h-9">
                            <button
                              onClick={() => updateQuantity(product.id, item.quantity - 1)}
                              className="px-2 h-full text-gray-500 hover:text-primary transition-colors border-r border-gray-200"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-extrabold text-gray-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(product.id, item.quantity + 1)}
                              className="px-2 h-full text-gray-500 hover:text-primary transition-colors border-l border-gray-200"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-extrabold text-primary">
                              R$ {(price * item.quantity).toFixed(2)}
                            </p>
                            <button
                              onClick={() => removeItem(product.id)}
                              className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors mt-0.5 inline-flex items-center gap-0.5"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Remover</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Back to shopping link */}
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Continuar Comprando</span>
              </Link>
            </div>

            {/* Right: Summary panel */}
            <div className="bg-[#fcfcf9] border border-gray-150 rounded-2xl p-6 shadow-2xs space-y-6">
              <h3 className="font-serif text-lg font-bold text-[#1b4332] pb-3 border-b border-gray-200">
                Resumo da Compra
              </h3>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-800">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Entrega (Itu/SP)</span>
                  <span className="font-semibold text-gray-800">
                    {deliveryFee === 0 ? (
                      <span className="text-[#2d6a4f] font-bold">Grátis</span>
                    ) : (
                      `R$ ${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <div className="text-[10px] text-gray-500 bg-white p-3 rounded-lg border border-gray-100 flex items-start gap-1.5 leading-relaxed font-semibold">
                    <Lightbulb className="h-4 w-4 text-[#e2b13c] flex-shrink-0" />
                    <span>Dica: Adicione mais <strong>R$ {(150 - subtotal).toFixed(2)}</strong> em produtos para ter Frete Grátis!</span>
                  </div>
                )}
                
                <div className="flex justify-between text-base font-extrabold text-primary border-t border-gray-200 pt-4">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <Link
                  href="/checkout"
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-sm hover:shadow transition-all"
                >
                  <span>Finalizar Compra</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Pedido enviado via WhatsApp</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
