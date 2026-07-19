"use client";

import React, { useEffect, useState } from "react";
import {
  DollarSign,
  ClipboardList,
  Package,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Activity,
  Zap,
  ShoppingBag,
  Megaphone,
  Tag,
  Star,
  Layers,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Users,
  BarChart3,
  RefreshCcw,
  Eye,
} from "lucide-react";
import Link from "next/link";
import {
  StatCard,
  SectionCard,
  Card,
  CardContent,
} from "@/components/ui/Card";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalRevenue: number;
  ordersCount: number;
  productsCount: number;
  lowStockCount: number;
}

interface RecentOrder {
  id: string;
  clientName: string;
  total: number;
  status: string;
  createdAt: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  unit: string;
}

interface SalesTrend {
  day: string;
  value: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_SALES_TREND: SalesTrend[] = [
  { day: "Seg", value: 340.5 },
  { day: "Ter", value: 580.0 },
  { day: "Qua", value: 412.8 },
  { day: "Qui", value: 920.1 },
  { day: "Sex", value: 1120.4 },
  { day: "Sáb", value: 780.0 },
  { day: "Dom", value: 310.2 },
];

const QUICK_ACTIONS = [
  { label: "Novo Produto", icon: ShoppingBag, href: "/admin/produtos/novo", color: "bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white" },
  { label: "Pedidos", icon: ClipboardList, href: "/admin/pedidos", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-600 hover:text-white" },
  { label: "Banners", icon: Megaphone, href: "/admin/banners", color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-500 hover:text-white" },
  { label: "Cupons", icon: Tag, href: "/admin/cupons", color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-600 hover:text-white" },
  { label: "Hero Slider", icon: Layers, href: "/admin/hero", color: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-600 hover:text-white" },
  { label: "Avaliações", icon: Star, href: "/admin/avaliacoes", color: "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-500 hover:text-white" },
  { label: "Relatórios", icon: BarChart3, href: "/admin/relatorios", color: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-600 hover:text-white" },
  { label: "Categorias", icon: Layers, href: "/admin/categorias", color: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-700 hover:text-white" },
];

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string; border: string; pulse?: boolean }> = {
  NEW:       { label: "Novo",       dot: "bg-blue-500",    bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-100",    pulse: true },
  CONFIRMED: { label: "Confirmado", dot: "bg-indigo-500",  bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-100" },
  PREPARING: { label: "Preparando", dot: "bg-amber-500",   bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-100",   pulse: true },
  SHIPPED:   { label: "A Caminho",  dot: "bg-purple-500",  bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-100" },
  DELIVERED: { label: "Entregue",   dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
  CANCELLED: { label: "Cancelado",  dot: "bg-rose-500",    bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-100" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status, dot: "bg-gray-400", bg: "bg-gray-50",
    text: "text-gray-600", border: "border-gray-100",
  };
  return (
    <span className={`inline-flex items-center gap-1 ${cfg.bg} border ${cfg.border} ${cfg.text} px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} ${cfg.pulse ? "animate-pulse" : ""}`} />
      {cfg.label}
    </span>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 28340.7,
    ordersCount: 207,
    productsCount: 11,
    lowStockCount: 2,
  });

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([
    { id: "AGR-1002", clientName: "José da Silva",  total: 189.8,  status: "NEW",       createdAt: "15/07/2026 09:30" },
    { id: "AGR-1001", clientName: "Maria de Souza", total: 110.0,  status: "PREPARING", createdAt: "14/07/2026 15:45" },
    { id: "AGR-0999", clientName: "Carlos Antunes", total: 78.0,   status: "DELIVERED", createdAt: "12/07/2026 11:20" },
    { id: "AGR-0998", clientName: "Ana Ferreira",   total: 234.5,  status: "SHIPPED",   createdAt: "11/07/2026 08:10" },
  ]);

  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([
    { id: "m-8", name: "Pulverizador Costal Guarany 20L",   stock: 4, unit: "Unidade"   },
    { id: "m-4", name: "Ração Premium Adultos Frango 15kg", stock: 8, unit: "Saco 15kg" },
    { id: "m-6", name: "Sal Mineral 80 Fósforo 25kg",       stock: 2, unit: "Saco 25kg" },
  ]);

  const [salesTrend, setSalesTrend] = useState<SalesTrend[]>(DEFAULT_SALES_TREND);
  const [hoveredPoint, setHoveredPoint] = useState<{ day: string; value: number; x: number; y: number } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchDashboardData = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    try {
      const res = await fetch("/api/relatorios/dashboard");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
        setLowStockProducts(data.lowStockProducts);
        if (data.salesTrend) setSalesTrend(data.salesTrend);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.warn("Dashboard fetch failed, using demo data.", err);
    } finally {
      if (showRefresh) setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  // ── Chart ──────────────────────────────────────────────────────────────────
  const chartW = 500;
  const chartH = 160;
  const pad = 28;
  const maxVal = Math.max(...salesTrend.map((t) => t.value), 1);
  const pts = salesTrend.map((t, i) => ({
    x: pad + (i / (salesTrend.length - 1)) * (chartW - pad * 2),
    y: chartH - pad - (t.value / maxVal) * (chartH - pad * 2),
    ...t,
  }));
  const lineD = pts.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");
  const areaD = `${lineD} L ${pts[pts.length - 1].x} ${chartH - pad} L ${pts[0].x} ${chartH - pad} Z`;
  const weekTotal = salesTrend.reduce((a, t) => a + t.value, 0);
  const maxDay = salesTrend.reduce((a, b) => (b.value > a.value ? b : a), salesTrend[0]);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="space-y-5 md:space-y-6 animate-fade-in-up">

      {/* ── Welcome Banner ─────────────────────────────────────────────────── */}
      <Card variant="dark" noPadding className="overflow-hidden">
        <div className="relative p-5 md:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Dot pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* Glowing orb */}
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-1">
            <p className="text-emerald-400/70 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
              {greeting}, Administrador 👋
            </p>
            <h1 className="font-serif text-xl md:text-2xl font-black text-white tracking-tight">
              Dashboard Agromil
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-white/40 text-[9px] md:text-[10px] font-semibold">
                {now.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
              </p>
              <span className="text-white/20 text-[9px]">·</span>
              <p className="text-white/40 text-[9px] font-semibold">
                Atualizado {lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10 flex-wrap">
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] md:text-[9px] font-black px-3 py-1.5 rounded-xl">
              <Activity className="h-2.5 w-2.5 animate-pulse" />
              Sistema Ativo
            </div>
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 bg-white/[0.06] border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-[8px] font-black px-3 py-1.5 rounded-xl transition-all disabled:opacity-40"
            >
              <RefreshCcw className={`h-2.5 w-2.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              href="/admin/pedidos"
              className="flex items-center gap-1.5 bg-[#e2b13c] text-[#1b4332] text-[8px] md:text-[9px] font-black px-3 py-1.5 rounded-xl hover:bg-[#d4a030] transition-all"
            >
              <Zap className="h-2.5 w-2.5" />
              Ver Kanban
            </Link>
          </div>
        </div>
      </Card>

      {/* ── KPI Grid ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          label="Faturamento Total"
          value={`R$ ${stats.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`}
          subValue={`R$ ${stats.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} exato`}
          trend="+12% no mês"
          trendUp={true}
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-500/15 border-emerald-500/20"
          accentColor="from-emerald-500/5"
        />
        <StatCard
          label="Pedidos no Período"
          value={`${stats.ordersCount}`}
          subValue="4 pedidos ativos agora"
          trend="4 ativos"
          trendUp={null}
          icon={ClipboardList}
          iconColor="text-blue-600"
          iconBg="bg-blue-500/15 border-blue-500/20"
          accentColor="from-blue-500/5"
          href="/admin/pedidos"
        />
        <StatCard
          label="Produtos Ativos"
          value={`${stats.productsCount}`}
          subValue="no catálogo"
          trend="Ver catálogo →"
          trendUp={null}
          icon={Package}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-500/15 border-indigo-500/20"
          accentColor="from-indigo-500/5"
          href="/admin/produtos"
        />
        <StatCard
          label="Estoque Crítico"
          value={`${stats.lowStockCount}`}
          subValue={`${stats.lowStockCount === 1 ? "item" : "itens"} abaixo do mínimo`}
          trend={stats.lowStockCount > 0 ? "Atenção urgente" : "Estoque saudável"}
          trendUp={stats.lowStockCount > 0 ? false : true}
          icon={AlertTriangle}
          iconColor={stats.lowStockCount > 0 ? "text-rose-600" : "text-emerald-600"}
          iconBg={stats.lowStockCount > 0 ? "bg-rose-500/15 border-rose-500/20" : "bg-emerald-500/15 border-emerald-500/20"}
          accentColor={stats.lowStockCount > 0 ? "from-rose-500/5" : "from-emerald-500/5"}
          pulse={stats.lowStockCount > 0}
        />
      </div>

      {/* ── Quick Actions ──────────────────────────────────────────────────── */}
      <SectionCard
        title="Ações Rápidas"
        titleIcon={Zap}
        description="Acesse as principais seções do painel em um clique"
      >
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 md:gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`flex flex-col items-center gap-1.5 md:gap-2 border rounded-xl md:rounded-2xl p-2.5 md:p-3.5 text-center hover-lift active-pop ${action.color}`}
            >
              <action.icon className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-[7px] md:text-[9px] font-black uppercase tracking-wide leading-tight">{action.label}</span>
            </Link>
          ))}
        </div>
      </SectionCard>

      {/* ── Charts + Stock Row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">

        {/* Sales Chart */}
        <SectionCard
          title="Desempenho — 7 dias"
          titleIcon={TrendingUp}
          description="Faturamento diário da semana"
          className="lg:col-span-2"
          action={
            <div className="text-right">
              <p className="text-[8px] text-gray-400 font-black uppercase tracking-wider">Semana</p>
              <p className="text-sm font-black text-primary mt-0.5">
                R$ {weekTotal.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
              </p>
              <p className="text-[8px] text-emerald-600 font-black">
                🔝 {maxDay?.day}: R$ {maxDay?.value.toFixed(0)}
              </p>
            </div>
          }
        >
          <div className="relative w-full min-h-[140px] md:min-h-[180px]">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#1b4332" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#1b4332" stopOpacity="0.01" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* Grid lines */}
              {[0.25, 0.5, 0.75, 1].map((t, i) => (
                <line
                  key={i}
                  x1={pad} y1={chartH - pad - t * (chartH - pad * 2)}
                  x2={chartW - pad} y2={chartH - pad - t * (chartH - pad * 2)}
                  stroke="#f3f4f6" strokeWidth="1"
                  strokeDasharray={i < 3 ? "4,4" : "0"}
                />
              ))}

              {/* Area + Line */}
              <path d={areaD} fill="url(#area-grad)" />
              <path d={lineD} fill="none" stroke="#1b4332" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />

              {/* Points */}
              {pts.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x} cy={p.y}
                    r={hoveredPoint?.day === p.day ? 7 : 4.5}
                    fill={p.day === maxDay?.day ? "#e2b13c" : "#1b4332"}
                    stroke="white" strokeWidth="2"
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              ))}

              {/* X-axis labels */}
              {pts.map((p, idx) => (
                <text key={idx} x={p.x} y={chartH - 4} textAnchor="middle" fontSize="8" fontWeight="800" fill="#9ca3af">
                  {p.day}
                </text>
              ))}
            </svg>

            {/* Tooltip */}
            {hoveredPoint && (
              <div
                className="absolute bg-gray-900/95 text-white rounded-xl px-3 py-2 text-[9px] font-black shadow-xl pointer-events-none border border-white/10 -translate-x-1/2 z-10 animate-scale-in"
                style={{ left: `${(hoveredPoint.x / chartW) * 100}%`, top: `${Math.max(0, hoveredPoint.y - 50)}px` }}
              >
                <span className="text-gray-400 uppercase text-[7px] font-bold block">{hoveredPoint.day}</span>
                <span className="text-emerald-400 text-sm">R$ {hoveredPoint.value.toFixed(2)}</span>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Low Stock Alert */}
        <SectionCard
          title="Reposição Urgente"
          titleIcon={AlertTriangle}
          description="Produtos abaixo do estoque mínimo"
          badge={
            lowStockProducts.length > 0 ? (
              <span className="inline-flex items-center bg-rose-50 border border-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-wider animate-pulse">
                {lowStockProducts.length} alerta{lowStockProducts.length !== 1 ? "s" : ""}
              </span>
            ) : null
          }
          action={
            <Link
              href="/admin/produtos"
              className="flex items-center gap-1 text-[9px] font-black text-primary hover:underline"
            >
              Ajustar
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          }
        >
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5">
            {lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-500 p-3 rounded-full">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="text-xs text-gray-700 font-extrabold">Tudo em ordem!</p>
                <p className="text-[10px] text-gray-400 font-semibold">Nenhum produto crítico</p>
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 bg-rose-50/50 border border-rose-100 rounded-xl p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-gray-800 leading-snug line-clamp-2">{p.name}</p>
                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">{p.unit}</span>
                  </div>
                  <div className="flex-shrink-0 text-center">
                    <span
                      className={`block font-black text-sm rounded-lg px-2 py-0.5 ${
                        p.stock <= 4 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {p.stock}
                    </span>
                    <span className="text-[7px] text-gray-400 font-bold block mt-0.5">restam</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      {/* ── Recent Orders ──────────────────────────────────────────────────── */}
      <SectionCard
        title="Últimos Pedidos"
        titleIcon={ClipboardList}
        description="Movimentações mais recentes da loja"
        noPadding
        action={
          <Link
            href="/admin/pedidos"
            className="flex items-center gap-1 text-[9px] md:text-[10px] bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 px-3 py-1.5 rounded-xl font-black transition-all uppercase tracking-wider"
          >
            <Eye className="h-3 w-3" />
            Kanban
            <ChevronRight className="h-3 w-3" />
          </Link>
        }
      >
        {/* Mobile cards */}
        <div className="divide-y divide-gray-50 md:hidden">
          {recentOrders.map((ord) => (
            <div key={ord.id} className="px-5 py-3.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-black text-primary">#{ord.id.slice(-6)}</span>
                  <StatusBadge status={ord.status} />
                </div>
                <p className="text-[11px] font-black text-gray-800 truncate">{ord.clientName}</p>
                <p className="text-[8px] text-gray-400 font-bold mt-0.5 flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" /> {ord.createdAt}
                </p>
              </div>
              <span className="text-[11px] font-black text-gray-900 flex-shrink-0">
                R$ {ord.total.toFixed(2).replace(".", ",")}
              </span>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/60 text-gray-400 font-black uppercase border-b border-gray-100 tracking-widest text-[9px]">
                <th className="px-5 py-3.5">Pedido</th>
                <th className="px-5 py-3.5">Cliente</th>
                <th className="px-5 py-3.5">Total</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 flex items-center gap-1"><Clock className="h-3 w-3" /> Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-gray-50/40 transition-colors group">
                  <td className="px-5 py-4 font-black text-primary text-[11px]">
                    <Link href="/admin/pedidos" className="hover:underline">{ord.id}</Link>
                  </td>
                  <td className="px-5 py-4 text-gray-700 font-bold text-[11px]">{ord.clientName}</td>
                  <td className="px-5 py-4 font-black text-gray-900 text-[11px]">R$ {ord.total.toFixed(2).replace(".", ",")}</td>
                  <td className="px-5 py-4"><StatusBadge status={ord.status} /></td>
                  <td className="px-5 py-4 text-gray-400 font-semibold text-[10px]">{ord.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

    </div>
  );
}
