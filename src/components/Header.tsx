"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useCartStore } from "@/lib/cart-store";
import { ShoppingCart, User, Search, X, Sparkles, Truck, Phone, Clock, Tag, ArrowRight, Heart, Flame, ShieldCheck, Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clientAuth } from "@/lib/client-auth";
import { dbService } from "@/lib/db-service";

interface SearchProduct {
  id: string;
  name: string;
  price: number;
  promoPrice?: number | null;
  images?: string[];
  category?: { name: string; slug: string };
}

interface SearchCategory {
  id: string;
  name: string;
  slug: string;
}

const STORAGE_KEY = "siluet_searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function saveRecentSearch(term: string) {
  if (typeof window === "undefined" || !term.trim()) return;
  const existing = getRecentSearches().filter((s) => s !== term);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([term, ...existing].slice(0, MAX_RECENT)));
}

export default function Header() {
  const { toggleCart, getCartCount } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [customerSession, setCustomerSession] = useState<any>(null);
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [categories, setCategories] = useState<SearchCategory[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cartCount = getCartCount();
  const [cartBouncing, setCartBouncing] = useState(false);
  const [favCount, setFavCount] = useState(0);

  const updateFavCount = useCallback(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("siluet_favorites") || "[]");
      setFavCount(Array.isArray(favs) ? favs.length : 0);
    } catch { setFavCount(0); }
  }, []);

  useEffect(() => {
    updateFavCount();
    window.addEventListener("siluet_favorites_updated", updateFavCount);
    return () => window.removeEventListener("siluet_favorites_updated", updateFavCount);
  }, [updateFavCount]);

  useEffect(() => {
    if (cartCount > 0) {
      setCartBouncing(true);
      const t = setTimeout(() => setCartBouncing(false), 450);
      return () => clearTimeout(t);
    }
  }, [cartCount]);

  useEffect(() => {
    setMounted(true);
    setRecentSearches(getRecentSearches());

    const checkCustomer = async () => {
      try {
        const session = await clientAuth.getCustomerSession();
        setCustomerSession(session || null);
      } catch { setCustomerSession(null); }
    };
    checkCustomer();
    if (typeof window !== "undefined") {
      window.addEventListener("siluet_auth_updated", checkCustomer);
    }

    dbService.getCategories()
      .then((data) => { if (Array.isArray(data)) setCategories(data.slice(0, 6)); })
      .catch(() => {});

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("siluet_auth_updated", checkCustomer);
      }
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", mobileMenuOpen);
    return () => document.body.classList.remove("mobile-menu-open");
  }, [mobileMenuOpen]);

  const doSearch = useCallback(async (term: string) => {
    if (!term.trim()) { setSearchResults([]); return; }
    setLoadingSearch(true);
    try {
      const res = await fetch(`/api/produtos?q=${encodeURIComponent(term)}&activeOnly=true`);
      const data = await res.json();
      if (Array.isArray(data)) setSearchResults(data.slice(0, 6));
    } catch { setSearchResults([]); }
    finally { setLoadingSearch(false); }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setDropdownOpen(true);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => doSearch(val), 300);
  };

  const handleInputFocus = () => {
    setRecentSearches(getRecentSearches());
    setDropdownOpen(true);
    if (searchQuery.trim()) doSearch(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") { setDropdownOpen(false); inputRef.current?.blur(); }
    if (e.key === "Enter") handleSubmitSearch(searchQuery);
  };

  const handleSubmitSearch = (term: string) => {
    if (!term.trim()) return;
    saveRecentSearch(term.trim());
    setRecentSearches(getRecentSearches());
    setDropdownOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
    router.push(`/busca?q=${encodeURIComponent(term.trim())}`);
  };

  const handleProductClick = (product: SearchProduct) => {
    saveRecentSearch(product.name);
    setDropdownOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
    router.push(`/produto/${product.id}`);
  };

  const fashionCategories = [
    { name: "Vestidos & Midis", slug: "vestidos" },
    { name: "Tops & Blusas", slug: "tops-blusas" },
    { name: "Conjuntos & Tailoring", slug: "conjuntos" },
    { name: "Calças & Wide Leg", slug: "calcas-jeans" },
    { name: "Bolsas & Acessórios", slug: "acessorios" },
    { name: "Calçados & Mules", slug: "calcados" },
  ];

  const showRecentSearches = !searchQuery.trim() && recentSearches.length > 0;
  const showResults = !!searchQuery.trim();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F5EFE6] border-b border-[#EDE3D3] shadow-xs">

      {/* ── Top announcement bar — hidden on mobile ── */}
      <div className="hidden sm:flex w-full bg-[#1A1A1A] text-[#F5EFE6] py-2 px-4 text-center text-xs font-medium items-center justify-between gap-2 select-none tracking-wider">
        <div className="flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5 text-[#8B5E3C]" />
          <span>FRETE GRÁTIS EM COMPRAS ACIMA DE R$ 159 | CUPOM <strong className="text-white bg-[#8B5E3C]/40 px-1.5 py-0.5 rounded border border-[#8B5E3C]/30">SILUET10</strong> PARA 10% OFF</span>
        </div>
        <div className="hidden md:flex gap-4 items-center text-[11px]">
          <div className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-[#8B5E3C]" />
            <span>Moda Minimalista &amp; Editorial</span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-[#8B5E3C]" />
            <span>Troca Grátis em até 30 Dias</span>
          </div>
        </div>
      </div>

      {/* ── Mobile Search Overlay (fullscreen) ── */}
      {searchOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-[#F5EFE6] flex flex-col animate-fade-in">
          {/* Search bar */}
          <div ref={searchRef} className="flex items-center gap-3 px-4 py-3 border-b border-[#EDE3D3] bg-white">
            <Search className="h-4 w-4 text-[#8B5E3C] flex-shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-sm text-[#2B2620] placeholder-[#7A6F63] focus:outline-none"
            />
            <button
              onClick={() => { setSearchOpen(false); setDropdownOpen(false); setSearchQuery(""); }}
              className="text-[#7A6F63] p-1 active:scale-90 transition-transform"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {/* Recent searches */}
            {showRecentSearches && (
              <div>
                <p className="px-4 pt-4 pb-1 text-[9px] font-black text-[#8B5E3C] uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> Buscas recentes
                </p>
                {recentSearches.map((term, i) => (
                  <button key={i} onClick={() => handleSubmitSearch(term)}
                    className="w-full text-left px-4 py-3 text-sm text-[#2B2620] flex items-center gap-3 border-b border-[#EDE3D3]/50 active:bg-[#F5EFE6]">
                    <Clock className="h-3.5 w-3.5 text-[#7A6F63] flex-shrink-0" /> {term}
                  </button>
                ))}
              </div>
            )}

            {/* Category chips */}
            {!showResults && categories.length > 0 && (
              <div className="px-4 pt-4">
                <p className="text-[9px] font-black text-[#8B5E3C] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Tag className="h-3 w-3" /> Categorias
                </p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Link key={cat.id} href={`/categoria/${cat.slug}`}
                      onClick={() => setSearchOpen(false)}
                      className="inline-flex items-center text-xs font-medium bg-[#EDE3D3] text-[#5C2818] rounded-full px-3 py-1.5 active:bg-[#8B5E3C] active:text-white transition-colors">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Search results */}
            {showResults && (
              <div>
                {loadingSearch ? (
                  <div className="px-4 py-8 text-center text-sm text-[#7A6F63]">Buscando...</div>
                ) : searchResults.length > 0 ? (
                  <>
                    <p className="px-4 pt-4 pb-1 text-[9px] font-black text-[#8B5E3C] uppercase tracking-widest">Produtos</p>
                    {searchResults.map((product) => {
                      const price = product.promoPrice ?? product.price;
                      return (
                        <button key={product.id} onClick={() => handleProductClick(product)}
                          className="w-full text-left px-4 py-3 flex items-center gap-3 border-b border-[#EDE3D3]/50 active:bg-[#EDE3D3]/30">
                          <div className="w-11 h-11 rounded-xl bg-[#EDE3D3] flex-shrink-0 overflow-hidden border border-[#E8DFD8]">
                            {product.images?.[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Search className="h-4 w-4 text-[#7A6F63]" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#2B2620] truncate">{product.name}</p>
                            {product.category && <p className="text-[10px] text-[#7A6F63]">{product.category.name}</p>}
                          </div>
                          <span className="text-sm font-bold text-[#5C2818] flex-shrink-0">R$ {Number(price).toFixed(2)}</span>
                        </button>
                      );
                    })}
                    <button onClick={() => handleSubmitSearch(searchQuery)}
                      className="w-full px-4 py-4 text-sm font-semibold text-[#8B5E3C] flex items-center justify-between">
                      <span>Ver todos resultados para &quot;{searchQuery}&quot;</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-[#7A6F63]">Nenhum resultado para</p>
                    <p className="text-sm font-bold text-[#2B2620]">&quot;{searchQuery}&quot;</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Main Navbar ── */}
      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-6 flex items-center justify-between gap-3
                      h-12 sm:h-16 md:h-20">

        {/* Left: hamburger (desktop only) */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="hidden lg:flex rounded-full p-2 text-[#2B2620] hover:bg-[#EDE3D3] transition-colors"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="Logo"
            className="h-7 sm:h-9 md:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]"
          />
          <span className="font-script text-base sm:text-lg text-[#8B5E3C] hidden sm:inline-block capitalize font-normal -mb-1">
            Atelier &amp; Luxo
          </span>
        </Link>

        {/* Desktop search bar */}
        <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl relative">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A04728] pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar vestidos, conjuntos, croppeds, calças..."
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              className="w-full bg-[#FAF7F2] border border-[#E8DFD8] rounded-full pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#8B5E3C] focus:bg-white transition-all placeholder-gray-400 text-[#2B2620]"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setSearchResults([]); setDropdownOpen(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Desktop dropdown */}
          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E8DFD8] rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in-up">
              {showRecentSearches && (
                <div>
                  <div className="px-4 pt-3 pb-1 text-[10px] font-bold text-[#A04728] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> Buscas recentes
                  </div>
                  {recentSearches.map((term, i) => (
                    <button key={i} onClick={() => handleSubmitSearch(term)}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#2B2620] hover:bg-[#F7EFEA] flex items-center gap-2.5 transition-colors">
                      <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" /> {term}
                    </button>
                  ))}
                  <div className="border-t border-[#E8DFD8] mt-1" />
                </div>
              )}

              {!showResults && categories.length > 0 && (
                <div className="px-4 py-3">
                  <div className="text-[10px] font-bold text-[#A04728] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Tag className="h-3 w-3" /> Tendências
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Link key={cat.id} href={`/categoria/${cat.slug}`}
                        onClick={() => setDropdownOpen(false)}
                        className="inline-flex items-center text-xs font-medium bg-[#F7EFEA] text-[#5C2818] rounded-full px-3 py-1 hover:bg-[#5C2818] hover:text-white transition-colors">
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {showResults && (
                <div>
                  {loadingSearch ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-400">Buscando na coleção...</div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <div className="px-4 pt-3 pb-1 text-[10px] font-bold text-[#A04728] uppercase tracking-wider">Peças Encontradas</div>
                      {searchResults.map((product) => {
                        const price = product.promoPrice ?? product.price;
                        return (
                          <button key={product.id} onClick={() => handleProductClick(product)}
                            className="w-full text-left px-4 py-2.5 hover:bg-[#F7EFEA] flex items-center gap-3 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-[#E8DFD8]">
                              {product.images?.[0] ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Search className="h-4 w-4 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#2B2620] truncate">{product.name}</p>
                              {product.category && <p className="text-[10px] text-gray-500">{product.category.name}</p>}
                            </div>
                            <span className="text-sm font-bold text-[#5C2818] flex-shrink-0">R$ {Number(price).toFixed(2)}</span>
                          </button>
                        );
                      })}
                      <div className="border-t border-[#E8DFD8]">
                        <button onClick={() => handleSubmitSearch(searchQuery)}
                          className="w-full px-4 py-3 text-sm font-semibold text-[#5C2818] hover:bg-[#F7EFEA] flex items-center justify-between transition-colors">
                          <span>Ver tudo para &quot;{searchQuery}&quot;</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <p className="text-sm text-gray-500">Nenhuma peça para</p>
                      <p className="text-sm font-bold text-[#2B2620]">&quot;{searchQuery}&quot;</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop nav links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-[#2B2620]">
          <Link href="/" className="hover:text-[#8B5E3C] transition-colors">Home</Link>
          <Link href="/categoria/vestidos" className="hover:text-[#8B5E3C] transition-colors">Shop</Link>
          <Link href="/categoria/conjuntos" className="hover:text-[#8B5E3C] transition-colors">Coleções</Link>
          <Link href="/sobre" className="hover:text-[#8B5E3C] transition-colors">Sobre</Link>
        </nav>

        {/* Action icons */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">

          {/* Mobile: search icon */}
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden rounded-full p-2 text-[#2B2620] hover:bg-[#EDE3D3] transition-colors active:scale-90"
            aria-label="Buscar"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Favorites — hidden on mobile (in bottom nav) */}
          <Link
            href="/favoritos"
            className="relative hidden sm:flex rounded-full p-2 text-[#2B2620] hover:bg-[#EDE3D3] hover:text-[#8B5E3C] transition-colors"
            title="Meus Favoritos"
          >
            <Heart className="h-5 w-5" />
            {mounted && favCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
                {favCount}
              </span>
            )}
          </Link>

          {/* User — hidden on mobile (in bottom nav) */}
          <Link
            href={customerSession ? "/minha-conta" : "/login"}
            className="hidden sm:flex rounded-full p-2 text-[#2B2620] hover:bg-[#EDE3D3] hover:text-[#8B5E3C] transition-colors items-center gap-1.5"
          >
            <User className="h-5 w-5" />
            {customerSession && (
              <span className="hidden lg:inline text-[10px] font-bold text-[#2B2620] max-w-[80px] truncate">
                {customerSession.name.split(" ")[0]}
              </span>
            )}
          </Link>

          {/* Cart */}
          <button
            onClick={() => toggleCart(true)}
            className={`relative rounded-full p-2 text-[#2B2620] hover:bg-[#EDE3D3] hover:text-[#8B5E3C] transition-all active:scale-90 ${cartBouncing ? "animate-cart-pop" : ""}`}
            aria-label="Carrinho"
          >
            <ShoppingCart className="h-5 w-5" />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#8B5E3C] text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger — hidden (bottom nav handles navigation) */}
        </div>
      </div>

      {/* ── Desktop side drawer menu ── */}
      {mobileMenuOpen && (
        <>
          <div onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-50 bg-[#2B1D19]/50 backdrop-blur-xs animate-fade-in" />
          <div className="fixed top-0 bottom-0 left-0 w-[300px] bg-[#FAF7F2] z-50 flex flex-col shadow-2xl overflow-y-auto"
            style={{ paddingTop: "calc(16px + env(safe-area-inset-top))", paddingBottom: "calc(16px + env(safe-area-inset-bottom))", padding: "20px" }}>
            <div className="flex items-center justify-between border-b border-[#E8DFD8] pb-3 mb-5">
              <span className="font-serif text-lg font-semibold text-[#2B2620]">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl p-2 text-gray-500 hover:bg-[#EDE3D3] transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              {fashionCategories.map((cat) => (
                <Link key={cat.slug} href={`/categoria/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-[#F7EFEA] text-sm font-semibold text-[#2B2620] transition-colors">
                  <span>{cat.name}</span>
                  <ArrowRight className="h-4 w-4 text-[#8B5E3C]" />
                </Link>
              ))}
              <Link href="/busca?promo=true" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-3 px-3 bg-[#A04728]/10 rounded-xl text-sm font-bold text-[#A04728] mt-2">
                <Flame className="h-4 w-4" />
                <span>Ofertas Relâmpago</span>
              </Link>
            </div>
            <div className="border-t border-[#E8DFD8] pt-4 mt-auto">
              <Link href={customerSession ? "/minha-conta" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-3 w-full bg-[#8B5E3C] text-white text-sm font-bold rounded-xl active:scale-95 transition-all shadow-sm">
                <User className="h-4 w-4" />
                {customerSession ? `Minha Conta (${customerSession.name.split(" ")[0]})` : "Entrar / Cadastrar"}
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
