import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await req.json();

    const updated = await dbService.updateCoupon(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Cupom não encontrado." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/cupom/[id] error:", error);
    return NextResponse.json({ error: error.message || "Erro ao atualizar cupom." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    await dbService.deleteCoupon(id);
    return NextResponse.json({ message: "Cupom excluído com sucesso." });
  } catch (error: any) {
    console.error("DELETE /api/cupom/[id] error:", error);
    return NextResponse.json({ error: error.message || "Erro ao excluir cupom." }, { status: 500 });
  }
}
