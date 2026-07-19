"use client";

import { useEffect, useState } from "react";
import { MapPin, Loader, CheckCircle, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

interface CustomerSession {
  id: string;
  name: string;
  email: string;
  phone: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function AddressesPage() {
  const [profile, setProfile] = useState<CustomerSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Address form states
  const [zipCode, setZipCode] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("Itu");
  const [state, setState] = useState("SP");

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/customer/me");
        if (res.ok) {
          const data = await res.json();
          if (data.session) {
            setProfile(data.session);
            setZipCode(data.session.zipCode);
            setStreet(data.session.street);
            setNumber(data.session.number);
            setComplement(data.session.complement || "");
            setNeighborhood(data.session.neighborhood);
            setCity(data.session.city || "Itu");
            setState(data.session.state || "SP");
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

  const handleZipCodeChange = async (cep: string) => {
    const cleaned = cep.replace(/\D/g, "");
    setZipCode(cleaned);

    if (cleaned.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
        if (res.ok) {
          const data = await res.json();
          if (!data.erro) {
            setStreet(data.logradouro || "");
            setNeighborhood(data.bairro || "");
            setCity(data.localidade || "Itu");
            setState(data.uf || "SP");
            setErrorMsg("");
          } else {
            setErrorMsg("CEP não encontrado.");
          }
        }
      } catch (err) {
        console.warn("Failed to lookup CEP:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    setSaving(true);

    if (!zipCode || !street || !number || !neighborhood) {
      setErrorMsg("Por favor, preencha todos os campos obrigatórios (*).");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/customer/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile?.name,
          phone: profile?.phone,
          street,
          number,
          complement: complement || null,
          neighborhood,
          city,
          state,
          zipCode,
        }),
      });

      if (res.ok) {
        setSuccessMsg("Endereço atualizado com sucesso!");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "Erro ao salvar endereço.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Falha de conexão com o servidor.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-xs">
      
      {/* Page Header */}
      <div className="border-b border-gray-50 pb-4">
        <h1 className="font-serif text-2xl font-extrabold text-[#1b4332] flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Endereço de Entrega
        </h1>
        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Gerencie seu local de entrega padrão estilo iFood.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Address Details form (col-span-2) */}
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-4">
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-2">
            Editar Local de Entrega
          </h3>

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3.5 rounded-xl flex items-center gap-2 font-bold text-[10px]">
              <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 border border-red-100 text-red-800 p-3.5 rounded-xl flex items-center gap-2 font-bold text-[10px]">
              <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">CEP *</label>
              <input
                type="text"
                required
                maxLength={9}
                value={zipCode}
                onChange={(e) => handleZipCodeChange(e.target.value)}
                placeholder="13300-000"
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-gray-800"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rua / Logradouro *</label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Nome do logradouro"
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-gray-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Número *</label>
              <input
                type="text"
                required
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Ex: 120"
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-gray-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Complemento</label>
              <input
                type="text"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                placeholder="Ex: Apto 2, Bloco C"
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bairro *</label>
            <input
              type="text"
              required
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Ex: Centro"
              className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-gray-800"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Cidade</label>
              <input
                type="text"
                disabled
                value={city}
                className="w-full bg-gray-50 border border-gray-150 rounded-xl py-2 px-3 text-xs text-gray-500 font-semibold cursor-not-allowed"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Estado</label>
              <input
                type="text"
                disabled
                value={state}
                className="w-full bg-gray-50 border border-gray-150 rounded-xl py-2 px-3 text-xs text-gray-500 font-semibold cursor-not-allowed text-center"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-[#122e22] text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer uppercase tracking-wider"
            >
              {saving ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Salvando Endereço...</span>
                </>
              ) : (
                <span>Salvar Endereço de Entrega</span>
              )}
            </button>
          </div>
        </form>

        {/* Right Side: Map/Visual representation */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-2">
            Visualização
          </h3>

          <div className="border border-gray-100 bg-[#fafaf9] rounded-2xl p-5 text-center flex flex-col justify-center items-center py-10 space-y-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-gray-800">Seu Local de Entrega</h5>
              <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
                {street ? `${street}, nº ${number || "S/N"}` : "Preencha seu endereço ao lado."} <br />
                {neighborhood} - {city} / {state}
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
