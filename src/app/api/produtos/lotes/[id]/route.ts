import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/produtos/lotes/[id]
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await dbService.updateLot(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Lote não encontrado." }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/produtos/lotes/[id] error:", error);
    return NextResponse.json({ error: error.message || "Erro ao atualizar lote." }, { status: 500 });
  }
}

// DELETE /api/produtos/lotes/[id]
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await dbService.deleteLot(id);
    return NextResponse.json({ message: "Lote removido com sucesso." });
  } catch (error: any) {
    console.error("DELETE /api/produtos/lotes/[id] error:", error);
    return NextResponse.json({ error: error.message || "Erro ao excluir lote." }, { status: 500 });
  }
}
