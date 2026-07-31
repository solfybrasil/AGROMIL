"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ImageIcon,
  Plus,
  Trash2,
  Save,
  Eye,
  MoveUp,
  MoveDown,
  RefreshCw,
  CheckCircle,
  Layers,
  Link2,
  Tag,
  Type,
  AlignLeft,
  Palette,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Upload,
  UploadCloud,
  Truck,
  ShieldCheck,
  ArrowRight,
  Play,
} from "lucide-react";
import Link from "next/link";
import { heroStorage } from "@/lib/indexed-db";

/* ── Types ───────────────────────────────────────── */
interface Slide {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  badge: string;
  overlayColor: string;
}

/* ── Image Presets ───────────────────────────────── */
const IMAGE_PRESETS = [
  { label: "✨ Vestidos & Midis", thumb: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop", full: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop" },
  { label: "🧥 Alfaiataria & Linho", thumb: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&auto=format&fit=crop", full: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1920&auto=format&fit=crop" },
  { label: "👜 Bolsas & Acessórios", thumb: "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=400&auto=format&fit=crop", full: "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=1920&auto=format&fit=crop" },
  { label: "👗 Alta Costura", thumb: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop", full: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1920&auto=format&fit=crop" },
  { label: "🍂 Tons Terrosos", thumb: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400&auto=format&fit=crop", full: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1920&auto=format&fit=crop" },
  { label: "🌿 Minimalismo Nude", thumb: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=400&auto=format&fit=crop", full: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1920&auto=format&fit=crop" },
];

/* ── Color Presets ───────────────────────────────── */
const PRESET_COLORS = [
  { label: "Fundo Linho Suave", value: "#F5EFE6" },
  { label: "Preto Obsidiana", value: "#1A1A1A" },
  { label: "Couro Nobre", value: "#2B2620" },
  { label: "Ouro Velho", value: "#8B5E3C" },
  { label: "Nude Terroso", value: "#E5C3B0" },
  { label: "Verde Sálvia", value: "#4A5D4E" },
  { label: "Café Noir", value: "#5C4033" },
];

/* ── Template inicial ───────────────────────────── */
const INITIAL_SLIDES: Slide[] = [
  {
    title: "Eleve Seu Estilo Diário",
    subtitle: "Peças atemporais desenvolvidas para conforto superior, desenhadas para elegância e feitas exclusivamente para você.",
    buttonText: "Comprar Agora",
    buttonLink: "/categoria/vestidos",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop",
    badge: "COLEÇÃO EDITORIAL 2026",
    overlayColor: "#F5EFE6",
  },
  {
    title: "Silhuetas Puramente Minimalistas",
    subtitle: "Descubra o toque nobre da seda e do linho puro em cortes ergonômicos de alta alfaiataria.",
    buttonText: "Ver Coleção",
    buttonLink: "/categoria/conjuntos",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1920&auto=format&fit=crop",
    badge: "LANÇAMENTO DE INVERNO",
    overlayColor: "#F5EFE6",
  },
  {
    title: "Detalhes Que Definem Luxo",
    subtitle: "Bolsas de couro legítimo, calçados artesanais e joias minimalistas para enriquecer cada produção.",
    buttonText: "Ver Acessórios",
    buttonLink: "/categoria/acessorios",
    imageUrl: "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=1920&auto=format&fit=crop",
    badge: "ACESSÓRIOS AUTORAIS",
    overlayColor: "#F5EFE6",
  },
];

function FieldLabel({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-1.5 text-[10px] font-bold text-[#8B5E3C] uppercase tracking-widest mb-1.5">
      {icon && <span>{icon}</span>}
      {children}
    </label>
  );
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <div className="h-px flex-1 bg-[#EDE3D3]" />
      <span className="text-[9px] font-bold text-[#8B5E3C] uppercase tracking-widest">{title}</span>
      <div className="h-px flex-1 bg-[#EDE3D3]" />
    </div>
  );
}

export default function AdminHeroPage() {
  const [slides, setSlides] = useState<Slide[]>(INITIAL_SLIDES);
  const [hydrated, setHydrated] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [editingIdx, setEditingIdx] = useState<number>(0);
  const [imageMode, setImageMode] = useState<"upload" | "grid" | "url">("upload");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* Load from heroStorage after hydration */
  useEffect(() => {
    setHydrated(true);
    const loadStored = async () => {
      const stored = await heroStorage.getSlides();
      if (stored && Array.isArray(stored) && stored.length > 0) {
        setSlides(stored);
      }
    };
    loadStored();
  }, []);

  const safePreviewIdx = Math.min(previewIdx, slides.length - 1);
  const safeEditingIdx = Math.min(editingIdx, slides.length - 1);
  const activeSlide = slides[safePreviewIdx] ?? slides[0];
  const editSlide = slides[safeEditingIdx];

  /* ── Handlers ── */
  const broadcastChange = (updatedSlides: Slide[]) => {
    try {
      heroStorage.setSlides(updatedSlides);
      window.dispatchEvent(new Event("siluet_hero_updated"));
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("siluet_hero_channel");
        bc.postMessage({ type: "HERO_UPDATED", slides: updatedSlides });
        bc.close();
      }
    } catch {}
  };

  const handleSave = async () => {
    setSaving(true);
    await heroStorage.setSlides(slides);
    broadcastChange(slides);
    await new Promise((r) => setTimeout(r, 200));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm("Restaurar slides originais da coleção? As edições salvas serão removidas.")) {
      try {
        localStorage.removeItem("siluet_hero_slides");
        localStorage.removeItem("agromil_hero_slides");
      } catch {}
      setSlides([...INITIAL_SLIDES]);
      setEditingIdx(0);
      setPreviewIdx(0);
      broadcastChange([...INITIAL_SLIDES]);
    }
  };

  const handleAdd = () => {
    const newSlide: Slide = {
      title: "Novo Banner Editorial",
      subtitle: "Adicione uma descrição marcante para valorizar a nova coleção do seu atelier.",
      buttonText: "Comprar Agora",
      buttonLink: "/categoria/vestidos",
      imageUrl: IMAGE_PRESETS[0].full,
      badge: "NOVA COLEÇÃO 2026",
      overlayColor: "#F5EFE6",
    };
    const updated = [...slides, newSlide];
    setSlides(updated);
    setEditingIdx(updated.length - 1);
    setPreviewIdx(updated.length - 1);
    broadcastChange(updated);
  };

  const handleDelete = (idx: number) => {
    if (slides.length <= 1) {
      alert("O hero deve ter pelo menos 1 slide.");
      return;
    }
    const updated = slides.filter((_, i) => i !== idx);
    setSlides(updated);
    const next = Math.max(0, idx - 1);
    setEditingIdx(next);
    setPreviewIdx(next);
    broadcastChange(updated);
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const s = [...slides];
    [s[idx - 1], s[idx]] = [s[idx], s[idx - 1]];
    setSlides(s);
    setEditingIdx(idx - 1);
    setPreviewIdx(idx - 1);
    broadcastChange(s);
  };

  const handleMoveDown = (idx: number) => {
    if (idx === slides.length - 1) return;
    const s = [...slides];
    [s[idx + 1], s[idx]] = [s[idx], s[idx + 1]];
    setSlides(s);
    setEditingIdx(idx + 1);
    setPreviewIdx(idx + 1);
    broadcastChange(s);
  };

  const updateSlide = (field: keyof Slide, value: string) => {
    const s = [...slides];
    s[safeEditingIdx] = { ...s[safeEditingIdx], [field]: value };
    setSlides(s);
    setPreviewIdx(safeEditingIdx);
    broadcastChange(s);
  };

  const [isDragging, setIsDragging] = useState(false);

  /* Compression Helper */
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1600;
          const MAX_HEIGHT = 900;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.82));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  /* Upload do PC */
  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecione um arquivo de imagem válido (JPG, PNG, WEBP).");
      return;
    }

    try {
      const compressed = await compressImage(file);
      updateSlide("imageUrl", compressed);
    } catch {
      alert("Erro ao ler arquivo de imagem.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <div className="animate-spin rounded-full h-7 w-7 border-4 border-[#8B5E3C] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 animate-fade-in-up">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EDE3D3] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-[#1A1A1A] text-[#EDE3D3] p-2 rounded-xl">
              <Layers className="h-5 w-5" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#1A1A1A] tracking-tight">Editor do Hero Principal</h1>
          </div>
          <p className="text-xs text-[#7A6F63] font-medium ml-10">
            Edite e pré-visualize o banner principal da loja exatamente como os clientes verão no site.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 border border-[#EDE3D3] bg-white hover:bg-[#F5EFE6] text-[#7A6F63] font-semibold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Restaurar Padrão
          </button>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 border border-[#8B5E3C]/30 text-[#8B5E3C] font-semibold text-xs py-2.5 px-4 rounded-xl transition-all hover:bg-[#8B5E3C]/10"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver Loja
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`inline-flex items-center gap-2 font-semibold text-xs py-2.5 px-6 rounded-xl shadow-sm transition-all cursor-pointer ${
              saved ? "bg-emerald-600 text-white" : "bg-[#1A1A1A] hover:bg-[#8B5E3C] text-white"
            }`}
          >
            {saving ? (
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
            ) : saved ? (
              <CheckCircle className="h-3.5 w-3.5" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {saving ? "Salvando…" : saved ? "Salvo no Site!" : "Salvar no Site"}
          </button>
        </div>
      </div>

      {/* ── 1:1 EXACT HOMEPAGE HERO LIVE PREVIEW ── */}
      <div className="bg-white border border-[#EDE3D3] rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#8B5E3C] uppercase tracking-widest flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            Pré-Visualização Fiel ao Site — Slide {safePreviewIdx + 1} de {slides.length}
          </span>
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { setPreviewIdx(i); setEditingIdx(i); }}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  i === safePreviewIdx ? "w-6 h-2 bg-[#1A1A1A]" : "w-2 h-2 bg-[#EDE3D3] hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Real Homepage Hero Container Preview */}
        {activeSlide ? (
          <div className="relative w-full h-[420px] sm:h-[480px] lg:h-[520px] bg-[#2B2620] overflow-hidden rounded-2xl border border-[#EDE3D3] select-none">
            {/* Background Image */}
            {activeSlide.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeSlide.imageUrl}
                alt={activeSlide.title || "Slide"}
                className="absolute inset-0 w-full h-full filter brightness-95 transition-all duration-300"
                style={{
                  objectFit: (activeSlide as any).imageFit || "cover",
                  objectPosition: (activeSlide as any).imagePosition || "top",
                }}
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }}
              />
            )}

            {/* Gradient Overlay Matching HeroSlider.tsx */}
            <div
              className="absolute inset-0 transition-all duration-500 z-10"
              style={{
                background: `linear-gradient(to right, ${activeSlide.overlayColor || "#F5EFE6"} 0%, ${activeSlide.overlayColor || "#F5EFE6"}e6 45%, transparent 100%)`,
              }}
            />

            {/* Right Edge Step Indicators */}
            <div className="absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-20">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => { setPreviewIdx(idx); setEditingIdx(idx); }}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <span className={`text-[10px] font-mono font-semibold ${idx === safePreviewIdx ? "text-[#1A1A1A] font-bold" : "text-gray-400"}`}>
                    0{idx + 1}
                  </span>
                  <div className={`w-0.5 mt-1 transition-all ${idx === safePreviewIdx ? "h-6 bg-[#1A1A1A]" : "h-2 bg-gray-300"}`} />
                </button>
              ))}
            </div>

            {/* Hero Text Overlay Content */}
            <div className="relative max-w-[1440px] mx-auto h-full px-6 sm:px-10 flex flex-col justify-between py-8 lg:py-10 z-20">
              
              <div className="max-w-md my-auto space-y-4 pt-2">
                {activeSlide.badge && (
                  <div className="inline-flex items-center gap-2 bg-[#EDE3D3]/80 backdrop-blur-sm text-[#8B5E3C] text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full border border-[#8B5E3C]/20">
                    <Sparkles className="h-3 w-3" />
                    <span>{activeSlide.badge}</span>
                  </div>
                )}

                <div>
                  <span className="font-script text-2xl sm:text-3xl text-[#8B5E3C] block capitalize font-normal leading-none mb-1">
                    Atelier & Moda Exclusiva
                  </span>
                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#2B2620] leading-[1.1] tracking-tight">
                    {activeSlide.title || "Título do Banner..."}
                  </h1>
                </div>

                <p className="text-xs sm:text-sm text-[#7A6F63] leading-relaxed font-normal">
                  {activeSlide.subtitle || "Subtítulo da coleção..."}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <span className="inline-flex items-center justify-center gap-2 bg-[#1A1A1A] text-white font-medium text-xs py-3 px-6 rounded-none shadow-md">
                    <span>{activeSlide.buttonText || "Comprar Agora"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                  <span className="inline-flex items-center justify-center gap-2 bg-white/60 text-[#2B2620] font-medium text-xs py-3 px-5 rounded-none border border-[#2B2620]/30 backdrop-blur-sm shadow-sm">
                    <Play className="h-3 w-3 fill-[#2B2620]" />
                    <span>Ver Lookbook</span>
                  </span>
                </div>
              </div>

              {/* Bottom Trust Badges Bar */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#2B2620]/10 max-w-md">
                <div className="flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5 text-[#8B5E3C] flex-shrink-0" />
                  <div>
                    <h5 className="text-[10px] font-semibold text-[#2B2620]">Frete Grátis</h5>
                    <p className="text-[8px] text-[#7A6F63]">Acima de R$ 299</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 text-[#8B5E3C] flex-shrink-0" />
                  <div>
                    <h5 className="text-[10px] font-semibold text-[#2B2620]">Troca Fácil</h5>
                    <p className="text-[8px] text-[#7A6F63]">30 dias corridos</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#8B5E3C] flex-shrink-0" />
                  <div>
                    <h5 className="text-[10px] font-semibold text-[#2B2620]">Pagamento Seguro</h5>
                    <p className="text-[8px] text-[#7A6F63]">Pix 5% OFF</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-gray-300 gap-2">
            <ImageIcon className="h-8 w-8 opacity-30" />
            <p className="text-xs font-bold uppercase tracking-wider">Nenhum slide cadastrado</p>
          </div>
        )}
      </div>

      {/* ── Slide List & Form Editor ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT: Slide Selector */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#8B5E3C] uppercase tracking-widest">
              Banners Cadastrados ({slides.length})
            </span>
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-1 text-[#8B5E3C] text-xs font-bold hover:bg-[#EDE3D3]/50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Novo Banner
            </button>
          </div>

          <div className="space-y-2">
            {slides.map((slide, idx) => (
              <div
                key={idx}
                onClick={() => { setEditingIdx(idx); setPreviewIdx(idx); }}
                className={`group relative flex items-stretch bg-white border rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 ${
                  safeEditingIdx === idx
                    ? "border-[#1A1A1A] ring-2 ring-[#1A1A1A]/10 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className={`w-1.5 flex-shrink-0 ${safeEditingIdx === idx ? "bg-[#1A1A1A]" : "bg-transparent"}`} />

                {/* Thumbnail */}
                <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden bg-gray-100">
                  {slide.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={slide.imageUrl}
                      alt={slide.title || "Slide"}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 text-white text-[8px] font-bold bg-black/60 px-1 rounded">
                    {idx + 1}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 px-3 py-2 min-w-0 flex flex-col justify-center">
                  <p className="text-xs font-bold text-[#1A1A1A] truncate">
                    {slide.title || <span className="text-gray-300 italic">Sem título</span>}
                  </p>
                  <p className="text-[9px] text-[#7A6F63] font-medium truncate mt-0.5">
                    {slide.badge || slide.buttonLink || "—"}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center justify-center gap-1 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMoveUp(idx); }}
                    disabled={idx === 0}
                    className="p-1 text-gray-400 hover:text-[#1A1A1A] disabled:opacity-20 cursor-pointer"
                  >
                    <MoveUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMoveDown(idx); }}
                    disabled={idx === slides.length - 1}
                    className="p-1 text-gray-400 hover:text-[#1A1A1A] disabled:opacity-20 cursor-pointer"
                  >
                    <MoveDown className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(idx); }}
                    className="p-1 text-gray-300 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Detailed Form Editor */}
        {editSlide ? (
          <div className="lg:col-span-8">
            <div className="bg-white border border-[#EDE3D3] rounded-3xl p-6 shadow-sm space-y-5">

              <div className="flex items-center gap-3">
                <div className="bg-[#1A1A1A] text-white rounded-xl w-8 h-8 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  0{safeEditingIdx + 1}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1A1A]">Editando Banner {safeEditingIdx + 1}</h3>
                  <p className="text-[10px] text-[#7A6F63]">Altere o texto, imagem do PC ou cor de fundo abaixo</p>
                </div>
              </div>

              {/* Section: Imagem */}
              <SectionDivider title="Imagem do Banner" />

              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setImageMode("upload")}
                    className={`text-[10px] font-bold px-4 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                      imageMode === "upload" ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-gray-50 text-[#7A6F63] border-gray-200"
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    📁 Enviar do Computador
                  </button>
                  <button
                    onClick={() => setImageMode("grid")}
                    className={`text-[10px] font-bold px-4 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                      imageMode === "grid" ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-gray-50 text-[#7A6F63] border-gray-200"
                    }`}
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    📷 Galeria Atelier
                  </button>
                  <button
                    onClick={() => setImageMode("url")}
                    className={`text-[10px] font-bold px-4 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                      imageMode === "url" ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-gray-50 text-[#7A6F63] border-gray-200"
                    }`}
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    🔗 URL Externa
                  </button>
                </div>

                {imageMode === "upload" && (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all space-y-2 group ${
                        isDragging
                          ? "border-[#1A1A1A] bg-[#EDE3D3] scale-[1.02] shadow-md"
                          : "border-[#8B5E3C]/30 hover:border-[#8B5E3C] bg-[#F5EFE6]/50 hover:bg-[#F5EFE6]"
                      }`}
                    >
                      <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                        <UploadCloud className={`h-7 w-7 ${isDragging ? "text-[#1A1A1A]" : "text-[#8B5E3C]"}`} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1A1A1A]">
                          {isDragging ? "Solte a imagem aqui para enviar!" : "Arraste e solte a imagem aqui ou clique para escolher do PC"}
                        </p>
                        <p className="text-[10px] text-[#7A6F63] mt-0.5">Suporta imagens JPG, PNG, WEBP de alta resolução (até 10MB)</p>
                      </div>
                    </div>
                  </div>
                )}

                {imageMode === "grid" && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {IMAGE_PRESETS.map((img) => (
                      <button
                        key={img.full}
                        onClick={() => updateSlide("imageUrl", img.full)}
                        className={`group relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                          editSlide.imageUrl === img.full ? "border-[#1A1A1A] scale-[0.96]" : "border-transparent hover:scale-[0.96]"
                        }`}
                        style={{ aspectRatio: "1" }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.thumb} alt={img.label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                          <span className="text-white text-[8px] font-bold leading-tight truncate">{img.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {imageMode === "url" && (
                  <div>
                    <FieldLabel icon={<ImageIcon className="h-3 w-3" />}>Link Direto da Imagem</FieldLabel>
                    <input
                      type="text"
                      value={editSlide.imageUrl}
                      onChange={(e) => updateSlide("imageUrl", e.target.value)}
                      className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 font-mono"
                      placeholder="https://..."
                    />
                  </div>
                )}

                {/* Controles de Ajuste de Imagem (Enquadramento e Foco) */}
                <div className="bg-[#F5EFE6]/60 border border-[#EDE3D3] rounded-2xl p-3.5 space-y-3 mt-3">
                  <div>
                    <FieldLabel icon={<ImageIcon className="h-3 w-3" />}>Alinhamento do Foco (Rosto / Corpo)</FieldLabel>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {[
                        { label: "⬆️ Topo (Rosto)", val: "top" },
                        { label: "🎯 Centro (Corpo)", val: "center" },
                        { label: "⬇️ Base (Pés)", val: "bottom" },
                        { label: "⬅️ Esquerda", val: "left" },
                        { label: "➡️ Direita", val: "right" },
                      ].map((pos) => (
                        <button
                          key={pos.val}
                          type="button"
                          onClick={() => updateSlide("imagePosition" as any, pos.val)}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                            ((editSlide as any).imagePosition || "top") === pos.val
                              ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                              : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Modo de Preenchimento</FieldLabel>
                    <div className="flex gap-1.5 mt-1">
                      {[
                        { label: "🖼️ Preencher (Cover)", val: "cover" },
                        { label: "📐 Inteira sem corte (Contain)", val: "contain" },
                      ].map((fit) => (
                        <button
                          key={fit.val}
                          type="button"
                          onClick={() => updateSlide("imageFit" as any, fit.val)}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                            ((editSlide as any).imageFit || "cover") === fit.val
                              ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                              : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {fit.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Textos */}
              <SectionDivider title="Textos do Banner" />

              <div className="space-y-4">
                <div>
                  <FieldLabel icon={<Type className="h-3 w-3" />}>Título Principal</FieldLabel>
                  <input
                    type="text"
                    value={editSlide.title}
                    onChange={(e) => updateSlide("title", e.target.value)}
                    maxLength={60}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20"
                    placeholder="Ex: Eleve Seu Estilo Diário"
                  />
                </div>

                <div>
                  <FieldLabel icon={<AlignLeft className="h-3 w-3" />}>Subtítulo / Descrição</FieldLabel>
                  <textarea
                    value={editSlide.subtitle}
                    onChange={(e) => updateSlide("subtitle", e.target.value)}
                    maxLength={160}
                    rows={2}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 resize-none"
                    placeholder="Descrição da coleção..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel icon={<Tag className="h-3 w-3" />}>Etiqueta / Badge</FieldLabel>
                    <input
                      type="text"
                      value={editSlide.badge}
                      onChange={(e) => updateSlide("badge", e.target.value)}
                      className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20"
                      placeholder="COLEÇÃO EDITORIAL 2026"
                    />
                  </div>
                  <div>
                    <FieldLabel icon={<Sparkles className="h-3 w-3" />}>Texto do Botão Principal</FieldLabel>
                    <input
                      type="text"
                      value={editSlide.buttonText}
                      onChange={(e) => updateSlide("buttonText", e.target.value)}
                      className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20"
                      placeholder="Comprar Agora"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel icon={<Link2 className="h-3 w-3" />}>Link de Destino do Botão</FieldLabel>
                  <input
                    type="text"
                    value={editSlide.buttonLink}
                    onChange={(e) => updateSlide("buttonLink", e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20"
                    placeholder="/categoria/vestidos"
                  />
                </div>
              </div>

              {/* Section: Cor do Gradiente */}
              <SectionDivider title="Cor de Fundo / Gradiente" />

              <div className="flex flex-wrap gap-3 items-center">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.value}
                    title={c.label}
                    onClick={() => updateSlide("overlayColor", c.value)}
                    className={`relative w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                      editSlide.overlayColor === c.value ? "scale-110 border-[#1A1A1A] ring-2 ring-black/20" : "border-gray-200 hover:scale-105"
                    }`}
                    style={{ background: c.value }}
                  />
                ))}
                <div className="relative flex items-center gap-2">
                  <input
                    type="color"
                    value={editSlide.overlayColor}
                    onChange={(e) => updateSlide("overlayColor", e.target.value)}
                    className="w-8 h-8 rounded-full border border-gray-300 cursor-pointer p-0 overflow-hidden bg-white"
                  />
                  <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border">
                    {editSlide.overlayColor}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#F5EFE6] border border-[#8B5E3C]/20 rounded-2xl p-4 text-[#8B5E3C]">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-[10px] font-semibold leading-relaxed">
                  Após fazer as alterações ou subir sua foto do computador, clique em <strong>"Salvar no Site"</strong> no topo para publicar na página inicial.
                </p>
              </div>

            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
}
