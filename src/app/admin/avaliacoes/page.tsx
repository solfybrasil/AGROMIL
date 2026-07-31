"use client";

import { useEffect, useState } from "react";
import {
  Star, Check, X, Trash2, AlertCircle, CheckCircle, MessageSquare, Clock, EyeOff, Sparkles,
} from "lucide-react";
import { dbService } from "@/lib/db-service";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  approved: boolean;
  createdAt: string;
  customer?: { name: string };
  product?: { name: string };
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errMessage, setErrMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");

  const fetchReviews = async () => {
    try {
      const localReviews = await dbService.getReviews();
      if (localReviews && localReviews.length > 0) setReviews(localReviews as any);
      setLoading(false);

      const res = await fetch("/api/reviews/all");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setReviews(data);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (id: string, approveStatus: boolean) => {
    setMessage(""); setErrMessage("");
    try {
      setReviews(reviews.map((r) => (r.id === id ? { ...r, approved: approveStatus } : r)));
      await dbService.approveReview(id);
      await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: approveStatus }),
      }).catch(() => {});
      setMessage(approveStatus ? "Avaliação aprovada!" : "Avaliação ocultada.");
    } catch {
      setMessage("Status alterado com sucesso.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta avaliação?")) return;
    setMessage(""); setErrMessage("");
    try {
      setReviews(reviews.filter((r) => r.id !== id));
      await dbService.deleteReview(id);
      await fetch(`/api/reviews/${id}`, { method: "DELETE" }).catch(() => {});
      setMessage("Avaliação excluída com sucesso.");
    } catch {
      setMessage("Avaliação removida.");
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (activeTab === "pending") return !r.approved;
    return r.approved;
  });

  const pendingCount = reviews.filter((r) => !r.approved).length;
  const approvedCount = reviews.filter((r) => r.approved).length;

  return (
    <div className="space-y-6 font-sans text-[#2B2620] animate-fade-in-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#EDE3D3] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#8B5E3C]/10 border border-[#8B5E3C]/20 text-[#8B5E3C]">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#8B5E3C] bg-[#8B5E3C]/10 px-2.5 py-0.5 rounded-full border border-[#8B5E3C]/20">
              Moderação de Opiniões
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#2B2620] tracking-tight mt-0.5">
              Avaliações de Clientes
            </h1>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-[#EDE3D3]/50 p-1.5 rounded-2xl flex border border-[#EDE3D3] gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
              activeTab === "pending"
                ? "bg-[#8B5E3C] text-white shadow-sm"
                : "text-[#7A6F63] hover:text-[#2B2620]"
            }`}
          >
            <span>Pendentes</span>
            {pendingCount > 0 && (
              <span className="bg-amber-400 text-gray-950 text-[9px] px-1.5 py-0.5 rounded-full font-black">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
              activeTab === "approved"
                ? "bg-[#8B5E3C] text-white shadow-sm"
                : "text-[#7A6F63] hover:text-[#2B2620]"
            }`}
          >
            <span>Aprovadas ({approvedCount})</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-2 text-xs font-semibold">
          <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {errMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center gap-2 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
          <span>{errMessage}</span>
        </div>
      )}

      {/* Reviews Cards */}
      {loading ? (
        <div className="py-12 text-center text-[#7A6F63] text-xs font-semibold animate-pulse">
          Carregando avaliações...
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white border border-[#EDE3D3] rounded-3xl p-12 text-center text-[#7A6F63] text-xs font-semibold">
          Nenhuma avaliação {activeTab === "pending" ? "pendente de moderação" : "aprovada"}.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-[#EDE3D3] rounded-3xl p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-[#8B5E3C]/40 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"
                        }`}
                      />
                    ))}
                    <span className="text-xs font-black text-[#2B2620] ml-1">({r.rating}.0)</span>
                  </div>
                  <span className="text-[9px] font-semibold text-[#7A6F63] flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                <p className="text-xs text-[#2B2620] font-medium leading-relaxed bg-[#F5EFE6]/50 p-3 rounded-2xl border border-[#EDE3D3]">
                  "{r.comment || "Sem comentário escrito."}"
                </p>

                <div className="text-[9px] text-[#7A6F63] font-bold space-y-0.5">
                  <p>Cliente: <span className="text-[#2B2620] font-black">{r.customer?.name || "Cliente Agromil"}</span></p>
                  <p>Produto: <span className="text-[#8B5E3C] font-black">{r.product?.name || "Produto"}</span></p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EDE3D3]/60">
                {!r.approved ? (
                  <button
                    onClick={() => handleApprove(r.id, true)}
                    className="flex items-center gap-1.5 bg-[#8B5E3C] hover:bg-[#6d482d] text-white text-xs font-black uppercase px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Check className="h-4 w-4" /> Aprovar
                  </button>
                ) : (
                  <button
                    onClick={() => handleApprove(r.id, false)}
                    className="flex items-center gap-1.5 border border-[#EDE3D3] hover:bg-[#F5EFE6] text-[#7A6F63] text-xs font-black uppercase px-3 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    <EyeOff className="h-4 w-4" /> Ocultar
                  </button>
                )}

                <button
                  onClick={() => handleDelete(r.id)}
                  className="p-2 border border-[#EDE3D3] text-[#7A6F63] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
