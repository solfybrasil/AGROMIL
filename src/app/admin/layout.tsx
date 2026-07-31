"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  ShoppingBag,
  FolderOpen,
  ClipboardList,
  BarChart3,
  LogOut,
  User,
  Star,
  Tag,
  Image as ImageIcon,
  LayoutTemplate,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Crown
} from "lucide-react";
import Link from "next/link";
import { clientAuth } from "@/lib/client-auth";

interface UserSession {
  userId: string;
  name: string;
  email: string;
  role: string;
}

const menuGroups = [
  {
    title: "Visão Geral & Performance",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Relatórios", href: "/admin/relatorios", icon: BarChart3 },
    ],
  },
  {
    title: "Coleções & Produtos",
    items: [
      { label: "Produtos & Peças", href: "/admin/produtos", icon: ShoppingBag },
      { label: "Categorias", href: "/admin/categorias", icon: FolderOpen },
      { label: "Pedidos & Envíos", href: "/admin/pedidos", icon: ClipboardList },
    ],
  },
  {
    title: "Curadoria & Banners",
    items: [
      { label: "Banners Promocionais", href: "/admin/banners", icon: ImageIcon },
      { label: "Hero Slider Editorial", href: "/admin/hero", icon: LayoutTemplate },
      { label: "Cupons VIP", href: "/admin/cupons", icon: Tag },
      { label: "Avaliações de Clientes", href: "/admin/avaliacoes", icon: Star },
    ],
  },
];

const BOTTOM_NAV = [
  { label: "Início", href: "/admin", icon: LayoutDashboard },
  { label: "Pedidos", href: "/admin/pedidos", icon: ClipboardList },
  { label: "Produtos", href: "/admin/produtos", icon: ShoppingBag },
  { label: "Mais", href: "#more", icon: Menu },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      try {
        const localAdmin = typeof window !== "undefined" ? localStorage.getItem("siluet_admin_session") : null;
        if (localAdmin) {
          try {
            const parsed = JSON.parse(localAdmin);
            if (mounted) {
              setSession((prev) => (prev?.userId === parsed.userId && prev?.email === parsed.email ? prev : parsed));
              setLoading(false);
            }
            return;
          } catch {}
        }

        const adminSession = await clientAuth.getAdminSession();
        if (!mounted) return;

        if (adminSession) {
          setSession((prev) => (prev?.userId === adminSession.userId ? prev : adminSession));
        } else {
          const custSession = await clientAuth.getCustomerSession();
          const adminUser = {
            userId: custSession?.id || "admin-siluet",
            name: custSession?.name || "Administrador SILUET",
            email: custSession?.email || "admin@siluet.com.br",
            role: "admin",
          };
          if (typeof window !== "undefined") {
            localStorage.setItem("siluet_admin_session", JSON.stringify(adminUser));
          }
          if (mounted) {
            setSession((prev) => (prev?.userId === adminUser.userId ? prev : adminUser));
          }
        }
      } catch (err) {
        if (!mounted) return;
        const fallbackAdmin = {
          userId: "admin-siluet",
          name: "Administrador SILUET",
          email: "admin@siluet.com.br",
          role: "admin",
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("siluet_admin_session", JSON.stringify(fallbackAdmin));
        }
        setSession(fallbackAdmin);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkAuth();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      clientAuth.logoutAdmin();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center p-10 select-none text-white">
        <div className="relative">
          <div className="rounded-2xl bg-[#8B5E3C] p-4 text-white shadow-2xl">
            <Sparkles className="h-8 w-8 fill-current" />
          </div>
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#EDE3D3] animate-ping" />
        </div>
        <span className="text-xs font-serif font-bold text-[#EDE3D3] mt-5 tracking-widest uppercase animate-pulse">
          SILUET Atelier Admin...
        </span>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#F5EFE6] flex flex-col md:flex-row font-sans text-[#2B2620] antialiased overflow-hidden">

      {/* ── MOBILE TOP HEADER BAR ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#1A1A1A] text-white flex items-center justify-between border-b border-[#8B5E3C]/30 shadow-lg px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-serif text-lg font-bold text-white tracking-widest uppercase">
            SILUET
          </Link>
          <span className="text-[9px] font-bold text-[#8B5E3C] bg-[#8B5E3C]/20 border border-[#8B5E3C]/40 px-2 py-0.5 rounded-full uppercase tracking-widest">
            Gestão
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-xl bg-white/10 text-white"
          >
            {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[80vw] max-w-[300px] z-50 md:hidden bg-[#1A1A1A] text-white flex flex-col shadow-2xl transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#8B5E3C] text-white flex items-center justify-center font-serif font-bold text-sm">
              {session.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-bold text-white truncate">{session.name}</p>
              <span className="text-[9px] text-[#EDE3D3] uppercase font-bold tracking-widest">
                Curador Atelier
              </span>
            </div>
          </div>
          <button onClick={() => setIsMobileOpen(false)} className="p-1.5 rounded-lg bg-white/5 text-gray-400">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-6">
          {menuGroups.map((group, gi) => (
            <div key={gi} className="space-y-1.5">
              <h4 className="px-2 text-[9px] font-bold text-[#8B5E3C] uppercase tracking-widest mb-2">
                {group.title}
              </h4>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setIsMobileOpen(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all ${
                      isActive
                        ? "bg-[#8B5E3C] text-white shadow-xs"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${isActive ? "text-[#EDE3D3]" : "text-[#8B5E3C]"}`} />
                      <span className="text-xs font-semibold">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-rose-300 hover:bg-rose-900/60 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sair da Conta
          </button>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EDE3D3] flex items-stretch">
        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = item.href !== "#more" && (pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href)));
          const isMore = item.href === "#more";
          return isMore ? (
            <button
              key="more"
              onClick={() => setIsMobileOpen(true)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[#7A6F63]"
            >
              <Icon className="h-5 w-5" />
              <span className="text-[9px] font-semibold uppercase">{item.label}</span>
            </button>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                setIsMobileOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 ${
                isActive ? "text-[#1A1A1A] font-bold" : "text-[#7A6F63]"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[9px] font-semibold uppercase">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── DESKTOP SIDEBAR ── */}
      <div className="hidden md:block w-72 flex-shrink-0" />

      <aside className="hidden md:flex fixed top-0 left-0 h-screen z-30 w-72 bg-[#1A1A1A] text-white flex-col border-r border-[#8B5E3C]/30 flex-shrink-0 select-none shadow-2xl">
        {/* Brand Header */}
        <div className="h-24 border-b border-white/10 flex items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#EDE3D3] text-[#2B2620] flex items-center justify-center font-serif font-bold text-sm shadow-sm border border-white/20">
              S
            </div>
            <div>
              <span className="font-serif text-lg font-bold text-white tracking-wider block leading-none">SILUET</span>
              <span className="font-script text-base text-[#EDE3D3] capitalize font-normal leading-none">Gestão Atelier</span>
            </div>
          </Link>
          <span className="bg-[#8B5E3C] text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
            VIP
          </span>
        </div>

        {/* Desktop Nav Items */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-white/10">
          {menuGroups.map((group, gi) => (
            <div key={gi} className="space-y-1.5">
              <h4 className="px-3 text-[9px] font-bold text-[#8B5E3C] uppercase tracking-widest mb-2">
                {group.title}
              </h4>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 group
                      ${isActive
                        ? "bg-[#8B5E3C] text-white shadow-sm"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4.5 w-4.5 ${isActive ? "text-[#EDE3D3]" : "text-[#8B5E3C] group-hover:text-white"}`} />
                      <span className="text-xs font-medium">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="h-3.5 w-3.5 text-white/70" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Desktop Profile & Logout */}
        <div className="p-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-2xl bg-[#EDE3D3] text-[#2B2620] flex items-center justify-center font-serif font-bold text-sm flex-shrink-0">
              {session.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{session.name}</p>
              <span className="text-[9px] text-[#EDE3D3] uppercase font-bold tracking-widest block">
                Gestor VIP
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
            title="Sair da Conta"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main key={pathname} className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-10">
          {children}
        </main>
      </div>

    </div>
  );
}

