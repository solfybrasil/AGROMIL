"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryMenu from "@/components/CategoryMenu";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import ProductDetailsModal from "@/components/ProductDetailsModal";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, ArrowUpDown, Tag, Inbox } from "lucide-react";

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

interface Category {
  id: string;
  name: string;
  slug: string;
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("relevance"); // relevance, price_asc, price_desc

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/categorias");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.warn("Failed to load categories in search page:", err);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/produtos?q=${encodeURIComponent(query)}&activeOnly=true`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.warn("Failed to fetch search results:", err);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [query]);

  // Apply filters and sorting
  const filteredProducts = products.filter((p) => {
    if (selectedCategory && p.categoryId !== selectedCategory) return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.promoPrice ?? a.price;
    const priceB = b.promoPrice ?? b.price;

    if (sortBy === "price_asc") return priceA - priceB;
    if (sortBy === "price_desc") return priceB - priceA;
    return 0; // relevance / natural DB order
  });

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 select-none">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-[#1b4332] flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Resultados de busca
          </h1>
          <p className="text-xs font-semibold text-gray-400 mt-1">
            {loading ? "Buscando..." : `${sortedProducts.length} itens encontrados para "${query}"`}
          </p>
        </div>

        {/* Sorting controls */}
        {!loading && products.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-3xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-gray-450" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none outline-none text-gray-700 cursor-pointer pr-1"
              >
                <option value="relevance">Relevância</option>
                <option value="price_asc">Menor Preço</option>
                <option value="price_desc">Maior Preço</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
          <span className="text-xs font-bold text-gray-400 animate-pulse">Pesquisando produtos...</span>
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center max-w-md mx-auto space-y-4">
          <div className="bg-gray-50 p-4 rounded-full inline-block text-gray-400">
            <Inbox className="h-8 w-8" />
          </div>
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Nenhum resultado encontrado</h3>
          <p className="text-xs text-gray-400 font-semibold leading-relaxed">
            Não encontramos correspondências para &quot;{query}&quot;. Verifique a ortografia ou tente palavras-chave diferentes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar Filters */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-3xs space-y-5">
            <h3 className="text-xs font-black text-[#1b4332] uppercase tracking-widest border-b border-gray-50 pb-2 flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Filtrar resultados
            </h3>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                Por Categoria
              </label>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`text-left text-xs font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center justify-between ${
                    selectedCategory === "" ? "bg-primary-light text-primary" : "text-gray-650 hover:bg-gray-50"
                  }`}
                >
                  <span>Todas as categorias</span>
                  <span className="text-[10px] bg-white border border-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
                    {products.length}
                  </span>
                </button>
                {categories.map((cat) => {
                  const count = products.filter((p) => p.categoryId === cat.id).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`text-left text-xs font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center justify-between ${
                        selectedCategory === cat.id ? "bg-primary-light text-primary" : "text-gray-650 hover:bg-gray-50"
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] bg-white border border-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Grid Products */}
          <div className="lg:col-span-3">
            {sortedProducts.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-xs font-semibold text-gray-400 italic">
                Nenhum produto atende aos filtros aplicados.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9]">
      <Header />
      <CategoryMenu />
      <Suspense fallback={
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
        </div>
      }>
        <SearchResultsContent />
      </Suspense>
      <Footer />
      <CartDrawer />
      <ProductDetailsModal />
    </div>
  );
}
