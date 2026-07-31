"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { heroStorage } from "@/lib/indexed-db";

interface HeroSlide {
  tag?: string;
  badge?: string;
  title: string;
  subtitle: string;
  buttonText?: string;
  buttonLink?: string;
  link?: string;
  imageUrl?: string;
  image?: string;
  step?: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    tag: "AGROPECUÁRIA & CAMPO 2026",
    title: "Tudo para o Campo e Produção Rural",
    subtitle: "Rações, suplementos minerais, ferramentas e equipamentos de alta performance para o produtor.",
    image: "https://images.unsplash.com/photo-1500595046743-cd271c9d7a40?q=80&w=1920&auto=format&fit=crop",
    link: "/categoria/agropecuaria",
    buttonText: "Ver Produtos",
    step: "01",
  },
  {
    tag: "JARDINAGEM & PLANTAÇÃO",
    title: "Cultive Vida e Verdor com Qualidade",
    subtitle: "Vasos decorativos, adubos orgânicos, substratos e sistemas completos de irrigação.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1920&auto=format&fit=crop",
    link: "/categoria/jardinagem",
    buttonText: "Ver Jardinagem",
    step: "02",
  },
  {
    tag: "PETSHOP & SAÚDE ANIMAL",
    title: "Nutrição e Cuidado para Seu Pet",
    subtitle: "As melhores marcas de ração, medicamentos, camas e acessórios para cães, gatos e grandes animais.",
    image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=1920&auto=format&fit=crop",
    link: "/categoria/petshop",
    buttonText: "Ver Petshop",
    step: "03",
  },
];

export default function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);

  const loadSlides = async () => {
    try {
      const stored = await heroStorage.getSlides();
      if (stored && Array.isArray(stored) && stored.length > 0) {
        const mapped = stored.map((s: any, idx: number) => ({
          tag: s.badge || s.tag || `DESTAQUE 0${idx + 1}`,
          title: s.title,
          subtitle: s.subtitle,
          image: s.imageUrl || s.image,
          link: s.buttonLink || s.link || "/categoria/agropecuaria",
          buttonText: s.buttonText || "Ver Produtos",
          step: `0${idx + 1}`,
        }));
        setSlides(mapped);
        return;
      }
    } catch {}
    setSlides(DEFAULT_SLIDES);
  };

  useEffect(() => {
    loadSlides();
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "agromil_hero_slides" || e.key === "siluet_hero_slides") loadSlides();
    };
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel("siluet_hero_channel");
      bc.onmessage = () => loadSlides();
    }
    if (typeof window !== "undefined") {
      window.addEventListener("siluet_hero_updated", loadSlides);
      window.addEventListener("storage", handleStorage);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("siluet_hero_updated", loadSlides);
        window.removeEventListener("storage", handleStorage);
      }
      if (bc) bc.close();
    };
  }, []);

  // Auto-advance
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const activeIdx = Math.min(currentSlide, slides.length - 1);
  const slide = slides[activeIdx] || slides[0];

  const goNext = () => setCurrentSlide((p) => (p + 1) % slides.length);
  const goPrev = () => setCurrentSlide((p) => (p - 1 + slides.length) % slides.length);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setDragStart(e.touches[0].clientX);
    setIsDragging(true);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = dragStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? goNext() : goPrev(); }
    setIsDragging(false);
  };

  return (
    <section
      className="relative w-full h-[260px] sm:h-[480px] lg:h-[680px] bg-[#2B2620] overflow-hidden select-none border-b border-[#EDE3D3]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Background images */}
      {slides.map((item, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === activeIdx ? "opacity-100 z-0" : "opacity-0 -z-10"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image || item.imageUrl}
            alt={item.title}
            className="w-full h-full filter brightness-90"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#F5EFE6] via-[#F5EFE6]/80 sm:via-[#F5EFE6]/70 to-transparent z-10 lg:w-3/4" />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#F5EFE6]/60 to-transparent z-10 sm:hidden" />

      {/* Desktop slide numbers */}
      <div className="absolute right-6 sm:right-12 top-1/2 -translate-y-1/2 hidden sm:flex flex-col items-center gap-6 z-20">
        {slides.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className="flex flex-col items-center group focus:outline-none"
          >
            <span
              className={`text-xs font-mono font-semibold transition-colors duration-300 ${
                idx === activeIdx ? "text-[#1A1A1A] scale-110 font-bold" : "text-gray-400 group-hover:text-gray-600"
              }`}
            >
              {item.step || `0${idx + 1}`}
            </span>
            <div
              className={`w-0.5 mt-1 transition-all duration-300 ${
                idx === activeIdx ? "h-8 bg-[#8B5E3C]" : "h-3 bg-gray-300 group-hover:h-5"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="relative max-w-[1440px] mx-auto h-full px-3 sm:px-5 lg:px-6 flex flex-col justify-center sm:justify-between sm:py-10 lg:py-14 z-20">

        {/* Mobile layout overlay */}
        <div className="flex flex-col justify-end h-full pb-4 sm:hidden">
          <div className="inline-flex items-center gap-1.5 bg-[#EDE3D3]/70 text-[#8B5E3C] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full w-fit mb-2">
            <Sparkles className="h-2.5 w-2.5" />
            <span>{slide.tag}</span>
          </div>
          <h1 className="font-serif text-xl font-semibold text-[#2B2620] leading-tight tracking-tight mb-1.5">
            {slide.title}
          </h1>
          <p className="text-[10px] text-[#7A6F63] leading-relaxed mb-3 max-w-[220px]">
            {slide.subtitle}
          </p>
          <Link
            href={slide.link || slide.buttonLink || "/"}
            className="inline-flex items-center gap-2 bg-[#8B5E3C] hover:bg-[#1A1A1A] text-white font-bold text-[10px] py-2.5 px-5 w-fit transition-colors rounded-xl shadow-xs"
          >
            <span>{slide.buttonText || "Ver Produtos"}</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Desktop layout */}
        <div className="hidden sm:block max-w-xl my-auto space-y-5 pt-4">
          <div className="inline-flex items-center gap-2 bg-[#EDE3D3]/80 backdrop-blur-sm text-[#8B5E3C] text-[11px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-[#8B5E3C]/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{slide.tag}</span>
          </div>
          <div>
            <span className="font-script text-3xl sm:text-4xl text-[#8B5E3C] block capitalize font-normal leading-none mb-1">
              Agromil Marketplace
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-semibold text-[#2B2620] leading-[1.08] tracking-tight">
              {slide.title}
            </h1>
          </div>
          <p className="text-xs sm:text-sm md:text-base text-[#7A6F63] leading-relaxed font-normal max-w-lg">
            {slide.subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href={slide.link || slide.buttonLink || "/"}
              className="inline-flex items-center gap-3 bg-[#8B5E3C] hover:bg-[#1A1A1A] text-white font-bold text-sm py-4 px-8 transition-all rounded-2xl shadow-md group"
            >
              <span>{slide.buttonText || "Ver Produtos"}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30 sm:hidden">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`rounded-full transition-all duration-300 ${
              idx === activeIdx
                ? "w-4 h-1.5 bg-[#8B5E3C]"
                : "w-1.5 h-1.5 bg-[#8B5E3C]/30"
            }`}
          />
        ))}
      </div>

      {/* Mobile arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 sm:hidden bg-white/60 backdrop-blur-sm p-1.5 rounded-full shadow-sm active:scale-90 transition-transform"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4 text-[#2B2620]" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 sm:hidden bg-white/60 backdrop-blur-sm p-1.5 rounded-full shadow-sm active:scale-90 transition-transform"
            aria-label="Próximo"
          >
            <ChevronRight className="h-4 w-4 text-[#2B2620]" />
          </button>
        </>
      )}
    </section>
  );
}
