import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export async function GET() {
  try {
    const coupons = await dbService.getCoupons();
    return NextResponse.json(coupons);
  } catch (error: any) {
    console.error("GET /api/cupom error:", error);
    return NextResponse.json({ error: "Erro ao buscar cupons." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Distinguish between validation request and creation request
    const isValidation = body.subtotal !== undefined && body.value === undefined;

    if (isValidation) {
      const { code, subtotal } = body;

      if (!code) {
        return NextResponse.json({ valid: false, message: "Código do cupom é obrigatório." }, { status: 400 });
      }

      const coupon = await dbService.getCouponByCode(code);

      if (!coupon) {
        return NextResponse.json({ valid: false, message: "Cupom não encontrado." });
      }

      if (!coupon.active) {
        return NextResponse.json({ valid: false, message: "Este cupom não está mais ativo." });
      }

      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return NextResponse.json({ valid: false, message: "Este cupom expirou." });
      }

      if (coupon.maxUses !== null && coupon.maxUses !== undefined && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json({ valid: false, message: "Limite de usos do cupom esgotado." });
      }

      if (subtotal < coupon.minOrder) {
        return NextResponse.json({
          valid: false,
          message: `Este cupom exige compra mínima de R$ ${coupon.minOrder.toFixed(2).replace(".", ",")}.`
        });
      }

      return NextResponse.json({
        valid: true,
        type: coupon.type,
        value: coupon.value,
        minOrder: coupon.minOrder,
        message: "Cupom aplicado com sucesso!"
      });
    } else {
      // Creation request
      const { code, type, value, minOrder, maxUses, expiresAt, active } = body;

      if (!code || !type || value === undefined) {
        return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 });
      }

      // Check if coupon with this code already exists
      const existing = await dbService.getCouponByCode(code);
      if (existing) {
        return NextResponse.json({ error: "Já existe um cupom com este código." }, { status: 400 });
      }

      const newCoupon = await dbService.createCoupon({
        code: code.toUpperCase(),
        type,
        value: Number(value),
        minOrder: Number(minOrder || 0),
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt || null,
        active: active !== false
      });

      return NextResponse.json(newCoupon, { status: 201 });
    }
  } catch (error: any) {
    console.error("POST /api/cupom error:", error);
    return NextResponse.json({ error: "Erro no servidor." }, { status: 500 });
  }
}
