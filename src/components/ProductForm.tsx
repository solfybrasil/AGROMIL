"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, AlertCircle, Upload, Trash2, ShoppingCart,
  Tag, Package, DollarSign, TrendingUp, BarChart3, ImageIcon,
  FileText, Sparkles, Star, Hash, Weight, Building2, ScanBarcode,
  PlusCircle, X, ChevronRight, Info, Check, Calculator, ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { dbService } from "@/lib/db-service";

// ─── Types ─────────────────────────────────────────────────────────────────

interface Category { id: string; name: string; }

interface ProductFormData {
  name: string;
  description: string;
  shortDesc: string;
  price: number | string;
  promoPrice: number | string;
  costPrice: number | string;
  wholesalePrice: number | string;
  discountPercent: number | string;
  stock: number;
  minStock: number;
  unit: string;
  sku: string;
  barcode: string;
  brand: string;
  weight: number | string;
  categoryId: string;
  active: boolean;
  featured: boolean;
  isNew: boolean;
  tags: string[];
  images?: string[];
}

interface ProductFormProps {
  initialData?: ProductFormData & { id?: string };
  isEdit?: boolean;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-jardinagem", name: "Jardinagem & Vasos" },
  { id: "cat-petshop", name: "Rações & Acessórios Pet" },
  { id: "cat-agropecuaria", name: "Agropecuária Geral" },
  { id: "cat-ferramentas", name: "Ferramentas & Equipamentos" },
  { id: "cat-irrigacao", name: "Irrigação" },
  { id: "cat-vestuario-epi", name: "Vestuário & EPI" },
];

const PRESET_UNITS = ["Unidade", "Saco 5kg", "Saco 15kg", "Caixa", "Pacote", "Litro", "Kg", "Grama"];

const TABS = [
  { id: "identity", label: "Identificação", icon: FileText, desc: "Nome, marca, categoria" },
  { id: "pricing", label: "Preços & Margem", icon: DollarSign, desc: "Custo, venda, lucro" },
  { id: "stock", label: "Estoque & Lote", icon: Package, desc: "Qtd, mínimo, lotes" },
  { id: "media", label: "Mídia & Ficha", icon: ImageIcon, desc: "Fotos e detalhes" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

const compressImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 800;
        let { width, height } = img;
        if (width > height ? width > MAX : height > MAX) {
          if (width > height) { height *= MAX / width; width = MAX; }
          else { width *= MAX / height; height = MAX; }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });

const parseCurrency = (val: string | number) => {
  if (typeof val === "number") return val;
  if (!val) return 0;
  return Number(val.replace(/\./g, "").replace(",", "."));
};

const formatCurrency = (val: any) => {
  if (val === undefined || val === null || val === "") return "";
  const num = Number(val);
  if (isNaN(num)) return "";
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const useCurrencyInput = (initial: any) => {
  const [value, setValue] = useState(formatCurrency(initial));
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, "");
    if (!clean) { setValue(""); return; }
    setValue((Number(clean) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };
  return [value, setValue, onChange, parseCurrency(value)] as const;
};

// ─── Financial Margin HUD Card (Harmonized with Brand Theme) ──────────────

function MarginCard({
  costNum, priceNum, promoPriceNum, stockNum, unitStr,
}: { costNum: number; priceNum: number; promoPriceNum: number; stockNum: number; unitStr: string }) {
  const sellPrice = promoPriceNum > 0 && promoPriceNum < priceNum ? promoPriceNum : priceNum;
  const grossProfit = sellPrice - costNum;
  const margin = sellPrice > 0 ? (grossProfit / sellPrice) * 100 : 0;
  const markup = costNum > 0 ? (grossProfit / costNum) * 100 : 0;
  const discountPct = priceNum > 0 && promoPriceNum > 0 && promoPriceNum < priceNum
    ? ((priceNum - promoPriceNum) / priceNum) * 100 : 0;
  const totalStockProfit = grossProfit * stockNum;

  const isHealthy = margin >= 40;
  const isWarning = margin >= 20 && margin < 40;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#1A1A1A] border border-[#8B5E3C]/40 text-[#EDE3D3] p-5 shadow-xl space-y-4">
      {/* Background Ambient Glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#8B5E3C]/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#e2b13c]/10 rounded-full blur-xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#8B5E3C]/30 pb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#8B5E3C]/20 border border-[#8B5E3C]/40 text-[#EDE3D3]">
            <Calculator className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#EDE3D3]">Análise Financeira</h3>
            <p className="text-[9px] text-[#EDE3D3]/70 font-medium">Margem & Lucratividade</p>
          </div>
        </div>
        {costNum > 0 && priceNum > 0 && (
          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
            isHealthy
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
              : isWarning
              ? "bg-amber-500/20 text-amber-300 border-amber-400/40"
              : "bg-rose-500/20 text-rose-300 border-rose-400/40"
          }`}>
            {isHealthy ? "🌟 Excelente" : isWarning ? "⚠️ Aceitável" : "🚨 Risco"}
          </span>
        )}
      </div>

      {costNum > 0 && priceNum > 0 ? (
        <div className="space-y-3 relative z-10">
          {/* Main Profit Box */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center shadow-inner space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#EDE3D3]/70">Lucro por Unidade</p>
            <p className={`text-3xl font-black tracking-tight ${
              grossProfit >= 0 ? "text-[#e2b13c]" : "text-rose-400"
            }`}>
              {grossProfit >= 0 ? "+" : ""}R$ {grossProfit.toFixed(2).replace(".", ",")}
            </p>
            <p className="text-[9px] text-gray-300 font-medium">por {unitStr || "unidade"}</p>
          </div>

          {/* Grid Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 text-center">
              <p className="text-[8px] font-black uppercase text-gray-400 tracking-wider">Margem Bruta</p>
              <p className={`text-base font-black mt-0.5 ${
                isHealthy ? "text-emerald-400" : isWarning ? "text-amber-400" : "text-rose-400"
              }`}>
                {margin.toFixed(1)}%
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 text-center">
              <p className="text-[8px] font-black uppercase text-gray-400 tracking-wider">Markup</p>
              <p className="text-base font-black mt-0.5 text-[#EDE3D3]">{markup.toFixed(1)}%</p>
            </div>
          </div>

          {discountPct > 0 && (
            <div className="bg-amber-500/15 border border-amber-400/30 rounded-xl p-2.5 flex items-center justify-between text-[9px] font-extrabold text-amber-200">
              <span>Desconto Promocional</span>
              <span className="bg-[#e2b13c] text-[#1A1A1A] px-2 py-0.5 rounded-md font-black">-{discountPct.toFixed(1)}%</span>
            </div>
          )}

          {stockNum > 0 && (
            <div className="bg-[#8B5E3C]/20 border border-[#8B5E3C]/40 rounded-xl p-3 flex justify-between items-center text-xs">
              <span className="text-[9px] font-black uppercase tracking-wider text-[#EDE3D3]">Lucro Potencial Total ({stockNum} un.)</span>
              <span className="font-black text-[#e2b13c] text-sm">
                {totalStockProfit >= 0 ? "+" : ""}R$ {totalStockProfit.toFixed(2).replace(".", ",")}
              </span>
            </div>
          )}

          {/* Hint */}
          <div className="flex items-start gap-2 bg-white/5 p-2.5 rounded-xl border border-white/5 text-[9px] text-gray-300 font-medium leading-relaxed">
            <Info className="h-3.5 w-3.5 text-[#8B5E3C] flex-shrink-0 mt-0.5" />
            <span>
              Custo cadastrado garante relatórios de <span className="text-[#EDE3D3] font-bold">lucro líquido</span> precisos no Dashboard Admin.
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 space-y-2 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#8B5E3C]">
            <TrendingUp className="h-6 w-6" />
          </div>
          <p className="text-xs font-bold text-[#EDE3D3]">Calculadora Financeira Ativa</p>
          <p className="text-[10px] text-gray-400 max-w-[220px] mx-auto leading-relaxed">
            Digite o <span className="text-amber-300 font-bold">Preço Pago</span> e o <span className="text-[#EDE3D3] font-bold">Preço de Venda</span> para calcular a margem exata.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Form ─────────────────────────────────────────────────────────────

export default function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("identity");

  // ── Identity ──────────────────────────────────────────────────────────────
  const [name, setName] = useState(initialData?.name || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [barcode, setBarcode] = useState(initialData?.barcode || "");
  const [brand, setBrand] = useState(initialData?.brand || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [active, setActive] = useState(initialData?.active !== undefined ? initialData.active : true);
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [isNew, setIsNew] = useState(initialData?.isNew ?? false);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");

  // ── Pricing ───────────────────────────────────────────────────────────────
  const [price, , onPriceChange, priceNum] = useCurrencyInput(initialData?.price);
  const [promoPrice, , onPromoPriceChange, promoPriceNum] = useCurrencyInput(initialData?.promoPrice);
  const [costPrice, , onCostPriceChange, costPriceNum] = useCurrencyInput(initialData?.costPrice);
  const [wholesalePrice, , onWholesalePriceChange] = useCurrencyInput(initialData?.wholesalePrice);

  // ── Stock ─────────────────────────────────────────────────────────────────
  const [stock, setStock] = useState(initialData?.stock || 0);
  const [minStock, setMinStock] = useState(initialData?.minStock || 5);
  const [unit, setUnit] = useState(initialData?.unit || "Unidade");
  const [isCustomUnit, setIsCustomUnit] = useState(!PRESET_UNITS.includes(initialData?.unit || "Unidade"));
  const [weight, setWeight] = useState(initialData?.weight || "");

  // ── Lot ───────────────────────────────────────────────────────────────────
  const [showLotForm, setShowLotForm] = useState(false);
  const [lotNumber, setLotNumber] = useState("");
  const [lotSupplier, setLotSupplier] = useState("");
  const [lotQty, setLotQty] = useState("");
  const [lotCostPrice, , onLotCostChange] = useCurrencyInput(null);
  const [lotDate, setLotDate] = useState(new Date().toISOString().slice(0, 10));
  const [lotNotes, setLotNotes] = useState("");
  const [pendingLot, setPendingLot] = useState<any>(null);

  // ── Media & Description ───────────────────────────────────────────────────
  const [images, setImages] = useState<string[]>(initialData?.images?.length ? initialData.images : []);
  const [isDragging, setIsDragging] = useState(false);
  const [shortDesc, setShortDesc] = useState(initialData?.shortDesc || "");
  const [description, setDescription] = useState(initialData?.description || "");

  // ── Categories fetch ───────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/categorias")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.length > 0) setCategories(d); })
      .catch(() => {});
  }, []);

  // ── Image helpers ──────────────────────────────────────────────────────────
  const processFiles = useCallback(async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (!imageFiles.length) return;
    try {
      const compressed = await Promise.all(imageFiles.map(compressImage));
      setImages((prev) => [...prev, ...compressed]);
    } catch {
      setError("Falha ao carregar imagem. Tente outro arquivo.");
    }
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) await processFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) await processFiles(Array.from(e.dataTransfer.files));
  };

  // ── Tag helpers ────────────────────────────────────────────────────────────
  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) { setTags((prev) => [...prev, t]); }
    setTagInput("");
  };

  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t));

  // ── Lot save ───────────────────────────────────────────────────────────────
  const saveLot = () => {
    if (!lotNumber.trim()) { alert("Número do lote é obrigatório."); return; }
    setPendingLot({
      lotNumber: lotNumber.trim(),
      supplier: lotSupplier.trim() || null,
      quantity: Number(lotQty) || 0,
      costPrice: parseCurrency(lotCostPrice),
      purchaseDate: new Date(lotDate).toISOString(),
      notes: lotNotes.trim() || null,
    });
    setShowLotForm(false);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name.trim()) { setError("O nome do produto é obrigatório."); setLoading(false); return; }
    if (!categoryId) { setError("Selecione uma categoria."); setLoading(false); return; }
    if (isNaN(priceNum) || priceNum <= 0) { setError("Preço de venda inválido."); setLoading(false); return; }
    if (promoPriceNum > 0 && promoPriceNum >= priceNum) {
      setError("Preço promocional deve ser menor que o preço de venda."); setLoading(false); return;
    }

    const payload: any = {
      name: name.trim(),
      description: description.trim() || name.trim(),
      shortDesc: shortDesc.trim(),
      price: priceNum,
      promoPrice: promoPriceNum > 0 ? promoPriceNum : null,
      costPrice: costPriceNum,
      wholesalePrice: parseCurrency(wholesalePrice) || null,
      stock: Number(stock),
      minStock: Number(minStock),
      unit: unit.trim(),
      sku: sku.trim() || null,
      barcode: barcode.trim() || null,
      brand: brand.trim() || null,
      weight: weight ? Number(weight) : 0,
      categoryId,
      active,
      featured,
      isNew,
      tags,
      images: images.length ? images : [],
    };

    if (promoPriceNum > 0 && priceNum > 0) {
      payload.discountPercent = Math.round(((priceNum - promoPriceNum) / priceNum) * 100 * 10) / 10;
    }

    try {
      const endpoint = isEdit ? `/api/produtos/${initialData?.id}` : "/api/produtos";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let savedProduct: any = null;
      if (res.ok) savedProduct = await res.json();

      if (!savedProduct) {
        if (isEdit && initialData?.id) {
          savedProduct = await dbService.updateProduct(initialData.id, payload);
        } else {
          savedProduct = await dbService.createProduct(payload);
        }
      }

      if (savedProduct && pendingLot) {
        await fetch("/api/produtos/lotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...pendingLot, productId: savedProduct.id }),
        }).catch(() => dbService.createLot({ ...pendingLot, productId: savedProduct.id }));
      }

      if (savedProduct) {
        router.push("/admin/produtos");
        router.refresh();
      } else {
        setError("Erro ao salvar produto. Tente novamente.");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao processar dados do produto.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  const sellPrice = promoPriceNum > 0 && promoPriceNum < priceNum ? promoPriceNum : priceNum;
  const discountPct = priceNum > 0 && promoPriceNum > 0 && promoPriceNum < priceNum
    ? Math.round(((priceNum - promoPriceNum) / priceNum) * 100) : 0;

  return (
    <div className="space-y-6 select-none max-w-7xl font-sans text-[#2B2620]">

      {/* Top Bar with Navigation & Title (Matched to Home Theme) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-[#EDE3D3] shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/produtos"
            className="p-2.5 rounded-2xl bg-[#F5EFE6] hover:bg-[#EDE3D3] text-[#2B2620] border border-[#EDE3D3] transition-all group"
            title="Voltar"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </Link>
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#8B5E3C] bg-[#8B5E3C]/10 px-2.5 py-0.5 rounded-full border border-[#8B5E3C]/20">
              Catálogo Agromil
            </span>
            <h1 className="text-lg font-serif font-bold text-[#2B2620] tracking-tight mt-0.5">
              {isEdit ? `Editar: ${name || "Produto"}` : "Novo Cadastro de Produto"}
            </h1>
          </div>
        </div>

        {/* Quick Top Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/produtos"
            className="px-4 py-2.5 rounded-xl border border-[#EDE3D3] text-[#7A6F63] hover:bg-[#EDE3D3]/50 text-xs font-bold transition-all"
          >
            Cancelar
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-[#8B5E3C] hover:bg-[#6d482d] text-white font-black text-xs shadow-md shadow-[#8B5E3C]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 uppercase tracking-wider"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? "Salvando..." : "Salvar Produto"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-start gap-3 text-xs font-semibold shadow-sm">
          <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ── Left: Form Panel ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Segmented Tab Navigation Bar (Harmonized Color Theme) */}
            <div className="bg-[#EDE3D3]/60 p-1.5 rounded-2xl flex gap-1.5 border border-[#EDE3D3] shadow-inner">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-black uppercase tracking-wide transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#8B5E3C] text-white shadow-md shadow-[#8B5E3C]/25 scale-[1.02]"
                        : "text-[#7A6F63] hover:text-[#2B2620] hover:bg-white/80"
                    }`}
                  >
                    <tab.icon className={`h-4 w-4 ${isActive ? "text-[#EDE3D3]" : "text-[#7A6F63]"}`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ── Tab: Identificação ───────────────────────────────────── */}
            {activeTab === "identity" && (
              <div className="bg-white border border-[#EDE3D3] rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-[#EDE3D3]/60 pb-3">
                  <h2 className="text-xs font-black text-[#2B2620] uppercase tracking-widest flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#8B5E3C]" />
                    Identificação & Classificação
                  </h2>
                  <span className="text-[9px] font-extrabold text-[#8B5E3C] bg-[#8B5E3C]/10 px-2.5 py-1 rounded-full border border-[#8B5E3C]/20">
                    Etapa 1 de 4
                  </span>
                </div>

                {/* Product Name */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#2B2620]">
                    Nome do Produto *
                  </label>
                  <input
                    type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Ração Golden Especial Cães Adultos 15kg"
                    className="w-full bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-xl py-3 px-4 text-xs font-semibold text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15 focus:border-[#8B5E3C] focus:bg-white transition-all"
                  />
                </div>

                {/* SKU + Barcode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#2B2620] flex items-center gap-1">
                      <Hash className="h-3.5 w-3.5 text-[#8B5E3C]" /> SKU / Código Interno
                    </label>
                    <input
                      type="text" value={sku} onChange={(e) => setSku(e.target.value)}
                      placeholder="Ex: PET-001"
                      className="w-full bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-xl py-3 px-4 text-xs font-semibold text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15 focus:border-[#8B5E3C] focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#2B2620] flex items-center gap-1">
                      <ScanBarcode className="h-3.5 w-3.5 text-[#8B5E3C]" /> Código de Barras (EAN)
                    </label>
                    <input
                      type="text" value={barcode} onChange={(e) => setBarcode(e.target.value)}
                      placeholder="Ex: 7891234567890"
                      className="w-full bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-xl py-3 px-4 text-xs font-semibold text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15 focus:border-[#8B5E3C] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Brand */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#2B2620] flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-[#8B5E3C]" /> Marca / Fabricante
                  </label>
                  <input
                    type="text" value={brand} onChange={(e) => setBrand(e.target.value)}
                    placeholder="Ex: Golden, Tortuga, Ceva, Tramontina..."
                    className="w-full bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-xl py-3 px-4 text-xs font-semibold text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15 focus:border-[#8B5E3C] focus:bg-white transition-all"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#2B2620]">
                    Categoria do Produto *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => {
                      const isSelected = categoryId === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setCategoryId(c.id)}
                          className={`flex items-center gap-1.5 text-xs font-black px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#8B5E3C] text-white border-[#8B5E3C] shadow-md shadow-[#8B5E3C]/20 ring-2 ring-[#8B5E3C]/20 scale-[1.02]"
                              : "bg-[#F5EFE6] text-[#2B2620] border-[#EDE3D3] hover:bg-[#EDE3D3] hover:border-[#8B5E3C]/40"
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                          <span>{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tags Input */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#2B2620] flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5 text-[#8B5E3C]" /> Tags / Palavras-Chave de Busca
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text" value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                      placeholder="Ex: racao, cao-adulto, premium... (Pressione Enter)"
                      className="flex-1 bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-xl py-2.5 px-4 text-xs font-semibold text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15 focus:border-[#8B5E3C] focus:bg-white transition-all"
                    />
                    <button
                      type="button" onClick={addTag}
                      className="bg-[#8B5E3C] hover:bg-[#6d482d] text-white font-black text-xs uppercase px-5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tags.map((t) => (
                        <span key={t} className="flex items-center gap-1.5 bg-[#EDE3D3] text-[#2B2620] border border-[#8B5E3C]/20 text-xs font-bold px-3 py-1 rounded-full shadow-2xs">
                          #{t}
                          <button type="button" onClick={() => removeTag(t)} className="text-[#8B5E3C] hover:text-rose-600 transition-colors">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Toggles */}
                <div className="border-t border-[#EDE3D3]/60 pt-5 space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Opções de Visibilidade</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        active
                          ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20"
                          : "bg-[#F5EFE6]/50 border-[#EDE3D3] hover:border-gray-300"
                      }`}
                    >
                      <div className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${active ? "bg-emerald-600" : "bg-gray-300"}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${active ? "left-4.5" : "left-0.5"}`} />
                      </div>
                      <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="hidden" />
                      <div>
                        <span className="text-xs font-black text-[#2B2620] block">Ativo na Loja</span>
                        <span className="text-[9px] text-[#7A6F63] font-medium">Disponível para venda</span>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        featured
                          ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20"
                          : "bg-[#F5EFE6]/50 border-[#EDE3D3] hover:border-gray-300"
                      }`}
                    >
                      <div className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${featured ? "bg-amber-500" : "bg-gray-300"}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${featured ? "left-4.5" : "left-0.5"}`} />
                      </div>
                      <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="hidden" />
                      <div>
                        <span className="text-xs font-black text-[#2B2620] block">Em Destaque ⭐</span>
                        <span className="text-[9px] text-[#7A6F63] font-medium">Banner principal</span>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isNew
                          ? "bg-rose-50/80 border-rose-300 ring-2 ring-rose-500/20"
                          : "bg-[#F5EFE6]/50 border-[#EDE3D3] hover:border-gray-300"
                      }`}
                    >
                      <div className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${isNew ? "bg-rose-500" : "bg-gray-300"}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isNew ? "left-4.5" : "left-0.5"}`} />
                      </div>
                      <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} className="hidden" />
                      <div>
                        <span className="text-xs font-black text-[#2B2620] block">Novidade 🔥</span>
                        <span className="text-[9px] text-[#7A6F63] font-medium">Selo de lançamento</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab: Preços & Margem ─────────────────────────────────── */}
            {activeTab === "pricing" && (
              <div className="bg-white border border-[#EDE3D3] rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-[#EDE3D3]/60 pb-3">
                  <h2 className="text-xs font-black text-[#2B2620] uppercase tracking-widest flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-[#8B5E3C]" />
                    Formação de Preços & Custo
                  </h2>
                  <span className="text-[9px] font-extrabold text-[#8B5E3C] bg-[#8B5E3C]/10 px-2.5 py-1 rounded-full border border-[#8B5E3C]/20">
                    Etapa 2 de 4
                  </span>
                </div>

                {/* COST PRICE — BRAND STYLED CALLOUT */}
                <div className="relative overflow-hidden bg-[#EDE3D3]/40 border-l-4 border-l-[#8B5E3C] border-y border-r border-[#EDE3D3] p-5 rounded-3xl space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-[#2B2620] flex items-center gap-1.5">
                      <span className="p-1 rounded-lg bg-[#8B5E3C] text-white font-black text-[10px]">CUSTO</span>
                      Preço Pago ao Fornecedor (Custo de Aquisição)
                    </label>
                    <span className="text-[9px] font-black uppercase bg-[#8B5E3C]/15 text-[#8B5E3C] px-2.5 py-0.5 rounded-md">
                      Apenas Admin
                    </span>
                  </div>
                  <p className="text-xs text-[#7A6F63] font-medium">
                    Insira o custo de compra para calcular o lucro líquido real das vendas no Dashboard.
                  </p>
                  <div className="relative mt-2">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-sm font-black text-[#8B5E3C]">R$</span>
                    <input
                      type="text" value={costPrice} onChange={onCostPriceChange}
                      placeholder="0,00"
                      className="w-full bg-white border-2 border-[#8B5E3C]/50 rounded-2xl pl-11 py-3 px-4 text-base font-black text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Sell Price Standard */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#2B2620]">
                    Preço de Venda Padrão (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xs font-black text-[#7A6F63]">R$</span>
                    <input
                      type="text" required value={price} onChange={onPriceChange}
                      placeholder="0,00"
                      className="w-full bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-2xl pl-10 py-3 px-4 text-sm font-black text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15 focus:border-[#8B5E3C] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Promo Price */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#2B2620]">
                      Preço Promocional (Opcional)
                    </label>
                    {discountPct > 0 && (
                      <span className="text-[10px] bg-[#8B5E3C] text-white px-2.5 py-0.5 rounded-full font-black shadow-2xs animate-pulse">
                        -{discountPct}% OFF
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xs font-black text-[#7A6F63]">R$</span>
                    <input
                      type="text" value={promoPrice} onChange={onPromoPriceChange}
                      placeholder="0,00 (deixe em branco se não houver promoção)"
                      className="w-full bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-2xl pl-10 py-3 px-4 text-sm font-black text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15 focus:border-[#8B5E3C] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Wholesale Price */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#2B2620]">
                    Preço de Atacado (Opcional)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xs font-black text-[#7A6F63]">R$</span>
                    <input
                      type="text" value={wholesalePrice} onChange={onWholesalePriceChange}
                      placeholder="0,00 (opcional para vendas em grandes volumes)"
                      className="w-full bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-2xl pl-10 py-3 px-4 text-sm font-black text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15 focus:border-[#8B5E3C] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Mobile Margin Widget */}
                <div className="lg:hidden">
                  <MarginCard
                    costNum={costPriceNum} priceNum={priceNum}
                    promoPriceNum={promoPriceNum} stockNum={stock} unitStr={unit}
                  />
                </div>
              </div>
            )}

            {/* ── Tab: Estoque & Lote ──────────────────────────────────── */}
            {activeTab === "stock" && (
              <div className="bg-white border border-[#EDE3D3] rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-[#EDE3D3]/60 pb-3">
                  <h2 className="text-xs font-black text-[#2B2620] uppercase tracking-widest flex items-center gap-2">
                    <Package className="h-4 w-4 text-[#8B5E3C]" />
                    Estoque & Controle de Lotes
                  </h2>
                  <span className="text-[9px] font-extrabold text-[#8B5E3C] bg-[#8B5E3C]/10 px-2.5 py-1 rounded-full border border-[#8B5E3C]/20">
                    Etapa 3 de 4
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#2B2620]">
                      Quantidade em Estoque *
                    </label>
                    <input
                      type="number" min={0} value={stock} onChange={(e) => setStock(Number(e.target.value))}
                      className="w-full bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-2xl py-3 px-4 text-xs font-bold text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15 focus:border-[#8B5E3C] focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#2B2620]">
                      Estoque Mínimo (Gatilho Alerta)
                    </label>
                    <input
                      type="number" min={0} value={minStock} onChange={(e) => setMinStock(Number(e.target.value))}
                      className="w-full bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-2xl py-3 px-4 text-xs font-bold text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15 focus:border-[#8B5E3C] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Weight */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#2B2620] flex items-center gap-1">
                    <Weight className="h-3.5 w-3.5 text-[#8B5E3C]" /> Peso do Produto (em gramas)
                  </label>
                  <input
                    type="number" min={0} value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Ex: 500 para 500g, 15000 para 15kg"
                    className="w-full bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-2xl py-3 px-4 text-xs font-bold text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15 focus:border-[#8B5E3C] focus:bg-white transition-all"
                  />
                </div>

                {/* Unit Picker */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#2B2620]">
                    Unidade de Medida
                  </label>
                  {isCustomUnit ? (
                    <div className="flex gap-2">
                      <input
                        type="text" value={unit} onChange={(e) => setUnit(e.target.value)}
                        placeholder="Ex: Balde 20kg"
                        className="flex-1 bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-xl py-2.5 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20"
                      />
                      <button type="button" onClick={() => { setIsCustomUnit(false); setUnit("Unidade"); }}
                        className="text-[9px] font-black uppercase bg-[#EDE3D3] hover:bg-[#EDE3D3]/80 text-[#2B2620] px-4 py-2.5 rounded-xl transition-colors cursor-pointer">
                        Padrões
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_UNITS.map((u) => {
                        const isSel = unit === u;
                        return (
                          <button key={u} type="button" onClick={() => setUnit(u)}
                            className={`text-xs font-black uppercase px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                              isSel ? "bg-[#8B5E3C] text-white border-[#8B5E3C] shadow-sm scale-[1.02]" : "bg-[#F5EFE6] text-[#2B2620] border-[#EDE3D3] hover:border-[#8B5E3C]/40"
                            }`}>
                            {u}
                          </button>
                        );
                      })}
                      <button type="button" onClick={() => setIsCustomUnit(true)}
                        className="text-xs font-black uppercase border border-dashed border-[#EDE3D3] hover:border-[#8B5E3C] hover:text-[#8B5E3C] px-3.5 py-2 rounded-xl text-gray-400 transition-all cursor-pointer">
                        + Customizado
                      </button>
                    </div>
                  )}
                </div>

                {/* Lot Section */}
                <div className="border-t border-[#EDE3D3]/60 pt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#2B2620]">Lotes de Aquisição</h3>
                      <p className="text-[9px] text-[#7A6F63] font-medium">Cadastre compras por lote para controle de validade e custo</p>
                    </div>
                    <button
                      type="button" onClick={() => setShowLotForm(!showLotForm)}
                      className="flex items-center gap-1.5 text-xs font-black uppercase bg-[#8B5E3C]/10 text-[#8B5E3C] border border-[#8B5E3C]/30 hover:bg-[#8B5E3C]/20 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      <PlusCircle className="h-4 w-4 text-[#8B5E3C]" />
                      {showLotForm ? "Fechar Lote" : "Cadastrar Lote"}
                    </button>
                  </div>

                  {pendingLot && !showLotForm && (
                    <div className="flex items-center gap-3 bg-[#EDE3D3]/60 border border-[#8B5E3C]/30 rounded-2xl p-4 shadow-2xs">
                      <div className="flex-1">
                        <span className="text-[9px] font-black uppercase text-[#8B5E3C] bg-[#8B5E3C]/20 px-2 py-0.5 rounded">Lote Agendado</span>
                        <p className="text-xs font-black text-[#2B2620] mt-1">
                          Lote #{pendingLot.lotNumber} — {pendingLot.quantity} unidades @ R$ {parseCurrency(pendingLot.costPrice).toFixed(2)}/un.
                        </p>
                      </div>
                      <button type="button" onClick={() => setPendingLot(null)} className="text-[#8B5E3C] hover:text-rose-600 transition-colors p-1">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {showLotForm && (
                    <div className="bg-[#F5EFE6] border border-[#EDE3D3] rounded-2xl p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[9px] font-black uppercase text-[#2B2620]">Número do Lote *</label>
                          <input type="text" value={lotNumber} onChange={(e) => setLotNumber(e.target.value)}
                            placeholder="Ex: LOT-2024-08"
                            className="w-full bg-white border border-[#EDE3D3] rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20" />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[9px] font-black uppercase text-[#2B2620]">Fornecedor</label>
                          <input type="text" value={lotSupplier} onChange={(e) => setLotSupplier(e.target.value)}
                            placeholder="Nome da distribuidora"
                            className="w-full bg-white border border-[#EDE3D3] rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20" />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[9px] font-black uppercase text-[#2B2620]">Qtd. Comprada</label>
                          <input type="number" min={0} value={lotQty} onChange={(e) => setLotQty(e.target.value)}
                            placeholder="0"
                            className="w-full bg-white border border-[#EDE3D3] rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20" />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[9px] font-black uppercase text-[#2B2620]">Custo Unitário (R$)</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-[9px] font-black text-[#8B5E3C]">R$</span>
                            <input type="text" value={lotCostPrice} onChange={onLotCostChange}
                              placeholder="0,00"
                              className="w-full bg-white border border-[#EDE3D3] rounded-xl pl-7 py-2 px-3 text-xs font-black focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[9px] font-black uppercase text-[#2B2620]">Data da Compra</label>
                        <input type="date" value={lotDate} onChange={(e) => setLotDate(e.target.value)}
                          className="w-full bg-white border border-[#EDE3D3] rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20" />
                      </div>
                      <button
                        type="button" onClick={saveLot}
                        className="w-full bg-[#8B5E3C] hover:bg-[#6d482d] text-white font-black text-xs uppercase py-3 rounded-xl shadow-md transition-all cursor-pointer tracking-wider"
                      >
                        ✓ Confirmar Lote
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Tab: Mídia & Descrição ───────────────────────────────── */}
            {activeTab === "media" && (
              <div className="bg-white border border-[#EDE3D3] rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-[#EDE3D3]/60 pb-3">
                  <h2 className="text-xs font-black text-[#2B2620] uppercase tracking-widest flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-[#8B5E3C]" />
                    Mídia & Detalhamento Técnico
                  </h2>
                  <span className="text-[9px] font-extrabold text-[#8B5E3C] bg-[#8B5E3C]/10 px-2.5 py-1 rounded-full border border-[#8B5E3C]/20">
                    Etapa 4 de 4
                  </span>
                </div>

                {/* Upload */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#2B2620]">Fotos do Produto</label>
                  <label
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-8 cursor-pointer transition-all ${
                      isDragging
                        ? "border-[#8B5E3C] bg-[#EDE3D3]/40 scale-[1.01]"
                        : "border-[#EDE3D3] hover:border-[#8B5E3C] hover:bg-[#F5EFE6]/50"
                    }`}
                  >
                    <div className="p-3 rounded-2xl bg-[#F5EFE6] text-[#8B5E3C] mb-3">
                      <Upload className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-black text-[#2B2620]">
                      {isDragging ? "Solte as fotos aqui!" : "Clique ou arraste as fotos do produto"}
                    </span>
                    <span className="text-[10px] text-[#7A6F63] mt-1">PNG, JPG ou WEBP — suporte a múltiplas imagens</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                  </label>

                  {/* Mobile Camera Button */}
                  <div className="sm:hidden">
                    <label className="flex items-center justify-center gap-2 w-full rounded-2xl border border-[#8B5E3C]/30 bg-[#F5EFE6] py-3 text-xs font-black text-[#8B5E3C] cursor-pointer">
                      📷 Tirar Foto Direto na Câmera
                      <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>

                  {images.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative border border-[#EDE3D3] bg-[#F5EFE6]/50 rounded-2xl p-1.5 aspect-square flex items-center justify-center overflow-hidden group shadow-2xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt={`Foto ${idx + 1}`} className="max-h-full max-w-full rounded-xl object-contain" />
                          <button type="button" onClick={() => setImages((p) => p.filter((_, i) => i !== idx))}
                            className="absolute -top-1.5 -right-1.5 bg-rose-500 hover:bg-rose-600 text-white p-1 rounded-xl shadow-md transition-all cursor-pointer">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-1.5 left-1.5 bg-[#8B5E3C] text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                              Capa
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center border border-[#EDE3D3] bg-[#F5EFE6]/30 rounded-2xl p-4 min-h-[70px]">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Nenhuma foto enviada</span>
                    </div>
                  )}
                </div>

                {/* Short Desc */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#2B2620]">Descrição Curta (Vitrine da Loja)</label>
                    <span className="text-[9px] text-[#7A6F63] font-bold">{shortDesc.length}/120</span>
                  </div>
                  <input
                    type="text" maxLength={120} value={shortDesc} onChange={(e) => setShortDesc(e.target.value)}
                    placeholder="Ex: Alimento completo e balanceado para cães adultos de porte médio..."
                    className="w-full bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-xl py-3 px-4 text-xs font-semibold text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15 focus:border-[#8B5E3C] focus:bg-white transition-all"
                  />
                </div>

                {/* Full Desc */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#2B2620]">
                    Ficha Técnica / Detalhes Completos
                  </label>
                  <textarea
                    rows={6} value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="Composição nutricional, instruções de uso, dosagem recomendada e especificações técnicas..."
                    className="w-full bg-[#F5EFE6]/40 border border-[#EDE3D3] rounded-2xl py-3 px-4 text-xs font-medium text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15 focus:border-[#8B5E3C] focus:bg-white transition-all resize-none"
                  />
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="bg-white border border-[#EDE3D3] rounded-3xl p-5 shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#8B5E3C]" />
                <span className="text-xs text-[#7A6F63] font-semibold hidden sm:inline">Campos validados e prontos</span>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/produtos"
                  className="px-5 py-3 rounded-2xl border border-[#EDE3D3] hover:bg-[#EDE3D3]/50 text-[#7A6F63] font-bold text-xs transition-all"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-7 py-3 rounded-2xl bg-[#8B5E3C] hover:bg-[#6d482d] text-white font-black text-xs shadow-lg shadow-[#8B5E3C]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 uppercase tracking-wider"
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? "Salvando..." : isEdit ? "Salvar Alterações" : "Cadastrar Produto"}</span>
                </button>
              </div>
            </div>

          </div>

          {/* ── Right Column: Financial HUD + Store Mockup ───────────────────── */}
          <div className="space-y-5 sticky top-8 hidden lg:block">

            {/* High-Tech Margin HUD */}
            <MarginCard
              costNum={costPriceNum} priceNum={priceNum}
              promoPriceNum={promoPriceNum} stockNum={stock} unitStr={unit}
            />

            {/* Live Store Preview Card */}
            <div className="bg-white border border-[#EDE3D3] rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#EDE3D3]/60 pb-2.5">
                <p className="text-[10px] font-black text-[#7A6F63] uppercase tracking-widest flex items-center gap-1.5">
                  <span>👁️</span> Visualização na Vitrine
                </p>
                <span className="text-[8px] font-extrabold bg-[#F5EFE6] text-[#2B2620] px-2 py-0.5 rounded-md border border-[#EDE3D3]">
                  Mockup Ao Vivo
                </span>
              </div>

              {/* Card Container */}
              <div className="bg-white rounded-2xl border border-[#EDE3D3] overflow-hidden shadow-md relative group">
                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
                  {discountPct > 0 && (
                    <span className="bg-[#e2b13c] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                      -{discountPct}% OFF
                    </span>
                  )}
                  {isNew && (
                    <span className="bg-rose-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                      <Sparkles className="h-2.5 w-2.5" /> Novo
                    </span>
                  )}
                  {featured && !isNew && (
                    <span className="bg-[#8B5E3C] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                      Destaque
                    </span>
                  )}
                </div>

                {/* Product Image */}
                <div className="relative aspect-square bg-[#F5EFE6]/50 flex items-center justify-center border-b border-[#EDE3D3]/60 overflow-hidden">
                  {images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={images[0]} alt="preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="text-center flex flex-col items-center gap-2 text-gray-300">
                      <ShoppingCart className="h-10 w-10 text-gray-300" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Sem Foto</span>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-4 space-y-2 bg-white">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-3 w-3 text-amber-400 fill-current" />)}
                    <span className="text-[9px] text-[#7A6F63] font-extrabold ml-1">(5.0)</span>
                  </div>

                  <h4 className="text-xs font-black text-[#2B2620] line-clamp-2 min-h-[32px] leading-tight">
                    {name.trim() || "Nome do Produto Exemplo"}
                  </h4>

                  {brand && (
                    <span className="text-[9px] font-black uppercase text-[#8B5E3C] bg-[#8B5E3C]/10 px-2 py-0.5 rounded border border-[#8B5E3C]/20">
                      {brand}
                    </span>
                  )}

                  <p className="text-[10px] text-[#7A6F63] line-clamp-2 leading-relaxed">
                    {shortDesc.trim() || "Descrição curta exibida na vitrine..."}
                  </p>

                  {/* Price & Buy Button */}
                  <div className="pt-2 flex items-end justify-between border-t border-[#EDE3D3]/40">
                    <div>
                      {discountPct > 0 && (
                        <span className="text-[9px] text-[#7A6F63] line-through block">
                          R$ {priceNum.toFixed(2).replace(".", ",")}
                        </span>
                      )}
                      <span className="text-base font-black text-[#8B5E3C] leading-none block">
                        R$ {(sellPrice || 0).toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-[8px] text-[#7A6F63] font-bold block mt-0.5">
                        por {unit || "unidade"}
                      </span>
                    </div>

                    <button type="button" className="bg-[#8B5E3C] hover:bg-[#6d482d] text-white text-[9px] font-black px-3.5 py-2 rounded-xl uppercase tracking-wider shadow-sm">
                      Comprar
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </form>
    </div>
  );
}
