"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Slide {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  badge: string;
  overlayColor: string; // css gradient stop color (e.g. "#1b4332")
}

const DEFAULT_SLIDES: Slide[] = [
  {
    title: "Festival de Jardinagem",
    subtitle: "Até 20% de Desconto em adubos orgânicos, vasos auto-irrigáveis e sementes selecionadas.",
    buttonText: "Ver Jardinagem",
    buttonLink: "/categoria/jardinagem",
    imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1600&auto=format&fit=crop",
    badge: "Oferta Especial",
    overlayColor: "#1b4332",
  },
  {
    title: "Rações Premium & Pet Shop",
    subtitle: "Nutrição e saúde para o seu pet com entrega rápida em Itu/SP. As melhores marcas.",
    buttonText: "Ver Pet Shop",
    buttonLink: "/categoria/petshop",
    imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1600&auto=format&fit=crop",
    badge: "Novidades Pet",
    overlayColor: "#2d4a3e",
  },
  {
    title: "Ferramentas Rurais Tramontina",
    subtitle: "Facilite sua poda, plantio e colheita com ferramentas de aço temperado de alta qualidade.",
    buttonText: "Ver Ferramentas",
    buttonLink: "/categoria/ferramentas",
    imageUrl: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=1600&auto=format&fit=crop",
    badge: "Alta Durabilidade",
    overlayColor: "#1a2f23",
  },
];

// Load custom slides from localStorage (saved by admin hero editor)
function loadSlides(): Slide[] {
  if (typeof window === "undefined") return DEFAULT_SLIDES;
  try {
    const saved = localStorage.getItem("agromil_hero_slides");
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_SLIDES;
}

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSlides(loadSlides());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const handleNext = () => setCurrent((prev) => (prev + 1) % slides.length);

  if (!mounted) {
    return (
      <section className="relative w-full h-[280px] sm:h-[380px] md:h-[580px] bg-[#1b4332]" />
    );
  }

  return (
    <section className="relative w-full h-[280px] sm:h-[380px] md:h-[580px] overflow-hidden select-none">
      {/* Slides */}
      {slides.map((slide, idx) => {
        const isActive = idx === current;
        return (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Full-bleed background image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[8000ms] ease-linear ${
                isActive ? "scale-110" : "scale-100"
              }`}
            />

            {/* Responsive overlay gradient: vertical on mobile, horizontal on desktop */}
            <style dangerouslySetInnerHTML={{__html: `
              .overlay-gradient-${idx} {
                background: linear-gradient(to top, ${slide.overlayColor}fd 0%, ${slide.overlayColor}b0 55%, ${slide.overlayColor}10 100%);
              }
              @media (min-width: 768px) {
                .overlay-gradient-${idx} {
                  background: linear-gradient(to right, ${slide.overlayColor}ee 0%, ${slide.overlayColor}99 45%, ${slide.overlayColor}33 80%, transparent 100%) !important;
                }
              }
            `}} />
            <div className={`absolute inset-0 overlay-gradient-${idx}`} />
            
            {/* Bottom darkening for the dots */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

            {/* Text content — bottom-aligned on mobile, centered on desktop */}
            <div className="absolute inset-0 flex items-end pb-12 md:items-center md:pb-0">
              <div className="max-w-7xl mx-auto w-full px-5 sm:px-10 lg:px-16">
                <div className="max-w-xl space-y-2 md:space-y-4 text-white">
                  <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-xs text-[#e2b13c] text-[8px] md:text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10 shadow-xs">
                    ✦ {slide.badge}
                  </span>

                  <h1 className="font-serif text-lg sm:text-3xl md:text-5xl lg:text-6xl font-black leading-[1.15] drop-shadow-md">
                    {slide.title}
                  </h1>

                  <p className="text-[10px] sm:text-sm md:text-base text-white/80 leading-relaxed font-semibold max-w-xs sm:max-w-md drop-shadow line-clamp-2 sm:line-clamp-none">
                    {slide.subtitle}
                  </p>

                  <div className="pt-1.5 md:pt-2">
                    <Link
                      href={slide.buttonLink}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#e2b13c] hover:bg-[#cfa132] text-[#1b4332] font-black text-[11px] md:text-sm py-2 px-4 md:py-3.5 md:px-8 shadow-md hover:shadow-lg transition-all active:scale-95 hover:-translate-y-0.5"
                    >
                      <span>{slide.buttonText}</span>
                      <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows (Desktop only) */}
      <button
        onClick={handlePrev}
        className="hidden md:flex absolute top-1/2 left-4 -translate-y-1/2 z-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 p-2.5 text-white hover:bg-white hover:text-[#1b4332] shadow-sm hover:shadow transition-all active:scale-90"
        title="Slide Anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={handleNext}
        className="hidden md:flex absolute top-1/2 right-4 -translate-y-1/2 z-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 p-2.5 text-white hover:bg-white hover:text-[#1b4332] shadow-sm hover:shadow transition-all active:scale-90"
        title="Próximo Slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Slide counter + indicator dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`rounded-full transition-all duration-300 ${
              idx === current ? "w-6 h-1.5 bg-[#e2b13c]" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/80"
            }`}
            title={`Slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Slide number overlay top-right (Desktop only) */}
      <div className="hidden md:block absolute top-4 right-16 z-20 text-white/50 text-[10px] font-black uppercase tracking-widest select-none">
        {current + 1} / {slides.length}
      </div>
    </section>
  );
}
