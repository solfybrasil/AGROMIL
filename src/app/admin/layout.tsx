"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Leaf,
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
  Radio,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface UserSession {
  userId: string;
  name: string;
  email: string;
  role: string;
}

const menuGroups = [
  {
    title: "Visão Geral",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Relatórios", href: "/admin/relatorios", icon: BarChart3 },
    ],
  },
  {
    title: "Catálogo & Operações",
    items: [
      { label: "Produtos", href: "/admin/produtos", icon: ShoppingBag },
      { label: "Categorias", href: "/admin/categorias", icon: FolderOpen },
      { label: "Pedidos", href: "/admin/pedidos", icon: ClipboardList },
    ],
  },
  {
    title: "Marketing & Avaliações",
    items: [
      { label: "Banners", href: "/admin/banners", icon: ImageIcon },
      { label: "Hero Slider", href: "/admin/hero", icon: LayoutTemplate },
      { label: "Cupons", href: "/admin/cupons", icon: Tag },
      { label: "Avaliações", href: "/admin/avaliacoes", icon: Star },
    ],
  },
];

// Bottom nav items for mobile (most important)
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
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setSession(data.user);
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Auth check error:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  // Close mobile drawer on navigation
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050e0a] flex flex-col items-center justify-center p-10 select-none">
        <div className="relative">
          <div className="rounded-2xl bg-gradient-to-tr from-primary to-emerald-500 p-4 text-white shadow-2xl shadow-primary/30">
            <Leaf className="h-8 w-8 fill-current" />
          </div>
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <span className="text-[11px] font-black text-emerald-400/70 mt-5 tracking-widest uppercase animate-pulse">
          Validando credenciais...
        </span>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col md:flex-row font-sans text-gray-800 antialiased overflow-hidden">

      {/* ══════════════════════════════════════════════
          MOBILE TOP HEADER BAR
      ══════════════════════════════════════════════ */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#0a1912]/95 backdrop-blur-xl text-white flex items-center justify-between border-b border-emerald-950/40 shadow-lg"
        style={{ paddingTop: "env(safe-area-inset-top)", paddingLeft: "16px", paddingRight: "16px", paddingBottom: "10px", minHeight: "56px" }}>
        <div className="flex items-center gap-2.5">
          <div className="bg-white rounded-xl p-1.5 shadow-xs" style={{ maxWidth: "80px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Agromil Logo" className="w-full h-auto object-contain" style={{ maxHeight: "24px" }} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase text-emerald-400/70 tracking-widest leading-none">Painel Admin</span>
            <span className="text-[11px] font-black text-white leading-tight truncate max-w-[140px]">
              {session.name.split(" ")[0]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-wider">Online</span>
          </div>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-xl bg-white/[0.06] border border-white/10 active:scale-95 transition-all"
          >
            {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════
          MOBILE FULL-SCREEN DRAWER OVERLAY
      ══════════════════════════════════════════════ */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Mobile Drawer Slide-in from Right */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[78vw] max-w-[300px] z-50 md:hidden
          bg-gradient-to-b from-[#0a1912] via-[#091710] to-[#050e0a]
          flex flex-col shadow-2xl transition-transform duration-300 ease-out
          ${isMobileOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-full bg-gradient-to-tr from-primary/30 to-emerald-500/30 border border-emerald-500/30 p-2 text-emerald-400">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-black text-white truncate">{session.name}</p>
              <span className="text-[8px] text-[#e2b13c] uppercase font-black tracking-widest">
                {session.role === "admin" ? "Administrador" : "Operador"}
              </span>
            </div>
          </div>
          <button onClick={() => setIsMobileOpen(false)} className="p-1.5 rounded-lg bg-white/5 text-gray-400">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer Nav */}
        <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-5 scrollbar-none">
          {menuGroups.map((group, gi) => (
            <div key={gi} className="space-y-1">
              <h4 className="px-3 text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2">
                {group.title}
              </h4>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 relative overflow-hidden
                      ${isActive
                        ? "bg-gradient-to-r from-primary to-[#2a684d] text-white shadow-lg shadow-primary/20"
                        : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${isActive ? "text-emerald-300" : ""}`} />
                      <span className="text-[11px] font-black">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="h-3.5 w-3.5 text-emerald-400/60" />}
                    {isActive && (
                      <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r-full bg-[#e2b13c]" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Drawer Footer */}
        <div className="px-4 py-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors text-[11px] font-black uppercase tracking-wider"
          >
            <LogOut className="h-4 w-4" />
            Sair da Conta
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          MOBILE BOTTOM NAVIGATION BAR
      ══════════════════════════════════════════════ */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-100 flex items-stretch"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = item.href !== "#more" && pathname === item.href;
          const isMore = item.href === "#more";
          return (
            isMore ? (
              <button
                key="more"
                onClick={() => setIsMobileOpen(true)}
                className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all active:scale-95
                  ${isMobileOpen ? "text-primary" : "text-gray-400"}`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[8px] font-black uppercase tracking-wider">{item.label}</span>
              </button>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all active:scale-95 relative
                  ${isActive ? "text-primary" : "text-gray-400"}`}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-b-full bg-primary" />
                )}
                <Icon className={`h-5 w-5 transition-transform ${isActive ? "scale-110" : ""}`} />
                <span className={`text-[8px] font-black uppercase tracking-wider ${isActive ? "text-primary" : ""}`}>{item.label}</span>
              </Link>
            )
          );
        })}
      </nav>

      {/* ══════════════════════════════════════════════
          DESKTOP SIDEBAR (hidden on mobile)
      ══════════════════════════════════════════════ */}
      <aside className="hidden md:flex w-64 bg-gradient-to-b from-[#0a1912] via-[#091710] to-[#050e0a] text-white flex-col border-r border-emerald-950/20 flex-shrink-0 select-none shadow-2xl sticky top-0 h-screen overflow-hidden">
        {/* Brand / Logo */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center bg-white rounded-2xl p-2 shadow-lg hover:scale-[1.02] transition-transform duration-300" style={{ maxWidth: "130px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Agromil Logo" className="w-full h-auto object-contain" />
          </div>
          <span className="text-[8px] font-black uppercase bg-[#e2b13c]/15 text-[#e2b13c] px-2 py-0.5 rounded border border-[#e2b13c]/20">
            Pro
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="flex-1 px-3 py-5 overflow-y-auto text-xs font-bold scrollbar-thin scrollbar-thumb-white/5 space-y-5">
          {menuGroups.map((group, gi) => (
            <div key={gi} className="space-y-1">
              <h4 className="px-3 text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">
                {group.title}
              </h4>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 relative group overflow-hidden
                      ${isActive
                        ? "bg-gradient-to-r from-primary to-[#2a684d] text-white shadow-lg shadow-primary/10"
                        : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
                      }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="flex items-center gap-3 relative z-10">
                      <Icon className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-emerald-300" : ""}`} />
                      <span className="text-[11px] font-black">{item.label}</span>
                    </div>
                    {isActive && (
                      <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r-full bg-[#e2b13c]" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Desktop Profile Footer */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between gap-3 select-none">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="rounded-full bg-gradient-to-tr from-primary/30 to-emerald-500/30 border border-emerald-500/30 p-2 text-emerald-400">
                <User className="h-4 w-4" />
              </div>
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 border-2 border-[#0a1912] animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black text-white truncate">{session.name}</p>
              <span className="text-[8px] text-[#e2b13c] uppercase font-black tracking-widest mt-0.5 block">
                {session.role === "admin" ? "Administrador" : "Operador"}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-rose-400 p-2 rounded-xl hover:bg-white/5 transition-all duration-200 flex-shrink-0 cursor-pointer"
            title="Sair da Conta"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════
          MAIN CONTENT AREA
      ══════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 w-full max-w-7xl mx-auto animate-fade-in-up px-4 md:px-10 pt-[calc(56px+12px+env(safe-area-inset-top))] md:pt-8 pb-[calc(56px+12px+env(safe-area-inset-bottom))] md:pb-8">
          {children}
        </main>
      </div>

    </div>
  );
}
