import prisma from "./prisma";
import { supabase } from "./supabase";
import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_ORDERS } from "./mocks";

// Helper to determine if we can query Prisma directly (TCP/IP connection string is set and not a placeholder)
const hasPrismaUrl = !!(
  typeof process !== "undefined" &&
  process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes("localhost:51213") &&
  !process.env.DATABASE_URL.includes("[SUA-SENHA]") &&
  !process.env.DATABASE_URL.includes("[YOUR-PASSWORD]")
);

// Fallback runtime mock order store for active sessions
let sessionOrders = [...MOCK_ORDERS];
let sessionProducts = [...MOCK_PRODUCTS];
let sessionCategories = [...MOCK_CATEGORIES];
let sessionCustomers: any[] = [];
let sessionCoupons: any[] = [
  { id: "coupon-welcome", code: "WELCOME10", type: "percent", value: 10, minOrder: 0, maxUses: 100, usedCount: 0, active: true },
  { id: "coupon-fixed", code: "AGRO20", type: "fixed", value: 20, minOrder: 100, maxUses: 50, usedCount: 0, active: true },
];
let sessionReviews: any[] = [];
let sessionFavorites: any[] = [];
let sessionBanners: any[] = [
  { id: "banner-1", title: "Frete Grátis acima de R$ 150", subtitle: "Para todo o interior de Itu", linkUrl: "/", linkLabel: "Comprar Agora", bgColor: "#1b4332", textColor: "#ffffff", active: true, displayOrder: 1 },
  { id: "banner-2", title: "Ração Golden com 15% OFF", subtitle: "Válido até o fim do estoque", linkUrl: "/categoria/petshop", linkLabel: "Ver Ofertas", bgColor: "#92400e", textColor: "#ffffff", active: true, displayOrder: 2 },
  { id: "banner-3", title: "Novos Produtos de Irrigação", subtitle: "Gotejadores e mangueiras", linkUrl: "/categoria/irrigacao", linkLabel: "Conferir", bgColor: "#1e3a5f", textColor: "#ffffff", active: true, displayOrder: 3 }
];
let sessionStockAlerts: any[] = [];
let sessionPriceHistory: any[] = [];
let sessionSubscriptions: any[] = [];

async function executeQuery<T>(
  prismaFn: () => Promise<T>,
  supabaseFn: () => Promise<T>,
  mockValue: T
): Promise<T> {
  // 1. Try Prisma first
  if (hasPrismaUrl) {
    try {
      return await prismaFn();
    } catch (err) {
      console.warn("Prisma query failed. Trying Supabase REST API instead...", err);
    }
  }

  // 2. Try Supabase REST Client
  if (supabase) {
    try {
      return await supabaseFn();
    } catch (err) {
      console.warn("Supabase REST API failed. Falling back to local mock data...", err);
    }
  }

  // 3. Fallback to Local Mock
  return mockValue;
}

async function ensureDefaultCategories() {
  if (hasPrismaUrl) {
    try {
      const count = await prisma.category.count();
      if (count === 0) {
        await prisma.category.createMany({
          data: [
            { id: "cat-jardinagem", name: "Jardinagem & Vasos", slug: "jardinagem", displayOrder: 1 },
            { id: "cat-petshop", name: "Rações & Acessórios Pet", slug: "petshop", displayOrder: 2 },
            { id: "cat-agropecuaria", name: "Agropecuária Geral", slug: "agropecuaria", displayOrder: 3 },
            { id: "cat-ferramentas", name: "Ferramentas & Equipamentos", slug: "ferramentas", displayOrder: 4 },
            { id: "cat-irrigacao", name: "Irrigação", slug: "irrigacao", displayOrder: 5 },
            { id: "cat-vestuario-epi", name: "Vestuário & EPI", slug: "vestuario-epi", displayOrder: 6 }
          ]
        });
      }
    } catch (err) {
      console.warn("Failed to ensure categories via Prisma:", err);
    }
  }
  if (supabase) {
    try {
      const { data, error } = await supabase.from("Category").select("id");
      if (!error && (!data || data.length === 0)) {
        await supabase.from("Category").insert([
          { id: "cat-jardinagem", name: "Jardinagem & Vasos", slug: "jardinagem", displayOrder: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "cat-petshop", name: "Rações & Acessórios Pet", slug: "petshop", displayOrder: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "cat-agropecuaria", name: "Agropecuária Geral", slug: "agropecuaria", displayOrder: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "cat-ferramentas", name: "Ferramentas & Equipamentos", slug: "ferramentas", displayOrder: 4, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "cat-irrigacao", name: "Irrigação", slug: "irrigacao", displayOrder: 5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "cat-vestuario-epi", name: "Vestuário & EPI", slug: "vestuario-epi", displayOrder: 6, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ]);
      }
    } catch (err) {
      console.warn("Failed to ensure categories via Supabase REST:", err);
    }
  }
}

// Normaliza campos numéricos de pedidos vindos do Supabase REST
function normalizeOrders(rows: any[]): any[] {
  return rows.map((o: any) => ({
    ...o,
    subtotal: Number(o.subtotal),
    deliveryFee: Number(o.deliveryFee),
    total: Number(o.total),
    items: (o.items || []).map((item: any) => ({
      ...item,
      price: Number(item.price),
      product: item.product ? {
        ...item.product,
        price: Number(item.product.price),
        promoPrice: item.product.promoPrice ? Number(item.product.promoPrice) : null,
      } : null,
    })),
  }));
}

export const dbService = {
  // ==========================================
  // CATEGORIES
  // ==========================================
  async getCategories() {
    await ensureDefaultCategories();
    return executeQuery(
      async () => {
        return await prisma.category.findMany({
          orderBy: { displayOrder: "asc" },
        });
      },
      async () => {
        const { data, error } = await supabase!
          .from("Category")
          .select("*")
          .order("displayOrder", { ascending: true });
        if (error) throw error;
        return data;
      },
      sessionCategories
    );
  },

  // ==========================================
  // PRODUCTS
  // ==========================================
  async getProducts(options?: { categoryId?: string; featured?: boolean; search?: string; includeInactive?: boolean }) {
    await ensureDefaultCategories();
    return executeQuery(
      async () => {
        const where: any = {};
        if (!options?.includeInactive) where.active = true;
        if (options?.categoryId) where.categoryId = options.categoryId;
        if (options?.featured) where.featured = options.featured;
        if (options?.search) {
          where.OR = [
            { name: { contains: options.search, mode: "insensitive" } },
            { description: { contains: options.search, mode: "insensitive" } },
          ];
        }
        const data = await prisma.product.findMany({
          where,
          orderBy: { name: "asc" },
        });
        return data.map((p) => ({
          ...p,
          price: Number(p.price),
          promoPrice: p.promoPrice ? Number(p.promoPrice) : null,
        }));
      },
      async () => {
        let query = supabase!.from("Product").select("*");
        if (!options?.includeInactive) query = query.eq("active", true);
        if (options?.categoryId) query = query.eq("categoryId", options.categoryId);
        if (options?.featured) query = query.eq("featured", options.featured);
        if (options?.search) {
          query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
        }
        const { data, error } = await query.order("name", { ascending: true });
        if (error) throw error;
        return data.map((p: any) => ({
          ...p,
          price: Number(p.price),
          promoPrice: p.promoPrice ? Number(p.promoPrice) : null,
        }));
      },
      // Local Mock Filter
      sessionProducts.filter((p) => {
        if (!options?.includeInactive && !p.active) return false;
        if (options?.categoryId && p.categoryId !== options.categoryId) return false;
        if (options?.featured && !p.featured) return false;
        if (options?.search) {
          const s = options.search.toLowerCase();
          return p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s);
        }
        return true;
      })
    );
  },

  async getProductById(id: string) {
    return executeQuery(
      async () => {
        const p = await prisma.product.findUnique({
          where: { id },
          include: { category: true },
        });
        if (!p) return null;
        return {
          ...p,
          price: Number(p.price),
          promoPrice: p.promoPrice ? Number(p.promoPrice) : null,
          categoryName: p.category?.name || "Geral",
        };
      },
      async () => {
        const { data, error } = await supabase!
          .from("Product")
          .select("*, category:Category(*)")
          .eq("id", id)
          .single();
        if (error) throw error;
        return {
          ...data,
          price: Number(data.price),
          promoPrice: data.promoPrice ? Number(data.promoPrice) : null,
          categoryName: data.category?.name || "Geral",
        };
      },
      (() => {
        const p = sessionProducts.find((prod) => prod.id === id);
        if (!p) return null;
        const cat = sessionCategories.find((c) => c.id === p.categoryId);
        return { ...p, categoryName: cat?.name || "Geral" };
      })()
    );
  },

  // ==========================================
  // ORDERS
  // ==========================================
  async getOrders() {
    return executeQuery(
      async () => {
        const data = await prisma.order.findMany({
          orderBy: { createdAt: "desc" },
          include: { items: { include: { product: true } } },
        });
        return data.map((o) => ({
          ...o,
          subtotal: Number(o.subtotal),
          deliveryFee: Number(o.deliveryFee),
          total: Number(o.total),
          items: o.items.map((item) => ({
            ...item,
            price: Number(item.price),
            product: item.product ? {
              ...item.product,
              price: Number(item.product.price),
              promoPrice: item.product.promoPrice ? Number(item.product.promoPrice) : null,
            } : null,
          })),
        }));
      },
      async () => {
        const { data, error } = await supabase!
          .from("Order")
          .select("*, items:OrderItem(*, product:Product(*))")
          .order("createdAt", { ascending: false });
        if (error) throw error;
        return data.map((o: any) => ({
          ...o,
          subtotal: Number(o.subtotal),
          deliveryFee: Number(o.deliveryFee),
          total: Number(o.total),
          items: o.items.map((item: any) => ({
            ...item,
            price: Number(item.price),
            product: item.product ? {
              ...item.product,
              price: Number(item.product.price),
              promoPrice: item.product.promoPrice ? Number(item.product.promoPrice) : null,
            } : null,
          })),
        }));
      },
      sessionOrders
    );
  },

  async getOrderById(id: string) {
    return executeQuery(
      async () => {
        const o = await prisma.order.findUnique({
          where: { id },
          include: { items: { include: { product: true } } },
        });
        if (!o) return null;
        return {
          ...o,
          subtotal: Number(o.subtotal),
          deliveryFee: Number(o.deliveryFee),
          total: Number(o.total),
          items: o.items.map((item) => ({
            ...item,
            price: Number(item.price),
            product: item.product ? {
              ...item.product,
              price: Number(item.product.price),
              promoPrice: item.product.promoPrice ? Number(item.product.promoPrice) : null,
            } : null,
          })),
        };
      },
      async () => {
        const { data, error } = await supabase!
          .from("Order")
          .select("*, items:OrderItem(*, product:Product(*))")
          .eq("id", id)
          .single();
        if (error) throw error;
        if (!data) return null;
        return {
          ...data,
          subtotal: Number(data.subtotal),
          deliveryFee: Number(data.deliveryFee),
          total: Number(data.total),
          items: data.items.map((item: any) => ({
            ...item,
            price: Number(item.price),
            product: item.product ? {
              ...item.product,
              price: Number(item.product.price),
              promoPrice: item.product.promoPrice ? Number(item.product.promoPrice) : null,
            } : null,
          })),
        };
      },
      sessionOrders.find((o) => o.id === id) || null
    );
  },

  async createOrder(orderData: any, items: Array<{ productId: string; quantity: number; price: number; productName?: string }>) {
    // Strip internal fields that are not columns in Order table
    const { items: _items, ...cleanOrderData } = orderData as any;

    // Build the order payload - only include customerId if it has a value
    const now = new Date().toISOString();
    const baseOrder: any = {
      clientName: cleanOrderData.clientName,
      clientPhone: cleanOrderData.clientPhone,
      clientEmail: cleanOrderData.clientEmail || null,
      street: cleanOrderData.street,
      number: cleanOrderData.number,
      complement: cleanOrderData.complement || null,
      neighborhood: cleanOrderData.neighborhood,
      city: cleanOrderData.city || "Itu",
      state: cleanOrderData.state || "SP",
      zipCode: cleanOrderData.zipCode,
      paymentMethod: cleanOrderData.paymentMethod,
      subtotal: Number(cleanOrderData.subtotal),
      deliveryFee: Number(cleanOrderData.deliveryFee || 0),
      total: Number(cleanOrderData.total),
      notes: cleanOrderData.notes || null,
      status: "NEW",
      createdAt: now,
      updatedAt: now,
    };

    // Only attach customerId if it's a real value (not null/undefined/empty)
    if (cleanOrderData.customerId) {
      baseOrder.customerId = cleanOrderData.customerId;
    }

    const formattedOrder = {
      ...baseOrder,
      id: cleanOrderData.id || `PED-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
    };

    if (hasPrismaUrl) {
      const newOrder = await prisma.order.create({
        data: {
          ...formattedOrder,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: Number(item.price),
              productName: item.productName || null,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });
      return newOrder;
    }

    if (supabase) {
      console.log("[createOrder] Inserting into Order table:", JSON.stringify(formattedOrder));
      const { data: order, error: orderErr } = await supabase!
        .from("Order")
        .insert([formattedOrder])
        .select()
        .single();
      if (orderErr) {
        console.error("[createOrder] Supabase Order insert error:", orderErr);
        throw new Error(`Supabase Order error: ${orderErr.message} (code: ${orderErr.code})`);
      }

      const orderItems = items.map((item) => ({
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.price),
        productName: item.productName || null,
      }));

      console.log("[createOrder] Inserting OrderItems:", orderItems.length, "items");
      const { data: insertedItems, error: itemsErr } = await supabase!.from("OrderItem").insert(orderItems).select();
      if (itemsErr) {
        console.error("[createOrder] Supabase OrderItem insert error:", itemsErr);
        throw new Error(`Supabase OrderItem error: ${itemsErr.message} (code: ${itemsErr.code})`);
      }

      return { ...order, items: insertedItems || orderItems };
    }

    // Mock local session storage
    const newMockOrder: any = {
      ...formattedOrder,
      createdAt: new Date().toISOString(),
      items: items.map((item, index) => {
        const prod = sessionProducts.find((p) => p.id === item.productId);
        return {
          id: `item-mock-${index}-${Date.now()}`,
          orderId: formattedOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          product: prod,
        };
      }),
    };
    sessionOrders = [newMockOrder, ...sessionOrders];
    return newMockOrder;
  },

  async updateOrderStatus(orderId: string, status: string) {
    if (hasPrismaUrl) {
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: { status: status as any },
      });
      return updated;
    }
    if (supabase) {
      const { data, error } = await supabase!
        .from("Order")
        .update({ status, updatedAt: new Date().toISOString() })
        .eq("id", orderId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    const index = sessionOrders.findIndex((o) => o.id === orderId);
    if (index > -1) {
      sessionOrders[index] = { ...sessionOrders[index], status: status as any };
      return sessionOrders[index];
    }
    return null;
  },

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  async getAdminUser(email: string) {
    return executeQuery(
      async () => {
        return await prisma.adminUser.findUnique({
          where: { email, active: true },
        });
      },
      async () => {
        const { data, error } = await supabase!
          .from("AdminUser")
          .select("*")
          .eq("email", email)
          .eq("active", true)
          .single();
        if (error) throw error;
        return data;
      },
      // Local Mock fallback for "admin@agromil.com.br"
      email.toLowerCase() === "admin@agromil.com.br"
        ? {
            id: "mock-admin-id",
            name: "Administrador Agromil",
            email: "admin@agromil.com.br",
            // password for "Agromil2026!"
            password: "$2b$10$FRMg.Rng46iEzgKsulFFq./Tao4pXm/d5rWPsODX.OnU9J9ZAU8Ri",
            role: "admin",
            active: true,
          }
        : null
    );
  },

  // ==========================================
  // PRODUCTS CRUD
  // ==========================================
  async createProduct(productData: any) {
    await ensureDefaultCategories();
    const id = productData.id || `m-${Date.now()}`;
    const defaultImages = productData.categoryId === "petshop"
      ? ["https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&auto=format&fit=crop&q=60"]
      : productData.categoryId === "jardinagem"
      ? ["https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&auto=format&fit=crop&q=60"]
      : ["https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&auto=format&fit=crop&q=60"];

    const formatted = {
      ...productData,
      id,
      images: productData.images || defaultImages,
      description: productData.description || productData.name,
      price: Number(productData.price),
      promoPrice: productData.promoPrice ? Number(productData.promoPrice) : null,
      stock: Number(productData.stock || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (hasPrismaUrl) {
      return await prisma.product.create({ data: formatted });
    }
    if (supabase) {
      const { data, error } = await supabase!.from("Product").insert([formatted]).select().single();
      if (error) throw error;
      return data;
    }
    sessionProducts.push(formatted as any);
    return formatted;
  },

  async updateProduct(id: string, productData: any) {
    await ensureDefaultCategories();
    const formatted: any = { ...productData };
    if (productData.price !== undefined) formatted.price = Number(productData.price);
    if (productData.promoPrice !== undefined) formatted.promoPrice = productData.promoPrice ? Number(productData.promoPrice) : null;
    if (productData.stock !== undefined) formatted.stock = Number(productData.stock);
    formatted.updatedAt = new Date().toISOString();

    if (hasPrismaUrl) {
      return await prisma.product.update({ where: { id }, data: formatted });
    }
    if (supabase) {
      const { data, error } = await supabase!.from("Product").update(formatted).eq("id", id).select().single();
      if (error) throw error;
      return data;
    }
    const idx = sessionProducts.findIndex((p) => p.id === id);
    if (idx > -1) {
      sessionProducts[idx] = { ...sessionProducts[idx], ...formatted } as any;
      return sessionProducts[idx];
    }
    return null;
  },

  async deleteProduct(id: string) {
    if (hasPrismaUrl) {
      await prisma.product.delete({ where: { id } });
      return true;
    }
    if (supabase) {
      const { error } = await supabase!.from("Product").delete().eq("id", id);
      if (error) throw error;
      return true;
    }
    sessionProducts = sessionProducts.filter((p) => p.id !== id);
    return true;
  },

  // ==========================================
  // CATEGORIES CRUD
  // ==========================================
  async createCategory(categoryData: any) {
    const id = categoryData.id || `m-cat-${Date.now()}`;
    const formatted = {
      ...categoryData,
      id,
      displayOrder: Number(categoryData.displayOrder || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (hasPrismaUrl) {
      return await prisma.category.create({ data: formatted });
    }
    if (supabase) {
      const { data, error } = await supabase!.from("Category").insert([formatted]).select().single();
      if (error) throw error;
      return data;
    }
    sessionCategories.push(formatted as any);
    return formatted;
  },

  async updateCategory(id: string, categoryData: any) {
    const formatted = {
      ...categoryData,
      displayOrder: Number(categoryData.displayOrder || 0),
      updatedAt: new Date().toISOString(),
    };

    if (hasPrismaUrl) {
      return await prisma.category.update({ where: { id }, data: formatted });
    }
    if (supabase) {
      const { data, error } = await supabase!.from("Category").update(formatted).eq("id", id).select().single();
      if (error) throw error;
      return data;
    }
    const idx = sessionCategories.findIndex((c) => c.id === id);
    if (idx > -1) {
      sessionCategories[idx] = { ...sessionCategories[idx], ...formatted } as any;
      return sessionCategories[idx];
    }
    return null;
  },

  async deleteCategory(id: string) {
    if (hasPrismaUrl) {
      await prisma.category.delete({ where: { id } });
      return true;
    }
    if (supabase) {
      const { error } = await supabase!.from("Category").delete().eq("id", id);
      if (error) throw error;
      return true;
    }
    sessionCategories = sessionCategories.filter((c) => c.id !== id);
    return true;
  },

  // ==========================================
  // CUSTOMER CRUD & AUTH
  // ==========================================
  async createCustomer(customerData: any) {
    const id = customerData.id || `cust-${Date.now()}`;
    const formatted = {
      ...customerData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (hasPrismaUrl) {
      return await prisma.customer.create({ data: formatted });
    }
    if (supabase) {
      const { data, error } = await supabase!.from("Customer").insert([formatted]).select().single();
      if (error) throw error;
      return data;
    }
    sessionCustomers.push(formatted);
    return formatted;
  },

  async getCustomerByEmail(email: string) {
    return executeQuery(
      async () => {
        return await prisma.customer.findUnique({ where: { email } });
      },
      async () => {
        const { data, error } = await supabase!
          .from("Customer")
          .select("*")
          .eq("email", email)
          .maybeSingle();
        if (error) throw error;
        return data;
      },
      sessionCustomers.find((c) => c.email.toLowerCase() === email.toLowerCase()) || null
    );
  },

  async getCustomerById(id: string) {
    return executeQuery(
      async () => {
        return await prisma.customer.findUnique({ where: { id } });
      },
      async () => {
        const { data, error } = await supabase!
          .from("Customer")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (error) throw error;
        return data;
      },
      sessionCustomers.find((c) => c.id === id) || null
    );
  },

  async getCustomerOrders(customerId: string) {
    // ── Prisma path ─────────────────────────────────────────────
    if (hasPrismaUrl) {
      try {
        const rows = await prisma.order.findMany({
          where: { customerId },
          include: { items: { include: { product: true } } },
          orderBy: { createdAt: "desc" },
        });
        return rows.map((o) => ({
          ...o,
          subtotal: Number(o.subtotal),
          deliveryFee: Number(o.deliveryFee),
          total: Number(o.total),
          items: o.items.map((item) => ({ ...item, price: Number(item.price) })),
        }));
      } catch (err) {
        console.warn("Prisma getCustomerOrders failed:", err);
      }
    }

    // ── Supabase path ────────────────────────────────────────────
    if (supabase) {
      try {
        // 1ª tentativa: buscar pelo customerId
        const { data: byId, error: errById } = await supabase!
          .from("Order")
          .select("*, items:OrderItem(*, product:Product(*))")
          .eq("customerId", customerId)
          .order("createdAt", { ascending: false });

        if (!errById && byId && byId.length > 0) {
          return normalizeOrders(byId);
        }

        // 2ª tentativa: buscar pelo e-mail (compatibilidade retroativa)
        const customer = await dbService.getCustomerById(customerId);
        if (customer?.email) {
          const { data: byEmail, error: errByEmail } = await supabase!
            .from("Order")
            .select("*, items:OrderItem(*, product:Product(*))")
            .eq("clientEmail", customer.email)
            .order("createdAt", { ascending: false });

          if (!errByEmail && byEmail && byEmail.length > 0) {
            // Vincula retroativamente pedidos sem customerId
            const unlinked = byEmail.filter((o: any) => !o.customerId);
            if (unlinked.length > 0) {
              await supabase!
                .from("Order")
                .update({ customerId, updatedAt: new Date().toISOString() })
                .in("id", unlinked.map((o: any) => o.id));
            }
            return normalizeOrders(byEmail);
          }
        }

        return [];
      } catch (err) {
        console.warn("Supabase getCustomerOrders failed:", err);
        return [];
      }
    }

    // ── Local mock fallback ───────────────────────────────────────
    return sessionOrders.filter((o: any) => o.customerId === customerId);
  },

  // ==========================================
  // COUPONS CRUD
  // ==========================================
  async getCouponByCode(code: string) {
    const upperCode = code.toUpperCase();
    return executeQuery(
      async () => {
        const coupon = await (prisma as any).coupon.findFirst({
          where: { code: { equals: upperCode, mode: 'insensitive' } }
        });
        return coupon ? { ...coupon, value: Number(coupon.value), minOrder: Number(coupon.minOrder) } : null;
      },
      async () => {
        const { data, error } = await supabase!
          .from("Coupon")
          .select("*")
          .eq("code", upperCode)
          .maybeSingle();
        if (error) throw error;
        return data ? { ...data, value: Number(data.value), minOrder: Number(data.minOrder) } : null;
      },
      sessionCoupons.find((c) => c.code.toUpperCase() === upperCode) || null
    );
  },

  async getCoupons() {
    return executeQuery(
      async () => {
        const coupons = await (prisma as any).coupon.findMany({ orderBy: { createdAt: 'desc' } });
        return coupons.map((c: any) => ({ ...c, value: Number(c.value), minOrder: Number(c.minOrder) }));
      },
      async () => {
        const { data, error } = await supabase!.from("Coupon").select("*").order("createdAt", { ascending: false });
        if (error) throw error;
        return (data || []).map((c: any) => ({ ...c, value: Number(c.value), minOrder: Number(c.minOrder) }));
      },
      sessionCoupons
    );
  },

  async createCoupon(couponData: any) {
    const id = couponData.id || `coupon-${Date.now()}`;
    const now = new Date().toISOString();
    const formatted = {
      ...couponData,
      id,
      code: couponData.code.toUpperCase(),
      value: Number(couponData.value),
      minOrder: Number(couponData.minOrder || 0),
      usedCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    if (hasPrismaUrl) {
      const c = await (prisma as any).coupon.create({ data: formatted });
      return { ...c, value: Number(c.value), minOrder: Number(c.minOrder) };
    }
    if (supabase) {
      const { data, error } = await supabase!.from("Coupon").insert([formatted]).select().single();
      if (error) throw error;
      return { ...data, value: Number(data.value), minOrder: Number(data.minOrder) };
    }
    sessionCoupons.push(formatted);
    return formatted;
  },

  async updateCoupon(id: string, couponData: any) {
    const now = new Date().toISOString();
    const formatted: any = { ...couponData, updatedAt: now };
    if (couponData.value !== undefined) formatted.value = Number(couponData.value);
    if (couponData.minOrder !== undefined) formatted.minOrder = Number(couponData.minOrder);
    if (couponData.code !== undefined) formatted.code = couponData.code.toUpperCase();

    if (hasPrismaUrl) {
      const c = await (prisma as any).coupon.update({ where: { id }, data: formatted });
      return { ...c, value: Number(c.value), minOrder: Number(c.minOrder) };
    }
    if (supabase) {
      const { data, error } = await supabase!.from("Coupon").update(formatted).eq("id", id).select().single();
      if (error) throw error;
      return { ...data, value: Number(data.value), minOrder: Number(data.minOrder) };
    }
    const idx = sessionCoupons.findIndex((c) => c.id === id);
    if (idx > -1) {
      sessionCoupons[idx] = { ...sessionCoupons[idx], ...formatted };
      return sessionCoupons[idx];
    }
    return null;
  },

  async deleteCoupon(id: string) {
    if (hasPrismaUrl) {
      await (prisma as any).coupon.delete({ where: { id } });
      return true;
    }
    if (supabase) {
      const { error } = await supabase!.from("Coupon").delete().eq("id", id);
      if (error) throw error;
      return true;
    }
    sessionCoupons = sessionCoupons.filter((c) => c.id !== id);
    return true;
  },

  async incrementCouponUses(code: string) {
    const upperCode = code.toUpperCase();
    if (hasPrismaUrl) {
      try {
        await (prisma as any).coupon.updateMany({
          where: { code: upperCode },
          data: { usedCount: { increment: 1 } }
        });
      } catch (err) {
        console.warn("Failed to increment coupon uses via Prisma:", err);
      }
    }
    if (supabase) {
      try {
        const coupon = await this.getCouponByCode(upperCode);
        if (coupon) {
          await supabase!.from("Coupon")
            .update({ usedCount: (coupon.usedCount || 0) + 1, updatedAt: new Date().toISOString() })
            .eq("id", coupon.id);
        }
      } catch (err) {
        console.warn("Failed to increment coupon uses via Supabase:", err);
      }
    }
    const c = sessionCoupons.find((c) => c.code.toUpperCase() === upperCode);
    if (c) c.usedCount += 1;
  },

  // ==========================================
  // REVIEWS CRUD
  // ==========================================
  async getProductReviews(productId: string) {
    return executeQuery(
      async () => {
        return await (prisma as any).review.findMany({
          where: { productId, approved: true },
          include: { customer: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        });
      },
      async () => {
        const { data, error } = await supabase!
          .from("Review")
          .select("*, customer:Customer(name)")
          .eq("productId", productId)
          .eq("approved", true)
          .order("createdAt", { ascending: false });
        if (error) throw error;
        return (data || []).map((r: any) => ({
          ...r,
          customer: { name: r.customer?.name || "Cliente" }
        }));
      },
      sessionReviews.filter((r) => r.productId === productId && r.approved)
    );
  },

  async getAdminReviews() {
    return executeQuery(
      async () => {
        return await (prisma as any).review.findMany({
          include: { customer: { select: { name: true } }, product: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        });
      },
      async () => {
        const { data, error } = await supabase!
          .from("Review")
          .select("*, customer:Customer(name), product:Product(name)")
          .order("createdAt", { ascending: false });
        if (error) throw error;
        return (data || []).map((r: any) => ({
          ...r,
          customer: { name: r.customer?.name || "Cliente" },
          product: { name: r.product?.name || "Produto" }
        }));
      },
      sessionReviews
    );
  },

  async createReview(reviewData: any) {
    const id = reviewData.id || `review-${Date.now()}`;
    const now = new Date().toISOString();
    const formatted = {
      ...reviewData,
      id,
      approved: false,
      createdAt: now,
    };
    if (hasPrismaUrl) {
      return await (prisma as any).review.create({ data: formatted });
    }
    if (supabase) {
      const { data, error } = await supabase!.from("Review").insert([formatted]).select().single();
      if (error) throw error;
      return data;
    }
    sessionReviews.push(formatted);
    return formatted;
  },

  async updateReview(id: string, approved: boolean) {
    if (hasPrismaUrl) {
      return await (prisma as any).review.update({ where: { id }, data: { approved } });
    }
    if (supabase) {
      const { data, error } = await supabase!.from("Review").update({ approved }).eq("id", id).select().single();
      if (error) throw error;
      return data;
    }
    const idx = sessionReviews.findIndex((r) => r.id === id);
    if (idx > -1) {
      sessionReviews[idx].approved = approved;
      return sessionReviews[idx];
    }
    return null;
  },

  async deleteReview(id: string) {
    if (hasPrismaUrl) {
      await (prisma as any).review.delete({ where: { id } });
      return true;
    }
    if (supabase) {
      const { error } = await supabase!.from("Review").delete().eq("id", id);
      if (error) throw error;
      return true;
    }
    sessionReviews = sessionReviews.filter((r) => r.id !== id);
    return true;
  },

  // ==========================================
  // BANNERS CRUD
  // ==========================================
  async getActiveBanners() {
    return executeQuery(
      async () => {
        return await (prisma as any).banner.findMany({
          where: { active: true },
          orderBy: { displayOrder: 'asc' }
        });
      },
      async () => {
        const { data, error } = await supabase!
          .from("Banner")
          .select("*")
          .eq("active", true)
          .order("displayOrder", { ascending: true });
        if (error) throw error;
        return data || [];
      },
      sessionBanners.filter((b) => b.active)
    );
  },

  async getBanners() {
    return executeQuery(
      async () => {
        return await (prisma as any).banner.findMany({ orderBy: { displayOrder: 'asc' } });
      },
      async () => {
        const { data, error } = await supabase!.from("Banner").select("*").order("displayOrder", { ascending: true });
        if (error) throw error;
        return data || [];
      },
      sessionBanners
    );
  },

  async createBanner(bannerData: any) {
    const id = bannerData.id || `banner-${Date.now()}`;
    const now = new Date().toISOString();
    const formatted = {
      ...bannerData,
      id,
      displayOrder: Number(bannerData.displayOrder || 0),
      createdAt: now,
      updatedAt: now,
    };
    if (hasPrismaUrl) {
      return await (prisma as any).banner.create({ data: formatted });
    }
    if (supabase) {
      const { data, error } = await supabase!.from("Banner").insert([formatted]).select().single();
      if (error) throw error;
      return data;
    }
    sessionBanners.push(formatted);
    return formatted;
  },

  async updateBanner(id: string, bannerData: any) {
    const now = new Date().toISOString();
    const formatted = { ...bannerData, updatedAt: now };
    if (bannerData.displayOrder !== undefined) formatted.displayOrder = Number(bannerData.displayOrder);

    if (hasPrismaUrl) {
      return await (prisma as any).banner.update({ where: { id }, data: formatted });
    }
    if (supabase) {
      const { data, error } = await supabase!.from("Banner").update(formatted).eq("id", id).select().single();
      if (error) throw error;
      return data;
    }
    const idx = sessionBanners.findIndex((b) => b.id === id);
    if (idx > -1) {
      sessionBanners[idx] = { ...sessionBanners[idx], ...formatted };
      return sessionBanners[idx];
    }
    return null;
  },

  async deleteBanner(id: string) {
    if (hasPrismaUrl) {
      await (prisma as any).banner.delete({ where: { id } });
      return true;
    }
    if (supabase) {
      const { error } = await supabase!.from("Banner").delete().eq("id", id);
      if (error) throw error;
      return true;
    }
    sessionBanners = sessionBanners.filter((b) => b.id !== id);
    return true;
  },

  // ==========================================
  // FAVORITES
  // ==========================================
  async getCustomerFavorites(customerId: string) {
    return executeQuery(
      async () => {
        const favs = await (prisma as any).favorite.findMany({
          where: { customerId },
          include: { product: true }
        });
        return favs.map((f: any) => ({
          ...f.product,
          price: Number(f.product.price),
          promoPrice: f.product.promoPrice ? Number(f.product.promoPrice) : null,
        }));
      },
      async () => {
        const { data, error } = await supabase!
          .from("Favorite")
          .select("*, product:Product(*)")
          .eq("customerId", customerId);
        if (error) throw error;
        return (data || []).map((f: any) => ({
          ...f.product,
          price: Number(f.product.price),
          promoPrice: f.product.promoPrice ? Number(f.product.promoPrice) : null,
        }));
      },
      sessionFavorites.filter((f) => f.customerId === customerId).map((f) => {
        const p = sessionProducts.find((p) => p.id === f.productId);
        return p ? { ...p, price: Number(p.price), promoPrice: p.promoPrice ? Number(p.promoPrice) : null } : null;
      }).filter(Boolean)
    );
  },

  async addFavorite(customerId: string, productId: string) {
    const id = `fav-${Date.now()}`;
    const formatted = { id, customerId, productId, createdAt: new Date().toISOString() };
    if (hasPrismaUrl) {
      await (prisma as any).favorite.create({ data: formatted });
      return true;
    }
    if (supabase) {
      const { error } = await supabase!.from("Favorite").insert([formatted]);
      if (error && error.code !== '23505') throw error;
      return true;
    }
    if (!sessionFavorites.some((f) => f.customerId === customerId && f.productId === productId)) {
      sessionFavorites.push(formatted);
    }
    return true;
  },

  async removeFavorite(customerId: string, productId: string) {
    if (hasPrismaUrl) {
      await (prisma as any).favorite.deleteMany({ where: { customerId, productId } });
      return true;
    }
    if (supabase) {
      const { error } = await supabase!.from("Favorite").delete().eq("customerId", customerId).eq("productId", productId);
      if (error) throw error;
      return true;
    }
    sessionFavorites = sessionFavorites.filter((f) => !(f.customerId === customerId && f.productId === productId));
    return true;
  },

  async checkFavorites(customerId: string, productIds: string[]) {
    if (hasPrismaUrl) {
      const favs = await (prisma as any).favorite.findMany({
        where: { customerId, productId: { in: productIds } },
        select: { productId: true }
      });
      return favs.map((f: any) => f.productId);
    }
    if (supabase) {
      const { data, error } = await supabase!
        .from("Favorite")
        .select("productId")
        .eq("customerId", customerId)
        .in("productId", productIds);
      if (error) throw error;
      return (data || []).map((f: any) => f.productId);
    }
    return sessionFavorites
      .filter((f) => f.customerId === customerId && productIds.includes(f.productId))
      .map((f) => f.productId);
  },

  // ==========================================
  // STOCK ALERTS ("Avise-me")
  // ==========================================
  async createStockAlert(productId: string, email: string, phone?: string) {
    const id = `alert-${Date.now()}`;
    const formatted = {
      id,
      productId,
      email: email.toLowerCase(),
      phone: phone || null,
      notified: false,
      createdAt: new Date().toISOString(),
    };
    if (hasPrismaUrl) {
      await (prisma as any).stockAlert.create({ data: formatted });
      return true;
    }
    if (supabase) {
      const { error } = await supabase!.from("StockAlert").insert([formatted]);
      if (error && error.code !== '23505') throw error;
      return true;
    }
    if (!sessionStockAlerts.some((s) => s.productId === productId && s.email.toLowerCase() === email.toLowerCase())) {
      sessionStockAlerts.push(formatted);
    }
    return true;
  },

  // ==========================================
  // PRICE HISTORY
  // ==========================================
  async getPriceHistory(productId: string) {
    return executeQuery(
      async () => {
        const history = await (prisma as any).priceHistory.findMany({
          where: { productId },
          orderBy: { recordedAt: 'asc' },
          take: 30
        });
        return history.map((h: any) => ({ ...h, price: Number(h.price), promoPrice: h.promoPrice ? Number(h.promoPrice) : null }));
      },
      async () => {
        const { data, error } = await supabase!
          .from("PriceHistory")
          .select("*")
          .eq("productId", productId)
          .order("recordedAt", { ascending: true })
          .limit(30);
        if (error) throw error;
        return (data || []).map((h: any) => ({ ...h, price: Number(h.price), promoPrice: h.promoPrice ? Number(h.promoPrice) : null }));
      },
      sessionPriceHistory.filter((h) => h.productId === productId)
    );
  },

  async addPriceHistoryRecord(productId: string, price: number, promoPrice?: number | null) {
    const id = `hist-${Date.now()}`;
    const formatted = {
      id,
      productId,
      price: Number(price),
      promoPrice: promoPrice ? Number(promoPrice) : null,
      recordedAt: new Date().toISOString()
    };
    if (hasPrismaUrl) {
      await (prisma as any).priceHistory.create({ data: formatted });
      return true;
    }
    if (supabase) {
      await supabase!.from("PriceHistory").insert([formatted]);
      return true;
    }
    sessionPriceHistory.push(formatted);
    return true;
  },

  async updateAdminUserId(oldId: string, newId: string) {
    if (hasPrismaUrl) {
      await prisma.adminUser.update({
        where: { id: oldId },
        data: { id: newId }
      });
      return;
    }
    if (supabase) {
      const { error } = await supabase.from("AdminUser").update({ id: newId }).eq("id", oldId);
      if (error) throw error;
    }
  },
};
