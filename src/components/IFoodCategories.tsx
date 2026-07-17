"use client";

import Link from "next/link";
import { Flower2, Dog, Wheat, Wrench, Droplet, ShieldCheck } from "lucide-react";

interface CategoryBubble {
  name: string;
  slug: string;
  icon: React.ComponentType<any>;
  bgColor: string;
  iconColor: string;
}

const BUBBLES: CategoryBubble[] = [
  {
    name: "Jardinagem",
    slug: "jardinagem",
    icon: Flower2,
    bgColor: "bg-emerald-50 hover:bg-emerald-100/70 border-emerald-100",
    iconColor: "text-emerald-700",
  },
  {
    name: "Pet Shop",
    slug: "petshop",
    icon: Dog,
    bgColor: "bg-orange-50 hover:bg-orange-100/70 border-orange-100",
    iconColor: "text-orange-700",
  },
  {
    name: "Agropecuária",
    slug: "agropecuaria",
    icon: Wheat,
    bgColor: "bg-amber-50 hover:bg-amber-100/70 border-amber-100",
    iconColor: "text-amber-700",
  },
  {
    name: "Ferramentas",
    slug: "ferramentas",
    icon: Wrench,
    bgColor: "bg-blue-50 hover:bg-blue-100/70 border-blue-100",
    iconColor: "text-blue-700",
  },
  {
    name: "Irrigação",
    slug: "irrigacao",
    icon: Droplet,
    bgColor: "bg-cyan-50 hover:bg-cyan-100/70 border-cyan-100",
    iconColor: "text-cyan-700",
  },
  {
    name: "Vestuário & EPI",
    slug: "vestuario-epi",
    icon: ShieldCheck,
    bgColor: "bg-rose-50 hover:bg-rose-100/70 border-rose-100",
    iconColor: "text-rose-700",
  },
];

export default function IFoodCategories() {
  return (
    <section className="w-full bg-[#fdfdfb] py-8 border-b border-gray-100 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest text-center mb-6">
          Navegue por Categoria
        </h3>
        
        {/* Horizontal scroll container (centered on desktop, swipable on mobile) */}
        <div className="flex items-center justify-start md:justify-center gap-6 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {BUBBLES.map((bubble, idx) => {
            const Icon = bubble.icon;
            
            return (
              <Link
                key={idx}
                href={`/categoria/${bubble.slug}`}
                className="flex flex-col items-center gap-2.5 snap-center min-w-[80px] group"
              >
                {/* Bubble Circle */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center border shadow-2xs transition-all duration-300 group-hover:scale-108 group-hover:shadow-md active:scale-95 ${bubble.bgColor}`}>
                  <Icon className={`h-7 w-7 transition-transform group-hover:rotate-6 ${bubble.iconColor}`} />
                </div>
                
                {/* Bubble Label */}
                <span className="text-[11px] font-extrabold text-gray-700 text-center tracking-tight truncate max-w-[90px] group-hover:text-primary transition-colors">
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
