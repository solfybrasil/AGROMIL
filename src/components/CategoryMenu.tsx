"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flower2, Dog, Wheat, Sprout, Pipette, ShieldAlert, Tag, Sparkles, ShoppingBag } from "lucide-react";
import { dbService } from "@/lib/db-service";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: "cat-vestidos", name: "Vestidos", slug: "vestidos" },
  { id: "cat-tops", name: "Tops & Blusas", slug: "tops-blusas" },
  { id: "cat-acessorios", name: "Bolsas & Acessórios", slug: "acessorios" },
  { id: "cat-calcas", name: "Calças & Alfaiataria", slug: "calcas-jeans" },
  { id: "cat-conjuntos", name: "Conjuntos", slug: "conjuntos" },
  { id: "cat-sale", name: "SALE 50%", slug: "vestidos" },
];

const ICON_MAP: Record<string, any> = {
  jardinagem: Flower2,
  petshop: Dog,
  agropecuaria: Wheat,
  ferramentas: Sprout,
  irrigacao: Pipette,
  "vestuario-epi": ShieldAlert,
};

export default function CategoryMenu() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await dbService.getCategories();
        if (res && res.length > 0) {
          setCategories(
            res.map((c: any) => ({
              id: c.id,
              name: c.name,
              slug: c.slug || c.id.replace("cat-", ""),
            }))
          );
        }
      } catch (err) {
        console.warn("Could not load dynamic categories for menu", err);
      }
    }
    loadCategories();
  }, []);

  return (
    <nav className="w-full bg-[#FAF7F2] border-b border-[#EDE3D3]/80 py-3 scrollbar-none overflow-x-auto select-none">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-6 flex items-center justify-start md:justify-center gap-2.5 sm:gap-4 min-w-max">
        {categories.map((cat) => {
          const IconComponent = ICON_MAP[cat.slug] || Sparkles;
          const isActive = pathname === `/categoria/${cat.slug}` || pathname === `/categoria/${cat.id}`;
          
          return (
            <Link
              key={cat.id}
              href={`/categoria/${cat.slug || cat.id}`}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
                isActive
                  ? "bg-[#2B2620] text-white shadow-xs scale-[1.02]"
                  : "bg-white text-[#5C5346] hover:text-[#2B2620] hover:bg-white/90 border border-[#EDE3D3] hover:border-[#8B5E3C]/40 shadow-3xs"
              }`}
            >
              <IconComponent className={`h-3.5 w-3.5 ${isActive ? "text-[#8B5E3C]" : "text-[#8B5E3C]/80"}`} />
              <span>{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
