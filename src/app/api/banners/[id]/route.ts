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

    const updated = await dbService.updateBanner(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Banner não encontrado." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/banners/[id] error:", error);
    return NextResponse.json({ error: error.message || "Erro ao atualizar banner." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    await dbService.deleteBanner(id);
    return NextResponse.json({ message: "Banner excluído com sucesso." });
  } catch (error: any) {
    console.error("DELETE /api/banners/[id] error:", error);
    return NextResponse.json({ error: error.message || "Erro ao excluir banner." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const banners = await dbService.getBanners();
    return NextResponse.json(banners);
  } catch (error: any) {
    console.error("GET /api/banners/[id] error:", error);
    return NextResponse.json({ error: "Erro ao buscar todos os banners." }, { status: 500 });
  }
}
