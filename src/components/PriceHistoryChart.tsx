"use client";

import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp, Info } from "lucide-react";

interface PricePoint {
  price: number;
  recordedAt: string;
}

interface PriceHistoryChartProps {
  productId: string;
  currentPrice: number;
}

export default function PriceHistoryChart({ productId, currentPrice }: PriceHistoryChartProps) {
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<{ price: number; date: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/preco-historico/${productId}`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.warn("Failed to load price history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [productId]);

  if (loading || history.length < 2) return null;

  // Extract prices to find min/max for scale scaling
  const prices = history.map((h) => h.price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const priceRange = maxPrice - minPrice || 1;

  // Check if current is min historical price
  const isMinPrice = currentPrice <= minPrice;
  const isPriceUp = currentPrice > prices[prices.length - 2];

  // SVG dimensions
  const width = 200;
  const height = 50;
  const padding = 5;

  // Generate SVG path coordinates
  const points = history.map((pt, idx) => {
    const x = padding + (idx / (history.length - 1)) * (width - padding * 2);
    // Invert Y axis (higher price is lower Y coordinate)
    const y =
      height -
      padding -
      ((pt.price - minPrice) / priceRange) * (height - padding * 2);
    return { x, y, price: pt.price, date: new Date(pt.recordedAt).toLocaleDateString("pt-BR") };
  });

  const pathD = points.reduce(
    (acc, pt, idx) => `${acc} ${idx === 0 ? "M" : "L"} ${pt.x} ${pt.y}`,
    ""
  );

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-3xs space-y-3 relative select-none max-w-xs">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
          <Info className="h-3 w-3 text-primary" />
          Histórico de Preço (30d)
        </span>
        {isMinPrice ? (
          <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wide">
            <TrendingDown className="h-2.5 w-2.5" />
            Melhor Preço!
          </span>
        ) : isPriceUp ? (
          <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wide">
            <TrendingUp className="h-2.5 w-2.5" />
            Em alta
          </span>
        ) : null}
      </div>

      {/* SVG Sparkline Area */}
      <div className="relative h-[55px] pt-1">
        <svg className="w-full h-full overflow-visible">
          {/* Grid line min/max */}
          <line
            x1="0"
            y1={padding}
            x2={width}
            y2={padding}
            stroke="#f3f4f6"
            strokeDasharray="2,2"
          />
          <line
            x1="0"
            y1={height - padding}
            x2={width}
            y2={height - padding}
            stroke="#f3f4f6"
            strokeDasharray="2,2"
          />

          {/* Sparkline Path */}
          <path
            d={pathD}
            fill="none"
            stroke={isMinPrice ? "#10b981" : "#2d6a4f"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Sparkline points to listen to hover */}
          {points.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r="3.5"
              className="fill-primary stroke-white stroke-2 opacity-0 hover:opacity-100 cursor-pointer transition-opacity duration-150"
              onMouseEnter={() =>
                setHoveredPoint({ price: pt.price, date: pt.date, x: pt.x, y: pt.y })
              }
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute bg-gray-900 text-white rounded-lg px-2 py-1 text-[9px] font-black shadow-lg pointer-events-none -translate-x-1/2 -translate-y-8 z-10 flex flex-col gap-0.5"
            style={{ left: `${(hoveredPoint.x / width) * 100}%`, top: `${hoveredPoint.y}px` }}
          >
            <span>R$ {hoveredPoint.price.toFixed(2)}</span>
            <span className="text-[7px] text-gray-400 font-bold">{hoveredPoint.date}</span>
          </div>
        )}
      </div>

      {/* Footer range info */}
      <div className="flex justify-between text-[8px] font-bold text-gray-400">
        <span>Menor: R$ {minPrice.toFixed(2)}</span>
        <span>Maior: R$ {maxPrice.toFixed(2)}</span>
      </div>
    </div>
  );
}
