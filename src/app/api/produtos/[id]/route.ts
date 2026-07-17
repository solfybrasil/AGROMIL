import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const product = await dbService.getProductById(id);

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("GET /api/produtos/[id] error:", error);
    return NextResponse.json({ error: "Erro ao buscar produto." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await req.json();
    
    const updated = await dbService.updateProduct(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Produto não encontrado ou falha ao atualizar." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/produtos/[id] error:", error);
    return NextResponse.json({ error: error.message || "Erro ao atualizar produto." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    await dbService.deleteProduct(id);
    return NextResponse.json({ message: "Produto removido com sucesso." });
  } catch (error: any) {
    console.error("DELETE /api/produtos/[id] error:", error);
    return NextResponse.json({ error: error.message || "Erro ao excluir produto." }, { status: 500 });
  }
}
