"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  AlertCircle,
  ShoppingCart,
  DollarSign,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Loader,
  RefreshCcw,
} from "lucide-react";

/* ── Types ───────────────────────────────────── */
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

/* ── Chart Constants ─────────────────────────── */
const CHART_W = 560;
const CHART_H = 160;
const BAR_W = 50;
const BAR_GAP = 30;
const LABEL_H = 20;
const MAX_BAR_H = CHART_H - LABEL_H;

/* ── Rank colors ──────────────────────────────── */
const RANK_STYLES = [
  "bg-[#e2b13c]/20 text-[#b8860b] border-[#e2b13c]/40",
  "bg-gray-200/60 text-gray-500 border-gray-300/60",
  "bg-orange-100 text-orange-600 border-orange-200",
  "bg-gray-100 text-gray-400 border-gray-200",
];

const CATEGORY_COLORS = [
  "#1b4332", "#3b82f6", "#10b981", "#e2b13c",
  "#8b5cf6", "#f97316", "#ef4444", "#06b6d4",
];

const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/* ── Component ───────────────────────────────── */
export default function AdminReports() {
  const [period, setPeriod] = useState("30");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tooltip, setTooltip] = useState<{ idx: number; x: number; y: number } | null>(null);
  const [barsVisible, setBarsVisible] = useState(false);
  const barsRef = useRef(false);

  /* ── Fetch raw data ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setBarsVisible(false);
    barsRef.current = false;
    try {
      const [ordersRes, catsRes] = await Promise.all([
        fetch("/api/pedidos"),
        fetch("/api/categorias"),
      ]);
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (catsRes.ok) setCategories(await catsRes.json());
    } catch (err) {
      console.warn("Relatórios: fetch error", err);
    } finally {
      setLoading(false);
      setTimeout(() => { setBarsVisible(true); barsRef.current = true; }, 80);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Rerun bars animation on period change ── */
  useEffect(() => {
    setBarsVisible(false);
    const t = setTimeout(() => setBarsVisible(true), 100);
    return () => clearTimeout(t);
  }, [period]);

  /* ── Compute date range ── */
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - Number(period));

  const filteredOrders = orders.filter((o) => {
    if (o.status === "CANCELLED") return false;
    return new Date(o.createdAt) >= cutoff;
  });

  /* ── KPI computation ── */
  const totalRevenue = filteredOrders.reduce((s, o) => s + Number(o.total), 0);
  const deliveredCount = filteredOrders.filter((o) => o.status === "DELIVERED").length;
  const ticketMedio = deliveredCount > 0
    ? filteredOrders.filter((o) => o.status === "DELIVERED").reduce((s, o) => s + Number(o.total), 0) / deliveredCount
    : 0;

  /* ── Top products ── */
  const productMap: Record<string, TopProduct> = {};
  filteredOrders.forEach((o) => {
    o.items.forEach((item) => {
      const name = item.productName || item.product?.name || item.productId;
      if (!productMap[name]) productMap[name] = { name, sales: 0, revenue: 0 };
      productMap[name].sales += item.quantity;
      productMap[name].revenue += item.quantity * Number(item.price);
    });
  });
  const topProducts: TopProduct[] = Object.values(productMap)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 4);
  const MAX_SALES = topProducts.length > 0 ? Math.max(...topProducts.map((p) => p.sales)) : 1;

  /* ── Sales by category ── */
  const catMap: Record<string, CategoryStat> = {};
  filteredOrders.forEach((o) => {
    o.items.forEach((item) => {
      const catId = item.product?.categoryId || "sem-categoria";
      const cat = categories.find((c) => c.id === catId);
      const catName = cat?.name || "Sem Categoria";
      if (!catMap[catName]) catMap[catName] = { name: catName, sales: 0, revenue: 0, color: "" };
      catMap[catName].sales += item.quantity;
      catMap[catName].revenue += item.quantity * Number(item.price);
    });
  });
  const salesByCategory: CategoryStat[] = Object.values(catMap)
    .sort((a, b) => b.revenue - a.revenue)
    .map((c, i) => ({ ...c, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }));
  const TOTAL_REVENUE_CAT = salesByCategory.reduce((s, c) => s + c.revenue, 0);
  const MAX_REVENUE = salesByCategory.length > 0 ? Math.max(...salesByCategory.map((c) => c.revenue)) : 1;

  /* ── Weekly chart (last 7 days) ── */
  const WEEKLY: WeeklyDay[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const label = DAYS_OF_WEEK[d.getDay()];
    const dateStr = d.toDateString();
    const value = filteredOrders
      .filter((o) => new Date(o.createdAt).toDateString() === dateStr)
      .reduce((s, o) => s + Number(o.total), 0);
    WEEKLY.push({ day: label, value });
  }
  const MAX_WEEKLY = Math.max(...WEEKLY.map((d) => d.value), 1);

  /* ── Previous period comparison for revenue ── */
  const prevCutoff = new Date();
  prevCutoff.setDate(prevCutoff.getDate() - Number(period) * 2);
  const prevOrders = orders.filter((o) => {
    if (o.status === "CANCELLED") return false;
    const d = new Date(o.createdAt);
    return d >= prevCutoff && d < cutoff;
  });
  const prevRevenue = prevOrders.reduce((s, o) => s + Number(o.total), 0);
  const revenueDiff = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
  const revenueUp = revenueDiff >= 0;

  /* ── Best product ── */
  const bestProduct = topProducts[0];

  const kpiCards = [
    {
      label: "Faturamento Total",
      value: `R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      iconBg: "bg-[#1b4332]/10",
      iconColor: "text-[#1b4332]",
      valueColor: "text-[#1b4332]",
      trend: prevRevenue > 0
        ? `${revenueUp ? "+" : ""}${revenueDiff.toFixed(1)}% vs período anterior`
        : "Sem dados anteriores",
      trendColor: revenueUp
        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
        : "text-rose-700 bg-rose-50 border-rose-200",
      trendIcon: revenueUp ? ArrowUpRight : ArrowDownRight,
    },
    {
      label: "Pedidos Entregues",
      value: String(deliveredCount),
      icon: ShoppingCart,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      valueColor: "text-blue-700",
      trend: `${filteredOrders.length} pedido(s) no período`,
      trendColor: "text-blue-700 bg-blue-50 border-blue-200",
      trendIcon: Package,
    },
    {
      label: "Ticket Médio",
      value: ticketMedio > 0
        ? `R$ ${ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
        : "—",
      icon: TrendingUp,
      iconBg: "bg-[#e2b13c]/10",
      iconColor: "text-[#b8860b]",
      valueColor: "text-[#1b4332]",
      trend: `Baseado em ${deliveredCount} entregue(s)`,
      trendColor: "text-amber-700 bg-amber-50 border-amber-200",
      trendIcon: ArrowUpRight,
    },
    {
      label: "Produto Mais Vendido",
      value: bestProduct?.name
        ? bestProduct.name.length > 22
          ? bestProduct.name.slice(0, 22) + "…"
          : bestProduct.name
        : "—",
      icon: Package,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600",
      valueColor: "text-gray-800",
      trend: bestProduct ? `${bestProduct.sales} venda(s) no período` : "Sem vendas",
      trendColor: "text-purple-700 bg-purple-50 border-purple-200",
      trendIcon: null,
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs font-black uppercase tracking-widest animate-pulse">
          Carregando relatórios...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#1b4332]/10 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-[#1b4332]" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-black text-[#1b4332] leading-tight">
              Relatórios & Analytics
            </h1>
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-0.5">
              Análise de vendas, faturamento e produtos mais vendidos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-500 hover:text-primary hover:border-primary/30 rounded-xl px-3 py-2.5 text-xs font-black uppercase tracking-wider transition-all hover-lift active-pop"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Atualizar
          </button>

          <div className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 hover:border-[#1b4332]/30 hover-lift active-pop transition-all">
            <Calendar className="h-4 w-4 text-[#1b4332]" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent border-0 text-xs font-black text-gray-700 focus:ring-0 cursor-pointer uppercase tracking-widest outline-none"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trendIcon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100/80 space-y-3 hover-lift cursor-default"
            >
              <div className="flex items-center gap-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-2xl ${kpi.iconBg} flex items-center justify-center`}>
                  <Icon className={`h-4.5 w-4.5 ${kpi.iconColor}`} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-tight">
                  {kpi.label}
                </p>
              </div>
              <p className={`text-xl font-black ${kpi.valueColor} leading-tight truncate`}>
                {kpi.value}
              </p>
              <div className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${kpi.trendColor}`}>
                {TrendIcon && <TrendIcon className="h-3 w-3" />}
                {kpi.trend}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Two-Column Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Top Products */}
        <div className="bg-white rounded-3xl shadow-xs p-6 space-y-5 border border-gray-100/80">
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-[#1b4332]/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-4 w-4 text-[#1b4332]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ranking</p>
              <h3 className="text-sm font-black text-gray-800 leading-tight">Produtos Mais Vendidos</h3>
            </div>
          </div>

          {topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-300 gap-2">
              <Package className="h-8 w-8 opacity-30" />
              <p className="text-xs font-black uppercase tracking-wider">Sem vendas no período</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((prod, idx) => {
                const barPct = (prod.sales / MAX_SALES) * 100;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border ${RANK_STYLES[idx] ?? RANK_STYLES[3]}`}>
                        {idx + 1}°
                      </span>
                      <p className="flex-1 text-xs font-black text-gray-700 truncate min-w-0">{prod.name}</p>
                      <span className="flex-shrink-0 text-xs font-black text-[#1b4332]">
                        R$ {prod.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="ml-11 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1b4332] rounded-full transition-all duration-700 ease-out"
                        style={{ width: barsVisible ? `${barPct}%` : "0%" }}
                      />
                    </div>
                    <div className="ml-11 flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {prod.sales} venda(s)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Sales by Category */}
        <div className="bg-white rounded-3xl shadow-xs p-6 space-y-5 border border-gray-100/80">
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-[#1b4332]/10 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="h-4 w-4 text-[#1b4332]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Distribuição</p>
              <h3 className="text-sm font-black text-gray-800 leading-tight">Vendas por Categoria</h3>
            </div>
          </div>

          {salesByCategory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-300 gap-2">
              <BarChart3 className="h-8 w-8 opacity-30" />
              <p className="text-xs font-black uppercase tracking-wider">Sem dados de categoria no período</p>
            </div>
          ) : (
            <div className="space-y-5">
              {salesByCategory.map((cat, idx) => {
                const pct = TOTAL_REVENUE_CAT > 0 ? Math.round((cat.revenue / TOTAL_REVENUE_CAT) * 100) : 0;
                const barPct = MAX_REVENUE > 0 ? (cat.revenue / MAX_REVENUE) * 100 : 0;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-xs font-black text-gray-700 truncate">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] font-black text-gray-400">{cat.sales} venda(s)</span>
                        <span className="text-xs font-black text-[#1b4332]">
                          R$ {cat.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                        <span
                          className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: cat.color + "20", color: cat.color }}
                        >
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: barsVisible ? `${barPct}%` : "0%",
                          backgroundColor: cat.color,
                          transitionDelay: `${idx * 80}ms`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Weekly Trend SVG Chart ── */}
      <div className="bg-white rounded-3xl shadow-xs p-6 border border-gray-100/80 space-y-5">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1b4332]/10 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="h-4 w-4 text-[#1b4332]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Últimos 7 dias</p>
              <h3 className="text-sm font-black text-gray-800 leading-tight">Tendência de Faturamento</h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total da semana</p>
            <p className="text-lg font-black text-[#1b4332]">
              R$ {WEEKLY.reduce((s, d) => s + d.value, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="relative" style={{ minWidth: CHART_W }}>
            <svg width={CHART_W} height={CHART_H + 10} className="overflow-visible">
              {/* Y-axis grid lines */}
              {[0, 1, 2, 3].map((tick) => {
                const y = CHART_H - LABEL_H - (tick / 3) * MAX_BAR_H;
                const val = ((tick / 3) * MAX_WEEKLY).toFixed(0);
                return (
                  <g key={tick}>
                    <line x1={0} y1={y} x2={CHART_W} y2={y} stroke="#f0f0f0" strokeWidth={1} />
                    <text
                      x={-8} y={y + 4} textAnchor="end"
                      fontSize={9} fill="#d1d5db" fontWeight={700} fontFamily="sans-serif"
                    >
                      {tick === 0 ? "R$0" : `${(Number(val) / 1000).toFixed(1)}k`}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {WEEKLY.map((d, i) => {
                const barH = (d.value / MAX_WEEKLY) * MAX_BAR_H;
                const x = i * (BAR_W + BAR_GAP) + BAR_GAP / 2;
                const y = CHART_H - LABEL_H - barH;
                const isMax = d.value > 0 && d.value === Math.max(...WEEKLY.map((w) => w.value));
                return (
                  <g key={d.day}>
                    <rect
                      x={x} y={y} width={BAR_W} height={barH}
                      rx={6} ry={6}
                      fill={isMax ? "#e2b13c" : "#1b4332"}
                      opacity={isMax ? 1 : 0.75}
                      className="cursor-pointer hover:opacity-100 transition-opacity"
                      onMouseEnter={() => setTooltip({ idx: i, x: x + BAR_W / 2, y })}
                      onMouseLeave={() => setTooltip(null)}
                    />
                    <text
                      x={x + BAR_W / 2} y={CHART_H + 2} textAnchor="middle"
                      fontSize={10} fill={isMax ? "#b8860b" : "#9ca3af"} fontWeight={700} fontFamily="sans-serif"
                    >
                      {d.day}
                    </text>
                  </g>
                );
              })}

              {/* Tooltip */}
              {tooltip !== null && (
                <g>
                  <rect x={tooltip.x - 42} y={tooltip.y - 36} width={84} height={30} rx={6} fill="#1b4332" />
                  <text
                    x={tooltip.x} y={tooltip.y - 22} textAnchor="middle"
                    fontSize={9} fill="#86efac" fontWeight={700} fontFamily="sans-serif" letterSpacing={1}
                  >
                    {WEEKLY[tooltip.idx].day.toUpperCase()}
                  </text>
                  <text
                    x={tooltip.x} y={tooltip.y - 11} textAnchor="middle"
                    fontSize={10} fill="white" fontWeight={900} fontFamily="sans-serif"
                  >
                    R$ {WEEKLY[tooltip.idx].value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-6 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#1b4332] opacity-75 inline-block" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Faturamento diário</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#e2b13c] inline-block" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Melhor dia</span>
          </div>
        </div>
      </div>

      {/* ── Info Notice ── */}
      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-2xl flex items-start gap-3 shadow-xs">
        <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-0.5">Fonte dos dados</p>
          <p className="text-xs font-semibold text-blue-700 leading-relaxed">
            Todos os dados exibidos são obtidos diretamente do banco de dados em tempo real.
            Os gráficos e rankings refletem apenas pedidos não cancelados no período selecionado.
          </p>
        </div>
      </div>
    </div>
  );
}
