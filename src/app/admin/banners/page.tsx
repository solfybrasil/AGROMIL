"use client";

import { useEffect, useState } from "react";
import {
  Megaphone, Edit, Trash2, AlertCircle, CheckCircle, Eye, EyeOff,
  Plus, ImageIcon, Link2, Type, AlignLeft, ToggleLeft, ToggleRight,
  MoveUp, MoveDown, Palette,
} from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  bgColor: string;
  textColor: string;
  active: boolean;
  displayOrder: number;
}



const PRESET_BG = ["#1b4332", "#2d6a4f", "#134e4a", "#92400e", "#1e3a5f", "#7c2d12", "#1f2937", "#e2b13c"];
const PRESET_TEXT = ["#ffffff", "#f9faf9", "#1b4332", "#1f2937", "#e2b13c"];

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-gray-100" />
      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{title}</span>
      <div className="h-px flex-1 bg-gray-100" />
    </div>
  );
}

function FieldLabel({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
      {icon && <span className="text-primary/50">{icon}</span>}
      {children}
    </label>
  );
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errMessage, setErrMessage] = useState("");

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [bgColor, setBgColor] = useState("#1b4332");
  const [textColor, setTextColor] = useState("#ffffff");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [active, setActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/banners/all");
      if (res.ok) setBanners(await res.json());
    } catch (err) {
      console.warn("Banners API offline.", err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchBanners(); }, []);

  const resetForm = () => {
    setTitle(""); setSubtitle(""); setImageUrl(""); setLinkUrl(""); setLinkLabel("");
    setBgColor("#1b4332"); setTextColor("#ffffff"); setDisplayOrder(0); setActive(true); setEditingId(null);
  };

  const showMsg = (msg: string, isErr = false) => {
    if (isErr) { setErrMessage(msg); setTimeout(() => setErrMessage(""), 4000); }
    else { setMessage(msg); setTimeout(() => setMessage(""), 4000); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) { showMsg("Título do banner é obrigatório.", true); return; }
    const payload = { title, subtitle: subtitle || null, imageUrl: imageUrl || null, linkUrl: linkUrl || null, linkLabel: linkLabel || null, bgColor, textColor, displayOrder: Number(displayOrder), active };
    try {
      if (editingId) {
        const res = await fetch(`/api/banners/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (res.ok) { setBanners(banners.map(b => b.id === editingId ? { ...b, ...payload } : b)); showMsg("Banner atualizado com sucesso."); resetForm(); return; }
      } else {
        const res = await fetch("/api/banners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (res.ok) { const created = await res.json(); setBanners([...banners, created]); showMsg("Banner cadastrado com sucesso."); resetForm(); return; }
      }
    } catch (err) {
      console.warn("Error saving banner.", err);
      showMsg("Erro de conexão ao salvar banner.", true);
    }
  };

  const handleEditClick = (b: Banner) => {
    setEditingId(b.id); setTitle(b.title); setSubtitle(b.subtitle || ""); setImageUrl(b.imageUrl || "");
    setLinkUrl(b.linkUrl || ""); setLinkLabel(b.linkLabel || ""); setBgColor(b.bgColor);
    setTextColor(b.textColor); setDisplayOrder(b.displayOrder); setActive(b.active);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este banner?")) return;
    try { await fetch(`/api/banners/${id}`, { method: "DELETE" }); } catch {}
    setBanners(banners.filter(b => b.id !== id));
    showMsg("Banner excluído.");
  };

  const handleOrderChange = async (b: Banner, dir: "up" | "down") => {
    const newOrder = dir === "up" ? b.displayOrder - 1 : b.displayOrder + 1;
    try { await fetch(`/api/banners/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayOrder: newOrder }) }); fetchBanners(); }
    catch { setBanners(banners.map(item => item.id === b.id ? { ...item, displayOrder: newOrder } : item)); }
  };

  const toggleActive = async (b: Banner) => {
    setBanners(banners.map(item => item.id === b.id ? { ...item, active: !b.active } : item));
    try { await fetch(`/api/banners/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !b.active }) }); } catch {}
  };

  const totalActive = banners.filter(b => b.active).length;
  const totalPaused = banners.filter(b => !b.active).length;

  return (
    <div className="space-y-7 animate-fade-in-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 border border-primary/20 text-primary rounded-2xl p-2.5">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-extrabold text-[#1b4332] tracking-tight">Campanhas & Banners</h1>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Configure o carrossel de banners e promoções da página inicial</p>
          </div>
        </div>
        <button onClick={resetForm} className="inline-flex items-center gap-1.5 bg-primary hover:bg-[#122e22] text-white font-extrabold text-xs py-2.5 px-5 rounded-2xl shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Novo Banner
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: "Total de Banners", value: banners.length, icon: Megaphone, cls: "bg-blue-500/10 border-blue-500/20 text-blue-600" },
          { label: "Banners Ativos", value: totalActive, icon: Eye, cls: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" },
          { label: "Banners Pausados", value: totalPaused, icon: EyeOff, cls: totalPaused > 0 ? "bg-amber-500/10 border-amber-500/20 text-amber-600" : "bg-gray-50 border-gray-200 text-gray-400" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-3xs flex items-center gap-4">
            <div className={`rounded-2xl p-3 border flex-shrink-0 ${kpi.cls}`}><kpi.icon className="h-5 w-5" /></div>
            <div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">{kpi.label}</span>
              <span className="text-xl font-black text-gray-800 tracking-tight mt-0.5 block">{kpi.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Toast messages */}
      {message && <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-3 rounded-2xl"><CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />{message}</div>}
      {errMessage && <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold px-4 py-3 rounded-2xl"><AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />{errMessage}</div>}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT: Form */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-3xl p-6 shadow-3xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white rounded-xl w-7 h-7 flex items-center justify-center flex-shrink-0">
              <Edit className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-xs font-black text-gray-800">{editingId ? "Editando Banner" : "Novo Banner"}</h3>
          </div>

          <div className="h-px bg-gray-100" />

          <form onSubmit={handleSave} className="space-y-4">
            <SectionDivider title="Conteúdo" />

            <div>
              <FieldLabel icon={<Type className="h-3 w-3" />}>Título *</FieldLabel>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Frete Grátis acima de R$ 150"
                className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>

            <div>
              <FieldLabel icon={<AlignLeft className="h-3 w-3" />}>Subtítulo</FieldLabel>
              <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Ex: Para todo o interior de Itu"
                className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel icon={<Link2 className="h-3 w-3" />}>Link</FieldLabel>
                <input type="text" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="/categoria/..."
                  className="w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <FieldLabel>Texto Botão</FieldLabel>
                <input type="text" value={linkLabel} onChange={e => setLinkLabel(e.target.value)} placeholder="Ver Ofertas"
                  className="w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
            </div>

            <div>
              <FieldLabel icon={<ImageIcon className="h-3 w-3" />}>URL da Imagem (opcional)</FieldLabel>
              <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..."
                className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-gray-700 font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>

            <SectionDivider title="Aparência" />

            {/* BG Color */}
            <div>
              <FieldLabel icon={<Palette className="h-3 w-3" />}>Cor de Fundo</FieldLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {PRESET_BG.map(c => (
                  <button key={c} type="button" onClick={() => setBgColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer hover:scale-110 ${bgColor === c ? "border-primary ring-2 ring-primary/30 scale-110" : "border-gray-200"}`}
                    style={{ background: c }} />
                ))}
                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 cursor-pointer overflow-hidden" />
                <span className="font-mono text-[10px] text-gray-500 bg-gray-50 border border-gray-200 px-2 rounded-lg self-center">{bgColor}</span>
              </div>
            </div>

            {/* Text Color */}
            <div>
              <FieldLabel>Cor do Texto</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {PRESET_TEXT.map(c => (
                  <button key={c} type="button" onClick={() => setTextColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer hover:scale-110 ${textColor === c ? "border-primary ring-2 ring-primary/30 scale-110" : "border-gray-200"}`}
                    style={{ background: c }} />
                ))}
                <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 cursor-pointer overflow-hidden" />
              </div>
            </div>

            <SectionDivider title="Configurações" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-gray-700">Exibir na Homepage</p>
                <p className="text-[9px] text-gray-400 font-semibold">Banner visível no carrossel</p>
              </div>
              <button type="button" onClick={() => setActive(!active)}
                className={`transition-all duration-300 cursor-pointer p-1 ${active ? "text-emerald-500" : "text-gray-300"}`}>
                {active ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8" />}
              </button>
            </div>

            <div>
              <FieldLabel>Ordem de Exibição</FieldLabel>
              <input type="number" min="0" value={displayOrder} onChange={e => setDisplayOrder(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>

            {/* Preview */}
            {title && (
              <div className="rounded-2xl overflow-hidden">
                <div className="p-4 relative" style={{ backgroundColor: bgColor }}>
                  {imageUrl && <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${imageUrl})` }} />}
                  <div className="relative z-10">
                    <p className="text-sm font-black leading-tight" style={{ color: textColor }}>{title}</p>
                    {subtitle && <p className="text-[10px] mt-1 opacity-80" style={{ color: textColor }}>{subtitle}</p>}
                    {linkLabel && <span className="inline-block mt-2 text-[9px] font-black px-2.5 py-1 rounded-lg" style={{ background: textColor === "#ffffff" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)", color: textColor }}>{linkLabel}</span>}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button type="submit" className="flex-1 bg-primary hover:bg-[#122e22] text-white text-xs font-black py-3 rounded-2xl shadow-sm transition-all active:scale-95 cursor-pointer">
                {editingId ? "Salvar Alterações" : "Criar Banner"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold py-3 px-5 rounded-2xl transition-all cursor-pointer">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT: Banner list */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-3xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-[#1b4332] uppercase tracking-wider flex items-center gap-2">
                <Megaphone className="h-4 w-4" /> Banners Cadastrados ({banners.length})
              </h3>
            </div>

            {loading ? (
              <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-7 w-7 border-4 border-primary border-t-transparent" /></div>
            ) : banners.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3 text-gray-400">
                <ImageIcon className="h-10 w-10 opacity-30" />
                <p className="text-xs font-black uppercase tracking-wider">Nenhum banner cadastrado</p>
                <p className="text-[10px] font-semibold">Crie seu primeiro banner usando o formulário ao lado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...banners].sort((a, b) => a.displayOrder - b.displayOrder).map(b => (
                  <div key={b.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-3xs group hover:shadow-sm transition-all">
                    {/* Preview strip */}
                    <div className="relative px-5 py-4 flex items-center justify-between" style={{ backgroundColor: b.bgColor }}>
                      {b.imageUrl && <div className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none" style={{ backgroundImage: `url(${b.imageUrl})` }} />}
                      <div className="relative z-10 flex-1 min-w-0 pr-3">
                        <h4 className="text-sm font-black truncate" style={{ color: b.textColor }}>{b.title}</h4>
                        {b.subtitle && <p className="text-[10px] opacity-75 mt-0.5" style={{ color: b.textColor }}>{b.subtitle}</p>}
                        {b.linkLabel && (
                          <span className="inline-block mt-2 text-[9px] font-black px-2.5 py-1 rounded-lg bg-white/20" style={{ color: b.textColor }}>
                            {b.linkLabel} →
                          </span>
                        )}
                      </div>
                      <div className="relative z-10 flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className="text-[8px] font-black bg-black/20 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Ordem #{b.displayOrder}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase flex items-center gap-1 ${b.active ? "bg-emerald-500/20 text-emerald-200" : "bg-black/30 text-gray-300"}`}>
                          {b.active ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
                          {b.active ? "Ativo" : "Pausado"}
                        </span>
                      </div>
                    </div>

                    {/* Actions footer */}
                    <div className="bg-gray-50/60 border-t border-gray-100 px-4 py-2.5 flex items-center gap-2">
                      <button onClick={() => handleOrderChange(b, "up")} className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-primary hover:bg-white transition-colors cursor-pointer">
                        <MoveUp className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleOrderChange(b, "down")} className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-primary hover:bg-white transition-colors cursor-pointer">
                        <MoveDown className="h-3.5 w-3.5" />
                      </button>

                      <button onClick={() => toggleActive(b)} className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1 ${b.active ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>
                        {b.active ? <><ToggleRight className="h-3.5 w-3.5" /> Ativo</> : <><ToggleLeft className="h-3.5 w-3.5" /> Pausado</>}
                      </button>

                      <div className="ml-auto flex gap-1.5">
                        <button onClick={() => handleEditClick(b)} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-primary hover:bg-white transition-colors cursor-pointer">
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(b.id)} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
