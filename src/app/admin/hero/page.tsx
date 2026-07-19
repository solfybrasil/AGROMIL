"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import Link from "next/link";

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
  { label: "🌿 Jardinagem", thumb: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=400&auto=format&fit=crop", full: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1600&auto=format&fit=crop" },
  { label: "🐾 Pet Shop", thumb: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400&auto=format&fit=crop", full: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1600&auto=format&fit=crop" },
  { label: "🔧 Ferramentas", thumb: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=400&auto=format&fit=crop", full: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=1600&auto=format&fit=crop" },
  { label: "🌾 Campo", thumb: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400&auto=format&fit=crop", full: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop" },
  { label: "🥦 Horta", thumb: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=400&auto=format&fit=crop", full: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1600&auto=format&fit=crop" },
  { label: "🐴 Cavalos", thumb: "https://images.unsplash.com/photo-1534307671554-9a6d81f4d629?q=80&w=400&auto=format&fit=crop", full: "https://images.unsplash.com/photo-1534307671554-9a6d81f4d629?q=80&w=1600&auto=format&fit=crop" },
  { label: "💧 Irrigação", thumb: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=400&auto=format&fit=crop", full: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=1600&auto=format&fit=crop" },
  { label: "🐄 Gado", thumb: "https://images.unsplash.com/photo-1510177598631-55a4ab0a5cdb?q=80&w=400&auto=format&fit=crop", full: "https://images.unsplash.com/photo-1510177598631-55a4ab0a5cdb?q=80&w=1600&auto=format&fit=crop" },
];

/* ── Color Presets ───────────────────────────────── */
const PRESET_COLORS = [
  { label: "Verde Floresta", value: "#1b4332" },
  { label: "Verde Médio", value: "#2d6a4f" },
  { label: "Verde Noite", value: "#1a2f23" },
  { label: "Teal Escuro", value: "#134e4a" },
  { label: "Marrom Rural", value: "#7c2d12" },
  { label: "Âmbar Campo", value: "#92400e" },
  { label: "Azul Petróleo", value: "#1e3a5f" },
  { label: "Grafite", value: "#1f2937" },
];

/* ── Template inicial (editor visual) ───────────── */
const INITIAL_SLIDES: Slide[] = [
  {
    title: "Bem-vindo ao Editor de Slides",
    subtitle: "Personalize os slides do banner principal da sua loja. Clique em um slide para editar.",
    buttonText: "Ver Produtos",
    buttonLink: "/",
    imageUrl: IMAGE_PRESETS[0].full,
    badge: "Novo",
    overlayColor: "#1b4332",
  },
];

/* ── Sub-components ──────────────────────────────── */
function FieldLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
      <span className="text-primary/60">{icon}</span>
      {children}
    </label>
  );
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <div className="h-px flex-1 bg-gray-100" />
      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{title}</span>
      <div className="h-px flex-1 bg-gray-100" />
    </div>
  );
}

/* ── Main Component ──────────────────────────────── */
export default function AdminHeroPage() {
  const [slides, setSlides] = useState<Slide[]>(INITIAL_SLIDES);
  const [hydrated, setHydrated] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [editingIdx, setEditingIdx] = useState<number>(0);
  const [imageMode, setImageMode] = useState<"url" | "grid">("grid");
  const [saving, setSaving] = useState(false);

  /* Load from localStorage after hydration */
  useEffect(() => {
    setHydrated(true);
    try {
      const stored = localStorage.getItem("agromil_hero_slides");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSlides(parsed);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const safePreviewIdx = Math.min(previewIdx, slides.length - 1);
  const safeEditingIdx = Math.min(editingIdx, slides.length - 1);
  const activeSlide = slides[safePreviewIdx] ?? slides[0];
  const editSlide = slides[safeEditingIdx];

  /* ── Handlers ── */
  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    try {
      localStorage.setItem("agromil_hero_slides", JSON.stringify(slides));
    } catch {}
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm("Restaurar slides de exemplo? As edições salvas serão removidas.")) {
      try { localStorage.removeItem("agromil_hero_slides"); } catch {}
      setSlides([...INITIAL_SLIDES]);
      setEditingIdx(0);
      setPreviewIdx(0);
    }
  };

  const handleAdd = () => {
    const newSlide: Slide = {
      title: "Novo Slide",
      subtitle: "Adicione uma descrição atrativa para este slide.",
      buttonText: "Ver Produtos",
      buttonLink: "/",
      imageUrl: IMAGE_PRESETS[0].full,
      badge: "Novidade",
      overlayColor: "#1b4332",
    };
    const updated = [...slides, newSlide];
    setSlides(updated);
    setEditingIdx(updated.length - 1);
    setPreviewIdx(updated.length - 1);
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
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const s = [...slides];
    [s[idx - 1], s[idx]] = [s[idx], s[idx - 1]];
    setSlides(s);
    setEditingIdx(idx - 1);
    setPreviewIdx(idx - 1);
  };

  const handleMoveDown = (idx: number) => {
    if (idx === slides.length - 1) return;
    const s = [...slides];
    [s[idx + 1], s[idx]] = [s[idx], s[idx + 1]];
    setSlides(s);
    setEditingIdx(idx + 1);
    setPreviewIdx(idx + 1);
  };

  const updateSlide = (field: keyof Slide, value: string) => {
    const s = [...slides];
    s[safeEditingIdx] = { ...s[safeEditingIdx], [field]: value };
    setSlides(s);
    setPreviewIdx(safeEditingIdx);
  };

  /* ── Render ── */
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <div className="animate-spin rounded-full h-7 w-7 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 animate-fade-in-up">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="bg-primary/10 border border-primary/20 text-primary rounded-xl p-1.5">
              <Layers className="h-4 w-4" />
            </div>
            <h1 className="font-serif text-2xl font-extrabold text-[#1b4332] tracking-tight">Editor do Hero Slider</h1>
          </div>
          <p className="text-xs text-gray-400 font-semibold ml-9">
            Personalize o banner principal da loja. Salve para aplicar no site.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-500 font-bold text-xs py-2.5 px-4 rounded-2xl transition-all cursor-pointer hover-lift active-pop"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Restaurar
          </button>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 border border-primary/30 text-primary font-bold text-xs py-2.5 px-4 rounded-2xl transition-all hover:bg-primary/5 hover-lift"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver Site
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`inline-flex items-center gap-1.5 font-extrabold text-xs py-2.5 px-5 rounded-2xl shadow-sm transition-all active:scale-95 cursor-pointer hover-lift ${
              saved ? "bg-emerald-500 text-white" : "bg-primary hover:bg-[#122e22] text-white"
            }`}
          >
            {saving ? (
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
            ) : saved ? (
              <CheckCircle className="h-3.5 w-3.5" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {saving ? "Salvando…" : saved ? "Salvo!" : "Salvar Alterações"}
          </button>
        </div>
      </div>

      {/* ── Live Preview ── */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <Eye className="h-3 w-3" />
            Pré-visualização — Slide {safePreviewIdx + 1} de {slides.length}
          </span>
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { setPreviewIdx(i); setEditingIdx(i); }}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  i === safePreviewIdx ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-gray-200 hover:bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {activeSlide ? (
          <div
            className="relative w-full rounded-2xl overflow-hidden"
            style={{ height: "280px", background: activeSlide.overlayColor }}
          >
            {/* Background image */}
            {activeSlide.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeSlide.imageUrl}
                alt={activeSlide.title || "Slide"}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
              />
            )}

            {/* Left-to-right gradient overlay */}
            <div
              className="absolute inset-0 transition-all duration-500"
              style={{
                background: `linear-gradient(to right, ${activeSlide.overlayColor}f0 0%, ${activeSlide.overlayColor}99 55%, transparent 100%)`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center px-10">
              <div className="text-white space-y-2.5 max-w-sm">
                {activeSlide.badge && (
                  <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-sm text-[#e2b13c] text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-white/15">
                    <Sparkles className="h-2.5 w-2.5" />
                    {activeSlide.badge}
                  </span>
                )}
                <h2 className="font-serif text-2xl font-black leading-tight drop-shadow-sm">
                  {activeSlide.title || <span className="opacity-40 italic">Título do slide…</span>}
                </h2>
                <p className="text-[11px] text-white/80 leading-relaxed">
                  {activeSlide.subtitle || <span className="opacity-40 italic">Subtítulo…</span>}
                </p>
                {activeSlide.buttonText && (
                  <span className="inline-block bg-[#e2b13c] text-[#1b4332] font-extrabold text-[10px] py-2 px-5 rounded-full shadow">
                    {activeSlide.buttonText} →
                  </span>
                )}
              </div>
            </div>

            {/* Slide number badge */}
            <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm text-white/80 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              Slide {safePreviewIdx + 1}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-gray-300 gap-2">
            <ImageIcon className="h-8 w-8 opacity-30" />
            <p className="text-xs font-black uppercase tracking-wider">Nenhum slide</p>
          </div>
        )}
      </div>

      {/* ── Main Layout: Slide List + Editor ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT: Slide Deck */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
              Slides ({slides.length})
            </span>
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-1 text-primary text-[10px] font-extrabold hover:bg-primary/5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer hover-lift active-pop"
            >
              <Plus className="h-3.5 w-3.5" />
              Novo slide
            </button>
          </div>

          <div className="space-y-2">
            {slides.map((slide, idx) => (
              <div
                key={idx}
                onClick={() => { setEditingIdx(idx); setPreviewIdx(idx); }}
                className={`group relative flex items-stretch bg-white border rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 ${
                  safeEditingIdx === idx
                    ? "border-primary ring-2 ring-primary/20 shadow-md"
                    : "border-gray-100 hover:border-gray-200 shadow-xs hover:shadow-sm"
                }`}
              >
                {/* Active accent */}
                <div className={`w-1 flex-shrink-0 transition-colors duration-200 ${safeEditingIdx === idx ? "bg-primary" : "bg-transparent"}`} />

                {/* Thumbnail */}
                <div className="relative w-16 h-14 flex-shrink-0 overflow-hidden">
                  {slide.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={slide.imageUrl}
                      alt={slide.title || "Slide"}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0" style={{ background: `${slide.overlayColor}bb` }} />
                  <span className="absolute bottom-1 right-1 text-white text-[8px] font-black bg-black/30 px-1 rounded">
                    {idx + 1}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 px-3 py-2.5 min-w-0">
                  <p className="text-[11px] font-black text-gray-800 truncate">
                    {slide.title || <span className="text-gray-300 italic">Sem título</span>}
                  </p>
                  <p className="text-[9px] text-gray-400 font-semibold truncate mt-0.5">
                    {slide.badge || slide.buttonLink || "—"}
                  </p>
                </div>

                {/* Reorder + Delete (show on hover) */}
                <div className="flex flex-col items-center justify-center gap-0.5 pr-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMoveUp(idx); }}
                    disabled={idx === 0}
                    className="p-1 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-50 disabled:opacity-20 cursor-pointer transition-all"
                    title="Mover para cima"
                  >
                    <MoveUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMoveDown(idx); }}
                    disabled={idx === slides.length - 1}
                    className="p-1 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-50 disabled:opacity-20 cursor-pointer transition-all"
                    title="Mover para baixo"
                  >
                    <MoveDown className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(idx); }}
                    className="p-1 rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 cursor-pointer transition-all"
                    title="Excluir slide"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 space-y-1.5 mt-4">
            <p className="text-[9px] font-black text-primary uppercase tracking-widest">💡 Dicas</p>
            <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
              • Use títulos curtos e diretos (até 40 caracteres).<br />
              • Escolha imagens com boa iluminação.<br />
              • Clique em <strong>Salvar Alterações</strong> para aplicar no site.<br />
              • Os slides são salvos no navegador e carregados na homepage.
            </p>
          </div>
        </div>

        {/* RIGHT: Editor Panel */}
        {editSlide ? (
          <div className="lg:col-span-8">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-5">

              {/* Editor header */}
              <div className="flex items-center gap-2">
                <div className="bg-primary text-white rounded-xl w-7 h-7 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                  {safeEditingIdx + 1}
                </div>
                <div>
                  <h3 className="text-xs font-black text-gray-800">Editando Slide {safeEditingIdx + 1}</h3>
                  <p className="text-[9px] text-gray-400 font-semibold">As alterações são refletidas na pré-visualização acima em tempo real</p>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Section: Conteúdo */}
              <SectionDivider title="Conteúdo do Slide" />

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <FieldLabel icon={<Type className="h-3 w-3" />}>Título Principal</FieldLabel>
                  <div className="relative">
                    <input
                      type="text"
                      value={editSlide.title}
                      onChange={(e) => updateSlide("title", e.target.value)}
                      maxLength={60}
                      className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-14"
                      placeholder="Ex: Festival de Jardinagem"
                    />
                    <span className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black tabular-nums ${editSlide.title.length > 50 ? "text-amber-500" : "text-gray-300"}`}>
                      {editSlide.title.length}/60
                    </span>
                  </div>
                </div>

                {/* Subtitle */}
                <div>
                  <FieldLabel icon={<AlignLeft className="h-3 w-3" />}>Subtítulo</FieldLabel>
                  <div className="relative">
                    <textarea
                      value={editSlide.subtitle}
                      onChange={(e) => updateSlide("subtitle", e.target.value)}
                      maxLength={140}
                      rows={2}
                      className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
                      placeholder="Descrição curta e objetiva do slide..."
                    />
                    <span className={`absolute right-3 bottom-2 text-[9px] font-black tabular-nums ${editSlide.subtitle.length > 120 ? "text-amber-500" : "text-gray-300"}`}>
                      {editSlide.subtitle.length}/140
                    </span>
                  </div>
                </div>

                {/* Badge + Button side by side */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel icon={<Tag className="h-3 w-3" />}>Badge / Etiqueta</FieldLabel>
                    <input
                      type="text"
                      value={editSlide.badge}
                      onChange={(e) => updateSlide("badge", e.target.value)}
                      maxLength={25}
                      className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="Ex: Oferta Especial"
                    />
                  </div>
                  <div>
                    <FieldLabel icon={<Sparkles className="h-3 w-3" />}>Texto do Botão</FieldLabel>
                    <input
                      type="text"
                      value={editSlide.buttonText}
                      onChange={(e) => updateSlide("buttonText", e.target.value)}
                      maxLength={30}
                      className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="Ex: Ver Promoções"
                    />
                  </div>
                </div>

                {/* Button link */}
                <div>
                  <FieldLabel icon={<Link2 className="h-3 w-3" />}>Link do Botão (URL)</FieldLabel>
                  <input
                    type="text"
                    value={editSlide.buttonLink}
                    onChange={(e) => updateSlide("buttonLink", e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                    placeholder="/categoria/jardinagem"
                  />
                </div>
              </div>

              {/* Section: Imagem */}
              <SectionDivider title="Imagem de Fundo" />

              <div className="space-y-3">
                {/* Mode toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setImageMode("grid")}
                    className={`text-[10px] font-black px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${imageMode === "grid" ? "bg-primary text-white border-primary" : "bg-gray-50 text-gray-500 border-gray-200 hover:border-primary/40"}`}
                  >
                    📷 Galeria
                  </button>
                  <button
                    onClick={() => setImageMode("url")}
                    className={`text-[10px] font-black px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${imageMode === "url" ? "bg-primary text-white border-primary" : "bg-gray-50 text-gray-500 border-gray-200 hover:border-primary/40"}`}
                  >
                    🔗 URL Personalizada
                  </button>
                </div>

                {imageMode === "grid" ? (
                  <div className="grid grid-cols-4 gap-2">
                    {IMAGE_PRESETS.map((img) => (
                      <button
                        key={img.full}
                        onClick={() => updateSlide("imageUrl", img.full)}
                        className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border-2 ${
                          editSlide.imageUrl === img.full
                            ? "border-primary ring-2 ring-primary/30 scale-[0.97]"
                            : "border-transparent hover:border-primary/40 hover:scale-[0.97]"
                        }`}
                        style={{ aspectRatio: "16/9" }}
                        title={img.label}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.thumb} alt={img.label} className="w-full h-full object-cover" />
                        <div className={`absolute inset-0 bg-black/50 flex items-end p-1.5 transition-opacity ${editSlide.imageUrl === img.full ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                          <span className="text-white text-[8px] font-extrabold leading-tight">{img.label}</span>
                        </div>
                        {editSlide.imageUrl === img.full && (
                          <div className="absolute top-1 right-1 bg-primary rounded-full w-4 h-4 flex items-center justify-center">
                            <CheckCircle className="h-2.5 w-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div>
                    <FieldLabel icon={<ImageIcon className="h-3 w-3" />}>URL da Imagem</FieldLabel>
                    <input
                      type="text"
                      value={editSlide.imageUrl}
                      onChange={(e) => updateSlide("imageUrl", e.target.value)}
                      className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                      placeholder="https://..."
                    />
                    {editSlide.imageUrl && (
                      <div className="mt-2 rounded-xl overflow-hidden h-24 border border-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={editSlide.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Section: Cor do Gradiente */}
              <SectionDivider title="Cor do Gradiente" />

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2.5 items-center">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.value}
                      title={c.label}
                      onClick={() => updateSlide("overlayColor", c.value)}
                      className={`relative w-9 h-9 rounded-full border-2 transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 ${
                        editSlide.overlayColor === c.value
                          ? "border-primary ring-2 ring-primary/30 scale-110"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                      style={{ background: c.value }}
                    >
                      {editSlide.overlayColor === c.value && (
                        <span className="absolute inset-0 flex items-center justify-center text-white text-xs">✓</span>
                      )}
                    </button>
                  ))}

                  <div className="w-px h-8 bg-gray-200" />

                  {/* Custom picker */}
                  <div className="relative">
                    <input
                      type="color"
                      value={editSlide.overlayColor}
                      onChange={(e) => updateSlide("overlayColor", e.target.value)}
                      className="w-9 h-9 rounded-full border-2 border-dashed border-gray-300 cursor-pointer p-0.5 overflow-hidden bg-white"
                      title="Cor personalizada"
                    />
                    <Palette className="absolute -bottom-1 -right-1 h-3 w-3 text-gray-400 pointer-events-none" />
                  </div>

                  <span className="font-mono text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg">
                    {editSlide.overlayColor}
                  </span>
                </div>
              </div>

              {/* Save notice */}
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] font-semibold text-amber-700 leading-relaxed">
                  Clique em <strong>"Salvar Alterações"</strong> no topo da página para aplicar os slides no site.
                </p>
              </div>

            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 flex items-center justify-center py-20 text-gray-300">
            <div className="text-center space-y-2">
              <Layers className="h-10 w-10 opacity-20 mx-auto" />
              <p className="text-xs font-black uppercase tracking-wider">Selecione um slide para editar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
