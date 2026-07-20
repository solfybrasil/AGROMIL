"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, AlertCircle, ShoppingCart, X } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";

type ToastKind = "added" | "exists";

interface ToastState {
  kind: ToastKind;
  productName: string;
  id: number;
}

interface CartToastContextType {
  notify: (kind: ToastKind, productName: string) => void;
}

const CartToastContext = createContext<CartToastContextType>({
  notify: () => {},
});

export const useCartToast = () => useContext(CartToastContext);

export function CartToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const { toggleCart } = useCartStore();

  const notify = useCallback((kind: ToastKind, productName: string) => {
    setToast({ kind, productName, id: Date.now() });
    window.setTimeout(() => {
      setToast((current) => (current && current.productName === productName ? null : current));
    }, 4000);
  }, []);

  const handleClose = () => setToast(null);
  const handleOpenCart = () => {
    setToast(null);
    toggleCart(true);
  };

  return (
    <CartToastContext.Provider value={{ notify }}>
      {children}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[min(92vw,380px)] animate-toast-in">
          <div
            className={`flex flex-wrap items-start gap-3 rounded-2xl border p-3.5 shadow-lg backdrop-blur
              ${toast.kind === "added"
                ? "bg-emerald-50/95 border-emerald-200"
                : "bg-amber-50/95 border-amber-200"}`}
          >
            <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full
              ${toast.kind === "added" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
              {toast.kind === "added"
                ? <CheckCircle2 className="h-5 w-5" />
                : <AlertCircle className="h-5 w-5" />}
            </div>

            <div className="min-w-0 flex-1">
              {toast.kind === "added" ? (
                <>
                  <p className="text-[11px] font-black text-emerald-800 leading-tight">
                    Adicionado ao carrinho!
                  </p>
                  <p className="text-[10px] text-emerald-700/80 font-semibold truncate mt-0.5">
                    {toast.productName}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[11px] font-black text-amber-800 leading-tight">
                    Você já adicionou este produto
                  </p>
                  <p className="text-[10px] text-amber-700/80 font-semibold mt-0.5">
                    Deseja adicionar mais um? Toque em &ldquo;Ver carrinho&rdquo; para ajustar.
                  </p>
                </>
              )}
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-black/5 transition-colors flex-shrink-0"
              aria-label="Fechar"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Action buttons: full-width row on mobile, inline on larger screens */}
            <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto sm:flex-shrink-0 sm:contents">
              <button
                onClick={handleOpenCart}
                className={`flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg px-3 py-2 sm:py-1.5 text-[11px] sm:text-[10px] font-black transition-colors
                  ${toast.kind === "added"
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-amber-600 text-white hover:bg-amber-700"}`}
              >
                <ShoppingCart className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                Ver carrinho
              </button>
            </div>
          </div>
        </div>
      )}
    </CartToastContext.Provider>
  );
}
