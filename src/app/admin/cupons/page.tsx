"use client";

import { useEffect, useState } from "react";
import {
  Tag, Edit, Trash2, AlertCircle, CheckCircle, Percent, DollarSign,
  Zap, ToggleLeft, ToggleRight, Shuffle, Plus, Calendar, Clock,
} from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
}



function SectionDivider({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 pt-2 pb-1">
      <span className="bg-primary/10 text-primary text-[9px] font-black px-2 py-0.5 rounded-lg border border-primary/20 tracking-wider flex-shrink-0">{number}</span>
      <div className="h-px flex-1 bg-gray-100" />
      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest flex-shrink-0">{title}</span>
      <div className="h-px flex-1 bg-gray-100" />
    </div>
  );
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errMessage, setErrMessage] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "active" | "expired">("all");

  const [code, setCode] = useState("");
  const [type, setType] = useState("percent");
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("0");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [active, setActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/cupom");
      if (res.ok) setCoupons(await res.json());
    } catch (err) {
      console.warn("Coupons API offline.", err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const resetForm = () => {
    setCode(""); setType("percent"); setValue(""); setMinOrder("0");
    setMaxUses(""); setExpiresAt(""); setActive(true); setEditingId(null);
  };

  const showMsg = (msg: string, isErr = false) => {
    if (isErr) { setErrMessage(msg); setTimeout(() => setErrMessage(""), 4000); }
    else { setMessage(msg); setTimeout(() => setMessage(""), 4000); }
  };

  const generateCode = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    setCode(`AGR${rand}`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value) { showMsg("Código e Valor são obrigatórios.", true); return; }
    const payload = {
      code: code.trim().toUpperCase(), type,
      value: Number(value), minOrder: Number(minOrder || 0),
      maxUses: maxUses ? Number(maxUses) : null,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null, active,
    };
    try {
      const url = editingId ? `/api/cupom/${editingId}` : "/api/cupom";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        const result = await res.json();
        if (editingId) { setCoupons(coupons.map(c => c.id === editingId ? result : c)); showMsg("Cupom atualizado!"); }
        else { setCoupons([...coupons, result]); showMsg("Cupom cadastrado!"); }
        resetForm(); return;
      }
    } catch (err) {
      console.warn("Error saving coupon.", err);
      showMsg("Erro de conexão ao salvar cupom.", true);
    }
  };

  const handleEditClick = (c: Coupon) => {
    setEditingId(c.id); setCode(c.code); setType(c.type); setValue(c.value.toString());
    setMinOrder(c.minOrder.toString()); setMaxUses(c.maxUses ? c.maxUses.toString() : "");
    setExpiresAt(c.expiresAt ? c.expiresAt.substring(0, 10) : ""); setActive(c.active);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este cupom?")) return;
    try { await fetch(`/api/cupom/${id}`, { method: "DELETE" }); } catch {}
    setCoupons(coupons.filter(c => c.id !== id)); showMsg("Cupom excluído.");
  };

  const isExpired = (c: Coupon) => !!(c.expiresAt && new Date(c.expiresAt) < new Date());

  const filtered = coupons.filter(c => {
    if (filterTab === "active") return c.active && !isExpired(c);
    if (filterTab === "expired") return isExpired(c) || !c.active;
    return true;
  });

  const totalActive = coupons.filter(c => c.active && !isExpired(c)).length;
  const totalUses = coupons.reduce((sum, c) => sum + c.usedCount, 0);

  return (
    <div className="space-y-7 animate-fade-in-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-2xl p-2.5">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-extrabold text-[#1b4332] tracking-tight">Cupons de Desconto</h1>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Gerencie cupons ativos e crie novas promoções</p>
          </div>
        </div>
        <button onClick={resetForm} className="inline-flex items-center gap-1.5 bg-primary hover:bg-[#122e22] text-white font-extrabold text-xs py-2.5 px-5 rounded-2xl shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Novo Cupom
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: "Total de Cupons", value: coupons.length, icon: Tag, cls: "bg-primary/10 border-primary/20 text-primary" },
          { label: "Cupons Ativos", value: totalActive, icon: CheckCircle, cls: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" },
          { label: "Usos Registrados", value: totalUses, icon: Zap, cls: "bg-amber-500/10 border-amber-500/20 text-amber-600" },
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

      {/* Messages */}
      {message && <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-3 rounded-2xl"><CheckCircle className="h-4 w-4 flex-shrink-0" />{message}</div>}
      {errMessage && <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold px-4 py-3 rounded-2xl"><AlertCircle className="h-4 w-4 flex-shrink-0" />{errMessage}</div>}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT: Form */}
        <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl p-6 shadow-3xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white rounded-xl w-7 h-7 flex items-center justify-center flex-shrink-0">
              <Edit className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-xs font-black text-gray-800">{editingId ? "Editando Cupom" : "Novo Cupom"}</h3>
          </div>
          <div className="h-px bg-gray-100" />

          <form onSubmit={handleSave} className="space-y-4">
            <SectionDivider number="01" title="Identificação" />

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Código do Cupom *</label>
              <div className="flex gap-2">
                <input type="text" required value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="PROMO10"
                  className="flex-1 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-black text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all tracking-widest font-mono" />
                <button type="button" onClick={generateCode} title="Gerar código aleatório"
                  className="p-2.5 border border-gray-200 rounded-2xl text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors cursor-pointer flex-shrink-0">
                  <Shuffle className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[9px] text-gray-400 font-semibold mt-1">Clique no ícone para gerar um código aleatório</p>
            </div>

            <SectionDivider number="02" title="Desconto" />

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Tipo de Desconto</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "percent", label: "Porcentagem", icon: Percent },
                  { key: "fixed", label: "Valor Fixo", icon: DollarSign },
                ].map(opt => (
                  <button key={opt.key} type="button" onClick={() => setType(opt.key)}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-black rounded-2xl border transition-all cursor-pointer active:scale-95 ${type === opt.key ? "border-primary bg-primary/5 text-primary shadow-3xs" : "border-gray-200 hover:bg-gray-50 text-gray-600"}`}>
                    <opt.icon className="h-3.5 w-3.5" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Valor *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-black">{type === "percent" ? "%" : "R$"}</span>
                  <input type="number" required min="0.01" step="any" value={value} onChange={e => setValue(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl pl-9 pr-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Pedido Mínimo</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-black">R$</span>
                  <input type="number" min="0" step="any" value={minOrder} onChange={e => setMinOrder(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl pl-9 pr-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>
            </div>

            <SectionDivider number="03" title="Restrições" />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Limite de Usos</label>
                <input type="number" min="1" value={maxUses} onChange={e => setMaxUses(e.target.value)} placeholder="Sem limite"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Expira em</label>
                <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
            </div>

            <div className="flex items-center justify-between bg-gray-50/50 border border-gray-100 rounded-2xl px-4 py-3">
              <div>
                <p className="text-xs font-black text-gray-700">Cupom Ativo</p>
                <p className="text-[9px] text-gray-400 font-semibold">Disponível para uso pelos clientes</p>
              </div>
              <button type="button" onClick={() => setActive(!active)}
                className={`transition-all duration-300 cursor-pointer p-1 ${active ? "text-emerald-500" : "text-gray-300"}`}>
                {active ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8" />}
              </button>
            </div>

            <div className="flex gap-2 pt-1">
              <button type="submit" className="flex-1 bg-primary hover:bg-[#122e22] text-white text-xs font-black py-3 rounded-2xl shadow-sm transition-all active:scale-95 cursor-pointer">
                {editingId ? "Salvar Alterações" : "Cadastrar Cupom"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold py-3 px-5 rounded-2xl transition-all cursor-pointer">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT: Table */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 shadow-3xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-[#1b4332] uppercase tracking-wider flex items-center gap-2">
              <Tag className="h-4 w-4" /> Cupons ({filtered.length})
            </h3>
            <div className="bg-gray-100/60 p-1.5 rounded-2xl flex border border-gray-200/40">
              {[
                { key: "all", label: "Todos" },
                { key: "active", label: "Ativos" },
                { key: "expired", label: "Expirados" },
              ].map(tab => (
                <button key={tab.key} onClick={() => setFilterTab(tab.key as any)}
                  className={`py-1.5 px-3 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${filterTab === tab.key ? "bg-white text-primary shadow-3xs border border-gray-100" : "text-gray-400 hover:text-gray-600"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-7 w-7 border-4 border-primary border-t-transparent" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center gap-2 text-gray-400">
              <Tag className="h-8 w-8 opacity-30" />
              <p className="text-xs font-black uppercase tracking-wider">Nenhum cupom encontrado</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map(c => {
                const expired = isExpired(c);
                const usagePercent = c.maxUses ? Math.min(100, Math.round((c.usedCount / c.maxUses) * 100)) : null;
                return (
                  <div key={c.id} className={`bg-white border rounded-2xl p-4 transition-all hover:shadow-3xs ${expired || !c.active ? "border-gray-150 opacity-70" : "border-gray-150 hover:border-primary/20"}`}>
                    <div className="flex items-start gap-3">
                      {/* Code pill */}
                      <span className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest font-mono flex-shrink-0 ${c.active && !expired ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
                        {c.code}
                      </span>

                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Discount + min order */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1 text-sm font-black text-gray-800">
                            {c.type === "percent" ? <Percent className="h-3.5 w-3.5 text-primary" /> : <DollarSign className="h-3.5 w-3.5 text-primary" />}
                            {c.type === "percent" ? `${c.value}% off` : `R$ ${Number(c.value).toFixed(2)} off`}
                          </span>
                          {c.minOrder > 0 && (
                            <span className="text-[9px] font-black text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                              min R$ {c.minOrder}
                            </span>
                          )}
                          {expired && <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg uppercase tracking-wider">Expirado</span>}
                          {!c.active && !expired && <span className="text-[9px] font-black text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-lg uppercase tracking-wider">Inativo</span>}
                        </div>

                        {/* Usage progress */}
                        {c.maxUses !== null && (
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Usos: {c.usedCount}/{c.maxUses}</span>
                              <span className={`text-[9px] font-black ${usagePercent! >= 80 ? "text-amber-600" : "text-gray-400"}`}>{usagePercent}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${usagePercent! >= 80 ? "bg-amber-500" : "bg-primary"}`}
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {c.maxUses === null && (
                          <span className="text-[9px] font-black text-gray-400 flex items-center gap-1">
                            <Zap className="h-3 w-3" /> {c.usedCount} usos · Sem limite
                          </span>
                        )}

                        {/* Expiry */}
                        {c.expiresAt && (
                          <span className={`text-[9px] font-black flex items-center gap-1 ${expired ? "text-rose-600" : "text-gray-400"}`}>
                            <Calendar className="h-3 w-3" />
                            {expired ? "Expirou em " : "Expira em "}{new Date(c.expiresAt).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                        {!c.expiresAt && (
                          <span className="text-[9px] font-black text-gray-300 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Sem validade
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button onClick={() => handleEditClick(c)} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors cursor-pointer">
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
