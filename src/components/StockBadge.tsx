import { AlertTriangle, Flame, ShieldCheck, Ban } from "lucide-react";

interface StockBadgeProps {
  stock: number;
}

export default function StockBadge({ stock }: StockBadgeProps) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full select-none">
        <Ban className="h-3 w-3 text-rose-500 flex-shrink-0" />
        Esgotado
      </span>
    );
  }

  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse select-none">
        <AlertTriangle className="h-3 w-3 text-orange-500 flex-shrink-0" />
        Últimas {stock} unidades!
      </span>
    );
  }

  if (stock <= 10) {
    return (
      <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full select-none">
        <Flame className="h-3 w-3 text-amber-500 flex-shrink-0" />
        Apenas {stock} restantes
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full select-none">
      <ShieldCheck className="h-3 w-3 text-emerald-500 flex-shrink-0" />
      Em estoque
    </span>
  );
}
