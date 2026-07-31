"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  DollarSign, ClipboardList, Package, AlertTriangle, ChevronRight,
  TrendingUp, Activity, Zap, ShoppingBag, Megaphone, Tag, Star,
  Layers, ArrowUpRight, Clock, CheckCircle2, BarChart3,
  RefreshCcw, Eye, Wallet, TrendingDown, Percent, BoxIcon,
  PiggyBank, Receipt, Coins, ArrowRight, Leaf,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalRevenue: number;
  ordersCount: number;
  productsCount: number;
  lowStockCount: number;
  totalInvested: number;
  stockValue: number;
  grossProfit: number;
  grossMarginPct: number;
  netProfit: number;
  potentialProfit: number;
}

interface RecentOrder { id: string; clientName: string; total: number; status: string; createdAt: string; }
interface LowStockProduct { id: string; name: string; stock: number; unit: string; minStock: number; costPrice: number; price: number; }
interface SalesTrend { day: string; value: number; }
interface LotItem {
  id: string; lotNumber: string; productName: string; quantity: number;
  costPrice: number; supplier?: string; purchaseDate: string;
  totalCost: number; totalSellValue: number; profit: number;
}
interface TopProduct { id: string; name: string; price: number; costPrice: number; profit: number; margin: number; stock: number; }

// ─── Constants ───────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: "Novo Produto", icon: ShoppingBag, href: "/admin/produtos/novo" },
  { label: "Pedidos", icon: ClipboardList, href: "/admin/pedidos" },
  { label: "Banners", icon: Megaphone, href: "/admin/banners" },
  { label: "Cupons VIP", icon: Tag, href: "/admin/cupons" },
  { label: "Hero Slider", icon: Layers, href: "/admin/hero" },
  { label: "Avaliações", icon: Star, href: "/admin/avaliacoes" },
  { label: "Relatórios", icon: BarChart3, href: "/admin/relatorios" },
  { label: "Categorias", icon: Layers, href: "/admin/categorias" },
];

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string; border: string; pulse?: boolean }> = {
  NEW:       { label: "Novo",       dot: "bg-blue-500",    bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",  pulse: true },
  CONFIRMED: { label: "Confirmado", dot: "bg-indigo-500",  bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200" },
  PREPARING: { label: "Preparando", dot: "bg-amber-500",   bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",  pulse: true },
  SHIPPED:   { label: "A Caminho",  dot: "bg-purple-500",  bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200" },
  DELIVERED: { label: "Entregue",   dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  CANCELLED: { label: "Cancelado",  dot: "bg-rose-500",    bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, dot: "bg-gray-400", bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" };
  return (
    <span className={`inline-flex items-center gap-1.5 ${cfg.bg} border ${cfg.border} ${cfg.text} px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} ${cfg.pulse ? "animate-pulse" : ""}`} />
      {cfg.label}
    </span>
  );
}

// KPI Card premium
function KpiCard({
  label, value, sub, icon: Icon, iconBg, iconColor, valueColor, badge, badgeColor, href,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; iconBg: string; iconColor: string;
  valueColor?: string; badge?: string; badgeColor?: string; href?: string;
}) {
  const inner = (
    <div className="bg-white border border-[#EDE3D3] rounded-3xl p-5 shadow-xs flex flex-col gap-3 h-full hover:shadow-md hover:border-[#8B5E3C]/30 transition-all group">
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-2xl border ${iconBg}`}>
          <Icon className={`h-4 w-4 md:h-5 md:w-5 ${iconColor}`} />
        </div>
        {badge && (
          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-[9px] font-black text-[#7A6F63] uppercase tracking-widest">{label}</p>
        <p className={`text-xl md:text-2xl font-black tracking-tight mt-0.5 ${valueColor || "text-[#2B2620]"}`}>{value}</p>
        {sub && <p className="text-[9px] text-[#7A6F63] font-medium mt-0.5">{sub}</p>}
      </div>
    </div>
  );
  if (href) return <Link href={href} className="h-full block">{inner}</Link>;
  return inner;
}

// Financial detail card (smaller, for row 2)
function FinCard({
  label, value, icon: Icon, color, trend, trendUp,
}: {
  label: string; value: string; icon: React.ElementType;
  color: "emerald" | "blue" | "amber" | "rose" | "indigo";
  trend?: string; trendUp?: boolean | null;
}) {
  const colors = {
    emerald: { icon: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", val: "text-emerald-700", tag: trendUp ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700" },
    blue:    { icon: "text-blue-600",    bg: "bg-blue-50 border-blue-200",       val: "text-blue-700",    tag: "bg-blue-50 border-blue-200 text-blue-700" },
    amber:   { icon: "text-amber-600",   bg: "bg-amber-50 border-amber-200",     val: "text-amber-700",   tag: "bg-amber-50 border-amber-200 text-amber-700" },
    rose:    { icon: "text-rose-600",    bg: "bg-rose-50 border-rose-200",       val: "text-rose-700",    tag: "bg-rose-50 border-rose-200 text-rose-700" },
    indigo:  { icon: "text-indigo-600",  bg: "bg-indigo-50 border-indigo-200",   val: "text-indigo-700",  tag: "bg-indigo-50 border-indigo-200 text-indigo-700" },
  };
  const c = colors[color];
  return (
    <div className="bg-white border border-[#EDE3D3] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
      <div className={`p-2.5 rounded-xl border flex-shrink-0 ${c.bg}`}>
        <Icon className={`h-4 w-4 ${c.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black text-[#7A6F63] uppercase tracking-widest truncate">{label}</p>
        <p className={`text-sm font-black ${c.val} mt-0.5 tracking-tight`}>{value}</p>
      </div>
      {trend && (
        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border flex-shrink-0 ${c.tag}`}>
          {trendUp === true ? "↑" : trendUp === false ? "↓" : ""} {trend}
        </span>
      )}
    </div>
  );
}

// Sparkline bar chart (7 bars)
function SparkBars({ data, max }: { data: SalesTrend[]; max: number }) {
  return (
    <div className="flex items-end gap-1 h-full w-full">
      {data.map((d, i) => {
        const pct = max > 0 ? (d.value / max) * 100 : 0;
        const isMax = d.value === max && max > 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            {/* Tooltip */}
            <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-[#EDE3D3] text-[9px] font-black py-1 px-2 rounded-lg whitespace-nowrap z-20 shadow-lg">
              R$ {d.value.toFixed(0)}
            </div>
            <div className="w-full bg-[#EDE3D3] rounded-t-md overflow-hidden flex-1 flex items-end min-h-[6px]">
              <div
                className={`w-full rounded-t-md transition-all duration-700 group-hover:opacity-80 ${isMax ? "bg-[#e2b13c]" : "bg-[#8B5E3C]"}`}
                style={{ height: `${Math.max(4, pct)}%` }}
              />
            </div>
            <span className="text-[8px] font-black text-[#7A6F63] uppercase">{d.day.slice(0, 3)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0, ordersCount: 0, productsCount: 0, lowStockCount: 0,
    totalInvested: 0, stockValue: 0, grossProfit: 0, grossMarginPct: 0,
    netProfit: 0, potentialProfit: 0,
  });

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [salesTrend, setSalesTrend] = useState<SalesTrend[]>([]);
  const [lots, setLots] = useState<LotItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  const fetchDashboardData = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    try {
      const res = await fetch("/api/relatorios/dashboard");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats ?? {});
        setRecentOrders(data.recentOrders ?? []);
        setLowStockProducts(data.lowStockProducts ?? []);
        if (data.salesTrend) setSalesTrend(data.salesTrend);
        if (data.lots) setLots(data.lots);
        if (data.topProducts) setTopProducts(data.topProducts);
        setLastUpdated(new Date());
      }
    } catch {} finally {
      if (showRefresh) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, []);

  const fmt = (n: number) => `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  const fmtShort = (n: number) => n >= 1000 ? `R$ ${(n / 1000).toFixed(1)}k` : fmt(n);

  const weekTotal = salesTrend.reduce((a, t) => a + t.value, 0);
  const maxTrend = Math.max(...salesTrend.map((t) => t.value), 1);
  const bestDay = salesTrend.length > 0 ? salesTrend.reduce((a, b) => b.value > a.value ? b : a, salesTrend[0]) : null;

  const marginColor = stats.grossMarginPct >= 40 ? "text-emerald-600" : stats.grossMarginPct >= 20 ? "text-amber-600" : "text-rose-600";

  return (
    <div className="space-y-5 md:space-y-6 font-sans text-[#2B2620]">

      {/* ── HERO BANNER ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#1A1A1A] rounded-3xl border border-[#8B5E3C]/30 shadow-xl">
        {/* Decorative grain/texture overlay */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }}
        />
        {/* Warm glow */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#8B5E3C]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#e2b13c]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Left */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 bg-[#8B5E3C]/20 border border-[#8B5E3C]/40 text-[#EDE3D3] text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                <Leaf className="h-3 w-3 text-[#e2b13c]" />
                Agromil Marketplace
              </div>
              <span className="text-[9px] text-[#7A6F63] font-bold">
                {mounted ? lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "--:--"}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
              Dashboard<br className="sm:hidden" /> <span className="text-[#EDE3D3]/70">Financeiro</span>
            </h1>
            <p className="text-sm text-[#7A6F63] font-medium max-w-sm">
              Custo, lucro, margem e lotes — visão técnica completa em tempo real.
            </p>
          </div>

          {/* Right: summary pills + actions */}
          <div className="flex flex-col sm:items-end gap-3 flex-shrink-0">
            {/* Mini summary pills */}
            <div className="flex flex-wrap gap-2">
              <div className="bg-white/5 border border-white/10 text-white rounded-2xl px-3 py-2 text-center min-w-[70px]">
                <p className="text-[8px] font-black text-[#7A6F63] uppercase tracking-wider">Faturamento</p>
                <p className="text-sm font-black text-emerald-400">{fmtShort(stats.totalRevenue)}</p>
              </div>
              <div className="bg-white/5 border border-white/10 text-white rounded-2xl px-3 py-2 text-center min-w-[70px]">
                <p className="text-[8px] font-black text-[#7A6F63] uppercase tracking-wider">Pedidos</p>
                <p className="text-sm font-black text-blue-400">{stats.ordersCount}</p>
              </div>
              <div className={`bg-white/5 border border-white/10 text-white rounded-2xl px-3 py-2 text-center min-w-[70px] ${stats.grossMarginPct >= 30 ? "" : "border-amber-500/30"}`}>
                <p className="text-[8px] font-black text-[#7A6F63] uppercase tracking-wider">Margem</p>
                <p className={`text-sm font-black ${stats.grossMarginPct >= 40 ? "text-emerald-400" : stats.grossMarginPct >= 20 ? "text-amber-400" : "text-rose-400"}`}>
                  {stats.grossMarginPct?.toFixed(1) ?? "0.0"}%
                </p>
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchDashboardData(true)}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl transition-all disabled:opacity-40 border border-white/10 cursor-pointer"
              >
                <RefreshCcw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>Atualizar</span>
              </button>
              <Link
                href="/admin/produtos/novo"
                className="flex items-center gap-1.5 bg-[#8B5E3C] hover:bg-[#a06d47] text-white text-xs font-black px-5 py-2.5 rounded-2xl shadow-sm transition-all uppercase tracking-wider"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Novo Produto</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 1: Main KPIs ────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-[9px] font-black uppercase tracking-widest text-[#7A6F63] flex items-center gap-1.5 px-1">
          <Receipt className="h-3 w-3 text-[#8B5E3C]" /> Visão Geral
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <KpiCard
            label="Faturamento Total" value={fmtShort(stats.totalRevenue)} sub={fmt(stats.totalRevenue)}
            icon={DollarSign} iconBg="bg-emerald-50 border-emerald-200" iconColor="text-emerald-600"
            valueColor="text-emerald-700" badge="Vendas" badgeColor="bg-emerald-50 border-emerald-200 text-emerald-700"
          />
          <KpiCard
            label="Pedidos Recebidos" value={`${stats.ordersCount}`} sub="total acumulado"
            icon={ClipboardList} iconBg="bg-blue-50 border-blue-200" iconColor="text-blue-600"
            valueColor="text-blue-700" href="/admin/pedidos"
            badge="Ver Kanban" badgeColor="bg-blue-50 border-blue-200 text-blue-700"
          />
          <KpiCard
            label="Produtos no Catálogo" value={`${stats.productsCount}`} sub="itens ativos"
            icon={Package} iconBg="bg-[#8B5E3C]/10 border-[#8B5E3C]/20" iconColor="text-[#8B5E3C]"
            href="/admin/produtos"
          />
          <KpiCard
            label="Estoque Crítico" value={`${stats.lowStockCount}`}
            sub={`${stats.lowStockCount === 0 ? "Estoque saudável" : "itens abaixo do mínimo"}`}
            icon={AlertTriangle}
            iconBg={stats.lowStockCount > 0 ? "bg-rose-50 border-rose-300 animate-pulse" : "bg-gray-50 border-gray-200"}
            iconColor={stats.lowStockCount > 0 ? "text-rose-600" : "text-gray-400"}
            valueColor={stats.lowStockCount > 0 ? "text-rose-700" : "text-[#2B2620]"}
            badge={stats.lowStockCount > 0 ? "⚠ Atenção" : "✓ OK"}
            badgeColor={stats.lowStockCount > 0 ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}
          />
        </div>
      </div>

      {/* ── ROW 2: Financial Analysis ────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-[9px] font-black uppercase tracking-widest text-[#7A6F63] flex items-center gap-1.5 px-1">
          <BarChart3 className="h-3 w-3 text-[#8B5E3C]" /> Análise Financeira
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <FinCard
            label="Total Investido (Custo de Estoque)"
            value={fmtShort(stats.totalInvested)}
            icon={Wallet} color="blue"
            trend="Custo × Qtd"
          />
          <FinCard
            label="Valor do Estoque (Preço de Venda)"
            value={fmtShort(stats.stockValue)}
            icon={BoxIcon} color="indigo"
            trend="Preço × Qtd"
          />
          <FinCard
            label="Lucro Potencial (Estoque Atual)"
            value={fmtShort(stats.potentialProfit)}
            icon={PiggyBank}
            color={stats.potentialProfit >= 0 ? "emerald" : "rose"}
            trend={stats.potentialProfit >= 0 ? "Positivo" : "Negativo"}
            trendUp={stats.potentialProfit >= 0}
          />
          <FinCard
            label="Lucro Bruto (Vendas Realizadas)"
            value={fmtShort(stats.grossProfit)}
            icon={TrendingUp}
            color={stats.grossProfit >= 0 ? "emerald" : "rose"}
            trend="Fat. - Custo"
            trendUp={stats.grossProfit >= 0}
          />
          <FinCard
            label="Lucro Líquido Estimado (-15%)"
            value={fmtShort(stats.netProfit)}
            icon={DollarSign}
            color={stats.netProfit >= 0 ? "emerald" : "rose"}
            trend={stats.netProfit >= 0 ? "Lucrativo" : "Prejuízo"}
            trendUp={stats.netProfit >= 0}
          />
          <FinCard
            label="Margem Bruta Média"
            value={`${stats.grossMarginPct?.toFixed(1) ?? "0.0"}%`}
            icon={Percent}
            color={stats.grossMarginPct >= 40 ? "emerald" : stats.grossMarginPct >= 20 ? "amber" : "rose"}
            trend={stats.grossMarginPct >= 40 ? "Excelente" : stats.grossMarginPct >= 20 ? "Aceitável" : "Atenção"}
            trendUp={stats.grossMarginPct >= 30}
          />
        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#EDE3D3] rounded-3xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#EDE3D3]/60">
          <Zap className="h-4 w-4 text-[#8B5E3C]" />
          <h3 className="text-xs font-black text-[#2B2620] uppercase tracking-wider">Acesso Rápido</h3>
          <p className="text-[9px] text-[#7A6F63] font-medium ml-1">— Navegue pelas seções principais</p>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 md:gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-1.5 md:gap-2 border border-[#EDE3D3] bg-[#F5EFE6]/50 hover:bg-[#8B5E3C] hover:border-[#8B5E3C] hover:text-white text-[#2B2620] rounded-2xl p-2.5 md:p-3.5 text-center transition-all active:scale-95 group"
            >
              <action.icon className="h-4 w-4 md:h-5 md:w-5 group-hover:scale-110 transition-transform" />
              <span className="text-[7px] md:text-[8px] font-black uppercase tracking-wide leading-tight">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Chart + Margin Ranking ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">

        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-[#EDE3D3] rounded-3xl shadow-xs overflow-hidden">
          {/* Chart Header */}
          <div className="flex items-center justify-between p-5 pb-3">
            <div>
              <h3 className="text-xs font-black text-[#2B2620] uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#8B5E3C]" />
                Faturamento — Últimos 7 Dias
              </h3>
              <p className="text-[9px] text-[#7A6F63] font-medium mt-0.5">Receita acumulada por dia da semana</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-[#7A6F63] font-black uppercase tracking-wider">Total da Semana</p>
              <p className="text-lg font-black text-[#8B5E3C] mt-0.5">
                R$ {weekTotal.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
              </p>
              {bestDay && bestDay.value > 0 && (
                <p className="text-[8px] text-[#e2b13c] font-black">
                  🔝 {bestDay.day}: R$ {bestDay.value.toFixed(0)}
                </p>
              )}
            </div>
          </div>
          <div className="border-t border-[#EDE3D3]/60 mx-5" />

          {/* Bar Chart */}
          <div className="p-5 pt-4">
            {salesTrend.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-[#7A6F63] text-xs font-semibold gap-2">
                <BarChart3 className="h-6 w-6 text-[#EDE3D3]" />
                <span>Nenhuma venda registrada esta semana</span>
              </div>
            ) : (
              <div className="h-40">
                <SparkBars data={salesTrend} max={maxTrend} />
              </div>
            )}
          </div>
        </div>

        {/* Top Products by Margin */}
        <div className="bg-white border border-[#EDE3D3] rounded-3xl shadow-xs overflow-hidden">
          <div className="p-5 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-[#2B2620] uppercase tracking-wider flex items-center gap-2">
                <Coins className="h-4 w-4 text-[#8B5E3C]" /> Mais Lucrativos
              </h3>
              <p className="text-[9px] text-[#7A6F63] font-medium mt-0.5">Por margem de lucro</p>
            </div>
          </div>
          <div className="border-t border-[#EDE3D3]/60 mx-5" />
          <div className="p-5 space-y-3.5">
            {topProducts.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <BarChart3 className="h-6 w-6 text-[#EDE3D3] mx-auto" />
                <p className="text-[10px] text-[#7A6F63] font-semibold">Cadastre o preço de custo para ver a margem</p>
              </div>
            ) : (
              topProducts.map((p, i) => {
                const barColor = p.margin >= 40 ? "bg-emerald-500" : p.margin >= 20 ? "bg-amber-500" : "bg-rose-400";
                const textColor = p.margin >= 40 ? "text-emerald-600" : p.margin >= 20 ? "text-amber-600" : "text-rose-600";
                return (
                  <div key={p.id} className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-[8px] font-black text-[#8B5E3C] bg-[#8B5E3C]/10 border border-[#8B5E3C]/20 px-1.5 py-0.5 rounded-lg flex-shrink-0 mt-0.5">
                          #{i + 1}
                        </span>
                        <span className="text-[10px] font-black text-[#2B2620] leading-tight truncate max-w-[100px]">{p.name}</span>
                      </div>
                      <span className={`text-[9px] font-black flex-shrink-0 ml-2 ${textColor}`}>
                        +R$ {p.profit.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#F5EFE6] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                          style={{ width: `${Math.min(100, Math.max(0, p.margin))}%` }}
                        />
                      </div>
                      <span className={`text-[8px] font-black flex-shrink-0 ${textColor}`}>
                        {p.margin.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Lots Table + Low Stock ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">

        {/* Lots of Purchase */}
        <div className="lg:col-span-2 bg-white border border-[#EDE3D3] rounded-3xl shadow-xs overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
            <div>
              <h3 className="text-xs font-black text-[#2B2620] uppercase tracking-wider flex items-center gap-2">
                <Package className="h-4 w-4 text-[#8B5E3C]" /> Lotes de Compra
              </h3>
              <p className="text-[9px] text-[#7A6F63] font-medium mt-0.5">Histórico de aquisições e lucro potencial por lote</p>
            </div>
            <Link href="/admin/produtos" className="flex items-center gap-1 text-[9px] font-black text-[#8B5E3C] hover:underline">
              Gerenciar <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="border-t border-[#EDE3D3]/60 mx-5" />

          {lots.length === 0 ? (
            <div className="py-12 text-center px-5 space-y-2">
              <Package className="h-8 w-8 text-[#EDE3D3] mx-auto" />
              <p className="text-xs text-[#2B2620] font-black">Nenhum lote cadastrado</p>
              <p className="text-[10px] text-[#7A6F63] font-medium">Cadastre lotes ao editar um produto para rastrear custos e margem</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F5EFE6]/60 text-[#7A6F63] font-black uppercase border-b border-[#EDE3D3] tracking-widest text-[8px]">
                    <th className="px-5 py-3">Lote</th>
                    <th className="px-5 py-3">Produto</th>
                    <th className="px-5 py-3">Qtd.</th>
                    <th className="px-5 py-3">Custo Total</th>
                    <th className="px-5 py-3">Val. Venda</th>
                    <th className="px-5 py-3">Lucro</th>
                    <th className="px-5 py-3">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE3D3]/50">
                  {lots.map((lot) => (
                    <tr key={lot.id} className="hover:bg-[#F5EFE6]/30 transition-colors">
                      <td className="px-5 py-3.5 font-black text-[#8B5E3C] text-[10px]">#{lot.lotNumber}</td>
                      <td className="px-5 py-3.5 text-[#2B2620] font-bold text-[10px] max-w-[120px] truncate">{lot.productName}</td>
                      <td className="px-5 py-3.5 font-black text-[#2B2620] text-[10px]">{lot.quantity}</td>
                      <td className="px-5 py-3.5 font-bold text-[10px] text-rose-600">
                        R$ {lot.totalCost.toFixed(2).replace(".", ",")}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-[10px] text-blue-600">
                        R$ {lot.totalSellValue.toFixed(2).replace(".", ",")}
                      </td>
                      <td className="px-5 py-3.5 font-black text-[10px]">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${lot.profit >= 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                          {lot.profit >= 0 ? "+" : ""}R$ {lot.profit.toFixed(2).replace(".", ",")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[#7A6F63] text-[9px] font-semibold">
                        {new Date(lot.purchaseDate).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alert Panel */}
        <div className="bg-white border border-[#EDE3D3] rounded-3xl shadow-xs overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
            <div>
              <h3 className="text-xs font-black text-[#2B2620] uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 ${lowStockProducts.length > 0 ? "text-rose-500 animate-pulse" : "text-[#7A6F63]"}`} />
                Reposição Urgente
                {lowStockProducts.length > 0 && (
                  <span className="bg-rose-50 border border-rose-200 text-rose-700 px-2 py-0.5 rounded-full text-[8px] font-black animate-pulse">
                    {lowStockProducts.length}
                  </span>
                )}
              </h3>
              <p className="text-[9px] text-[#7A6F63] font-medium mt-0.5">Abaixo do estoque mínimo</p>
            </div>
            <Link href="/admin/produtos" className="flex items-center gap-1 text-[9px] font-black text-[#8B5E3C] hover:underline">
              Ajustar <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="border-t border-[#EDE3D3]/60 mx-5" />

          <div className="p-5 space-y-2.5 max-h-[300px] overflow-y-auto">
            {lowStockProducts.length === 0 ? (
              <div className="py-8 flex flex-col items-center gap-3 text-center">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-500 p-4 rounded-2xl">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-[#2B2620] font-black">Tudo em ordem!</p>
                  <p className="text-[9px] text-[#7A6F63] font-medium">Nenhum produto crítico</p>
                </div>
              </div>
            ) : (
              lowStockProducts.map((p) => {
                const pct = p.minStock > 0 ? Math.min(100, (p.stock / p.minStock) * 100) : 100;
                const isEmpty = p.stock === 0;
                return (
                  <div key={p.id} className={`flex items-center gap-3 rounded-2xl p-3 border ${isEmpty ? "bg-rose-50 border-rose-200" : "bg-amber-50/50 border-amber-200"}`}>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <p className="text-[10px] font-black text-[#2B2620] line-clamp-1">{p.name}</p>
                      <div className="h-1.5 bg-white/70 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isEmpty ? "bg-rose-400" : "bg-amber-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[8px] text-[#7A6F63] font-bold">mín: {p.minStock} {p.unit}</span>
                    </div>
                    <div className="flex-shrink-0 text-center">
                      <span className={`block font-black text-sm rounded-xl px-2.5 py-1 border ${isEmpty ? "bg-rose-100 border-rose-300 text-rose-800" : "bg-amber-100 border-amber-300 text-amber-800"}`}>
                        {p.stock}
                      </span>
                      <span className="text-[7px] text-[#7A6F63] font-bold block mt-0.5">{p.unit}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Orders ─────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#EDE3D3] rounded-3xl shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-3">
          <div>
            <h3 className="text-xs font-black text-[#2B2620] uppercase tracking-wider flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-[#8B5E3C]" /> Últimos Pedidos
            </h3>
            <p className="text-[9px] text-[#7A6F63] font-medium mt-0.5">Movimentações mais recentes da loja</p>
          </div>
          <Link
            href="/admin/pedidos"
            className="flex items-center gap-1.5 text-[9px] bg-[#8B5E3C]/10 hover:bg-[#8B5E3C] text-[#8B5E3C] hover:text-white border border-[#8B5E3C]/20 hover:border-[#8B5E3C] px-3 py-1.5 rounded-xl font-black transition-all uppercase tracking-wider"
          >
            <Eye className="h-3 w-3" /> Kanban <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="border-t border-[#EDE3D3]/60 mx-5" />

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-[#7A6F63] text-xs font-semibold">
            Nenhum pedido registrado ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop Table */}
            <table className="hidden md:table w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F5EFE6]/60 text-[#7A6F63] font-black uppercase border-b border-[#EDE3D3] tracking-widest text-[8px]">
                  <th className="px-5 py-3.5">Pedido</th>
                  <th className="px-5 py-3.5">Cliente</th>
                  <th className="px-5 py-3.5">Total</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 flex items-center gap-1"><Clock className="h-3 w-3" /> Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE3D3]/40">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#F5EFE6]/30 transition-colors">
                    <td className="px-5 py-4 font-black text-[#8B5E3C] text-[11px]">
                      <Link href="/admin/pedidos" className="hover:underline">#{ord.id.slice(-8).toUpperCase()}</Link>
                    </td>
                    <td className="px-5 py-4 text-[#2B2620] font-bold text-[11px]">{ord.clientName}</td>
                    <td className="px-5 py-4 font-black text-emerald-700 text-[11px]">
                      R$ {ord.total.toFixed(2).replace(".", ",")}
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={ord.status} /></td>
                    <td className="px-5 py-4 text-[#7A6F63] font-semibold text-[10px]">{ord.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-[#EDE3D3]/50">
              {recentOrders.map((ord) => (
                <div key={ord.id} className="px-5 py-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-[#8B5E3C]">#{ord.id.slice(-6)}</span>
                      <StatusBadge status={ord.status} />
                    </div>
                    <p className="text-xs font-black text-[#2B2620] truncate">{ord.clientName}</p>
                    <p className="text-[8px] text-[#7A6F63] font-bold mt-0.5 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" /> {ord.createdAt}
                    </p>
                  </div>
                  <span className="text-sm font-black text-emerald-700 flex-shrink-0">
                    R$ {ord.total.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
