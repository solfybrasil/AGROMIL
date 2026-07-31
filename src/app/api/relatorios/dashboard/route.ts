import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export async function GET() {
  try {
    const [orders, products, lots] = await Promise.all([
      dbService.getOrders(),
      dbService.getProducts({ includeInactive: true }),
      dbService.getLots().catch(() => []),
    ]);

    // ── Pedidos ──────────────────────────────────────────────────────────────
    const activeOrders = orders.filter((o: any) => o.status !== "CANCELLED");
    const totalRevenue = activeOrders.reduce((sum: number, o: any) => sum + Number(o.total), 0);
    const ordersCount = orders.length;
    const productsCount = products.filter((p: any) => p.active).length;

    // ── Estoque Crítico ───────────────────────────────────────────────────────
    const lowStockProducts = products
      .filter((p: any) => {
        const minStock = p.minStock ?? 5;
        return p.stock <= minStock;
      })
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        unit: p.unit,
        minStock: p.minStock ?? 5,
        costPrice: Number(p.costPrice ?? 0),
        price: Number(p.price),
      }));
    const lowStockCount = lowStockProducts.length;

    // ── Métricas Financeiras de Estoque ────────────────────────────────────
    // totalInvested = soma de (costPrice × stock) para todos os produtos
    const totalInvested = products.reduce((sum: number, p: any) => {
      return sum + (Number(p.costPrice ?? 0) * Number(p.stock ?? 0));
    }, 0);

    // stockValue = soma de (price × stock) para todos os produtos ativos
    const stockValue = products.reduce((sum: number, p: any) => {
      const sellPrice = Number(p.promoPrice ?? 0) > 0 ? Number(p.promoPrice) : Number(p.price);
      return sum + (sellPrice * Number(p.stock ?? 0));
    }, 0);

    // ── Lucro Bruto das Vendas ────────────────────────────────────────────
    // Para cada pedido, calcular o custo dos itens vendidos
    let totalCostOfGoodsSold = 0;
    activeOrders.forEach((order: any) => {
      const items = order.items || [];
      items.forEach((item: any) => {
        const costPrice = Number(item.product?.costPrice ?? 0);
        totalCostOfGoodsSold += costPrice * Number(item.quantity ?? 1);
      });
    });
    const grossProfit = totalRevenue - totalCostOfGoodsSold;
    const grossMarginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // Lucro líquido estimado (bruto - 15% de despesas operacionais fixas estimadas)
    const estimatedExpensesPct = 0.15;
    const netProfit = grossProfit - totalRevenue * estimatedExpensesPct;

    // ── Lucro Potencial do Estoque ────────────────────────────────────────
    const potentialProfit = stockValue - totalInvested;

    // ── Margem Média por Produto ───────────────────────────────────────────
    const productsWithMargin = products
      .filter((p: any) => p.active && Number(p.costPrice ?? 0) > 0)
      .map((p: any) => {
        const sellPrice = Number(p.promoPrice ?? 0) > 0 ? Number(p.promoPrice) : Number(p.price);
        const cost = Number(p.costPrice);
        const margin = sellPrice > 0 ? ((sellPrice - cost) / sellPrice) * 100 : 0;
        const profit = sellPrice - cost;
        return {
          id: p.id,
          name: p.name,
          price: sellPrice,
          costPrice: cost,
          profit,
          margin: Math.round(margin * 10) / 10,
          stock: p.stock,
          category: p.categoryId,
        };
      })
      .sort((a: any, b: any) => b.profit - a.profit)
      .slice(0, 5);

    // ── Lotes ─────────────────────────────────────────────────────────────
    const lotsFormatted = lots.slice(0, 10).map((l: any) => {
      const productSellPrice = Number(l.product?.price ?? 0);
      const lotCostTotal = Number(l.costPrice) * Number(l.quantity);
      const lotSellValue = productSellPrice * Number(l.quantity);
      const lotProfit = lotSellValue - lotCostTotal;
      return {
        id: l.id,
        lotNumber: l.lotNumber,
        productName: l.product?.name ?? "—",
        quantity: l.quantity,
        costPrice: l.costPrice,
        supplier: l.supplier,
        purchaseDate: l.purchaseDate,
        totalCost: lotCostTotal,
        totalSellValue: lotSellValue,
        profit: lotProfit,
      };
    });

    // ── Tendência de Vendas (últimos 7 dias) ───────────────────────────────
    const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const last7Days: { day: string; dateStr: string; value: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      last7Days.push({ day: daysOfWeek[d.getDay()], dateStr: d.toDateString(), value: 0 });
    }
    activeOrders.forEach((o: any) => {
      const orderDateKey = new Date(o.createdAt).toDateString();
      const match = last7Days.find((day) => day.dateStr === orderDateKey);
      if (match) match.value += Number(o.total);
    });

    // ── Pedidos Recentes ───────────────────────────────────────────────────
    const recentOrders = orders.slice(0, 5).map((o: any) => ({
      id: o.id,
      clientName: o.clientName,
      total: Number(o.total),
      status: o.status,
      createdAt: new Date(o.createdAt).toLocaleString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      }),
    }));

    return NextResponse.json({
      stats: {
        totalRevenue,
        ordersCount,
        productsCount,
        lowStockCount,
        totalInvested,
        stockValue,
        grossProfit,
        grossMarginPct: Math.round(grossMarginPct * 10) / 10,
        netProfit,
        potentialProfit,
      },
      recentOrders,
      lowStockProducts,
      salesTrend: last7Days.map((d) => ({ day: d.day, value: d.value })),
      lots: lotsFormatted,
      topProducts: productsWithMargin,
    });
  } catch (error) {
    console.error("GET /api/relatorios/dashboard error:", error);
    return NextResponse.json({ error: "Erro ao gerar estatísticas do dashboard." }, { status: 500 });
  }
}
