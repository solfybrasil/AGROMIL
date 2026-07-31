"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  BarChart3, TrendingUp, Calendar, AlertCircle, ShoppingCart,
  DollarSign, Package, ArrowUpRight, ArrowDownRight, Loader, RefreshCcw,
} from "lucide-react";
import { dbService } from "@/lib/db-service";

interface OrderItem {
  quantity: number;
  price: number;
  productId: string;
  productName?: string;
  product?: { name: string; categoryId?: string } | null;
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

interface Category {
  id: string;
  name: string;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
}

interface CategoryStat {
  name: string;
  sales: number;
  revenue: number;
  color: string;
}

interface WeeklyDay {
  day: string;
  value: number;
}

const CHART_W = 560;
const CHART_H = 160;
const BAR_W = 50;
const BAR_GAP = 30;
const LABEL_H = 20;
const MAX_BAR_H = CHART_H - LABEL_H;

const CATEGORY_COLORS = [
  "#8B5E3C", "#2d6a4f", "#e2b13c", "#3b82f6",
  "#8b5cf6", "#f97316", "#ef4444", "#06b6d4",
];

const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function AdminReports() {
  const [period, setPeriod] = useState("30");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tooltip, setTooltip] = useState<{ idx: number; x: number; y: number } | null>(null);
  const [barsVisible, setBarsVisible] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setBarsVisible(false);
    try {
      const localOrders = await dbService.getOrders();
      const localCats = await dbService.getCategories();
      if (localOrders && localOrders.length > 0) setOrders(localOrders as any);
      if (localCats && localCats.length > 0) setCategories(localCats as any);

      const [ordersRes, catsRes] = await Promise.all([
        fetch("/api/pedidos"),
        fetch("/api/categorias"),
      ]);

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        if (Array.isArray(data)) setOrders(data);
      }
      if (catsRes.ok) {
        const data = await catsRes.json();
        if (Array.isArray(data)) setCategories(data);
      }
    } catch {} finally {
      setLoading(false);
      setTimeout(() => setBarsVisible(true), 100);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter orders by period & status
  const cutoffDate = new Date();
  const periodDays = Number(period);
  cutoffDate.setDate(cutoffDate.getDate() - periodDays);

  const activeOrders = orders.filter((o) => {
    if (o.status === "CANCELLED") return false;
    const d = new Date(o.createdAt);
    return d >= cutoffDate;
  });

  // Financial KPIs
  const totalRevenue = activeOrders.reduce((acc, o) => acc + Number(o.total || 0), 0);
  const totalSalesCount = activeOrders.length;
  const avgOrderValue = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

  // Previous period comparison
  const prevCutoff = new Date(cutoffDate);
  prevCutoff.setDate(prevCutoff.getDate() - periodDays);
  const prevOrders = orders.filter((o) => {
    if (o.status === "CANCELLED") return false;
    const d = new Date(o.createdAt);
    return d >= prevCutoff && d < cutoffDate;
  });
  const prevRevenue = prevOrders.reduce((acc, o) => acc + Number(o.total || 0), 0);
  const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

  // Weekly Sales Bar Chart
  const weeklyData: WeeklyDay[] = DAYS_OF_WEEK.map((dayLabel, dayIdx) => {
    const dayTotal = activeOrders.reduce((acc, o) => {
      const d = new Date(o.createdAt);
      return d.getDay() === dayIdx ? acc + Number(o.total || 0) : acc;
    }, 0);
    return { day: dayLabel, value: dayTotal };
  });

  const maxWeeklyVal = Math.max(...weeklyData.map((d) => d.value), 1);

  // Top Products
  const productMap = new Map<string, { sales: number; revenue: number }>();
  activeOrders.forEach((o) => {
    (o.items || []).forEach((item) => {
      const name = item.productName || item.product?.name || "Produto";
      const existing = productMap.get(name) || { sales: 0, revenue: 0 };
      existing.sales += item.quantity || 1;
      existing.revenue += Number(item.price || 0) * (item.quantity || 1);
      productMap.set(name, existing);
    });
  });

  const topProducts: TopProduct[] = Array.from(productMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Category Breakdown
  const catMap = new Map<string, { sales: number; revenue: number }>();
  activeOrders.forEach((o) => {
    (o.items || []).forEach((item) => {
      const catId = item.product?.categoryId || "outros";
      const catName = categories.find((c) => c.id === catId)?.name || "Geral";
      const existing = catMap.get(catName) || { sales: 0, revenue: 0 };
      existing.sales += item.quantity || 1;
      existing.revenue += Number(item.price || 0) * (item.quantity || 1);
      catMap.set(catName, existing);
    });
  });

  const categoryStats: CategoryStat[] = Array.from(catMap.entries())
    .map(([name, data], idx) => ({
      name,
      ...data,
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const totalCatRevenue = categoryStats.reduce((acc, c) => acc + c.revenue, 0) || 1;

  return (
    <div className="space-y-6 font-sans text-[#2B2620] animate-fade-in-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#EDE3D3] shadow-xs">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-[#8B5E3C] bg-[#8B5E3C]/10 px-2.5 py-0.5 rounded-full border border-[#8B5E3C]/20">
            Inteligência de Vendas
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#2B2620] tracking-tight mt-0.5">
            Relatórios & Analytics
          </h1>
          <p className="text-xs text-[#7A6F63] font-medium mt-0.5">
            Desempenho financeiro, faturamento semanal e curva ABC de produtos.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[#F5EFE6] border border-[#EDE3D3] px-3 py-1.5 rounded-2xl">
            <Calendar className="h-4 w-4 text-[#8B5E3C]" />
            <select
              value={period} onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent text-xs font-black uppercase text-[#2B2620] focus:outline-none cursor-pointer"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="365">Último ano</option>
            </select>
          </div>

          <button onClick={fetchData} disabled={loading}
            className="p-2.5 bg-white border border-[#EDE3D3] text-[#2B2620] hover:bg-[#F5EFE6] rounded-2xl transition-all cursor-pointer">
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#EDE3D3] rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#7A6F63]">Faturamento Líquido</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#2B2620]">
            R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1 text-[9px] font-black">
            {revenueGrowth >= 0 ? (
              <span className="text-emerald-600 flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" /> +{revenueGrowth.toFixed(1)}%</span>
            ) : (
              <span className="text-rose-600 flex items-center gap-0.5"><ArrowDownRight className="h-3 w-3" /> {revenueGrowth.toFixed(1)}%</span>
            )}
            <span className="text-[#7A6F63] font-medium">vs. período anterior</span>
          </div>
        </div>

        <div className="bg-white border border-[#EDE3D3] rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#7A6F63]">Total de Pedidos</span>
            <div className="p-2 bg-[#8B5E3C]/10 text-[#8B5E3C] rounded-xl border border-[#8B5E3C]/20">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#2B2620]">{totalSalesCount}</p>
          <p className="text-[9px] text-[#7A6F63] font-medium">pedidos finalizados no período</p>
        </div>

        <div className="bg-white border border-[#EDE3D3] rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#7A6F63]">Ticket Médio</span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#2B2620]">
            R$ {avgOrderValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[9px] text-[#7A6F63] font-medium">valor médio por pedido</p>
        </div>
      </div>

      {/* Main Bar Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Weekly Chart */}
        <div className="lg:col-span-2 bg-white border border-[#EDE3D3] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-[#EDE3D3]/60 pb-3">
            <h3 className="text-xs font-black text-[#2B2620] uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#8B5E3C]" />
              Faturamento por Dia da Semana
            </h3>
            <span className="text-[9px] text-[#7A6F63] font-bold">Acumulado</span>
          </div>

          <div className="relative w-full h-[180px] flex items-end justify-between px-4 pt-6">
            {weeklyData.map((d, i) => {
              const barH = (d.value / maxWeeklyVal) * MAX_BAR_H;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[#1A1A1A] text-[#EDE3D3] text-[9px] font-black py-1 px-2 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-10">
                    R$ {d.value.toFixed(2)}
                  </div>

                  <div className="w-full max-w-[40px] bg-[#F5EFE6] rounded-xl overflow-hidden flex items-end h-[140px]">
                    <div
                      className="w-full bg-[#8B5E3C] rounded-t-xl transition-all duration-700 group-hover:bg-[#6d482d]"
                      style={{ height: barsVisible ? `${Math.max(6, barH)}px` : "0px" }}
                    />
                  </div>
                  <span className="text-[9px] font-black uppercase text-[#7A6F63]">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white border border-[#EDE3D3] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="border-b border-[#EDE3D3]/60 pb-3">
            <h3 className="text-xs font-black text-[#2B2620] uppercase tracking-wider">
              Vendas por Categoria
            </h3>
            <p className="text-[9px] text-[#7A6F63] font-medium">Distribuição da receita</p>
          </div>

          <div className="space-y-3">
            {categoryStats.length === 0 ? (
              <p className="text-xs text-gray-400 font-semibold py-8 text-center">Nenhuma venda gravada</p>
            ) : (
              categoryStats.map((c) => {
                const pct = (c.revenue / totalCatRevenue) * 100;
                return (
                  <div key={c.name} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-black">
                      <span className="text-[#2B2620] truncate max-w-[60%]">{c.name}</span>
                      <span className="text-[#8B5E3C]">R$ {c.revenue.toFixed(0)} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-[#F5EFE6] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: c.color }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-white border border-[#EDE3D3] rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-[#EDE3D3]/60 pb-3">
          <h3 className="text-xs font-black text-[#2B2620] uppercase tracking-wider flex items-center gap-2">
            <Package className="h-4 w-4 text-[#8B5E3C]" />
            Top 5 Produtos Mais Vendidos
          </h3>
          <span className="text-[9px] text-[#7A6F63] font-bold">Por Faturamento</span>
        </div>

        {topProducts.length === 0 ? (
          <p className="text-xs text-gray-400 font-semibold py-8 text-center">Nenhum produto registrado no período</p>
        ) : (
          <div className="divide-y divide-[#EDE3D3]/50">
            {topProducts.map((p, idx) => (
              <div key={p.name} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-xl bg-[#8B5E3C]/10 text-[#8B5E3C] border border-[#8B5E3C]/20 flex items-center justify-center text-xs font-black">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-[#2B2620]">{p.name}</h4>
                    <span className="text-[9px] text-[#7A6F63] font-bold">{p.sales} unidades vendidas</span>
                  </div>
                </div>
                <span className="text-xs font-black text-[#8B5E3C]">
                  R$ {p.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
