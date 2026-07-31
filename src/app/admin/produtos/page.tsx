"use client";

import React, { useEffect, useState } from "react";
import {
  Plus, Edit, Trash2, Search, PackageOpen, ToggleLeft, ToggleRight,
  AlertCircle, CheckCircle, Coins, Package, Layers, ArrowRight,
  Minus, Loader, Eye, ShieldAlert, Sparkles, Filter, RefreshCcw,
} from "lucide-react";
import Link from "next/link";
import { dbService } from "@/lib/db-service";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  promoPrice: number | null;
  costPrice?: number;
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

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusTab, setStatusTab] = useState<"all" | "active" | "inactive" | "lowStock">("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingStockId, setUpdatingStockId] = useState<string | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [deleteAllProgress, setDeleteAllProgress] = useState({ current: 0, total: 0 });

  // Fetch data
  const fetchData = async () => {
    try {
      const localProds = await dbService.getProducts();
      const localCats = await dbService.getCategories();
      if (localProds && localProds.length > 0) setProducts(localProds as any);
      if (localCats && localCats.length > 0) setCategories(localCats as any);
      setLoading(false);

      const prodRes = await fetch("/api/produtos");
      const catRes = await fetch("/api/categorias");
      if (prodRes.ok) {
        const data = await prodRes.json();
        if (Array.isArray(data) && data.length > 0) setProducts(data);
      }
      if (catRes.ok) {
        const data = await catRes.json();
        if (Array.isArray(data) && data.length > 0) setCategories(data);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    setMessage("");

    try {
      const res = await fetch(`/api/produtos/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(prev => prev.filter((p) => p.id !== id));
        setMessage("Produto excluído com sucesso.");
        return;
      }
    } catch (err) {
      setProducts(prev => prev.filter((p) => p.id !== id));
      setMessage("Produto excluído localmente.");
    }
  };

  const handleDeleteAll = async () => {
    const total = products.length;
    if (total === 0) return;
    setDeletingAll(true);
    setDeleteAllProgress({ current: 0, total });
    setShowDeleteAllModal(false);
    setMessage("");

    try {
      const res = await fetch("/api/produtos", { method: "DELETE" });
      if (res.ok) {
        setProducts([]);
        setDeleteAllProgress({ current: total, total });
      } else {
        let deleted = 0;
        const snapshot = [...products];
        for (const prod of snapshot) {
          try { await fetch(`/api/produtos/${prod.id}`, { method: "DELETE" }); } catch {}
          deleted++;
          setDeleteAllProgress({ current: deleted, total });
          setProducts(prev => prev.filter(p => p.id !== prod.id));
        }
      }
    } catch {
      let deleted = 0;
      const snapshot = [...products];
      for (const prod of snapshot) {
        try { await fetch(`/api/produtos/${prod.id}`, { method: "DELETE" }); } catch {}
        deleted++;
        setDeleteAllProgress({ current: deleted, total });
        setProducts(prev => prev.filter(p => p.id !== prod.id));
      }
    }

    setDeletingAll(false);
    setDeleteAllProgress({ current: 0, total: 0 });
    setMessage(`${total} produto(s) excluído(s) com sucesso.`);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setProducts(prev => prev.map((p) => (p.id === id ? { ...p, active: !currentStatus } : p)));
      await fetch(`/api/produtos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentStatus }),
      });
    } catch (err) {
      console.warn("Toggle failed offline.", err);
    }
  };

  const adjustStock = async (id: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    if (newStock === currentStock) return;

    setUpdatingStockId(id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));

    try {
      await fetch(`/api/produtos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
    } catch {} finally {
      setUpdatingStockId(null);
    }
  };

  // KPIs
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.stock <= 10).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.stock * (p.promoPrice ? Number(p.promoPrice) : Number(p.price))), 0);

  // Filtered
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
    <div className="space-y-6 font-sans text-[#2B2620] animate-fade-in-up">

      {/* Delete All Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-7 flex flex-col items-center gap-5 border border-rose-100">
            <div className="bg-rose-100 text-rose-600 rounded-2xl p-4">
              <ShieldAlert className="h-10 w-10" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="font-serif text-xl font-bold text-[#2B2620]">Apagar Todos os Produtos?</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Esta ação é <strong>irreversível</strong>. Todos os <strong>{products.length} produtos</strong> serão permanentemente excluídos.
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={() => setShowDeleteAllModal(false)}
                className="flex-1 py-3 px-4 rounded-2xl border border-[#EDE3D3] text-gray-600 text-xs font-bold hover:bg-[#F5EFE6] transition-colors cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleDeleteAll}
                className="flex-1 py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm">
                <Trash2 className="h-3.5 w-3.5" /> Apagar Tudo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete progress */}
      {deletingAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 flex flex-col items-center gap-5">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#8B5E3C] border-t-transparent" />
            <div className="text-center space-y-2">
              <h3 className="font-serif text-lg font-bold text-[#2B2620]">Excluindo produtos...</h3>
              <p className="text-xs text-gray-500 font-medium">
                {deleteAllProgress.current} de {deleteAllProgress.total} produtos removidos
              </p>
              <div className="w-full bg-[#EDE3D3] rounded-full h-2 mt-2">
                <div className="bg-[#8B5E3C] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${deleteAllProgress.total > 0 ? (deleteAllProgress.current / deleteAllProgress.total) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#EDE3D3] shadow-xs">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-[#8B5E3C] bg-[#8B5E3C]/10 px-2.5 py-0.5 rounded-full border border-[#8B5E3C]/20">
            Catálogo Agromil
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#2B2620] tracking-tight mt-0.5">
            Gestão de Produtos
          </h1>
          <p className="text-xs text-[#7A6F63] font-medium mt-0.5">
            Cadastre, edite preços, acompanhe estoques e gerencie lotes.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {products.length > 0 && (
            <button onClick={() => setShowDeleteAllModal(true)}
              className="inline-flex items-center gap-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 font-bold text-xs py-3 px-4 rounded-2xl shadow-xs transition-all active:scale-95 uppercase tracking-wider cursor-pointer">
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Apagar Todos</span>
            </button>
          )}
          <Link href="/admin/produtos/novo"
            className="inline-flex items-center gap-2 bg-[#8B5E3C] hover:bg-[#6d482d] text-white font-black text-xs py-3 px-5 rounded-2xl shadow-md shadow-[#8B5E3C]/20 transition-all active:scale-95 uppercase tracking-wider">
            <Plus className="h-4 w-4" />
            <span>Novo Produto</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white border border-[#EDE3D3] rounded-3xl p-4 md:p-5 shadow-xs flex items-center gap-3.5">
          <div className="bg-[#8B5E3C]/10 border border-[#8B5E3C]/20 text-[#8B5E3C] rounded-2xl p-3 flex-shrink-0">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-black text-[#7A6F63] uppercase tracking-widest block">Cadastrados</span>
            <span className="text-xl font-black text-[#2B2620] tracking-tight">{totalProducts}</span>
          </div>
        </div>

        <div className="bg-white border border-[#EDE3D3] rounded-3xl p-4 md:p-5 shadow-xs flex items-center gap-3.5">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl p-3 flex-shrink-0">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-black text-[#7A6F63] uppercase tracking-widest block">Valor em Venda</span>
            <span className="text-base md:text-lg font-black text-[#2B2620] tracking-tight">
              R$ {totalInventoryValue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#EDE3D3] rounded-3xl p-4 md:p-5 shadow-xs flex items-center gap-3.5">
          <div className={`rounded-2xl p-3 border flex-shrink-0 ${lowStockCount > 0 ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-gray-50 border-gray-100 text-gray-400"}`}>
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-black text-[#7A6F63] uppercase tracking-widest block">Estoque Baixo</span>
            <span className={`text-xl font-black tracking-tight ${lowStockCount > 0 ? "text-amber-700" : "text-[#2B2620]"}`}>{lowStockCount}</span>
          </div>
        </div>

        <div className="bg-white border border-[#EDE3D3] rounded-3xl p-4 md:p-5 shadow-xs flex items-center gap-3.5">
          <div className={`rounded-2xl p-3 border flex-shrink-0 ${outOfStockCount > 0 ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse" : "bg-gray-50 border-gray-100 text-gray-400"}`}>
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-black text-[#7A6F63] uppercase tracking-widest block">Esgotados</span>
            <span className={`text-xl font-black tracking-tight ${outOfStockCount > 0 ? "text-rose-600" : "text-[#2B2620]"}`}>{outOfStockCount}</span>
          </div>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-start gap-2 text-xs font-semibold shadow-xs">
          <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white border border-[#EDE3D3] rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A6F63]" />
            <input
              type="text" placeholder="Buscar por Nome ou SKU..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F5EFE6]/50 border border-[#EDE3D3] rounded-2xl pl-10 py-2.5 px-4 text-xs font-semibold text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15 focus:border-[#8B5E3C] focus:bg-white transition-all"
            />
          </div>
          <select
            value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#F5EFE6]/50 border border-[#EDE3D3] rounded-2xl py-2.5 px-4 text-xs font-black uppercase text-[#2B2620] focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/15"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Filter Tabs */}
        <div className="bg-[#EDE3D3]/50 p-1.5 rounded-2xl flex border border-[#EDE3D3] overflow-x-auto scrollbar-none gap-1">
          {[
            { key: "all", label: "Todos" },
            { key: "active", label: "Ativos" },
            { key: "inactive", label: "Inativos" },
            { key: "lowStock", label: "Estoque Baixo" },
          ].map((tab) => (
            <button
              key={tab.key} onClick={() => setStatusTab(tab.key as any)}
              className={`flex-1 py-2 px-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                statusTab === tab.key
                  ? "bg-[#8B5E3C] text-white shadow-sm"
                  : "text-[#7A6F63] hover:text-[#2B2620] hover:bg-white/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#8B5E3C] border-t-transparent" />
          <span className="text-xs font-semibold animate-pulse text-[#7A6F63]">Carregando produtos...</span>
        </div>
      ) : (
        <div className="bg-white border border-[#EDE3D3] rounded-3xl shadow-xs overflow-hidden">
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#EDE3D3]/60 bg-[#F5EFE6]/30">
            <h3 className="text-xs font-black text-[#2B2620] uppercase tracking-wider flex items-center gap-2">
              <PackageOpen className="h-4 w-4 text-[#8B5E3C]" />
              Produtos Listados ({filteredProducts.length})
            </h3>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-[#7A6F63] text-xs font-semibold">
              Nenhum produto encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F5EFE6]/60 text-[#7A6F63] font-black uppercase border-b border-[#EDE3D3] tracking-wider text-[9px]">
                    <th className="p-4">Produto</th>
                    <th className="p-4">SKU</th>
                    <th className="p-4">Preço</th>
                    <th className="p-4">Estoque</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE3D3]/50 font-semibold">
                  {filteredProducts.map((prod) => {
                    const hasPromo = prod.promoPrice !== null && Number(prod.promoPrice) > 0;
                    const hasLowStock = prod.stock <= 10;
                    const isOutOfStock = prod.stock === 0;

                    return (
                      <tr key={prod.id} className="hover:bg-[#F5EFE6]/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3.5">
                            <div className="h-11 w-11 bg-[#F5EFE6] border border-[#EDE3D3] rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {prod.images?.[0] ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={prod.images[0]} alt={prod.name} className="h-full w-full object-cover" />
                              ) : (
                                <Package className="h-5 w-5 text-gray-300" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <Link href={`/produto/${prod.id}`} target="_blank" className="font-black text-[#2B2620] hover:text-[#8B5E3C] transition-colors truncate max-w-xs md:max-w-md block">
                                {prod.name}
                              </Link>
                              <span className="text-[9px] text-[#7A6F63] font-bold uppercase block mt-0.5">{prod.unit}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-[#7A6F63] font-bold uppercase tracking-wider">{prod.sku || "—"}</td>
                        <td className="p-4">
                          {hasPromo ? (
                            <div className="flex flex-col">
                              <span className="text-[9px] text-[#7A6F63] line-through">R$ {Number(prod.price).toFixed(2).replace(".", ",")}</span>
                              <span className="font-black text-[#8B5E3C] text-xs">R$ {Number(prod.promoPrice).toFixed(2).replace(".", ",")}</span>
                            </div>
                          ) : (
                            <span className="font-black text-[#2B2620] text-xs">R$ {Number(prod.price).toFixed(2).replace(".", ",")}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => adjustStock(prod.id, prod.stock, -1)} disabled={updatingStockId === prod.id || isOutOfStock}
                              className="p-1 rounded-lg border border-[#EDE3D3] hover:bg-[#F5EFE6] text-[#2B2620] disabled:opacity-30 cursor-pointer active:scale-90 transition-transform">
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className={`w-10 text-center font-black text-xs py-1 rounded-xl border flex items-center justify-center ${
                              isOutOfStock ? "bg-rose-50 border-rose-200 text-rose-600" :
                              hasLowStock ? "bg-amber-50 border-amber-200 text-amber-700" :
                              "bg-[#F5EFE6] border-[#EDE3D3] text-[#2B2620]"
                            }`}>
                              {updatingStockId === prod.id ? <Loader className="h-3 w-3 animate-spin text-[#8B5E3C]" /> : prod.stock}
                            </span>
                            <button onClick={() => adjustStock(prod.id, prod.stock, 1)} disabled={updatingStockId === prod.id}
                              className="p-1 rounded-lg border border-[#EDE3D3] hover:bg-[#F5EFE6] text-[#2B2620] disabled:opacity-30 cursor-pointer active:scale-90 transition-transform">
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => toggleStatus(prod.id, prod.active)} className={`transition-all p-1 hover:scale-105 cursor-pointer ${prod.active ? "text-emerald-600" : "text-gray-300"}`}>
                            {prod.active ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7" />}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/produto/${prod.id}`} target="_blank" title="Ver Produto" className="p-2 border border-[#EDE3D3] rounded-xl text-[#7A6F63] hover:text-[#8B5E3C] hover:bg-[#F5EFE6] transition-colors">
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link href={`/admin/produtos/${prod.id}/editar`} className="p-2 border border-[#EDE3D3] rounded-xl text-[#7A6F63] hover:text-[#8B5E3C] hover:bg-[#F5EFE6] transition-colors">
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button onClick={() => handleDelete(prod.id)} className="p-2 border border-[#EDE3D3] rounded-xl text-[#7A6F63] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
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
          )}
        </div>
      )}
    </div>
  );
}
