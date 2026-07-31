"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Megaphone, Edit, Trash2, AlertCircle, CheckCircle, Eye, EyeOff,
  Plus, ImageIcon, Link2, Type, ToggleLeft, ToggleRight, Palette,
  UploadCloud, Save, Sparkles, MoveUp, MoveDown,
} from "lucide-react";
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
  imagePosition?: string;
  imageFit?: string;
  active: boolean;
  displayOrder: number;
}

const DEFAULT_BANNERS: Banner[] = [
  {
    id: "twin-1",
    title: "Fertilizantes & Adubos",
    subtitle: "Nutrição de Alta Performance",
    imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
    linkUrl: "/categoria/jardinagem",
    linkLabel: "Confira a Linha",
    bgColor: "#8B5E3C",
    textColor: "#FFFFFF",
    active: true,
    displayOrder: 1,
  },
  {
    id: "twin-2",
    title: "Rações & Suplementos Pet",
    subtitle: "Saúde e Vitalidade Animal",
    imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80",
    linkUrl: "/categoria/petshop",
    linkLabel: "Ver Promoções",
    bgColor: "#1A1A1A",
    textColor: "#EDE3D3",
    active: true,
    displayOrder: 2,
  },
];

const PRESET_BG = [
  { label: "Ouro Velho", value: "#8B5E3C" },
  { label: "Preto Obsidiana", value: "#1A1A1A" },
  { label: "Couro Nobre", value: "#2B2620" },
  { label: "Verde Sálvia", value: "#2d6a4f" },
  { label: "Linho Claro", value: "#F5EFE6" },
  { label: "Areia Nobre", value: "#EDE3D3" },
];

const PRESET_TEXT = ["#FFFFFF", "#EDE3D3", "#2B2620", "#8B5E3C", "#e2b13c"];

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-[#EDE3D3]" />
      <span className="text-[9px] font-bold text-[#8B5E3C] uppercase tracking-widest">{title}</span>
      <div className="h-px flex-1 bg-[#EDE3D3]" />
    </div>
  );
}

function FieldLabel({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-1.5 text-[10px] font-bold text-[#8B5E3C] uppercase tracking-widest mb-1.5">
      {icon && <span>{icon}</span>}
      {children}
    </label>
  );
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_BANNERS);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errMessage, setErrMessage] = useState("");

  // Form states
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("confira");
  const [bgColor, setBgColor] = useState("#8B5E3C");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [imagePosition, setImagePosition] = useState("right");
  const [imageFit, setImageFit] = useState("cover");
  const [active, setActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const broadcastBanners = (list: Banner[]) => {
    try {
      localStorage.setItem("agromil_banners", JSON.stringify(list));
      window.dispatchEvent(new Event("agromil_banners_updated"));
    } catch {}
  };

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const stored = localStorage.getItem("agromil_banners");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setBanners(parsed);
            setLoading(false);
            return;
          }
        }

        const localBanners = await dbService.getBanners();
        if (localBanners && localBanners.length > 0) {
          setBanners(localBanners as any);
        } else {
          setBanners(DEFAULT_BANNERS);
        }
      } catch {
        setBanners(DEFAULT_BANNERS);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 800;
          let w = img.width, h = img.height;
          if (w > h ? w > MAX_SIZE : h > MAX_SIZE) {
            if (w > h) { h *= MAX_SIZE / w; w = MAX_SIZE; }
            else { w *= MAX_SIZE / h; h = MAX_SIZE; }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      setErrMessage("Apenas imagens são permitidas.");
      return;
    }
    const compressed = await compressImage(file);
    setImageUrl(compressed);
  };

  const resetForm = () => {
    setTitle(""); setSubtitle(""); setImageUrl(""); setLinkUrl("");
    setLinkLabel("Confira"); setBgColor("#8B5E3C"); setTextColor("#FFFFFF");
    setImagePosition("right"); setImageFit("cover"); setActive(true);
    setDisplayOrder(banners.length + 1); setEditingId(null);
    setMessage(""); setErrMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(""); setErrMessage("");

    if (!title.trim()) { setErrMessage("O título do banner é obrigatório."); return; }

    const payload: Banner = {
      id: editingId || `banner-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      imageUrl: imageUrl || null,
      linkUrl: linkUrl.trim() || null,
      linkLabel: linkLabel.trim() || "Confira",
      bgColor,
      textColor,
      imagePosition,
      imageFit,
      active,
      displayOrder: Number(displayOrder || banners.length + 1),
    };

    try {
      let updated = [...banners];
      if (editingId) {
        const idx = updated.findIndex((b) => b.id === editingId);
        if (idx > -1) updated[idx] = payload;
      } else {
        updated.push(payload);
      }

      updated.sort((a, b) => a.displayOrder - b.displayOrder);
      setBanners(updated);
      broadcastBanners(updated);

      const endpoint = editingId ? `/api/banners/${editingId}` : "/api/banners";
      const method = editingId ? "PUT" : "POST";
      await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});

      setMessage(editingId ? "Banner atualizado!" : "Banner cadastrado!");
      resetForm();
    } catch {
      setErrMessage("Erro ao salvar banner.");
    }
  };

  const handleEdit = (b: Banner) => {
    setEditingId(b.id);
    setTitle(b.title);
    setSubtitle(b.subtitle || "");
    setImageUrl(b.imageUrl || "");
    setLinkUrl(b.linkUrl || "");
    setLinkLabel(b.linkLabel || "Confira");
    setBgColor(b.bgColor);
    setTextColor(b.textColor);
    setImagePosition(b.imagePosition || "right");
    setImageFit(b.imageFit || "cover");
    setActive(b.active);
    setDisplayOrder(b.displayOrder);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este banner?")) return;
    const updated = banners.filter((b) => b.id !== id);
    setBanners(updated);
    broadcastBanners(updated);
    await fetch(`/api/banners/${id}`, { method: "DELETE" }).catch(() => {});
    setMessage("Banner removido com sucesso.");
  };

  const toggleActive = async (id: string, current: boolean) => {
    const updated = banners.map((b) => (b.id === id ? { ...b, active: !current } : b));
    setBanners(updated);
    broadcastBanners(updated);
  };

  return (
    <div className="space-y-6 font-sans text-[#2B2620] animate-fade-in-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#EDE3D3] shadow-xs">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-[#8B5E3C] bg-[#8B5E3C]/10 px-2.5 py-0.5 rounded-full border border-[#8B5E3C]/20">
            Curadoria Visual
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#2B2620] tracking-tight mt-0.5">
            Banners Promocionais
          </h1>
          <p className="text-xs text-[#7A6F63] font-medium mt-0.5">
            Gerencie os cartões promocionais da página inicial com pré-visualização ao vivo.
          </p>
        </div>
        <button onClick={resetForm}
          className="inline-flex items-center gap-2 bg-[#8B5E3C] hover:bg-[#6d482d] text-white font-black text-xs py-3 px-5 rounded-2xl shadow-md shadow-[#8B5E3C]/20 transition-all uppercase tracking-wider cursor-pointer self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Novo Banner
        </button>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-2 text-xs font-semibold">
          <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {errMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center gap-2 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
          <span>{errMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Form Panel */}
        <div className="bg-white border border-[#EDE3D3] rounded-3xl p-6 shadow-xs space-y-5">
          <h2 className="text-xs font-black text-[#2B2620] uppercase tracking-widest border-b border-[#EDE3D3]/60 pb-3 flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-[#8B5E3C]" />
            {editingId ? "Editar Banner" : "Novo Banner"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <FieldLabel icon={<Type className="h-3 w-3" />}>Título *</FieldLabel>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Fertilizantes de Inverno"
                className="w-full bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-2xl py-3 px-4 text-xs font-semibold text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15 focus:border-[#8B5E3C]" />
            </div>

            <div className="space-y-1.5">
              <FieldLabel>Subtítulo</FieldLabel>
              <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ex: Até 30% OFF nesta semana"
                className="w-full bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-2xl py-3 px-4 text-xs font-semibold text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15 focus:border-[#8B5E3C]" />
            </div>

            <SectionDivider title="Cores e Visual" />

            <div className="space-y-1.5">
              <FieldLabel icon={<Palette className="h-3 w-3" />}>Cor de Fundo</FieldLabel>
              <div className="flex gap-2">
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                  className="h-10 w-12 rounded-xl border border-[#EDE3D3] cursor-pointer" />
                <div className="flex flex-wrap gap-1 flex-1">
                  {PRESET_BG.map((p) => (
                    <button key={p.value} type="button" onClick={() => setBgColor(p.value)}
                      style={{ backgroundColor: p.value }}
                      className="h-7 w-7 rounded-lg border border-black/10 shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                      title={p.label} />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <FieldLabel>Cor do Texto</FieldLabel>
              <div className="flex gap-2 items-center">
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                  className="h-10 w-12 rounded-xl border border-[#EDE3D3] cursor-pointer" />
                <div className="flex gap-1">
                  {PRESET_TEXT.map((c) => (
                    <button key={c} type="button" onClick={() => setTextColor(c)}
                      style={{ backgroundColor: c }}
                      className="h-7 w-7 rounded-lg border border-black/10 shadow-2xs hover:scale-110 transition-transform cursor-pointer" />
                  ))}
                </div>
              </div>
            </div>

            <SectionDivider title="Imagem e Link" />

            <div className="space-y-1.5">
              <FieldLabel icon={<ImageIcon className="h-3 w-3" />}>Imagem do Banner</FieldLabel>
              <div onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#EDE3D3] hover:border-[#8B5E3C] bg-[#F5EFE6]/30 rounded-2xl p-4 text-center cursor-pointer transition-all">
                {imageUrl ? (
                  <div className="space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="preview" className="h-20 w-auto mx-auto rounded-xl object-cover shadow-2xs" />
                    <span className="text-[9px] font-bold text-[#8B5E3C] uppercase block">Alterar imagem</span>
                  </div>
                ) : (
                  <div className="space-y-1 text-[#7A6F63]">
                    <UploadCloud className="h-6 w-6 mx-auto text-[#8B5E3C]" />
                    <span className="text-xs font-bold block text-[#2B2620]">Selecione uma imagem</span>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e.target.files)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <FieldLabel icon={<Link2 className="h-3 w-3" />}>Link de Destino</FieldLabel>
                <input type="text" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="/categoria/jardinagem"
                  className="w-full bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-2xl py-2.5 px-3 text-xs font-semibold text-[#2B2620] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20" />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Texto do Botão</FieldLabel>
                <input type="text" value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)}
                  placeholder="Confira"
                  className="w-full bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-2xl py-2.5 px-3 text-xs font-semibold text-[#2B2620] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20" />
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              {editingId && (
                <button type="button" onClick={resetForm}
                  className="flex-1 py-3 px-4 border border-[#EDE3D3] text-[#7A6F63] font-bold text-xs rounded-2xl hover:bg-[#F5EFE6] transition-all">
                  Cancelar
                </button>
              )}
              <button type="submit"
                className="flex-1 bg-[#8B5E3C] hover:bg-[#6d482d] text-white font-black text-xs uppercase tracking-wider py-3 px-4 rounded-2xl shadow-md shadow-[#8B5E3C]/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
                <Save className="h-4 w-4" />
                {editingId ? "Atualizar" : "Salvar Banner"}
              </button>
            </div>
          </form>
        </div>

        {/* Preview & Banners List */}
        <div className="lg:col-span-2 space-y-5">

          {/* Live Banner Mockup */}
          <div className="bg-white border border-[#EDE3D3] rounded-3xl p-5 shadow-xs space-y-3">
            <p className="text-[10px] font-black text-[#7A6F63] uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#8B5E3C]" /> Visualização ao Vivo na Loja
            </p>
            <div className="rounded-2xl p-6 min-h-[140px] flex items-center justify-between overflow-hidden shadow-md relative"
              style={{ backgroundColor: bgColor, color: textColor }}>
              <div className="space-y-1.5 max-w-[60%] relative z-10">
                {subtitle && <p className="text-[9px] font-black uppercase tracking-widest opacity-80">{subtitle}</p>}
                <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight">{title || "Título do Banner"}</h3>
                <span className="inline-block mt-2 font-black text-[9px] uppercase px-4 py-2 rounded-xl bg-black/20 backdrop-blur-xs border border-white/20">
                  {linkLabel || "Confira"} →
                </span>
              </div>
              {imageUrl && (
                <div className="h-28 w-28 rounded-xl overflow-hidden shadow-lg border border-white/20 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="banner image" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Banners List */}
          <div className="space-y-3">
            <div className="bg-white border border-[#EDE3D3] rounded-3xl p-4 shadow-xs flex justify-between items-center">
              <h3 className="text-xs font-black text-[#2B2620] uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-[#8B5E3C]" /> Banners Cadastrados ({banners.length})
              </h3>
            </div>

            {banners.map((b) => (
              <div key={b.id} className="bg-white border border-[#EDE3D3] rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4 hover:border-[#8B5E3C]/40 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl flex-shrink-0 border border-black/10 overflow-hidden flex items-center justify-center font-black text-xs"
                    style={{ backgroundColor: b.bgColor, color: b.textColor }}>
                    {b.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={b.imageUrl} alt={b.title} className="h-full w-full object-cover" />
                    ) : (
                      "B"
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[8px] font-black text-[#8B5E3C] bg-[#8B5E3C]/10 px-2 py-0.5 rounded uppercase">
                      #{b.displayOrder}
                    </span>
                    <h4 className="text-xs font-black text-[#2B2620] truncate mt-0.5">{b.title}</h4>
                    {b.subtitle && <p className="text-[9px] text-[#7A6F63] truncate">{b.subtitle}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(b.id, b.active)}
                    className={`transition-colors cursor-pointer ${b.active ? "text-emerald-600" : "text-gray-300"}`}>
                    {b.active ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                  </button>
                  <button onClick={() => handleEdit(b)}
                    className="p-2 border border-[#EDE3D3] rounded-xl text-[#7A6F63] hover:text-[#8B5E3C] hover:bg-[#F5EFE6] transition-colors cursor-pointer">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(b.id)}
                    className="p-2 border border-[#EDE3D3] rounded-xl text-[#7A6F63] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
