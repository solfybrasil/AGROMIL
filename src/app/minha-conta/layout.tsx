"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, ClipboardList, MapPin, Award, LogOut, Loader, LayoutDashboard, ChevronRight, Menu, X } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryMenu from "@/components/CategoryMenu";

export interface CustomerSession {
  id: string;
  name: string;
  email: string;
  phone: string;
  planType: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

interface AccountContextType {
  session: CustomerSession | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType>({
  session: null,
  loading: true,
  refreshSession: async () => {},
});

export const useAccount = () => useContext(AccountContext);

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const checkSession = async () => {
    try {
      const res = await fetch("/api/customer/me");
      if (res.ok) {
        const data = await res.json();
        if (data.session) {
          setSession(data.session);
        } else {
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
      } else {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    } catch (err) {
      console.error("Session verification failed:", err);
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]); // Only run once on layout mount

  // Close mobile drawer on navigation
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/customer/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex flex-col items-center justify-center p-10 select-none">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
        <span className="text-[11px] font-black text-primary/70 mt-4 tracking-widest uppercase animate-pulse">
          Carregando sua conta...
        </span>
      </div>
    );
  }

  if (!session) return null;

  const menuItems = [
    { label: "Visão Geral", href: "/minha-conta", icon: LayoutDashboard },
    { label: "Meus Pedidos", href: "/minha-conta/pedidos", icon: ClipboardList },
    { label: "Meu Perfil", href: "/minha-conta/perfil", icon: User },
    { label: "Endereços Salvos", href: "/minha-conta/enderecos", icon: MapPin },
    { label: "Clube Fidelidade", href: "/minha-conta/fidelidade", icon: Award },
  ];

  return (
    <AccountContext.Provider value={{ session, loading, refreshSession: checkSession }}>
      <div className="flex flex-col min-h-screen bg-[#fafaf9]">
        <Header />
        <CategoryMenu />

        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* ── Desktop Sidebar ── */}
            <aside className="hidden lg:flex w-72 bg-white border border-gray-100 rounded-3xl p-5 shadow-3xs flex-col flex-shrink-0">
              {/* Header info */}
              <div className="flex items-center gap-3 pb-5 border-b border-gray-50 mb-5">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-lg font-black">
                  {session.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-gray-800 truncate">{session.name}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      session.planType === "PLANO" 
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}>
                      {session.planType === "PLANO" ? "Corporativo" : "Varejo"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu */}
              <nav className="space-y-1 font-sans text-xs">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative
                        ${isActive
                          ? "bg-primary text-white shadow-xs"
                          : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`h-4 w-4 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-800"}`} />
                        <span className="font-bold">{item.label}</span>
                      </div>
                      <ChevronRight className={`h-3.5 w-3.5 ${isActive ? "text-white/60" : "text-gray-300 group-hover:text-gray-500"}`} />
                    </Link>
                  );
                })}
              </nav>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="mt-6 flex items-center justify-center gap-2 py-3 rounded-xl border border-rose-150 hover:bg-rose-50 text-rose-600 transition-colors text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sair da Conta
              </button>
            </aside>

            {/* ── Mobile Sidebar Header (Drawer trigger) ── */}
            <div className="lg:hidden w-full bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-3xs">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-black">
                  {session.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-800 truncate">{session.name.split(" ")[0]}</h4>
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Painel do Cliente</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="p-2 border border-gray-250 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                {isMobileOpen ? <X className="h-4 w-4 text-gray-600" /> : <Menu className="h-4 w-4 text-gray-600" />}
              </button>
            </div>

            {/* ── Mobile Navigation Drawer ── */}
            {isMobileOpen && (
              <div className="lg:hidden w-full bg-white border border-gray-100 rounded-2xl p-4 shadow-3xs space-y-4 animate-fade-in-down">
                <nav className="space-y-1 text-xs">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all
                          ${isActive
                            ? "bg-primary text-white"
                            : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span className="font-bold">{item.label}</span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                      </Link>
                    );
                  })}
                </nav>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-150 text-rose-600 text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sair da Conta
                </button>
              </div>
            )}

            {/* ── Main Content Area ── */}
            <div className="flex-1 w-full bg-white border border-gray-100 rounded-3xl p-5 md:p-8 shadow-3xs min-w-0">
              {children}
            </div>

          </div>
        </div>

        <Footer />
      </div>
    </AccountContext.Provider>
  );
}
