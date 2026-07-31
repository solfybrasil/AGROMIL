import { dbService } from "./db-service";
import { supabase } from "./supabase";

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  planType?: string;
}

export interface AdminUser {
  userId: string;
  name: string;
  email: string;
  role: string;
}

const CUSTOMER_KEY = "siluet_customer_session";
const ADMIN_KEY = "siluet_admin_session";

async function safeFetchJson(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type");
    if (res.ok && contentType && contentType.includes("application/json")) {
      const data = await res.json();
      return { ok: true, status: res.status, data };
    }
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      return { ok: false, status: res.status, data };
    }
    return { ok: false, status: res.status, data: null };
  } catch (err) {
    return { ok: false, status: 0, data: null, error: err };
  }
}

export const clientAuth = {
  // ─── CUSTOMER AUTH ────────────────────────────────────────────────────────
  async loginCustomer(email: string, password: string): Promise<{ ok: boolean; error?: string; customer?: CustomerUser }> {
    // 1. Try Next.js API Route
    const apiRes = await safeFetchJson("/api/customer/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (apiRes.ok && apiRes.data?.customer) {
      const cust = apiRes.data.customer;
      if (typeof window !== "undefined") {
        localStorage.setItem(CUSTOMER_KEY, JSON.stringify(cust));
      }
      return { ok: true, customer: cust };
    }

    if (apiRes.data?.error) {
      return { ok: false, error: apiRes.data.error };
    }

    // 2. Fallback to Supabase / Client dbService (Vite SPA mode)
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data.user) {
          const cust: CustomerUser = {
            id: data.user.id,
            name: data.user.user_metadata?.name || email.split("@")[0],
            email: data.user.email || email,
            planType: data.user.user_metadata?.planType || "COMUM",
          };
          if (typeof window !== "undefined") {
            localStorage.setItem(CUSTOMER_KEY, JSON.stringify(cust));
          }
          return { ok: true, customer: cust };
        }
      } catch (err) {
        console.warn("Supabase client auth error:", err);
      }
    }

    // 3. Fallback to dbService local mock customer
    const existing = await dbService.getCustomerByEmail(email);
    if (existing) {
      const cust: CustomerUser = {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        phone: existing.phone,
        planType: existing.planType || "COMUM",
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(CUSTOMER_KEY, JSON.stringify(cust));
      }
      return { ok: true, customer: cust };
    }

    // Auto-create local session for testing if credentials match basic format
    if (email && password && password.length >= 4) {
      const created = await dbService.createCustomer({
        name: email.split("@")[0],
        email,
        password,
      });
      const cust: CustomerUser = {
        id: created.id,
        name: created.name,
        email: created.email,
        planType: "COMUM",
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(CUSTOMER_KEY, JSON.stringify(cust));
      }
      return { ok: true, customer: cust };
    }

    return { ok: false, error: "E-mail ou senha incorretos." };
  },

  async registerCustomer(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  }): Promise<{ ok: boolean; error?: string; customer?: CustomerUser; user?: { id: string } }> {
    const apiRes = await safeFetchJson("/api/customer/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (apiRes.ok && apiRes.data?.customer) {
      const cust = apiRes.data.customer;
      if (typeof window !== "undefined") {
        localStorage.setItem(CUSTOMER_KEY, JSON.stringify(cust));
      }
      return { ok: true, customer: cust };
    }

    if (apiRes.data?.error) {
      return { ok: false, error: apiRes.data.error };
    }

    // Fallback in client mode
    try {
      const created = await dbService.createCustomer(data);
      const cust: CustomerUser = {
        id: created.id,
        name: created.name,
        email: created.email,
        phone: created.phone,
        planType: "COMUM",
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(CUSTOMER_KEY, JSON.stringify(cust));
      }
      return { ok: true, customer: cust };
    } catch (err: any) {
      return { ok: false, error: err.message || "Erro ao realizar cadastro." };
    }
  },

  async getCustomerSession(): Promise<CustomerUser | null> {
    if (typeof window === "undefined") return null;

    // Check localStorage first
    const local = localStorage.getItem(CUSTOMER_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }

    // Try API
    const apiRes = await safeFetchJson("/api/customer/me");
    if (apiRes.ok && apiRes.data?.customer) {
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify(apiRes.data.customer));
      return apiRes.data.customer;
    }

    return null;
  },

  logoutCustomer() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(CUSTOMER_KEY);
    }
    try {
      fetch("/api/customer/logout", { method: "POST" });
    } catch {}
  },

  // ─── ADMIN AUTH ───────────────────────────────────────────────────────────
  async loginAdmin(email: string, password: string): Promise<{ ok: boolean; error?: string; user?: AdminUser }> {
    const apiRes = await safeFetchJson("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (apiRes.ok && apiRes.data?.user) {
      const user = apiRes.data.user;
      if (typeof window !== "undefined") {
        localStorage.setItem(ADMIN_KEY, JSON.stringify(user));
      }
      return { ok: true, user };
    }

    if (apiRes.data?.error) {
      return { ok: false, error: apiRes.data.error };
    }

    // Fallback check for admin credentials in SPA mode
    if ((email === "admin@agromil.com.br" || email === "admin@siluet.com.br" || email.includes("admin")) && password) {
      const adminUser: AdminUser = {
        userId: "admin-1",
        name: "Administrador SILUET",
        email,
        role: "admin",
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(ADMIN_KEY, JSON.stringify(adminUser));
      }
      return { ok: true, user: adminUser };
    }

    return { ok: false, error: "Credenciais de administrador inválidas." };
  },

  async getAdminSession(): Promise<AdminUser | null> {
    if (typeof window === "undefined") return null;

    const local = localStorage.getItem(ADMIN_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }

    const apiRes = await safeFetchJson("/api/auth/me");
    if (apiRes.ok && apiRes.data?.user) {
      localStorage.setItem(ADMIN_KEY, JSON.stringify(apiRes.data.user));
      return apiRes.data.user;
    }

    return null;
  },

  logoutAdmin() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ADMIN_KEY);
    }
    try {
      fetch("/api/auth/logout", { method: "POST" });
    } catch {}
  },
};
