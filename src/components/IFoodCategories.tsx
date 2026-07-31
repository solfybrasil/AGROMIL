"use client";

import Link from "next/link";
import { Sparkles, ShoppingBag, Flame, Crown, Gem, Footprints } from "lucide-react";

interface CategoryBubble {
  name: string;
  slug: string;
  icon: React.ComponentType<any>;
  imageUrl: string;
}

const BUBBLES: CategoryBubble[] = [
  {
    name: "Vestidos Midis",
    slug: "vestidos",
    icon: Crown,
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=200",
  },
  {
    name: "Tops & Blusas",
    slug: "tops-blusas",
    icon: Sparkles,
    imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=200",
  },
  {
    name: "Conjuntos Chic",
    slug: "conjuntos",
    icon: Flame,
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200",
  },
  {
    name: "Calças Wide Leg",
    slug: "calcas-jeans",
    icon: ShoppingBag,
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=200",
  },
  {
    name: "Bolsas & Accessories",
    slug: "acessorios",
    icon: Gem,
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=200",
  },
  {
    name: "Calçados & Mules",
    slug: "calcados",
    icon: Footprints,
    imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=200",
  },
];

export default function IFoodCategories() {
  return (
    <section className="w-full bg-[#FAF7F2] py-10 border-b border-[#E8DFD8] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-xs font-bold text-[#A04728] uppercase tracking-widest text-center mb-6">
          Explorar por Categoria Shein
        </h3>

        {/* Swipable Circular Categories */}
        <div className="flex items-center justify-start md:justify-center gap-6 md:gap-10 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {BUBBLES.map((bubble, idx) => {
            return (
              <Link
                key={idx}
                href={`/categoria/${bubble.slug}`}
                className="flex flex-col items-center gap-3 snap-center min-w-[85px] group"
              >
                {/* Image Bubble Circle */}
                <div className="w-20 h-20 rounded-full p-1 border-2 border-[#C86D51]/30 bg-white shadow-sm transition-all duration-300 group-hover:scale-108 group-hover:border-[#A04728] group-hover:shadow-md relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bubble.imageUrl}
                    alt={bubble.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                  <div className="absolute inset-0 bg-[#5C2818]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Label */}
                <span className="text-xs font-semibold text-[#2B1D19] text-center tracking-tight truncate max-w-[100px] group-hover:text-[#A04728] transition-colors">
                  {bubble.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
