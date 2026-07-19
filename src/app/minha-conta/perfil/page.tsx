"use client";

import { useEffect, useState } from "react";
import { User, Phone, Mail, ShieldAlert, Sparkles, Building2, Key, Loader, CheckCircle, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

interface CustomerSession {
  id: string;
  name: string;
  email: string;
  phone: string;
  planType: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<CustomerSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [planType, setPlanType] = useState("COMUM");
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/customer/me");
        if (res.ok) {
          const data = await res.json();
          if (data.session) {
            setProfile(data.session);
            setName(data.session.name);
            setPhone(data.session.phone);
            setPlanType(data.session.planType || "COMUM");
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handlePhoneChange = (val: string) => {
    let cleaned = val.replace(/\D/g, "");
    if (cleaned.length > 11) cleaned = cleaned.substring(0, 11);
    
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
    }
    if (cleaned.length > 7) {
      formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    }
    setPhone(formatted);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");
    setSavingProfile(true);

    try {
      const res = await fetch("/api/customer/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, planType }),
      });

      if (res.ok) {
        setProfileSuccess("Perfil atualizado com sucesso!");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setProfileError(data.error || "Erro ao atualizar perfil.");
      }
    } catch (err) {
      console.error(err);
      setProfileError("Falha de conexão com o servidor.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setSavingPassword(true);

    try {
      const res = await fetch("/api/customer/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, password: newPassword }),
      });

      if (res.ok) {
        setPasswordSuccess("Senha alterada com sucesso!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json().catch(() => ({}));
        setPasswordError(data.error || "Erro ao alterar senha.");
      }
    } catch (err) {
      console.error(err);
      setPasswordError("Falha de conexão com o servidor.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-8 font-sans text-xs">
      
      {/* Page Header */}
      <div className="border-b border-gray-50 pb-4">
        <h1 className="font-serif text-2xl font-extrabold text-[#1b4332] flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Meu Perfil
        </h1>
        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Mantenha seus dados atualizados para entregas e cobranças.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Column 1: General Info */}
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-1.5">
            Dados do Perfil
          </h3>

          {profileSuccess && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3.5 rounded-xl flex items-center gap-2 font-bold text-[10px]">
              <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="bg-red-50 border border-red-100 text-red-800 p-3.5 rounded-xl flex items-center gap-2 font-bold text-[10px]">
              <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nome Completo / Razão Social</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 pl-9 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">E-mail (Não editável)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full bg-gray-50 border border-gray-150 rounded-xl py-2 px-3 pl-9 text-xs text-gray-500 font-semibold cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">WhatsApp / Telefone</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Phone className="h-4 w-4" />
              </span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 pl-9 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-gray-800"
              />
            </div>
          </div>

          {/* Account Category selection card */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Categoria do Plano</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPlanType("COMUM")}
                className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 ${
                  planType === "COMUM" 
                    ? "bg-primary/5 border-primary shadow-3xs" 
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <Sparkles className={`h-4 w-4 ${planType === "COMUM" ? "text-primary" : "text-gray-400"}`} />
                <span className="font-black uppercase text-[9px] text-gray-800">Comum / Varejo</span>
              </button>
              <button
                type="button"
                onClick={() => setPlanType("PLANO")}
                className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 ${
                  planType === "PLANO" 
                    ? "bg-emerald-50 border-emerald-500 shadow-3xs" 
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <Building2 className={`h-4 w-4 ${planType === "PLANO" ? "text-emerald-600" : "text-gray-400"}`} />
                <span className="font-black uppercase text-[9px] text-emerald-800">Plano Corporativo</span>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-[#122e22] text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer uppercase tracking-wider"
            >
              {savingProfile ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Salvando Perfil...</span>
                </>
              ) : (
                <span>Salvar Alterações</span>
              )}
            </button>
          </div>
        </form>

        {/* Column 2: Password Reset */}
        <form onSubmit={handlePasswordSubmit} className="space-y-4 bg-gray-50/50 border border-gray-100 rounded-3xl p-5 shadow-3xs">
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-1.5">
            <Key className="h-4.5 w-4.5 text-primary" />
            Alterar Senha
          </h3>

          {passwordSuccess && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3.5 rounded-xl flex items-center gap-2 font-bold text-[10px]">
              <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="bg-red-50 border border-red-100 text-red-800 p-3.5 rounded-xl flex items-center gap-2 font-bold text-[10px]">
              <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nova Senha</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="No mínimo 6 caracteres"
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 pl-9 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Confirmar Nova Senha</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 pl-9 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-gray-800"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-gray-700 hover:bg-gray-850 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer uppercase tracking-wider"
            >
              {savingPassword ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Alterando Senha...</span>
                </>
              ) : (
                <span>Confirmar Nova Senha</span>
              )}
            </button>
          </div>
        </form>

      </div>

    </div>
  );
}
