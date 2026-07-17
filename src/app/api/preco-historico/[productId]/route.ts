import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const productId = resolvedParams.productId;

    if (!productId) {
      return NextResponse.json({ error: "productId é obrigatório." }, { status: 400 });
    }

    // 1. Fetch records from DB
    let history = await dbService.getPriceHistory(productId);

    // 2. Generate deterministic mock data if empty (so sparkline works instantly for all products)
    if (!history || history.length === 0) {
      const product = await dbService.getProductById(productId);
      if (!product) {
        return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
      }

      const currentPrice = product.promoPrice ?? product.price;
      const generated = [];
      const now = new Date();

      // Generate 30 daily price points with small fluctuations
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        
        // Deterministic variation using index and product ID length
        const sineVal = Math.sin(i * 0.4 + productId.length);
        const variation = currentPrice * (sineVal * 0.06); // Max 6% variation
        const priceRecord = Math.max(1.0, Number((currentPrice + variation).toFixed(2)));

        generated.push({
          id: `gen-hist-${i}-${productId}`,
          productId,
          price: priceRecord,
          promoPrice: null,
          recordedAt: date.toISOString(),
        });
      }

      // Add current price as the last record to match exactly
      generated[generated.length - 1].price = Number(currentPrice);

      history = generated;
    }

    return NextResponse.json(history);
  } catch (error: any) {
    console.error("GET /api/preco-historico/[productId] error:", error);
    return NextResponse.json({ error: "Erro ao buscar histórico de preços." }, { status: 500 });
  }
}
