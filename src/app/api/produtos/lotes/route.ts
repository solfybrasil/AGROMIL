import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

// GET /api/produtos/lotes?productId=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId") || undefined;
    const lots = await dbService.getLots(productId);
    return NextResponse.json(lots);
  } catch (error: any) {
    console.error("GET /api/produtos/lotes error:", error);
    return NextResponse.json({ error: error.message || "Erro ao buscar lotes." }, { status: 500 });
  }
}

// POST /api/produtos/lotes
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.productId) {
      return NextResponse.json({ error: "productId é obrigatório." }, { status: 400 });
    }
    if (!body.lotNumber) {
      return NextResponse.json({ error: "Número do lote é obrigatório." }, { status: 400 });
    }
    const lot = await dbService.createLot(body);
    return NextResponse.json(lot, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/produtos/lotes error:", error);
    return NextResponse.json({ error: error.message || "Erro ao criar lote." }, { status: 500 });
  }
}
