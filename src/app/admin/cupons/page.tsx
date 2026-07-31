"use client";

import { useEffect, useState } from "react";
import {
  Tag, Edit, Trash2, AlertCircle, CheckCircle, Percent, DollarSign,
  Zap, ToggleLeft, ToggleRight, Shuffle, Plus, Calendar, Clock, Sparkles,
} from "lucide-react";
import { dbService } from "@/lib/db-service";

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
      <span className="bg-[#8B5E3C]/10 text-[#8B5E3C] text-[9px] font-black px-2 py-0.5 rounded-lg border border-[#8B5E3C]/20 tracking-wider flex-shrink-0">{number}</span>
      <div className="h-px flex-1 bg-[#EDE3D3]" />
      <span className="text-[9px] font-black text-[#7A6F63] uppercase tracking-widest flex-shrink-0">{title}</span>
      <div className="h-px flex-1 bg-[#EDE3D3]" />
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
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("0");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [active, setActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchCoupons = async () => {
    try {
      const localCoupons = await dbService.getCoupons();
      if (localCoupons && localCoupons.length > 0) setCoupons(localCoupons as any);
      setLoading(false);

      const res = await fetch("/api/cupom");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setCoupons(data);
      }
    } catch {} finally {
      setLoading(false);
    }
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
    setCode(`AGRO${rand}`);
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
    setEditingId(c.id); setCode(c.code); setType(c.type as "percent" | "fixed"); setValue(c.value.toString());
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

  return (
    <div className="space-y-6 font-sans text-[#2B2620] animate-fade-in-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#EDE3D3] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#8B5E3C]/10 border border-[#8B5E3C]/20 text-[#8B5E3C]">
            <Tag className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#8B5E3C] bg-[#8B5E3C]/10 px-2.5 py-0.5 rounded-full border border-[#8B5E3C]/20">
              Campanhas & Promoções
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#2B2620] tracking-tight mt-0.5">
              Cupons VIP
            </h1>
          </div>
        </div>

        <button onClick={resetForm}
          className="inline-flex items-center gap-2 bg-[#8B5E3C] hover:bg-[#6d482d] text-white font-black text-xs py-3 px-5 rounded-2xl shadow-md shadow-[#8B5E3C]/20 transition-all uppercase tracking-wider cursor-pointer self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Novo Cupom
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

        {/* Form */}
        <div className="bg-white border border-[#EDE3D3] rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-black text-[#2B2620] uppercase tracking-widest border-b border-[#EDE3D3]/60 pb-3 flex items-center gap-2">
            <Tag className="h-4 w-4 text-[#8B5E3C]" />
            {editingId ? "Editar Cupom" : "Criar Cupom VIP"}
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <SectionDivider number="01" title="Código" />

            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#2B2620] uppercase tracking-widest">Código do Cupom *</label>
              <div className="flex gap-2">
                <input type="text" required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: AGRO10"
                  className="flex-1 bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-2xl py-2.5 px-3.5 text-xs font-black text-[#8B5E3C] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15" />
                <button type="button" onClick={generateCode}
                  className="bg-[#F5EFE6] border border-[#EDE3D3] text-[#8B5E3C] p-2.5 rounded-2xl hover:bg-[#EDE3D3] transition-colors cursor-pointer" title="Gerar código">
                  <Shuffle className="h-4 w-4" />
                </button>
              </div>
            </div>

            <SectionDivider number="02" title="Desconto" />

            <div>
              <label className="text-[10px] font-black text-[#2B2620] uppercase tracking-widest block mb-1.5">Tipo de Desconto</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "percent", label: "Porcentagem", icon: Percent },
                  { key: "fixed", label: "Valor Fixo", icon: DollarSign },
                ].map((opt) => (
                  <button key={opt.key} type="button" onClick={() => setType(opt.key as "percent" | "fixed")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-black rounded-2xl border transition-all cursor-pointer ${
                      type === opt.key ? "border-[#8B5E3C] bg-[#8B5E3C]/10 text-[#8B5E3C]" : "border-[#EDE3D3] hover:bg-[#F5EFE6] text-[#7A6F63]"
                    }`}>
                    <opt.icon className="h-3.5 w-3.5" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#2B2620] uppercase tracking-widest">Valor ({type === "percent" ? "%" : "R$"}) *</label>
                <input type="number" required step="any" min="0" value={value} onChange={(e) => setValue(e.target.value)}
                  placeholder={type === "percent" ? "10" : "50"}
                  className="w-full bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-2xl py-2.5 px-3.5 text-xs font-black text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#2B2620] uppercase tracking-widest">Pedido Mín. (R$)</label>
                <input type="number" step="any" min="0" value={minOrder} onChange={(e) => setMinOrder(e.target.value)}
                  placeholder="0"
                  className="w-full bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-2xl py-2.5 px-3.5 text-xs font-bold text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15" />
              </div>
            </div>

            <SectionDivider number="03" title="Validade" />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#2B2620] uppercase tracking-widest">Limite de Usos</label>
                <input type="number" min="1" value={maxUses} onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="Ilimitado"
                  className="w-full bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-2xl py-2.5 px-3.5 text-xs font-bold text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#2B2620] uppercase tracking-widest">Expiração</label>
                <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-2xl py-2.5 px-3 text-xs font-bold text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15" />
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
                className="flex-1 bg-[#8B5E3C] hover:bg-[#6d482d] text-white font-black text-xs uppercase tracking-wider py-3 px-4 rounded-2xl shadow-md shadow-[#8B5E3C]/20 transition-all cursor-pointer">
                {editingId ? "Atualizar Cupom" : "Salvar Cupom"}
              </button>
            </div>
          </form>
        </div>

        {/* Coupons List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#EDE3D3] rounded-3xl p-4 shadow-xs flex justify-between items-center">
            <h3 className="text-xs font-black text-[#2B2620] uppercase tracking-wider flex items-center gap-2">
              <Tag className="h-4 w-4 text-[#8B5E3C]" /> Cupons ({filtered.length})
            </h3>
            <div className="flex gap-1">
              {[
                { key: "all", label: "Todos" },
                { key: "active", label: "Ativos" },
                { key: "expired", label: "Expirados" },
              ].map((t) => (
                <button key={t.key} onClick={() => setFilterTab(t.key as any)}
                  className={`text-[9px] font-black uppercase px-3 py-1 rounded-xl transition-all cursor-pointer ${
                    filterTab === t.key ? "bg-[#8B5E3C] text-white" : "bg-[#F5EFE6] text-[#7A6F63]"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-[#7A6F63] text-xs font-semibold animate-pulse">
              Carregando cupons...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((c) => {
                const expired = isExpired(c);
                return (
                  <div key={c.id} className="bg-white border border-[#EDE3D3] rounded-3xl p-4 shadow-xs space-y-3 hover:border-[#8B5E3C]/40 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-sm font-black text-[#8B5E3C] bg-[#8B5E3C]/10 px-2.5 py-1 rounded-xl border border-[#8B5E3C]/20">
                          {c.code}
                        </span>
                        <p className="text-[10px] text-[#7A6F63] font-bold mt-1.5">
                          {c.type === "percent" ? `${c.value}% OFF` : `R$ ${c.value} OFF`}
                        </p>
                      </div>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        !c.active || expired ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                      }`}>
                        {!c.active ? "Inativo" : expired ? "Expirado" : "Ativo"}
                      </span>
                    </div>

                    <div className="text-[9px] text-[#7A6F63] space-y-0.5 border-t border-[#EDE3D3]/60 pt-2">
                      <p>Mínimo: R$ {c.minOrder}</p>
                      <p>Usos: {c.usedCount} {c.maxUses ? `/ ${c.maxUses}` : ""}</p>
                      {c.expiresAt && <p>Expira: {new Date(c.expiresAt).toLocaleDateString("pt-BR")}</p>}
                    </div>

                    <div className="flex items-center justify-end gap-1.5 border-t border-[#EDE3D3]/60 pt-2">
                      <button onClick={() => handleEditClick(c)} className="p-1.5 border border-[#EDE3D3] rounded-xl text-[#7A6F63] hover:text-[#8B5E3C] hover:bg-[#F5EFE6]">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 border border-[#EDE3D3] rounded-xl text-[#7A6F63] hover:text-rose-600 hover:bg-rose-50 cursor-pointer">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
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
