"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingCart, Heart, User } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useEffect, useState } from "react";

const TABS = [
  { href: "/", icon: Home, label: "Início" },
  { href: "/busca", icon: Search, label: "Buscar" },
  { href: "#carrinho", icon: ShoppingCart, label: "Carrinho", isCart: true },
  { href: "/favoritos", icon: Heart, label: "Favoritos" },
  { href: "/minha-conta", icon: User, label: "Conta" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { toggleCart, getCartCount } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    const updateFavs = () => {
      try {
        const favs = JSON.parse(localStorage.getItem("siluet_favorites") || "[]");
        setFavCount(Array.isArray(favs) ? favs.length : 0);
      } catch { setFavCount(0); }
    };
    updateFavs();
    window.addEventListener("siluet_favorites_updated", updateFavs);
    return () => window.removeEventListener("siluet_favorites_updated", updateFavs);
  }, []);

  // Hide on admin routes
  if (pathname?.startsWith("/admin")) return null;

  const cartCount = mounted ? getCartCount() : 0;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#EDE3D3] shadow-[0_-4px_24px_rgba(43,38,32,0.08)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch justify-around h-14">
        {TABS.map((tab) => {
          const isActive = tab.isCart
            ? false
            : tab.href === "/"
            ? pathname === "/"
            : pathname?.startsWith(tab.href);

          const badge = tab.isCart ? cartCount : tab.href === "/favoritos" ? favCount : 0;

          if (tab.isCart) {
            return (
              <button
                key="cart"
                onClick={() => toggleCart(true)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 relative active:scale-90 transition-transform"
              >
                {/* Cart Pill Button */}
                <div className="relative bg-[#8B5E3C] rounded-2xl px-4 py-2 -mt-5 shadow-lg shadow-[#8B5E3C]/30 border-2 border-white">
                  <tab.icon className="h-5 w-5 text-white" />
                  {mounted && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] font-black rounded-full h-4 w-4 flex items-center justify-center border border-white">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-black text-[#8B5E3C] uppercase tracking-wide mt-1">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative active:scale-90 transition-transform"
            >
              <div className="relative">
                <tab.icon
                  className={`h-5 w-5 transition-colors ${
                    isActive ? "text-[#8B5E3C]" : "text-[#7A6F63]"
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                {badge > 0 && mounted && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] font-black rounded-full h-4 w-4 flex items-center justify-center border border-white">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[9px] font-black uppercase tracking-wide transition-colors ${
                  isActive ? "text-[#8B5E3C]" : "text-[#7A6F63]"
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#8B5E3C] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
