import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export async function GET() {
  try {
    const orders = await dbService.getOrders();
    const products = await dbService.getProducts();

    // 1. Calculate stats
    const activeOrders = orders.filter((o) => o.status !== "CANCELLED");
    const totalRevenue = activeOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const ordersCount = orders.length;
    const productsCount = products.length;
    
    // Low stock limit: 15 units or less
    const lowStockProducts = products.filter((p) => p.stock <= 15).map((p) => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      unit: p.unit,
    }));
    const lowStockCount = lowStockProducts.length;

    // 2. Format recent orders for dashboard (take top 5)
    const recentOrders = orders.slice(0, 5).map((o) => ({
      id: o.id,
      clientName: o.clientName,
      total: Number(o.total),
      status: o.status,
      createdAt: new Date(o.createdAt).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

    // 3. Calculate weekly sales trend (last 7 days faturamento)
    const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const last7Days: { day: string; dateStr: string; value: number }[] = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayLabel = daysOfWeek[d.getDay()];
      const dateKey = d.toDateString();
      last7Days.push({
        day: dayLabel,
        dateStr: dateKey,
        value: 0
      });
    }

    activeOrders.forEach((o) => {
      const orderDate = new Date(o.createdAt);
      const orderDateKey = orderDate.toDateString();
      const match = last7Days.find((day) => day.dateStr === orderDateKey);
      if (match) {
        match.value += Number(o.total);
      }
    });

    return NextResponse.json({
      stats: {
        totalRevenue,
        ordersCount,
        productsCount,
        lowStockCount,
      },
      recentOrders,
      lowStockProducts,
      salesTrend: last7Days.map((day) => ({
        day: day.day,
        value: day.value,
      })),
    });
  } catch (error) {
    console.error("GET /api/relatorios/dashboard error:", error);
    return NextResponse.json({ error: "Erro ao gerar estatísticas do dashboard." }, { status: 500 });
  }
}
