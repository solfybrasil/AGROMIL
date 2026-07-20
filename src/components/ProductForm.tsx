"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, AlertCircle, Upload, Trash2, ShoppingCart, Star, HelpCircle } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

interface ProductFormData {
  name: string;
  description: string;
  shortDesc: string;
  price: number | string;
  promoPrice: number | string;
  stock: number;
  unit: string;
  sku: string;
  categoryId: string;
  active: boolean;
  featured: boolean;
  images?: string[];
}

interface ProductFormProps {
  initialData?: ProductFormData & { id?: string };
  isEdit?: boolean;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-jardinagem", name: "Jardinagem & Vasos" },
  { id: "cat-petshop", name: "Rações & Acessórios Pet" },
  { id: "cat-agropecuaria", name: "Agropecuária Geral" },
  { id: "cat-ferramentas", name: "Ferramentas & Equipamentos" },
  { id: "cat-irrigacao", name: "Irrigação" },
  { id: "cat-vestuario-epi", name: "Vestuário & EPI" },
];

const PRESET_UNITS = ["Unidade", "Saco 5kg", "Saco 15kg", "Caixa", "Pacote"];

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const formatInitialCurrency = (val: any) => {
  if (val === undefined || val === null || val === "") return "";
  const num = Number(val);
  return num.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form Fields State
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [shortDesc, setShortDesc] = useState(initialData?.shortDesc || "");
  const [price, setPrice] = useState(formatInitialCurrency(initialData?.price));
  const [promoPrice, setPromoPrice] = useState(formatInitialCurrency(initialData?.promoPrice));
  const [stock, setStock] = useState(initialData?.stock || 0);
  const [unit, setUnit] = useState(initialData?.unit || "Unidade");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [active, setActive] = useState(initialData?.active !== undefined ? initialData.active : true);
  const [featured, setFeatured] = useState(initialData?.featured !== undefined ? initialData.featured : false);
  const [dbHasNoCategories, setDbHasNoCategories] = useState(false);
  const [images, setImages] = useState<string[]>(initialData?.images?.length ? initialData.images : []);
  const [isDragging, setIsDragging] = useState(false);
  const [isCustomUnit, setIsCustomUnit] = useState(!PRESET_UNITS.includes(initialData?.unit || "Unidade"));

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categorias");
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setCategories(data);
            setDbHasNoCategories(false);
          } else {
            setDbHasNoCategories(true);
          }
        }
      } catch (err) {
        console.warn("Failed to load categories for select. Using defaults.", err);
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFiles(Array.from(files));
    // Reset input so selecting the same file again re-triggers change
    e.target.value = "";
  };

  const processFiles = async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;
    try {
      const compressed = await Promise.all(imageFiles.map((f) => compressImage(f)));
      setImages((prev) => [...prev, ...compressed]);
    } catch (err) {
      console.error("Failed to compress image:", err);
      setError("Falha ao carregar e comprimir a imagem. Tente outro arquivo.");
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const parseCurrency = (val: string | number) => {
    if (typeof val === "number") return val;
    if (!val) return 0;
    const clean = val.replace(/\./g, "").replace(",", ".");
    return Number(clean);
  };

  const priceNum = parseCurrency(price);
  const promoPriceNum = parseCurrency(promoPrice);
  
  const discountPercentage = priceNum && promoPriceNum && promoPriceNum < priceNum
    ? Math.round(((priceNum - promoPriceNum) / priceNum) * 100)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name.trim()) {
      setError("O nome do produto é obrigatório.");
      setLoading(false);
      return;
    }

    if (!categoryId) {
      setError("Selecione uma categoria válida.");
      setLoading(false);
      return;
    }

    const priceValue = parseCurrency(price);
    const promoPriceValue = promoPrice ? parseCurrency(promoPrice) : null;

    if (isNaN(priceValue) || priceValue <= 0) {
      setError("Preço padrão inválido.");
      setLoading(false);
      return;
    }

    if (promoPriceValue !== null && (isNaN(promoPriceValue) || promoPriceValue >= priceValue)) {
      setError("Preço promocional deve ser menor que o preço padrão.");
      setLoading(false);
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      shortDesc: shortDesc.trim(),
      price: priceValue,
      promoPrice: promoPriceValue,
      stock: Number(stock),
      unit: unit.trim(),
      sku: sku.trim() || null,
      categoryId,
      active,
      featured,
      images: images.length ? images : [],
    };

    try {
      const endpoint = isEdit ? `/api/produtos/${initialData?.id}` : "/api/produtos";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/produtos");
        router.refresh();
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || "Erro no servidor ao salvar produto.");
      }
    } catch (err) {
      console.error("Failed to save product", err);
      setError("Erro de rede. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 select-none max-w-7xl">
      {/* Back to list */}
      <div>
        <Link
          href="/admin/produtos"
          className="inline-flex items-center gap-1.5 text-xs font-black text-primary hover:text-[#122e22] uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para a Lista</span>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start gap-2.5 text-xs font-semibold">
          <AlertCircle className="h-4.5 w-4.5 text-red-500 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Split grid: Form on the Left, Live Card Preview on the Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Form panel */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-3xs space-y-6">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest pb-3 border-b border-gray-50">
            {isEdit ? "Editar Dados do Produto" : "Novo Cadastro de Produto"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6 text-xs font-bold text-gray-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Name */}
              <div className="sm:col-span-2 space-y-1.5">
                <label htmlFor="prod-name" className="block text-[10px] font-black uppercase tracking-wider">
                  Nome do Produto *
                </label>
                <input
                  id="prod-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Ração Golden Especial Cães 15kg"
                  className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-300"
                />
              </div>

              {/* Category Select */}
              <div className="space-y-1.5">
                <label htmlFor="prod-cat" className="block text-[10px] font-black uppercase tracking-wider">
                  Categoria *
                </label>
                <select
                  id="prod-cat"
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                  disabled={dbHasNoCategories}
                >
                  {dbHasNoCategories ? (
                    <option value="">Nenhuma categoria no banco</option>
                  ) : (
                    <>
                      <option value="">Selecione...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* SKU */}
              <div className="space-y-1.5">
                <label htmlFor="prod-sku" className="block text-[10px] font-black uppercase tracking-wider">
                  Código de Estoque (SKU)
                </label>
                <input
                  id="prod-sku"
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Ex: PET-001"
                  className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Description Short */}
              <div className="sm:col-span-2 space-y-1.5">
                <div className="flex justify-between">
                  <label htmlFor="prod-sdesc" className="text-[10px] font-black uppercase tracking-wider">
                    Descrição Curta (Vitrine)
                  </label>
                  <span className="text-[9px] text-gray-400 font-bold">{shortDesc.length}/120</span>
                </div>
                <input
                  id="prod-sdesc"
                  type="text"
                  maxLength={120}
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="Ex: Alimento completo premium para cães adultos..."
                  className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Description Long */}
              <div className="sm:col-span-2 space-y-1.5">
                <label htmlFor="prod-desc" className="block text-[10px] font-black uppercase tracking-wider">
                  Ficha Técnica / Detalhes do Produto
                </label>
                <textarea
                  id="prod-desc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Composição, modo de uso, dosagem e informações completas..."
                  className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Image Upload Area */}
              <div className="sm:col-span-2 space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider">
                  Fotos do Produto
                </label>

                <label
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all group
                    ${isDragging
                      ? "border-primary bg-primary/5 scale-[1.01]"
                      : "border-gray-100 hover:border-primary hover:bg-primary/2"}`}
                >
                  <div className="flex flex-col items-center text-center">
                    <Upload className="h-6 w-6 text-gray-400 group-hover:text-primary transition-colors mb-2" />
                    <span className="text-xs font-extrabold text-gray-700">
                      {isDragging ? "Solte a imagem aqui" : "Arraste uma imagem ou clique para escolher"}
                    </span>
                    <span className="text-[9px] text-gray-400 mt-1">Formatos: PNG, JPG, JPEG — você pode adicionar várias</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    id="product-image-input"
                  />
                </label>

                {/* Mobile: open camera directly */}
                <div className="sm:hidden">
                  <label className="flex items-center justify-center gap-2 w-full rounded-2xl border border-primary/30 bg-primary/5 py-3 text-xs font-black text-primary cursor-pointer active:scale-[0.98] transition-transform">
                    <span>📷 Tirar Foto na Hora</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Thumbnails grid */}
                {images.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative border border-gray-100 bg-gray-50/50 rounded-xl p-1.5 aspect-square flex items-center justify-center overflow-hidden group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Foto ${idx + 1}`} className="max-h-full max-w-full rounded-lg object-contain" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-1.5 -right-1.5 bg-rose-500 hover:bg-rose-600 text-white p-1 rounded-xl shadow transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 bg-primary text-white text-[7px] font-black px-1 py-0.5 rounded uppercase">
                            Capa
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center border border-gray-100 bg-gray-50/50 rounded-2xl p-4 min-h-[80px]">
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest font-black">Nenhuma foto ainda</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <label htmlFor="prod-price" className="block text-[10px] font-black uppercase tracking-wider">
                  Preço Padrão *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[10px] font-black text-gray-400">R$</span>
                  <input
                    id="prod-price"
                    type="text"
                    required
                    value={price}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, "");
                      if (!clean) { setPrice(""); return; }
                      setPrice((Number(clean) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                    }}
                    placeholder="0,00"
                    className="w-full bg-white border border-gray-200 rounded-xl pl-9 py-2.5 px-4 text-xs font-black text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Promo Price */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="prod-promo" className="text-[10px] font-black uppercase tracking-wider">
                    Preço Promocional
                  </label>
                  {discountPercentage > 0 && (
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-150 px-2 py-0.5 rounded-md font-black animate-pulse">
                      -{discountPercentage}%
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[10px] font-black text-gray-400">R$</span>
                  <input
                    id="prod-promo"
                    type="text"
                    value={promoPrice}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, "");
                      if (!clean) { setPromoPrice(""); return; }
                      setPromoPrice((Number(clean) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                    }}
                    placeholder="0,00"
                    className="w-full bg-white border border-gray-200 rounded-xl pl-9 py-2.5 px-4 text-xs font-black text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Stock */}
              <div className="space-y-1.5">
                <label htmlFor="prod-stock" className="block text-[10px] font-black uppercase tracking-wider">
                  Quantidade em Estoque
                </label>
                <input
                  id="prod-stock"
                  type="number"
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Unit Select (Segmented layout picker) */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider">
                  Unidade de Medida
                </label>
                
                {isCustomUnit ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="Ex: Balde 20kg"
                      className="flex-1 bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:ring-2"
                    />
                    <button
                      type="button"
                      onClick={() => { setIsCustomUnit(false); setUnit("Unidade"); }}
                      className="text-[9px] font-black uppercase bg-gray-100 hover:bg-gray-200 text-gray-500 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Padrões
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_UNITS.map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setUnit(u)}
                        className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          unit === u
                            ? "bg-primary text-white border-primary"
                            : "bg-gray-50 text-gray-500 border-gray-200 hover:border-primary/30"
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setIsCustomUnit(true)}
                      className="text-[9px] font-black uppercase border border-dashed border-gray-300 hover:border-primary hover:text-primary px-2.5 py-1.5 rounded-lg text-gray-400 transition-all cursor-pointer"
                    >
                      + Outro
                    </button>
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="sm:col-span-2 border-t border-gray-50 pt-4 flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
                  />
                  <span className="text-[10px] font-black uppercase tracking-wider">Disponível para Compra (Ativo)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
                  />
                  <span className="text-[10px] font-black uppercase tracking-wider">Produto em Destaque</span>
                </label>
              </div>

            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-50">
              <Link
                href="/admin/produtos"
                className="inline-flex items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-500 font-bold text-xs py-3 px-6 rounded-xl transition-all"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 bg-primary hover:bg-[#122e22] text-white font-extrabold text-xs py-3 px-6 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-40"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? "Salvando..." : "Salvar Produto"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Mockup Card Preview on Desktop */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-3xs sticky top-8 space-y-4 hidden lg:block">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2.5">
            👁️ Visualização na Loja (Homepage)
          </p>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden relative shadow-3xs">
            {/* Promo label */}
            {discountPercentage > 0 && (
              <span className="absolute top-3 left-3 bg-[#e2b13c] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full z-10">
                -{discountPercentage}%
              </span>
            )}
            {featured && !promoPrice && (
              <span className="absolute top-3 left-3 bg-primary text-white text-[9px] font-black px-2.5 py-0.5 rounded-full z-10">
                Destaque
              </span>
            )}

            {/* Product image container */}
            <div className="aspect-square bg-gray-50 flex items-center justify-center border-b border-gray-50 relative overflow-hidden">
              {images[0] ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={images[0]} alt="Live Card preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center flex flex-col items-center gap-1.5 text-gray-300">
                  <ShoppingCart className="h-8 w-8" />
                  <span className="text-[9px] font-bold uppercase">Mockup</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(star => <Star key={star} className="h-3 w-3 text-amber-400 fill-current" />)}
                <span className="text-[9px] text-gray-400 font-bold ml-1">(5.0)</span>
              </div>

              <h4 className="text-xs font-black text-gray-800 line-clamp-2 min-h-[32px] leading-tight">
                {name.trim() || "Nome do Produto Exemplo"}
              </h4>

              <p className="text-[10px] text-gray-450 line-clamp-2 leading-relaxed">
                {shortDesc.trim() || "Descrição da vitrine..."}
              </p>

              <div className="pt-2 flex items-end justify-between">
                <div>
                  {discountPercentage > 0 && (
                    <span className="text-[9px] text-gray-400 line-through block">
                      R$ {priceNum.toFixed(2).replace(".", ",")}
                    </span>
                  )}
                  <span className="text-sm font-black text-primary leading-none">
                    R$ {(promoPriceNum || priceNum || 0).toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-[8px] text-gray-400 font-bold block mt-0.5">
                    por {unit || "unidade"}
                  </span>
                </div>

                <div className="bg-primary text-white text-[9px] font-black px-3 py-2 rounded-xl uppercase tracking-wider">
                  Comprar
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2 text-[10px] text-gray-400 font-semibold bg-gray-50/50 p-3 rounded-2xl leading-relaxed">
            <HelpCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <span>Este mockup simula a aparência exata do card do produto nas vitrines e buscas do marketplace.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
