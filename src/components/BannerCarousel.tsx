"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { dbService } from "@/lib/db-service";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  bgColor: string;
  textColor: string;
}

const DEFAULT_TWIN_BANNERS: Banner[] = [
  {
    id: "twin-1",
    title: "Vestidos longos",
    subtitle: "Linha completa",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop",
    linkUrl: "/categoria/vestidos",
    linkLabel: "confira",
    bgColor: "#E5C3B0",
    textColor: "#5C3523",
  },
  {
    id: "twin-2",
    title: "Acessórios",
    subtitle: "Linha completa",
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop",
    linkUrl: "/categoria/acessorios",
    linkLabel: "confira",
    bgColor: "#D4DEC9",
    textColor: "#2E422B",
  },
];

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_TWIN_BANNERS);
  const [loading, setLoading] = useState(true);

  const loadBanners = async () => {
    try {
      const stored = typeof window !== "undefined" ? (localStorage.getItem("siluet_twin_banners") || localStorage.getItem("agromil_banners")) : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBanners(parsed);
          setLoading(false);
          return;
        }
      }

      const data = await dbService.getBanners();
      if (data && data.length >= 1) {
        setBanners(data);
        setLoading(false);
        return;
      }
    } catch {}
    setBanners(DEFAULT_TWIN_BANNERS);
    setLoading(false);
  };

  useEffect(() => {
    loadBanners();

    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "siluet_twin_banners" || e.key === "agromil_banners") {
        loadBanners();
      }
    };

    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel("siluet_banners_channel");
      bc.onmessage = () => {
        loadBanners();
      };
    }

    if (typeof window !== "undefined") {
      window.addEventListener("siluet_banners_updated", loadBanners);
      window.addEventListener("storage", handleStorage);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("siluet_banners_updated", loadBanners);
        window.removeEventListener("storage", handleStorage);
      }
      if (bc) bc.close();
    };
  }, []);

  const displayBanners = banners.length >= 2 ? banners.slice(0, 2) : DEFAULT_TWIN_BANNERS;

  return (
    <div className="w-full max-w-[1440px] mx-auto my-4 sm:my-6 select-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayBanners.map((banner, idx) => {
          const defaultBg = idx === 0 ? "#E5C3B0" : "#D4DEC9";
          const defaultText = idx === 0 ? "#5C3523" : "#2E422B";
          const bg = banner.bgColor || defaultBg;
          const text = banner.textColor || defaultText;

          return (
            <div
              key={banner.id || idx}
              className="relative w-full h-[180px] sm:h-[210px] md:h-[230px] rounded-[28px] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-between group"
              style={{ backgroundColor: bg }}
            >
              {/* Left Side: Model Photo with smooth gradient mask */}
              <div className="w-2/5 h-full relative flex-shrink-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.imageUrl || DEFAULT_TWIN_BANNERS[idx % 2].imageUrl!}
                  alt={banner.title}
                  className="w-full h-full transition-transform duration-700 group-hover:scale-105"
                  style={{
                    objectFit: (banner as any).imageFit || "cover",
                    objectPosition: (banner as any).imagePosition || "center",
                  }}
                />
                {/* Soft right edge mask */}
                <div
                  className="absolute inset-y-0 right-0 w-12 bg-gradient-to-r from-transparent to-current pointer-events-none"
                  style={{ color: bg }}
                />
              </div>

              {/* Right Side: Typography & Button (Matching screenshot exactly) */}
              <div className="flex-1 h-full flex flex-col justify-center items-center text-center p-4 sm:p-6 z-10 pr-6">
                <h3
                  className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight leading-tight"
                  style={{ color: text }}
                >
                  {banner.title}
                </h3>
                
                <p
                  className="text-xs sm:text-sm opacity-80 mt-1 font-normal"
                  style={{ color: text }}
                >
                  {banner.subtitle || "Linha completa"}
                </p>

                <div className="mt-4">
                  <Link
                    href={banner.linkUrl || "/"}
                    className="inline-flex items-center justify-center bg-white text-[#2B2620] hover:bg-gray-50 font-bold text-xs px-6 py-2 rounded-full shadow-xs hover:shadow transition-all hover:scale-105 active:scale-95 uppercase tracking-wider cursor-pointer"
                  >
                    <span>{banner.linkLabel || "confira"}</span>
                  </Link>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
