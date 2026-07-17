"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, AlertCircle, CheckCircle, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: {
    name: string;
  };
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  // Form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errMessage, setErrMessage] = useState("");

  const loadReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.warn("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkUserStatus = async () => {
    try {
      const meRes = await fetch("/api/customer/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.session) {
          setIsAuthenticated(true);
          const customerId = meData.session.id;

          // Check if already reviewed (among all approved/pending, for simplicity check from DB or filter client-side)
          // Wait, we can fetch all reviews for admin or just rely on API response code
          // Let's check orders
          const ordersRes = await fetch("/api/customer/orders");
          if (ordersRes.ok) {
            const orders = await ordersRes.json();
            const hasBought = orders.some((o: any) =>
              o.status === "DELIVERED" && o.items?.some((it: any) => it.productId === productId)
            );
            setCanReview(hasBought);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to check user status for reviews:", err);
    }
  };

  useEffect(() => {
    loadReviews();
    checkUserStatus();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setErrMessage("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Sua avaliação foi enviada com sucesso e está aguardando aprovação administrativa.");
        setComment("");
        setRating(5);
        setHasReviewed(true);
        // Refresh check
        loadReviews();
      } else {
        setErrMessage(data.error || "Erro ao enviar avaliação.");
      }
    } catch {
      setErrMessage("Erro ao conectar com o servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  // Calc summary metrics
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
    : 0;

  // Star bars
  const ratingDistribution = [0, 0, 0, 0, 0]; // 1 to 5 star counts
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      ratingDistribution[r.rating - 1]++;
    }
  });

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-8 select-none">
      <div className="border-b border-gray-50 pb-4">
        <h2 className="font-serif text-xl font-extrabold text-[#1b4332] flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Avaliações dos Clientes
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Summary Column */}
          <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 flex flex-col items-center text-center space-y-3">
            <h3 className="text-3xl font-black text-primary leading-none">{avgRating || "0.0"}</h3>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(avgRating)
                      ? "text-[#e2b13c] fill-[#e2b13c]"
                      : "text-gray-200 fill-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {totalReviews} {totalReviews === 1 ? "avaliação" : "avaliações"}
            </p>

            {/* Progress Bars */}
            <div className="w-full space-y-1.5 pt-2 text-[10px] font-semibold text-gray-500">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingDistribution[stars - 1];
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="w-3 text-right">{stars}</span>
                    <Star className="h-3 w-3 text-gray-300 fill-gray-300 flex-shrink-0" />
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="bg-[#e2b13c] h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-left text-gray-400 font-bold">{Math.round(pct)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* List & Form Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Form to submit review */}
            {isAuthenticated && canReview && !hasReviewed && (
              <form onSubmit={handleSubmit} className="border border-primary/20 bg-primary-light/10 p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-wider">Avaliar este Produto</h4>

                {message && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-2 rounded-xl">
                    <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>{message}</span>
                  </div>
                )}
                {errMessage && (
                  <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold px-3 py-2 rounded-xl">
                    <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                    <span>{errMessage}</span>
                  </div>
                )}

                {/* Stars selector */}
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Nota</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="hover:scale-110 active:scale-95 transition-all"
                      >
                        <Star
                          className={`h-6 w-6 cursor-pointer ${
                            star <= rating
                              ? "text-[#e2b13c] fill-[#e2b13c]"
                              : "text-gray-200 hover:text-[#e2b13c]/60"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment textarea */}
                <div>
                  <label htmlFor="comment" className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    Comentário (opcional)
                  </label>
                  <textarea
                    id="comment"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Conte sua experiência com este produto..."
                    className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-primary font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary hover:bg-primary-dark text-white text-[10px] font-black uppercase tracking-wider py-2 px-4 rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  {submitting ? "Enviando..." : "Enviar Avaliação"}
                </button>
              </form>
            )}

            {isAuthenticated && !canReview && (
              <div className="bg-amber-50/50 border border-amber-200 text-amber-800 text-[10px] font-bold p-3 rounded-xl flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <span>Apenas clientes que compraram e receberam este produto podem avaliá-lo.</span>
              </div>
            )}

            {!isAuthenticated && (
              <div className="bg-gray-50 border border-gray-200 text-gray-500 text-[10px] font-bold p-3 rounded-xl flex items-center justify-between gap-2">
                <span>Deseja avaliar o produto? Faça login com sua conta.</span>
                <Link href={`/login?redirect=/produto/${productId}`} className="text-primary hover:underline font-black">
                  Fazer Login
                </Link>
              </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-4 font-semibold italic">
                Nenhuma avaliação aprovada para este produto ainda.
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="border-b border-gray-50 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-black text-gray-800 leading-tight">
                          {r.customer?.name || "Cliente"}
                        </p>
                        <div className="flex items-center gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= r.rating
                                  ? "text-[#e2b13c] fill-[#e2b13c]"
                                  : "text-gray-155 fill-gray-155"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-[9px] text-gray-300 font-bold">
                        {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    {r.comment && (
                      <p className="text-xs font-semibold text-gray-600 mt-2 italic leading-relaxed">
                        "{r.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
