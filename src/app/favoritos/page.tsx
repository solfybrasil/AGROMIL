"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryMenu from "@/components/CategoryMenu";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import ProductDetailsModal from "@/components/ProductDetailsModal";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Loader, ArrowRight, Trash2 } from "lucide-react";
import { useAddToCart } from "@/lib/useAddToCart";
import { dbService } from "@/lib/db-service";
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

  const addToCart = useAddToCart();
  const router = useRouter();

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Try local storage IDs first
      const localIds: string[] = JSON.parse(localStorage.getItem("siluet_favorites") || "[]");
      let apiItems: Product[] = [];

      // 2. Try fetching from API if active
      try {
        const res = await fetch("/api/favoritos");
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          apiItems = await res.json();
        }
      } catch (err) {
        console.warn("API favoritos fetch skipped:", err);
      }

      // 3. Collect product details from dbService for localIds
      const productPromises = localIds.map((id) => dbService.getProductById(id));
      const dbProducts = await Promise.all(productPromises);
      const validDbProducts = dbProducts.filter((p): p is Product => p !== null);

      // 4. Merge API items and DB products by unique ID
      const map = new Map<string, Product>();
      apiItems.forEach((p) => map.set(p.id, p));
      validDbProducts.forEach((p) => map.set(p.id, p));

      setFavorites(Array.from(map.values()));
    } catch (err) {
      console.warn("Failed to load favorites:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();

    const handleUpdate = () => {
      loadFavorites();
    };

    window.addEventListener("siluet_favorites_updated", handleUpdate);
    return () => window.removeEventListener("siluet_favorites_updated", handleUpdate);
  }, [loadFavorites]);

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
      localStorage.setItem("siluet_favorites", JSON.stringify([]));
      window.dispatchEvent(new Event("siluet_favorites_updated"));
      setFavorites([]);

      for (const p of favorites) {
        await fetch(`/api/favoritos?productId=${p.id}`, { method: "DELETE" }).catch(() => {});
      }
    } catch (err) {
      console.warn("Failed to clear favorites:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5EFE6] text-[#2B2620]">
      <Header />
      <CategoryMenu />

      <main className="flex-grow max-w-[1440px] w-full mx-auto px-3 sm:px-5 lg:px-6 py-10 select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-[#EDE3D3] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-script text-xl text-[#8B5E3C] capitalize font-normal">Coleção Pessoal</span>
            </div>
            <h1 className="font-serif text-3xl font-semibold text-[#2B2620] flex items-center gap-2.5">
              <Heart className="h-7 w-7 text-rose-500 fill-rose-500" />
              Meus Favoritos
            </h1>
            <p className="text-xs text-[#7A6F63] mt-1 font-normal">
              Suas peças salvas e selecionadas no Atelier SILUET
            </p>
          </div>

          {favorites.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddAllToCart}
                className="inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#8B5E3C] text-white font-medium text-xs py-3 px-6 rounded-2xl shadow-xs transition-all cursor-pointer uppercase tracking-wider"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Adicionar Tudo ao Carrinho</span>
              </button>
              <button
                onClick={handleClearFavorites}
                className="inline-flex items-center gap-2 bg-white border border-[#EDE3D3] hover:border-rose-300 text-rose-600 font-medium text-xs py-3 px-4 rounded-2xl shadow-3xs transition-all cursor-pointer"
                title="Limpar todos os favoritos"
              >
                <Trash2 className="h-4 w-4" />
                <span>Limpar</span>
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader className="h-8 w-8 text-[#8B5E3C] animate-spin" />
            <span className="text-xs font-semibold text-[#7A6F63] animate-pulse">Carregando seus favoritos...</span>
          </div>
        ) : favorites.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-[#EDE3D3] rounded-3xl p-12 sm:p-16 text-center max-w-md mx-auto space-y-4 shadow-3xs">
            <div className="bg-rose-50 border border-rose-100 p-5 rounded-full inline-block text-rose-500">
              <Heart className="h-8 w-8 fill-rose-500" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-[#2B2620]">Nenhuma peça salva ainda</h3>
            <p className="text-xs text-[#7A6F63] leading-relaxed font-normal">
              Explore nossos vestidos, conjuntos, blusas e acessórios e toque no coração para salvar suas peças favoritas aqui!
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#8B5E3C] text-white font-medium text-xs py-3.5 px-7 rounded-2xl shadow-xs transition-all uppercase tracking-wider"
              >
                <span>Explorar Coleções</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
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

