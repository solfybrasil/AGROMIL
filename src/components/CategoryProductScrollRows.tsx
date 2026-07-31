"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
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
  { id: "cat-jardinagem", name: "Jardinagem & Vasos", slug: "jardinagem", imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=300" },
  { id: "cat-petshop", name: "Petshop & Rações", slug: "petshop", imageUrl: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=300" },
  { id: "cat-agropecuaria", name: "Agropecuária", slug: "agropecuaria", imageUrl: "https://images.unsplash.com/photo-1500595046743-cd271c9d7a40?q=80&w=300" },
  { id: "cat-ferramentas", name: "Ferramentas", slug: "ferramentas", imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=300" },
  { id: "cat-irrigacao", name: "Irrigação & Bombas", slug: "irrigacao", imageUrl: "https://images.unsplash.com/photo-1558904541-efa843a96f9f?q=80&w=300" },
  { id: "cat-vestuario-epi", name: "Vestuário & EPI", slug: "vestuario-epi", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=300" },
  { id: "cat-ofertas", name: "OFERTAS 30%", slug: "jardinagem" },
];

const SECTIONS = [
  {
    title: "Jardinagem & Paisagismo",
    subtitle: "Vasos, adubos, substratos e ferramentas de poda",
    categoryId: "cat-jardinagem",
    slug: "jardinagem",
  },
  {
    title: "Petshop & Rações",
    subtitle: "Nutrição completa para cães, gatos e animais de estimação",
    categoryId: "cat-petshop",
    slug: "petshop",
  },
  {
    title: "Agropecuária & Campo",
    subtitle: "Sais minerais, rações de produção e suplementação animal",
    categoryId: "cat-agropecuaria",
    slug: "agropecuaria",
  },
  {
    title: "Ferramentas & Equipamentos",
    subtitle: "Máquinas, furadeiras, chaves e equipamentos profissionais",
    categoryId: "cat-ferramentas",
    slug: "ferramentas",
  },
];

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  jardinagem: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600",
  petshop: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=600",
  agropecuaria: "https://images.unsplash.com/photo-1500595046743-cd271c9d7a40?q=80&w=600",
  ferramentas: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=600",
  irrigacao: "https://images.unsplash.com/photo-1558904541-efa843a96f9f?q=80&w=600",
  "vestuario-epi": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600",
};

export default function CategoryProductScrollRows() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<HomeCategory[]>(DEFAULT_CATEGORIES);

  const loadCategories = async () => {
    try {
      const dbCats = await dbService.getCategories();
      if (dbCats && dbCats.length > 0) {
        const mapped: HomeCategory[] = dbCats.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug || "jardinagem",
          imageUrl: c.imageUrl,
        }));
        if (!mapped.some((c) => c.name.toUpperCase().includes("OFERTAS"))) {
          mapped.push({ id: "sale-pill", name: "OFERTAS 30%", slug: "jardinagem" });
        }
        setCategories(mapped);
      }
    } catch {}
  };

  useEffect(() => {
    dbService.getProducts().then((products) => {
      setAllProducts(products);
    });

    loadCategories();

    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "agromil_categories" || e.key === "siluet_categories") {
        loadCategories();
      }
    };

    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel("agromil_categories_channel");
      bc.onmessage = () => loadCategories();
    }

    if (typeof window !== "undefined") {
      window.addEventListener("agromil_categories_updated", loadCategories);
      window.addEventListener("storage", handleStorage);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("agromil_categories_updated", loadCategories);
        window.removeEventListener("storage", handleStorage);
      }
      if (bc) bc.close();
    };
  }, []);

  return (
    <div className="w-full bg-[#F5EFE6] py-5 sm:py-10 space-y-8 sm:space-y-16">

      {/* 1. Category Chips */}
      <section className="max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between gap-3 mb-3 sm:mb-5 border-b border-[#EDE3D3] pb-3 px-3 sm:px-5 lg:px-6">
          <div>
            <span className="text-[9px] sm:text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest block mb-0.5">
              CATEGORIAS DE PRODUTOS
            </span>
            <h2 className="font-serif text-base sm:text-xl md:text-2xl font-semibold text-[#2B2620]">
              Explore o Catálogo Agromil
            </h2>
          </div>
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="sm:hidden flex gap-2 overflow-x-auto scrollbar-none px-3 pb-1">
          {categories.map((cat, idx) => {
            const isSale = cat.name.toUpperCase().includes("OFERTAS");
            const fallbackImg = DEFAULT_CATEGORY_IMAGES[cat.slug] || DEFAULT_CATEGORY_IMAGES["jardinagem"];
            const bgImage = cat.imageUrl || fallbackImg;
            return (
              <Link
                key={cat.id || idx}
                href={`/categoria/${cat.slug}`}
                className="group relative flex-shrink-0 h-10 rounded-full overflow-hidden flex items-center justify-center px-4 shadow-xs border border-white/30 active:scale-95 transition-all select-none"
                style={{ minWidth: isSale ? 95 : 85 }}
              >
                {bgImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={bgImage} alt={cat.name} className="absolute inset-0 w-full h-full object-cover object-center" />
                )}
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative z-10 flex items-center gap-1">
                  <span className="text-[10px] font-black text-white whitespace-nowrap leading-none">{cat.name}</span>
                  {isSale && <span className="bg-[#8B5E3C] text-white text-[7px] font-black px-1 py-0.5 rounded-full">30%</span>}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Desktop: grid */}
        <div className="hidden sm:grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 px-5 lg:px-6">
          {categories.map((cat, idx) => {
            const isSale = cat.name.toUpperCase().includes("OFERTAS");
            const fallbackImg = DEFAULT_CATEGORY_IMAGES[cat.slug] || DEFAULT_CATEGORY_IMAGES["jardinagem"];
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
                  {isSale && <span className="bg-[#8B5E3C] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase leading-none ml-1 flex-shrink-0">30%</span>}
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
                p.category?.slug === section.slug
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

  const displayProducts = products.length >= 1 ? products : fallbackProducts.slice(0, 6);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between gap-3 mb-3 sm:mb-5 border-b border-[#EDE3D3] pb-3 px-3 sm:px-5 lg:px-6">
        <div>
          <span className="text-[9px] sm:text-[11px] font-black text-[#8B5E3C] uppercase tracking-widest block mb-0.5">
            AGROMIL MARKETPLACE
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
