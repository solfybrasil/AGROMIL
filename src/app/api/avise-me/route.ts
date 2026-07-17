import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export async function POST(req: NextRequest) {
  try {
    const { productId, email, phone } = await req.json();

    if (!productId || !email) {
      return NextResponse.json({ error: "productId e e-mail são obrigatórios." }, { status: 400 });
    }

    await dbService.createStockAlert(productId, email, phone);
    return NextResponse.json({ success: true, message: "Te avisaremos assim que o produto chegar!" });
  } catch (error: any) {
    console.error("POST /api/avise-me error:", error);
    return NextResponse.json({ error: "Erro ao cadastrar alerta de estoque." }, { status: 500 });
  }
}
