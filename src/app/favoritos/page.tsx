"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryMenu from "@/components/CategoryMenu";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import ProductDetailsModal from "@/components/ProductDetailsModal";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Loader, ArrowRight, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useAddToCart } from "@/lib/useAddToCart";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  promoPrice: number | null;
  images: string[];
  unit: string;
  categoryId: string;
  active: boolean;
  featured: boolean;
  description: string;
  stock: number;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const addToCart = useAddToCart();
  const router = useRouter();

  const loadFavorites = async () => {
    try {
      const res = await fetch("/api/favoritos");
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (err) {
      console.warn("Failed to load favorites:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/customer/me");
        if (res.ok) {
          const data = await res.json();
          if (data.session) {
            setSession(data.session);
            await loadFavorites();
          } else {
            router.push("/login?redirect=/favoritos");
          }
        } else {
          router.push("/login?redirect=/favoritos");
        }
      } catch {
        router.push("/login?redirect=/favoritos");
      } finally {
        setSessionLoading(false);
      }
    };
    checkSession();
  }, [router]);

  const handleAddAllToCart = () => {
    if (favorites.length === 0) return;
    favorites.forEach((p) => {
      addToCart(p, 1);
    });
    router.push("/carrinho");
  };

  const handleClearFavorites = async () => {
    if (!confirm("Deseja realmente remover todos os favoritos?")) return;
    setLoading(true);
    try {
      // Loop through and delete each
      for (const p of favorites) {
        await fetch(`/api/favoritos?productId=${p.id}`, { method: "DELETE" });
      }
      setFavorites([]);
    } catch (err) {
      console.warn("Failed to clear favorites:", err);
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fafaf9]">
        <Header />
        <CategoryMenu />
        <main className="flex-grow flex flex-col items-center justify-center py-20 gap-3 select-none">
          <Loader className="h-8 w-8 text-primary animate-spin" />
          <span className="text-xs font-bold text-gray-400 animate-pulse">Carregando seus favoritos...</span>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9]">
      <Header />
      <CategoryMenu />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-black text-[#1b4332] flex items-center gap-2">
              <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
              Meus Favoritos
            </h1>
            <p className="text-xs font-semibold text-gray-400 mt-1">
              Produtos que você salvou para comprar mais tarde
            </p>
          </div>

          {favorites.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleAddAllToCart}
                className="inline-flex items-center gap-1.5 bg-primary hover:bg-[#122e22] text-white font-black text-xs py-2.5 px-5 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <ShoppingCart className="h-4 w-4" />
                Adicionar Tudo ao Carrinho
              </button>
              <button
                onClick={handleClearFavorites}
                className="inline-flex items-center gap-1.5 border border-gray-200 hover:bg-gray-55 text-gray-500 font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                title="Limpar todos os favoritos"
              >
                <Trash2 className="h-4 w-4" />
                Limpar
              </button>
            </div>
          )}
        </div>

        {favorites.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center max-w-md mx-auto space-y-4">
            <div className="bg-rose-50 border border-rose-100 p-5 rounded-full inline-block text-rose-500">
              <Heart className="h-8 w-8 fill-rose-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Nenhum favorito ainda</h3>
            <p className="text-xs text-gray-400 font-semibold leading-relaxed">
              Explore nossos produtos de pet shop, jardinagem e agropecuária e clique no coração para salvá-los aqui!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 bg-primary hover:bg-[#122e22] text-white font-black text-xs py-2.5 px-6 rounded-xl shadow-sm transition-all mt-2"
            >
              <span>Ver Produtos</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
      <CartDrawer />
      <ProductDetailsModal />
    </div>
  );
}
