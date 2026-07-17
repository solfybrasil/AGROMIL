"use client";

import { useState } from "react";
import { Bell, Check, Loader, AlertCircle } from "lucide-react";

interface AviseMeProps {
  productId: string;
}

export default function AviseMe({ productId }: AviseMeProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/avise-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, email, phone }),
      });

      if (res.ok) {
        setSuccess(true);
        setEmail("");
        setPhone("");
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao registrar alerta.");
      }
    } catch {
      setError("Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-150 rounded-2xl p-5 space-y-3.5 select-none">
      <div className="flex items-start gap-2.5">
        <Bell className="h-4.5 w-4.5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider">Produto Indisponível</h4>
          <p className="text-[10px] text-gray-450 font-semibold leading-relaxed mt-0.5">
            Avise-me quando este item estiver disponível em estoque.
          </p>
        </div>
      </div>

      {success ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold p-3 rounded-xl flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>Alerta registrado! Te avisaremos por e-mail assim que o estoque chegar.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-250 text-rose-800 text-[10px] font-bold px-3 py-2 rounded-xl">
              <AlertCircle className="h-3.5 w-3.5 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail *"
              className="bg-white border border-gray-250 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-primary font-semibold"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="WhatsApp (opcional)"
              className="bg-white border border-gray-250 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-primary font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-[#1b4332] hover:bg-[#0c1f16] text-white text-[10px] font-black uppercase py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Bell className="h-3.5 w-3.5" />}
            <span>Me avise quando chegar</span>
          </button>
        </form>
      )}
    </div>
  );
}
