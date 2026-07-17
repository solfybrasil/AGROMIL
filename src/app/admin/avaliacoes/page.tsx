"use client";

import { useEffect, useState } from "react";
import {
  Star,
  Check,
  X,
  Trash2,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Clock,
  EyeOff,
} from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  approved: boolean;
  createdAt: string;
  customer: {
    name: string;
  };
  product: {
    name: string;
  };
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errMessage, setErrMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews/all");
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.warn("Reviews API error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (id: string, approveStatus: boolean) => {
    setMessage("");
    setErrMessage("");
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: approveStatus }),
      });
      if (res.ok) {
        setReviews(reviews.map((r) => (r.id === id ? { ...r, approved: approveStatus } : r)));
        setMessage(approveStatus ? "Avaliação aprovada com sucesso." : "Avaliação ocultada.");
      } else {
        setErrMessage("Erro ao atualizar status da avaliação.");
      }
    } catch {
      setReviews(reviews.map((r) => (r.id === id ? { ...r, approved: approveStatus } : r)));
      setMessage("Status alterado localmente (Modo Demo).");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta avaliação definitivamente?")) return;
    setMessage("");
    setErrMessage("");
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviews(reviews.filter((r) => r.id !== id));
        setMessage("Avaliação excluída com sucesso.");
      } else {
        setErrMessage("Erro ao excluir avaliação.");
      }
    } catch {
      setReviews(reviews.filter((r) => r.id !== id));
      setMessage("Avaliação excluída localmente (Modo Demo).");
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (activeTab === "approved") return r.approved === true;
    return r.approved === false;
  });

  const totalCount = reviews.length;
  const approvedCount = reviews.filter((r) => r.approved === true).length;
  const pendingCount = reviews.filter((r) => r.approved === false).length;

  const kpiCards = [
    {
      label: "Total de Avaliações",
      value: totalCount,
      icon: MessageSquare,
      iconBg: "bg-[#1b4332]/10",
      iconColor: "text-[#1b4332]",
      valueColor: "text-[#1b4332]",
      pulse: false,
    },
    {
      label: "Aprovadas",
      value: approvedCount,
      icon: CheckCircle,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      valueColor: "text-emerald-700",
      pulse: false,
    },
    {
      label: "Pendentes",
      value: pendingCount,
      icon: Clock,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
      valueColor: "text-amber-700",
      pulse: pendingCount > 0,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#1b4332] border-t-transparent" />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Carregando avaliações…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none animate-fade-in-up">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <Star className="h-6 w-6 text-amber-600 fill-amber-400/30" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-black text-[#1b4332] leading-tight">
              Moderação de Avaliações
            </h1>
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-0.5">
              Aprove ou rejeite reviews escritos por clientes
            </p>
          </div>
        </div>

        {pendingCount > 0 && (
          <div className="flex-shrink-0 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            {pendingCount} pendente{pendingCount !== 1 ? "s" : ""} aguardando
          </div>
        )}
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-3xl p-5 shadow-3xs border border-gray-100/80 flex items-center gap-4"
            >
              <div
                className={`flex-shrink-0 w-11 h-11 rounded-2xl ${kpi.iconBg} flex items-center justify-center`}
              >
                <Icon
                  className={`h-5 w-5 ${kpi.iconColor} ${kpi.pulse ? "animate-pulse" : ""}`}
                />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {kpi.label}
                </p>
                <p className={`text-2xl font-black ${kpi.valueColor} leading-tight mt-0.5`}>
                  {kpi.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Toast Messages ── */}
      {message && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black px-4 py-3 rounded-2xl animate-pulse">
          <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {errMessage && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-black px-4 py-3 rounded-2xl animate-pulse">
          <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
          <span>{errMessage}</span>
        </div>
      )}

      {/* ── Segmented Tabs ── */}
      <div className="bg-gray-100/70 p-1.5 rounded-2xl flex w-fit gap-1 border border-gray-200/40">
        {[
          { key: "pending" as const, label: "Pendentes", count: pendingCount },
          { key: "approved" as const, label: "Aprovadas", count: approvedCount },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 py-2 px-5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 cursor-pointer active:scale-95 ${
              activeTab === tab.key
                ? "bg-white text-[#1b4332] shadow-3xs border border-gray-100"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
            <span
              className={`min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[9px] font-black px-1 ${
                activeTab === tab.key
                  ? tab.key === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                  : "bg-gray-200/70 text-gray-500"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Section Divider ── */}
      <div className="relative flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 flex-shrink-0">
          {activeTab === "pending" ? "Aguardando moderação" : "Avaliações aprovadas & públicas"}
        </span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* ── Review List / Empty State ── */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-14 text-center space-y-4 shadow-3xs">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-3xl ${
              activeTab === "pending"
                ? "bg-amber-50 text-amber-400"
                : "bg-emerald-50 text-emerald-400"
            }`}
          >
            {activeTab === "pending" ? (
              <Clock className="h-7 w-7" />
            ) : (
              <CheckCircle className="h-7 w-7" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">
              {activeTab === "pending"
                ? "Nenhuma avaliação pendente"
                : "Nenhuma avaliação aprovada"}
            </h3>
            <p className="text-xs text-gray-400 font-semibold mt-2 max-w-xs mx-auto leading-relaxed">
              {activeTab === "pending"
                ? "Todas as avaliações já foram moderadas. Volte mais tarde."
                : "Nenhuma avaliação foi aprovada ainda. Acesse a aba 'Pendentes' para moderar."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredReviews.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-gray-100/80 rounded-3xl p-5 shadow-3xs flex flex-col md:flex-row md:items-start gap-5 hover:border-gray-200 transition-all duration-200"
            >
              {/* Left: Content */}
              <div className="flex-1 min-w-0 space-y-3">
                {/* Product + Customer + Date */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-[#1b4332]/10 text-[#1b4332] rounded-xl px-2.5 py-1 text-[10px] font-black uppercase tracking-widest">
                    {r.product?.name || "Produto"}
                  </span>
                  <span className="font-black text-gray-800 text-sm">
                    {r.customer?.name || "Cliente"}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">
                    {new Date(r.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 transition-colors ${
                        star <= r.rating
                          ? "text-[#e2b13c] fill-[#e2b13c]"
                          : "text-gray-200 fill-gray-200"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {r.rating}/5
                  </span>
                </div>

                {/* Comment */}
                {r.comment ? (
                  <blockquote className="border-l-2 border-[#1b4332]/20 pl-3">
                    <p className="text-xs italic text-gray-600 leading-relaxed">
                      &ldquo;{r.comment}&rdquo;
                    </p>
                  </blockquote>
                ) : (
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 italic">
                    Sem comentário
                  </p>
                )}
              </div>

              {/* Right: Actions + Status Badge */}
              <div className="flex-shrink-0 flex flex-col items-end gap-3">
                {/* Status badge */}
                {r.approved ? (
                  <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                    <CheckCircle className="h-3 w-3" />
                    Aprovada
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                    <Clock className="h-3 w-3" />
                    Pendente
                  </span>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {activeTab === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(r.id, true)}
                        className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black py-2 px-3.5 rounded-xl transition-all cursor-pointer uppercase tracking-widest active:scale-95"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleApprove(r.id, false)}
                        className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-black py-2 px-3.5 rounded-xl transition-all cursor-pointer uppercase tracking-widest active:scale-95"
                      >
                        <X className="h-3.5 w-3.5" />
                        Rejeitar
                      </button>
                    </>
                  )}
                  {activeTab === "approved" && (
                    <button
                      onClick={() => handleApprove(r.id, false)}
                      className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black py-2 px-3.5 rounded-xl transition-all cursor-pointer uppercase tracking-widest active:scale-95"
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      Ocultar
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-2.5 border border-gray-200 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all cursor-pointer active:scale-95"
                    title="Excluir permanentemente"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
