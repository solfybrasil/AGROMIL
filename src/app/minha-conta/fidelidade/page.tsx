"use client";

import { useEffect, useState } from "react";
import { Award, CheckCircle, Lock, Trophy, Sparkles, Building2 } from "lucide-react";
import { useAccount } from "../layout";

export default function LoyaltyPage() {
  const { session: profile } = useAccount();
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetchLoyaltyData = async () => {
      try {
        const ordersRes = await fetch("/api/customer/orders");
        if (ordersRes.ok) {
          const orders = await ordersRes.json();
          setOrderCount(orders.length);
        }
      } catch (err) {
        console.error("Failed to load loyalty details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoyaltyData();
  }, [profile]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!profile) return null;

  const points = orderCount * 120;
  
  // Tier definition
  let tierName = "Bronze";
  let tierColor = "from-amber-600 to-amber-800";
  let nextTierName = "Prata";
  let nextTierPoints = 600;
  let progressPercentage = (points / 600) * 100;
  
  if (points >= 600 && points < 1800) {
    tierName = "Prata";
    tierColor = "from-slate-400 to-slate-600";
    nextTierName = "Ouro";
    nextTierPoints = 1800;
    progressPercentage = ((points - 600) / 1200) * 100;
  } else if (points >= 1800 && points < 3600) {
    tierName = "Ouro";
    tierColor = "from-amber-400 via-amber-500 to-yellow-600";
    nextTierName = "Diamante";
    nextTierPoints = 3600;
    progressPercentage = ((points - 1800) / 1800) * 100;
  } else if (points >= 3600) {
    tierName = "Diamante";
    tierColor = "from-cyan-400 via-blue-500 to-indigo-600";
    nextTierName = "Máximo";
    nextTierPoints = 3600;
    progressPercentage = 100;
  }

  const benefits = [
    {
      tier: "Bronze",
      points: "0 - 599 pts",
      items: [
        "Acúmulo de 120 pontos por pedido finalizado",
        "Acesso padrão ao catálogo de varejo",
        "Suporte ao cliente via WhatsApp comercial"
      ],
      unlocked: true
    },
    {
      tier: "Prata",
      points: "600 - 1799 pts",
      items: [
        "Cupom especial de R$ 15 no mês de aniversário",
        "Desconto extra de 2% em pagamentos via Pix",
        "Frete Grátis em compras acima de R$ 120"
      ],
      unlocked: points >= 600
    },
    {
      tier: "Ouro",
      points: "1800 - 3599 pts",
      items: [
        "Desconto permanente de 5% em todos os produtos da categoria Jardinagem",
        "Faturamento prioritário de pedidos na expedição",
        "Acesso antecipado a campanhas de cupons e saldões"
      ],
      unlocked: points >= 1800
    },
    {
      tier: "Diamante",
      points: "3600+ pts",
      items: [
        "Desconto permanente de 7% em qualquer produto da loja",
        "Frete grátis em todas as compras (sem valor mínimo)",
        "Atendimento personalizado por consultor técnico especialista"
      ],
      unlocked: points >= 3600
    }
  ];

  return (
    <div className="space-y-8 font-sans text-xs">
      
      {/* Page Header */}
      <div className="border-b border-gray-50 pb-4">
        <h1 className="font-serif text-2xl font-extrabold text-[#1b4332] flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Clube Fidelidade Agromil
        </h1>
        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Acumule pontos em suas compras e libere descontos e privilégios especiais.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* ── Column 1: Physical Tier Card (col-span-1) ── */}
        <div className="md:col-span-1 flex flex-col justify-between bg-gradient-to-br from-[#122e22] to-[#1b4332] rounded-3xl p-6 text-white min-h-[220px] shadow-lg relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-white/5 border border-white/10" />
          <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-white/5 border border-white/10" />

          {/* Header */}
          <div className="flex justify-between items-start z-10">
            <div className="space-y-1">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/50">Membro do Clube</span>
              <h4 className="font-serif text-lg font-black tracking-wide leading-none">{profile.name}</h4>
            </div>
            <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-gradient-to-r ${tierColor} border border-white/20`}>
              {tierName}
            </div>
          </div>

          {/* Points Display */}
          <div className="z-10 py-6">
            <span className="text-[8px] font-black uppercase tracking-widest text-white/40 block">Saldo de Pontos</span>
            <span className="text-3xl font-black tracking-tight">{points} <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">pts</span></span>
          </div>

          {/* Footer info */}
          <div className="flex justify-between items-center border-t border-white/10 pt-4 z-10">
            <div className="flex items-center gap-1.5 text-[8px] font-bold text-white/60">
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              <span>Agromil Fidelidade</span>
            </div>
            <span className="text-[8px] font-bold text-white/60 uppercase">Desde {new Date().getFullYear()}</span>
          </div>
        </div>

        {/* ── Column 2: Progress indicator (col-span-2) ── */}
        <div className="md:col-span-2 border border-gray-100 rounded-3xl p-6 shadow-3xs flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <h4 className="font-bold text-gray-800 text-sm">Seu Progresso de Categoria</h4>
            <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
              Cada pedido fechado no site gera **120 pontos**. Continue comprando para subir de nível e desbloquear benefícios exclusivos.
            </p>
          </div>

          {/* Progress bar */}
          {points < 3600 ? (
            <div className="space-y-2">
              <div className="flex justify-between font-bold text-gray-500 text-[10px]">
                <span>Nível Atual: **{tierName}**</span>
                <span>Próximo Nível: **{nextTierName}** (**{points}** / {nextTierPoints} pts)</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              <span className="block text-[9px] text-gray-400 font-semibold text-right">
                Faltam **{nextTierPoints - points} pontos** para atingir a categoria **{nextTierName}**.
              </span>
            </div>
          ) : (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
              <Trophy className="h-8 w-8 text-amber-500 flex-shrink-0" />
              <div>
                <span className="font-black text-emerald-800 block">Parabéns! Nível Máximo Atingido</span>
                <span className="text-[9px] text-emerald-600/70 font-semibold block mt-0.5">
                  Você está na categoria **Diamante** e tem acesso a todos os privilégios máximos de frete grátis e descontos!
                </span>
              </div>
            </div>
          )}

          {/* Account Partner promo info */}
          {profile.planType !== "PLANO" && (
            <div className="bg-primary/[0.02] border border-primary/5 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="font-bold text-gray-850 block">É de Grande Empresa ou Condomínio?</span>
                <span className="text-[9px] text-gray-450 font-semibold block leading-relaxed mt-0.5">
                  Assine o **Plano Corporativo** no menu de Perfil para receber descontos no atacado imediatamente, independente de pontos!
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── Benefits listing ── */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-2">Benefícios por Nível</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {benefits.map((benefit) => (
            <div
              key={benefit.tier}
              className={`border rounded-2xl p-4 space-y-4 shadow-3xs flex flex-col justify-between relative ${
                benefit.unlocked 
                  ? "bg-white border-gray-200" 
                  : "bg-gray-50/50 border-gray-100 opacity-60"
              }`}
            >
              {/* Unlock badge */}
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-black uppercase tracking-wider ${benefit.unlocked ? "text-primary" : "text-gray-400"}`}>
                  {benefit.tier}
                </span>
                {benefit.unlocked ? (
                  <CheckCircle className="h-4 w-4 text-primary" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-300" />
                )}
              </div>

              {/* Items */}
              <ul className="space-y-2 flex-1">
                {benefit.items.map((item, idx) => (
                  <li key={idx} className="text-[9px] text-gray-500 font-semibold leading-relaxed flex items-start gap-1.5">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Points range */}
              <div className="border-t border-gray-50 pt-2.5 text-center">
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">{benefit.points}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
