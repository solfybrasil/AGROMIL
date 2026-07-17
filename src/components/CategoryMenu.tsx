"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flower2, Dog, Wheat, Sprout, Pipette, ShieldAlert } from "lucide-react";

export default function CategoryMenu() {
  const pathname = usePathname();

  const categories = [
    { name: "Jardinagem", slug: "jardinagem", icon: Flower2 },
    { name: "Pet Shop", slug: "petshop", icon: Dog },
    { name: "Agropecuária Geral", slug: "agropecuaria", icon: Wheat },
    { name: "Ferramentas", slug: "ferramentas", icon: Sprout },
    { name: "Irrigação", slug: "irrigacao", icon: Pipette },
    { name: "Vestuário & EPI", slug: "vestuario-epi", icon: ShieldAlert },
  ];

  return (
    <div className="w-full bg-[#fcfcf9] border-b border-gray-100 py-3 scrollbar-none overflow-x-auto select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-start md:justify-center gap-3 md:gap-6 min-w-max">
        {categories.map((cat) => {
          const IconComponent = cat.icon;
          const isActive = pathname === `/categoria/${cat.slug}`;
          
          return (
            <Link
              key={cat.slug}
              href={`/categoria/${cat.slug}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                isActive
                  ? "bg-primary text-white shadow-xs"
                  : "bg-white text-gray-700 hover:text-primary hover:bg-primary-light/50 border border-gray-150 shadow-2xs"
              }`}
            >
              <IconComponent className="h-4 w-4" />
              <span>{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
