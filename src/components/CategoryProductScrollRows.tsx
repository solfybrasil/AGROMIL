"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { dbService } from "@/lib/db-service";
import { Product } from "@/lib/cart-store";

import BannerCarousel from "./BannerCarousel";

interface HomeCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
}

const DEFAULT_CATEGORIES: HomeCategory[] = [
  { id: "cat-vestidos", name: "Vestidos", slug: "vestidos", imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200&auto=format&fit=crop" },
  { id: "cat-tops", name: "Tops & Blusas", slug: "tops-blusas", imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=200&auto=format&fit=crop" },
  { id: "cat-bolsas", name: "Bolsas", slug: "acessorios", imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=200&auto=format&fit=crop" },
  { id: "cat-calcas", name: "Calças", slug: "calcas-jeans", imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=200&auto=format&fit=crop" },
  { id: "cat-conjuntos", name: "Conjuntos", slug: "conjuntos", imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=200&auto=format&fit=crop" },
  { id: "cat-acessorios", name: "Acessórios", slug: "acessorios", imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=200&auto=format&fit=crop" },
  { id: "cat-sale", name: "SALE 50%", slug: "vestidos" },
];

const SECTIONS = [
  {
    title: "Bolsas & Acessórios",
    subtitle: "Couro legítimo, acabamento artesanal e ferragens douradas",
    categoryId: "cat_acessorios",
    slug: "acessorios",
  },
  {
    title: "Tops & Blusas",
    subtitle: "Regatas caneladas, camisas de linho e bodys alfaiataria",
    categoryId: "cat_tops",
    slug: "tops-blusas",
  },
  {
    title: "Vestidos & Midis",
    subtitle: "Silhuetas fluidas e tecidos nobres para qualquer ocasião",
    categoryId: "cat_vestidos",
    slug: "vestidos",
  },
  {
    title: "Calças & Alfaiataria",
    subtitle: "Modelagem ergonomicamente desenvolvida com caimento perfeito",
    categoryId: "cat_calcas",
    slug: "calcas-jeans",
  },
];

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  vestidos: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop",
  "tops-blusas": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600&auto=format&fit=crop",
  acessorios: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop",
  "calcas-jeans": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop",
  conjuntos: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop",
};

export default function CategoryProductScrollRows() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<HomeCategory[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      const stored = typeof window !== "undefined" ? (localStorage.getItem("siluet_categories") || localStorage.getItem("agromil_categories")) : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed);
          return;
        }
      }

      const dbCats = await dbService.getCategories();
      if (dbCats && dbCats.length > 0) {
        const mapped: HomeCategory[] = dbCats.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug || "vestidos",
          imageUrl: c.imageUrl,
        }));
        if (!mapped.some((c) => c.name.toUpperCase().includes("SALE"))) {
          mapped.push({ id: "sale-pill", name: "SALE 50%", slug: "vestidos" });
        }
        setCategories(mapped);
      }
    } catch {}
  };

  useEffect(() => {
    dbService.getProducts().then((products) => {
      setAllProducts(products);
      setLoading(false);
    });

    loadCategories();

    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "siluet_categories" || e.key === "agromil_categories") {
        loadCategories();
      }
    };

    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel("siluet_categories_channel");
      bc.onmessage = () => {
        loadCategories();
      };
    }

    if (typeof window !== "undefined") {
      window.addEventListener("siluet_categories_updated", loadCategories);
      window.addEventListener("storage", handleStorage);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("siluet_categories_updated", loadCategories);
        window.removeEventListener("storage", handleStorage);
      }
      if (bc) bc.close();
    };
  }, []);

  return (
    <div className="w-full bg-[#F5EFE6] py-5 sm:py-10 space-y-8 sm:space-y-16">

      {/* 1. Category Chips — horizontal scroll on mobile, grid on desktop */}
      <section className="max-w-[1440px] mx-auto">
        {/* Section header */}
        <div className="flex items-center justify-between gap-3 mb-3 sm:mb-5 border-b border-[#EDE3D3] pb-3 px-3 sm:px-5 lg:px-6">
          <div>
            <span className="text-[9px] sm:text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest block mb-0.5">
              COLEÇÕES DO ATELIER
            </span>
            <h2 className="font-serif text-base sm:text-xl md:text-2xl font-semibold text-[#2B2620]">
              Explore Por Categoria
            </h2>
          </div>
        </div>

        {/* Mobile: horizontal scroll chips */}
        <div className="sm:hidden flex gap-2 overflow-x-auto scrollbar-none px-3 pb-1">
          {categories.map((cat, idx) => {
            const isSale = cat.name.toUpperCase().includes("SALE");
            const fallbackImg = DEFAULT_CATEGORY_IMAGES[cat.slug] || DEFAULT_CATEGORY_IMAGES["vestidos"];
            const bgImage = cat.imageUrl || fallbackImg;
            return (
              <Link
                key={cat.id || idx}
                href={`/categoria/${cat.slug}`}
                className="group relative flex-shrink-0 h-10 rounded-full overflow-hidden flex items-center justify-center px-4 shadow-xs border border-white/30 active:scale-95 transition-all select-none"
                style={{ minWidth: isSale ? 90 : 80 }}
              >
                {bgImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={bgImage} alt={cat.name} className="absolute inset-0 w-full h-full object-cover object-center" />
                )}
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative z-10 flex items-center gap-1">
                  <span className="text-[10px] font-black text-white whitespace-nowrap leading-none">{cat.name}</span>
                  {isSale && <span className="bg-[#8B5E3C] text-white text-[7px] font-black px-1 py-0.5 rounded-full">50%</span>}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Desktop: grid */}
        <div className="hidden sm:grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 px-5 lg:px-6">
          {categories.map((cat, idx) => {
            const isSale = cat.name.toUpperCase().includes("SALE");
            const fallbackImg = DEFAULT_CATEGORY_IMAGES[cat.slug] || DEFAULT_CATEGORY_IMAGES["vestidos"];
            const bgImage = cat.imageUrl || fallbackImg;
            return (
              <Link
                key={cat.id || idx}
                href={`/categoria/${cat.slug}`}
                className="group relative h-16 md:h-20 rounded-full overflow-hidden flex items-center justify-center px-4 py-2 text-center shadow-xs hover:shadow-md transition-all duration-300 border border-white/30 hover:border-[#8B5E3C] hover:scale-[1.03] select-none cursor-pointer"
              >
                {bgImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={bgImage} alt={cat.name} className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30 group-hover:from-black/85 transition-colors" />
                <div className="relative z-10 flex items-center justify-center gap-1.5 px-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5E3C] flex-shrink-0" />
                  <h3 className="font-serif text-xs sm:text-sm font-bold text-white tracking-tight leading-tight drop-shadow-sm truncate">{cat.name}</h3>
                  {isSale && <span className="bg-[#8B5E3C] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase leading-none ml-1 flex-shrink-0">50%</span>}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 2. Category product rows */}
      {SECTIONS.map((section, idx) => (
        <div key={idx} className="space-y-6 sm:space-y-10">
          <CategoryScrollRow
            title={section.title}
            subtitle={section.subtitle}
            slug={section.slug}
            categoryId={section.categoryId}
            products={allProducts.filter(
              (p: any) =>
                p.categoryId === section.categoryId ||
                p.category?.slug === section.slug ||
                (section.slug === "acessorios" && (p.name.toLowerCase().includes("bolsa") || p.name.toLowerCase().includes("óculos") || p.name.toLowerCase().includes("cinto"))) ||
                (section.slug === "tops-blusas" && (p.name.toLowerCase().includes("top") || p.name.toLowerCase().includes("camisa") || p.name.toLowerCase().includes("blusa"))) ||
                (section.slug === "vestidos" && (p.name.toLowerCase().includes("vestido") || p.name.toLowerCase().includes("midi"))) ||
                (section.slug === "calcas-jeans" && (p.name.toLowerCase().includes("calça") || p.name.toLowerCase().includes("wide") || p.name.toLowerCase().includes("alfaiataria")))
            )}
            fallbackProducts={allProducts}
          />
          {idx === 0 && (
            <div className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-6 my-2">
              <BannerCarousel />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CategoryScrollRow({
  title,
  subtitle,
  slug,
  products,
  fallbackProducts,
}: {
  title: string;
  subtitle: string;
  slug: string;
  categoryId: string;
  products: Product[];
  fallbackProducts: Product[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // If specific filter yielded few products, fill with fallback
  const displayProducts = products.length >= 2 ? products : fallbackProducts.slice(0, 6);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="max-w-[1440px] mx-auto">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 mb-3 sm:mb-5 border-b border-[#EDE3D3] pb-3 px-3 sm:px-5 lg:px-6">
        <div>
          <span className="text-[9px] sm:text-[11px] font-black text-[#8B5E3C] uppercase tracking-widest block mb-0.5">
            COLEÇÃO
          </span>
          <h2 className="font-serif text-base sm:text-2xl md:text-3xl font-semibold text-[#2B2620] leading-tight">
            {title}
          </h2>
          <p className="hidden sm:block text-xs text-[#7A6F63] mt-1 font-normal">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <Link href={`/categoria/${slug}`}
            className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black text-[#8B5E3C] hover:text-[#2B2620] transition-colors">
            <span>Ver Tudo</span>
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Link>
          <div className="hidden sm:flex items-center gap-1.5">
            <button onClick={() => scroll("left")}
              className="p-2 rounded-full border border-[#2B2620]/20 hover:bg-[#1A1A1A] hover:text-white text-[#2B2620] transition-colors shadow-sm focus:outline-none"
              aria-label="Anterior">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => scroll("right")}
              className="p-2 rounded-full border border-[#2B2620]/20 hover:bg-[#1A1A1A] hover:text-white text-[#2B2620] transition-colors shadow-sm focus:outline-none"
              aria-label="Próximo">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Product List */}
      <div
        ref={scrollRef}
        className="flex gap-2.5 sm:gap-5 overflow-x-auto snap-x scroll-smooth pb-3 pt-1 scrollbar-none -mx-0 px-3 sm:px-5 lg:px-6"
      >
        {displayProducts.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-[150px] sm:w-[240px] md:w-[270px] snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
