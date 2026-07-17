import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const order = await dbService.getOrderById(id);

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error(`GET /api/pedidos/[id] error:`, error);
    return NextResponse.json({ error: "Erro ao buscar detalhes do pedido." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status é obrigatório." }, { status: 400 });
    }

    const updated = await dbService.updateOrderStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: "Pedido não encontrado ou falha ao atualizar." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error(`PUT /api/pedidos/[id] error:`, error);
    return NextResponse.json({ error: "Erro ao atualizar status do pedido." }, { status: 500 });
  }
}
