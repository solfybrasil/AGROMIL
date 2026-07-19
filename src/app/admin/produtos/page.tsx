"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  PackageOpen,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle,
  Coins,
  Package,
  Layers,
  ArrowRight,
  Minus,
  Loader,
} from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  promoPrice: number | null;
  stock: number;
  unit: string;
  active: boolean;
  categoryId: string;
  images?: string[];
}

interface Category {
  id: string;
  name: string;
}

const DEFAULT_PRODUCTS: Product[] = [
  { id: "m-1", name: "Adubo Orgânico Concentrado Húmus de Minhoca 5kg", sku: "JAD-001", price: 24.90, promoPrice: 19.90, stock: 35, unit: "Saco 5kg", active: true, categoryId: "jardinagem", images: [] },
  { id: "m-2", name: "Vaso Auto-irrigável Gourmet N03 Verde Floresta", sku: "JAD-002", price: 32.90, promoPrice: null, stock: 20, unit: "Unidade", active: true, categoryId: "jardinagem", images: [] },
  { id: "m-3", name: "Pá de Mão Estreita Tramontina em Aço", sku: "JAD-003", price: 15.50, promoPrice: null, stock: 50, unit: "Unidade", active: true, categoryId: "jardinagem", images: [] },
  { id: "m-4", name: "Ração Premium Especial Cães Adultos Frango 15kg", sku: "PET-001", price: 189.90, promoPrice: 169.90, stock: 15, unit: "Saco 15kg", active: true, categoryId: "petshop", images: [] },
  { id: "m-5", name: "Antipulgas e Carrapatos Simparic 20mg", sku: "PET-002", price: 94.50, promoPrice: null, stock: 45, unit: "Caixa 1 Comp.", active: true, categoryId: "petshop", images: [] },
  { id: "m-6", name: "Sal Mineral 80 Fosforo para Bovinos 25kg", sku: "AGR-001", price: 110.00, promoPrice: null, stock: 8, unit: "Saco 25kg", active: true, categoryId: "agropecuaria", images: [] },
];

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusTab, setStatusTab] = useState<"all" | "active" | "inactive" | "lowStock">("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingStockId, setUpdatingStockId] = useState<string | null>(null);

  // Fetch data
  const fetchData = async () => {
    try {
      // Products
      const prodRes = await fetch("/api/produtos");
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      } else {
        setProducts(DEFAULT_PRODUCTS);
      }

      // Categories
      const catRes = await fetch("/api/categorias");
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
    } catch (err) {
      console.warn("API offline. Using fallbacks.", err);
      setProducts(DEFAULT_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto? (O produto será removido do catálogo, mas o histórico de vendas passadas será preservado)")) return;
    setMessage("");

    try {
      const res = await fetch(`/api/produtos/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setProducts(prev => prev.filter((p) => p.id !== id));
        setMessage("Produto excluído com sucesso.");
        return;
      } else {
        alert(`Erro ao excluir do banco de dados: ${data.error || "Erro inesperado"}`);
        setMessage(`Erro ao excluir: ${data.error || "Erro no servidor"}`);
        return;
      }
    } catch (err) {
      console.warn("Could not delete from DB. Applying locally.", err);
      setProducts(prev => prev.filter((p) => p.id !== id));
      setMessage("Produto excluído localmente (Modo Demo).");
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      // Optimistic UI
      setProducts(prev => prev.map((p) => (p.id === id ? { ...p, active: !currentStatus } : p)));

      const res = await fetch(`/api/produtos/${id}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentStatus }),
      });
      if (!res.ok) {
        fetchData();
      }
    } catch (err) {
      console.warn("Could not toggle status via API.", err);
    }
  };

  // Inline stock adjustment with direct API update
  const adjustStock = async (id: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    if (newStock === currentStock) return;

    setUpdatingStockId(id);
    // Optimistic UI update
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));

    try {
      const res = await fetch(`/api/produtos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      if (!res.ok) {
        // Revert on failure
        fetchData();
      }
    } catch {
      console.warn("Failed to update stock online. Local change kept.");
    } finally {
      setUpdatingStockId(null);
    }
  };

  // KPI Calculations
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.stock <= 10).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.stock * (p.promoPrice ? Number(p.promoPrice) : Number(p.price))), 0);

  // Filters logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || p.categoryId === selectedCategory;
    
    let matchesStatus = true;
    if (statusTab === "active") matchesStatus = p.active;
    else if (statusTab === "inactive") matchesStatus = !p.active;
    else if (statusTab === "lowStock") matchesStatus = p.stock <= 10;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-4 md:space-y-7 animate-fade-in-up">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-lg md:text-2xl font-extrabold text-[#1b4332] tracking-tight">Catálogo</h1>
          <p className="text-[9px] md:text-xs text-gray-400 font-semibold mt-0.5 hidden sm:block">
            Gerencie produtos, estoques e preços.
          </p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="inline-flex items-center gap-1.5 bg-primary hover:bg-[#122e22] text-white font-extrabold text-[10px] md:text-xs py-2 md:py-3 px-3 md:px-5 rounded-xl md:rounded-2xl shadow-xs hover:shadow transition-all active:scale-95 uppercase tracking-wider"
        >
          <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span>Novo</span>
        </Link>
      </div>

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-5">
        <div className="bg-white border border-gray-100 rounded-xl md:rounded-3xl p-3 md:p-5 shadow-xs flex items-center gap-2.5 md:gap-4">
          <div className="bg-primary/10 border border-primary/20 text-primary rounded-xl md:rounded-2xl p-2 md:p-3 flex-shrink-0">
            <Package className="h-3.5 w-3.5 md:h-5 md:w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[7px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-none">Produtos</span>
            <span className="text-base md:text-xl font-black text-gray-800 tracking-tight mt-0.5 block leading-tight">{totalProducts}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl md:rounded-3xl p-3 md:p-5 shadow-xs flex items-center gap-2.5 md:gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl md:rounded-2xl p-2 md:p-3 flex-shrink-0">
            <Coins className="h-3.5 w-3.5 md:h-5 md:w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[7px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-none">Em Estoque</span>
            <span className="text-[11px] md:text-xl font-black text-gray-800 tracking-tight mt-0.5 block leading-tight">
              R$ {totalInventoryValue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl md:rounded-3xl p-3 md:p-5 shadow-xs flex items-center gap-2.5 md:gap-4">
          <div className={`rounded-xl md:rounded-2xl p-2 md:p-3 border flex-shrink-0 ${lowStockCount > 0 ? "bg-amber-500/10 border-amber-500/20 text-amber-600" : "bg-gray-50 border-gray-100 text-gray-400"}`}>
            <AlertCircle className="h-3.5 w-3.5 md:h-5 md:w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[7px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-none">Est. Baixo</span>
            <span className={`text-base md:text-xl font-black tracking-tight mt-0.5 block leading-tight ${lowStockCount > 0 ? "text-amber-600" : "text-gray-800"}`}>
              {lowStockCount}
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl md:rounded-3xl p-3 md:p-5 shadow-xs flex items-center gap-2.5 md:gap-4">
          <div className={`rounded-xl md:rounded-2xl p-2 md:p-3 border flex-shrink-0 ${outOfStockCount > 0 ? "bg-rose-500/10 border-rose-500/20 text-rose-600 animate-pulse" : "bg-gray-50 border-gray-100 text-gray-400"}`}>
            <Trash2 className="h-3.5 w-3.5 md:h-5 md:w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[7px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-none">Esgotados</span>
            <span className={`text-base md:text-xl font-black tracking-tight mt-0.5 block leading-tight ${outOfStockCount > 0 ? "text-rose-600" : "text-gray-800"}`}>
              {outOfStockCount}
            </span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3 md:p-4 rounded-xl md:rounded-2xl flex items-start gap-2 text-[10px] md:text-xs font-semibold">
          <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-600 flex-shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      {/* Filters Area */}
      <div className="bg-white border border-gray-100 rounded-xl md:rounded-3xl p-3 md:p-4 shadow-xs flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Nome ou SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200 rounded-xl pl-9 py-2 px-3 text-[10px] md:text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-300"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl py-2 px-2.5 text-[9px] md:text-xs font-black uppercase text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">Todas</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div className="bg-gray-100/60 p-1 rounded-xl flex select-none border border-gray-200/40 overflow-x-auto scrollbar-none">
          {[
            { key: "all", label: "Todos" },
            { key: "active", label: "Ativos" },
            { key: "inactive", label: "Inativos" },
            { key: "lowStock", label: "Est. Baixo" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusTab(tab.key as any)}
              className={`flex-shrink-0 py-1.5 px-3 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer ${
                statusTab === tab.key
                  ? "bg-white text-primary shadow-xs border border-gray-100"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
          <span className="text-[10px] font-semibold animate-pulse">Carregando produtos...</span>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl md:rounded-3xl shadow-xs overflow-hidden">
          <div className="flex items-center justify-between p-3 md:p-5 border-b border-gray-50">
            <h3 className="text-[9px] md:text-xs font-black text-[#1b4332] uppercase tracking-wider flex items-center gap-1.5">
              <PackageOpen className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
              Produtos ({filteredProducts.length})
            </h3>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-8 md:p-10 text-center text-gray-400 text-[10px] font-semibold">
              Nenhum produto encontrado.
            </div>
          ) : (
            <>
              {/* ── Mobile: Card list ── */}
              <div className="md:hidden divide-y divide-gray-50">
                {filteredProducts.map((prod) => {
                  const hasPromo = prod.promoPrice !== null;
                  const hasLowStock = prod.stock <= 10;
                  const isOutOfStock = prod.stock === 0;
                  return (
                    <div key={prod.id} className="p-3 flex items-start gap-3">
                      <div className="h-10 w-10 bg-gray-50 border border-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {prod.images?.[0] ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={prod.images[0]} alt={prod.name} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-4 w-4 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-gray-800 leading-snug" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{prod.name}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[8px] text-gray-400 font-bold uppercase">{prod.unit}</span>
                          {hasPromo ? (
                            <span className="text-[9px] font-black text-primary">R$ {Number(prod.promoPrice).toFixed(2).replace(".", ",")}</span>
                          ) : (
                            <span className="text-[9px] font-black text-gray-800">R$ {Number(prod.price).toFixed(2).replace(".", ",")}</span>
                          )}
                          <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-lg border ${
                            isOutOfStock ? "bg-rose-50 border-rose-100 text-rose-600" :
                            hasLowStock ? "bg-amber-50 border-amber-100 text-amber-600" :
                            "bg-gray-50 border-gray-100 text-gray-600"
                          }`}>{prod.stock} un.</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => toggleStatus(prod.id, prod.active)} className={`transition-colors ${prod.active ? "text-emerald-500" : "text-gray-300"}`}>
                          {prod.active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                        </button>
                        <Link href={`/admin/produtos/${prod.id}/editar`} className="p-1.5 border border-gray-100 rounded-lg text-gray-400 hover:text-primary transition-colors">
                          <Edit className="h-3.5 w-3.5" />
                        </Link>
                        <button onClick={() => handleDelete(prod.id)} className="p-1.5 border border-gray-100 rounded-lg text-gray-400 hover:text-rose-500 transition-colors cursor-pointer">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Desktop: Table ── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-gray-400 font-black uppercase border-b border-gray-100 tracking-wider">
                      <th className="p-5">Produto</th>
                      <th className="p-5">SKU</th>
                      <th className="p-5">Preço</th>
                      <th className="p-5">Estoque</th>
                      <th className="p-5 text-center">Disp.</th>
                      <th className="p-5 w-24 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-semibold">
                    {filteredProducts.map((prod) => {
                      const hasPromo = prod.promoPrice !== null;
                      const hasLowStock = prod.stock <= 10;
                      const isOutOfStock = prod.stock === 0;
                      return (
                        <tr key={prod.id} className="hover:bg-gray-50/10 transition-colors">
                          <td className="p-5">
                            <div className="flex items-center gap-3.5">
                              <div className="h-11 w-11 bg-gray-50 border border-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                                {prod.images?.[0] ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img src={prod.images[0]} alt={prod.name} className="h-full w-full object-cover" />
                                ) : (
                                  <Package className="h-5 w-5 text-gray-300" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-black text-gray-800 truncate max-w-xs md:max-w-md">{prod.name}</div>
                                <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider block mt-1">{prod.unit}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-5 text-gray-400 font-bold uppercase tracking-wider">{prod.sku || "-"}</td>
                          <td className="p-5">
                            {hasPromo ? (
                              <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 line-through">R$ {Number(prod.price).toFixed(2).replace(".", ",")}</span>
                                <span className="font-black text-[#2d6a4f] text-[13px] mt-0.5">R$ {Number(prod.promoPrice).toFixed(2).replace(".", ",")}</span>
                              </div>
                            ) : (
                              <span className="font-black text-gray-800 text-[13px]">R$ {Number(prod.price).toFixed(2).replace(".", ",")}</span>
                            )}
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-2">
                              <button onClick={() => adjustStock(prod.id, prod.stock, -1)} disabled={updatingStockId === prod.id || isOutOfStock} className="p-1 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 disabled:opacity-30 cursor-pointer active:scale-90 transition-transform">
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className={`w-10 text-center font-black text-xs py-1 rounded-lg border flex items-center justify-center ${
                                isOutOfStock ? "bg-rose-50 border-rose-100 text-rose-600" : hasLowStock ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-gray-50 border-gray-100 text-gray-700"
                              }`}>
                                {updatingStockId === prod.id ? <Loader className="h-3 w-3 animate-spin text-gray-400" /> : prod.stock}
                              </span>
                              <button onClick={() => adjustStock(prod.id, prod.stock, 1)} disabled={updatingStockId === prod.id} className="p-1 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 disabled:opacity-30 cursor-pointer active:scale-90 transition-transform">
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                          <td className="p-5 text-center">
                            <button onClick={() => toggleStatus(prod.id, prod.active)} className={`transition-all duration-300 p-1 hover:scale-105 cursor-pointer ${prod.active ? "text-emerald-500" : "text-gray-300"}`}>
                              {prod.active ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7" />}
                            </button>
                          </td>
                          <td className="p-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link href={`/admin/produtos/${prod.id}/editar`} className="p-2 border border-gray-100 rounded-xl text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors">
                                <Edit className="h-4 w-4" />
                              </Link>
                              <button onClick={() => handleDelete(prod.id)} className="p-2 border border-gray-100 rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
