"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";

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

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch("/api/banners");
        if (res.ok) {
          const data = await res.json();
          setBanners(data);
        }
      } catch (err) {
        console.warn("Banners API failed. No banners displayed.", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // Auto advance
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(t);
  }, [banners]);

  if (loading || banners.length === 0) return null;

  const next = () => setCurrent((prev) => (prev + 1) % banners.length);
  const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <div className="relative w-full h-[140px] sm:h-[220px] md:h-[280px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xs group mb-6 select-none bg-primary-dark">
      {/* Slides */}
      <div
        className="w-full h-full flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((b) => (
          <div
            key={b.id}
            className="w-full h-full flex-shrink-0 flex items-center justify-between p-4 sm:p-10 relative overflow-hidden"
            style={{ backgroundColor: b.bgColor, color: b.textColor }}
          >
            {/* Background Image / Overlay if present */}
            {b.imageUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30 pointer-events-none"
                style={{ backgroundImage: `url(${b.imageUrl})` }}
              />
            )}

            {/* Content */}
            <div className="space-y-1.5 sm:space-y-4 max-w-[70%] md:max-w-lg z-10 text-left">
              <h2 className="font-serif text-sm sm:text-2xl md:text-3xl font-black leading-snug">
                {b.title}
              </h2>
              {b.subtitle && (
                <p className="text-[10px] sm:text-sm font-semibold opacity-90 leading-relaxed max-w-sm sm:max-w-md line-clamp-1 sm:line-clamp-none">
                  {b.subtitle}
                </p>
              )}
              {b.linkUrl && (
                <Link
                  href={b.linkUrl}
                  className="inline-flex items-center gap-1 bg-white text-[#1b4332] font-black text-[8px] sm:text-xs py-1.5 px-3 rounded-lg md:rounded-xl shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all hover:bg-gray-50 uppercase tracking-wider"
                >
                  <span>{b.linkLabel || "Aproveitar"}</span>
                  <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </Link>
              )}
            </div>

            {/* Graphic ornament decoration */}
            <div className="hidden md:block w-40 h-40 rounded-full bg-white/5 border border-white/10 absolute -right-10 -bottom-10 z-0" />
            <div className="hidden md:block w-64 h-64 rounded-full bg-white/5 border border-white/10 absolute -right-20 -bottom-20 z-0" />
          </div>
        ))}
      </div>

      {/* Navigation Buttons (shown on hover - Desktop only) */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-3xs"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-3xs"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  current === idx ? "w-3 bg-white" : "w-1 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
