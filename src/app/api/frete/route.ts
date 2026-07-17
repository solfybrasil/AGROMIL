import { NextRequest, NextResponse } from "next/server";

// ── Endereço da loja (origem) ──────────────────────────────────────────────
const STORE_CEP = "13310160"; // Av. Caetano Ruggieri, 2191 – Parque Res. Mayard, Itu/SP

// ── Frete grátis a partir de R$ ──────────────────────────────────────────
const FREE_SHIPPING_THRESHOLD = 0; // 🚚 Frete grátis temporário — altere para 150 quando quiser reativar

// ── Tabela de preço por faixa de distância ───────────────────────────────
// Distâncias em km (raio)
const DISTANCE_ZONES: Array<{ maxKm: number; label: string; fee: number; days: string }> = [
  { maxKm: 10,  label: "Itu – Entrega Local",        fee: 0,  days: "Hoje ou amanhã" },
  { maxKm: 30,  label: "Região de Itu",               fee: 10, days: "1 dia útil" },
  { maxKm: 80,  label: "Interior próximo de SP",      fee: 18, days: "2 dias úteis" },
  { maxKm: 200, label: "Interior de SP",              fee: 25, days: "2-3 dias úteis" },
  { maxKm: 500, label: "Grande SP e Estado de SP",    fee: 32, days: "3-4 dias úteis" },
];
const DEFAULT_ZONE = { label: "Todo o Brasil", fee: 45, days: "5-8 dias úteis" };

// ── Fórmula de Haversine (distância entre dois pontos geográficos) ────────
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // raio da Terra em km
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Geocoding via Nominatim (OpenStreetMap) – gratuito, sem API key ───────
async function geocodeCep(cep: string): Promise<{ lat: number; lon: number } | null> {
  try {
    // Nominatim aceita busca por CEP brasileiro
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${cep}&country=BR&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Agromil-Marketplace/1.0 (contact@agromilitu.com.br)" },
      next: { revalidate: 86400 }, // cache de 24h
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

// ── Cache em memória das coordenadas da loja ──────────────────────────────
let storeCoords: { lat: number; lon: number } | null = null;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cep = searchParams.get("cep")?.replace(/\D/g, "") || "";
  const subtotal = Number(searchParams.get("subtotal") || 0);

  if (!cep || cep.length !== 8) {
    return NextResponse.json({ error: "CEP inválido." }, { status: 400 });
  }

  try {
    // 1. Busca endereço do cliente via ViaCEP
    const viaCepRes = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      next: { revalidate: 3600 },
    });
    const viaCepData = await viaCepRes.json();

    if (viaCepData.erro) {
      return NextResponse.json({ error: "CEP não encontrado." }, { status: 404 });
    }

    // 2. Geocoding paralelo: loja + cliente
    if (!storeCoords) {
      storeCoords = await geocodeCep(STORE_CEP);
    }
    const clientCoords = await geocodeCep(cep);

    let zone = DEFAULT_ZONE;
    let distanceKm: number | null = null;

    if (storeCoords && clientCoords) {
      distanceKm = haversineKm(
        storeCoords.lat,
        storeCoords.lon,
        clientCoords.lat,
        clientCoords.lon
      );

      // Encontra a faixa correta de distância
      const matched = DISTANCE_ZONES.find((z) => distanceKm! <= z.maxKm);
      if (matched) zone = matched;
    } else {
      // Fallback: usa prefixo do CEP se geocoding falhar
      const FALLBACK_ZONES: Array<{ prefixes: string[]; label: string; fee: number; days: string }> = [
        { prefixes: ["1331"], label: "Itu – Entrega Local", fee: 0, days: "Hoje ou amanhã" },
        { prefixes: ["132"], label: "Região de Itu", fee: 10, days: "1 dia útil" },
        { prefixes: ["130", "131", "134"], label: "Interior próximo de SP", fee: 18, days: "2 dias úteis" },
        { prefixes: ["13", "14", "15", "16", "17", "18", "19"], label: "Interior de SP", fee: 25, days: "2-3 dias úteis" },
        { prefixes: ["01","02","03","04","05","06","07","08","09","10","11","12"], label: "Grande SP", fee: 32, days: "3-4 dias úteis" },
      ];
      const fallback = FALLBACK_ZONES.find((z) => z.prefixes.some((p) => cep.startsWith(p)));
      if (fallback) zone = fallback;
    }

    // 3. Aplica frete grátis acima do limite
    const finalFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : zone.fee;
    const isFree = finalFee === 0;

    return NextResponse.json({
      cep,
      address: {
        street: viaCepData.logradouro || "",
        neighborhood: viaCepData.bairro || "",
        city: viaCepData.localidade || "",
        state: viaCepData.uf || "",
      },
      zone: zone.label,
      fee: finalFee,
      originalFee: zone.fee,
      isFree,
      estimatedDays: zone.days,
      distanceKm: distanceKm !== null ? Math.round(distanceKm) : null,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      remainingForFree: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
      message: isFree
        ? `🎉 Frete grátis para ${viaCepData.localidade}!`
        : `Entrega para ${viaCepData.localidade} em ${zone.days}`,
    });
  } catch (err) {
    console.error("Frete API error:", err);
    return NextResponse.json({ error: "Erro ao calcular frete." }, { status: 500 });
  }
}
