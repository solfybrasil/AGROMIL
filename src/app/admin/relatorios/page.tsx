"use client";

import { useState, useEffect, useRef } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  AlertCircle,
  ShoppingCart,
  DollarSign,
  Package,
  ArrowUpRight,
} from "lucide-react";

/* ── Mock Data ─────────────────────────────── */
const topProducts = [
  { name: "Ração Premium Cães Adultos 15kg", sales: 48, revenue: 8155.20 },
  { name: "Sal Mineral 80 Bovinos 25kg", sales: 32, revenue: 3520.00 },
  { name: "Adubo Orgânico Concentrado Húmus 5kg", sales: 25, revenue: 497.50 },
  { name: "Mangueira de Jardim Flexível 20m", sales: 18, revenue: 1618.20 },
];

const salesByCategory = [
  { name: "Pet Shop", sales: 80, revenue: 12500.50, color: "#3b82f6" },
  { name: "Agropecuária Geral", sales: 65, revenue: 9800.00, color: "#1b4332" },
  { name: "Jardinagem", sales: 42, revenue: 1540.20, color: "#10b981" },
  { name: "Ferramentas", sales: 20, revenue: 4500.00, color: "#e2b13c" },
];

const WEEKLY = [
  { day: "Seg", value: 340.50 },
  { day: "Ter", value: 580.00 },
  { day: "Qua", value: 412.80 },
  { day: "Qui", value: 920.10 },
  { day: "Sex", value: 1120.40 },
  { day: "Sab", value: 780.00 },
  { day: "Dom", value: 310.20 },
];

const TOTAL_REVENUE = 28340.70;
const MAX_REVENUE = Math.max(...salesByCategory.map((c) => c.revenue));
const MAX_SALES = Math.max(...topProducts.map((p) => p.sales));
const MAX_WEEKLY = Math.max(...WEEKLY.map((d) => d.value));

/* ── Chart Constants ────────────────────────── */
const CHART_W = 560;
const CHART_H = 160;
const BAR_W = 50;
const BAR_GAP = 30;
const LABEL_H = 20;
const MAX_BAR_H = CHART_H - LABEL_H;

/* ── Rank colors ─────────────────────────────── */
const RANK_STYLES = [
  "bg-[#e2b13c]/20 text-[#b8860b] border-[#e2b13c]/40",  // gold
  "bg-gray-200/60 text-gray-500 border-gray-300/60",       // silver
  "bg-orange-100 text-orange-600 border-orange-200",       // bronze
  "bg-gray-100 text-gray-400 border-gray-200",             // plain
];

/* ── Component ───────────────────────────────── */
export default function AdminReports() {
  const [period, setPeriod] = useState("30");
  const [tooltip, setTooltip] = useState<{ idx: number; x: number; y: number } | null>(null);
  const [barsVisible, setBarsVisible] = useState(false);
  const barsRef = useRef(false);

  useEffect(() => {
    // Trigger animated progress bars after mount
    const timer = setTimeout(() => {
      setBarsVisible(true);
      barsRef.current = true;
    }, 80);
    return () => clearTimeout(timer);
  }, []);

  const kpiCards = [
    {
      label: "Faturamento Total",
      value: "R$ 28.340,70",
      icon: DollarSign,
      iconBg: "bg-[#1b4332]/10",
      iconColor: "text-[#1b4332]",
      valueColor: "text-[#1b4332]",
      trend: "+12% vs período anterior",
      trendColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      trendIcon: ArrowUpRight,
    },
    {
      label: "Pedidos Entregues",
      value: "207",
      icon: ShoppingCart,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      valueColor: "text-blue-700",
      trend: "+8% vs período anterior",
      trendColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      trendIcon: ArrowUpRight,
    },
    {
      label: "Ticket Médio",
      value: "R$ 136,91",
      icon: TrendingUp,
      iconBg: "bg-[#e2b13c]/10",
      iconColor: "text-[#b8860b]",
      valueColor: "text-[#1b4332]",
      trend: "+3% vs período anterior",
      trendColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      trendIcon: ArrowUpRight,
    },
    {
      label: "Produto Mais Vendido",
      value: "Ração Premium 15kg",
      icon: Package,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600",
      valueColor: "text-gray-800",
      trend: "48 vendas no período",
      trendColor: "text-purple-700 bg-purple-50 border-purple-200",
      trendIcon: null,
    },
  ];

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

        {/* Period Selector */}
        <div className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-3xs flex-shrink-0 cursor-pointer hover:border-[#1b4332]/30 transition-all">
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

      {/* ── KPI Row (4 cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trendIcon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-3xl p-5 shadow-3xs border border-gray-100/80 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-2xl ${kpi.iconBg} flex items-center justify-center`}
                >
                  <Icon className={`h-4.5 w-4.5 ${kpi.iconColor}`} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-tight">
                  {kpi.label}
                </p>
              </div>
              <p className={`text-xl font-black ${kpi.valueColor} leading-tight truncate`}>
                {kpi.value}
              </p>
              <div
                className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${kpi.trendColor}`}
              >
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
        <div className="bg-white rounded-3xl shadow-3xs p-6 space-y-5 border border-gray-100/80">
          {/* Card Header */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-[#1b4332]/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-4 w-4 text-[#1b4332]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Ranking
              </p>
              <h3 className="text-sm font-black text-gray-800 leading-tight">
                Produtos Mais Vendidos
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            {topProducts.map((prod, idx) => {
              const barPct = (prod.sales / MAX_SALES) * 100;
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-3">
                    {/* Rank badge */}
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border ${RANK_STYLES[idx] ?? RANK_STYLES[3]}`}
                    >
                      {idx + 1}°
                    </span>
                    {/* Name */}
                    <p className="flex-1 text-xs font-black text-gray-700 truncate min-w-0">
                      {prod.name}
                    </p>
                    {/* Revenue */}
                    <span className="flex-shrink-0 text-xs font-black text-[#1b4332]">
                      R$ {prod.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="ml-11 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1b4332] rounded-full transition-all duration-700 ease-out"
                      style={{ width: barsVisible ? `${barPct}%` : "0%" }}
                    />
                  </div>
                  <div className="ml-11 flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {prod.sales} vendas
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Sales by Category */}
        <div className="bg-white rounded-3xl shadow-3xs p-6 space-y-5 border border-gray-100/80">
          {/* Card Header */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-[#1b4332]/10 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="h-4 w-4 text-[#1b4332]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Distribuição
              </p>
              <h3 className="text-sm font-black text-gray-800 leading-tight">
                Vendas por Categoria
              </h3>
            </div>
          </div>

          <div className="space-y-5">
            {salesByCategory.map((cat, idx) => {
              const pct = Math.round((cat.revenue / TOTAL_REVENUE) * 100);
              const barPct = (cat.revenue / MAX_REVENUE) * 100;
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="flex-shrink-0 w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-xs font-black text-gray-700 truncate">
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-black text-gray-400">
                        {cat.sales} vendas
                      </span>
                      <span className="text-xs font-black text-[#1b4332]">
                        R$ {cat.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                      <span
                        className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: cat.color + "20",
                          color: cat.color,
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                  {/* Animated progress bar */}
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
        </div>
      </div>

      {/* ── Weekly Trend SVG Chart ── */}
      <div className="bg-white rounded-3xl shadow-3xs p-6 border border-gray-100/80 space-y-5">
        {/* Card Header */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1b4332]/10 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="h-4 w-4 text-[#1b4332]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Esta semana
              </p>
              <h3 className="text-sm font-black text-gray-800 leading-tight">
                Tendência Semanal de Faturamento
              </h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Total
            </p>
            <p className="text-lg font-black text-[#1b4332]">
              R$ {WEEKLY.reduce((s, d) => s + d.value, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* SVG Bar Chart */}
        <div className="overflow-x-auto">
          <div className="relative" style={{ minWidth: CHART_W }}>
            <svg
              width={CHART_W}
              height={CHART_H + 10}
              className="overflow-visible"
            >
              {/* Y-axis grid lines */}
              {[0, 1, 2, 3].map((tick) => {
                const y = CHART_H - LABEL_H - (tick / 3) * MAX_BAR_H;
                const val = ((tick / 3) * MAX_WEEKLY).toFixed(0);
                return (
                  <g key={tick}>
                    <line
                      x1={0}
                      y1={y}
                      x2={CHART_W}
                      y2={y}
                      stroke="#f0f0f0"
                      strokeWidth={1}
                    />
                    <text
                      x={-8}
                      y={y + 4}
                      textAnchor="end"
                      fontSize={9}
                      fill="#d1d5db"
                      fontWeight={700}
                      fontFamily="sans-serif"
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
                const isMax = d.value === MAX_WEEKLY;

                return (
                  <g key={d.day}>
                    {/* Bar */}
                    <rect
                      x={x}
                      y={y}
                      width={BAR_W}
                      height={barH}
                      rx={6}
                      ry={6}
                      fill={isMax ? "#e2b13c" : "#1b4332"}
                      opacity={isMax ? 1 : 0.75}
                      className="cursor-pointer hover:opacity-100 transition-opacity"
                      onMouseEnter={() => setTooltip({ idx: i, x: x + BAR_W / 2, y })}
                      onMouseLeave={() => setTooltip(null)}
                    />
                    {/* X-axis label */}
                    <text
                      x={x + BAR_W / 2}
                      y={CHART_H + 2}
                      textAnchor="middle"
                      fontSize={10}
                      fill={isMax ? "#b8860b" : "#9ca3af"}
                      fontWeight={700}
                      fontFamily="sans-serif"
                    >
                      {d.day}
                    </text>
                  </g>
                );
              })}

              {/* Tooltip */}
              {tooltip !== null && (
                <g>
                  <rect
                    x={tooltip.x - 42}
                    y={tooltip.y - 36}
                    width={84}
                    height={30}
                    rx={6}
                    fill="#1b4332"
                  />
                  <text
                    x={tooltip.x}
                    y={tooltip.y - 22}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#86efac"
                    fontWeight={700}
                    fontFamily="sans-serif"
                    letterSpacing={1}
                  >
                    {WEEKLY[tooltip.idx].day.toUpperCase()}
                  </text>
                  <text
                    x={tooltip.x}
                    y={tooltip.y - 11}
                    textAnchor="middle"
                    fontSize={10}
                    fill="white"
                    fontWeight={900}
                    fontFamily="sans-serif"
                  >
                    R$ {WEEKLY[tooltip.idx].value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#1b4332] opacity-75 inline-block" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Faturamento diário
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#e2b13c] inline-block" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Melhor dia
            </span>
          </div>
        </div>
      </div>

      {/* ── Info Notice ── */}
      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-2xl flex items-start gap-3 shadow-3xs">
        <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-0.5">
            Fonte dos dados
          </p>
          <p className="text-xs font-semibold text-blue-700 leading-relaxed">
            Os dados exibidos neste relatório são gerados a partir do histórico de pedidos
            finalizados com o status de &ldquo;Entregue&rdquo;. Os gráficos semanais refletem a
            semana corrente.
          </p>
        </div>
      </div>
    </div>
  );
}
