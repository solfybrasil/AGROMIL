"use client";

import { useCartStore } from "@/lib/cart-store";
import { ShoppingCart, User, Search, Menu, X, Leaf, Truck, Phone, Clock, Tag, ArrowRight, Sprout, Heart, Tractor, Wrench, Droplet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

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

const STORAGE_KEY = "agromil_searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(term: string) {
  if (typeof window === "undefined" || !term.trim()) return;
  const existing = getRecentSearches().filter((s) => s !== term);
  const next = [term, ...existing].slice(0, MAX_RECENT);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export default function Header() {
  const { toggleCart, getCartCount } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [customerSession, setCustomerSession] = useState<any>(null);
  const router = useRouter();

  // Search state
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

  useEffect(() => {
    if (cartCount > 0) {
      setCartBouncing(true);
      const timer = setTimeout(() => setCartBouncing(false), 450);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  useEffect(() => {
    setMounted(true);
    setRecentSearches(getRecentSearches());

    const checkCustomer = async () => {
      try {
        const res = await fetch("/api/customer/me");
        if (res.ok) {
          const data = await res.json();
          if (data.session) setCustomerSession(data.session);
        }
      } catch (err) {
        console.warn("Header session check failed:", err);
      }
    };
    checkCustomer();

    // Fetch categories for chips
    fetch("/api/categorias?activeOnly=true")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data.slice(0, 6));
      })
      .catch(() => {});
  }, []);

  // Click-outside closes dropdown (and mobile inline search)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const doSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    setLoadingSearch(true);
    try {
      const res = await fetch(
        `/api/produtos?q=${encodeURIComponent(term)}&activeOnly=true`
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setSearchResults(data.slice(0, 6));
      }
    } catch {
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setDropdownOpen(true);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      doSearch(val);
    }, 300);
  };

  const handleInputFocus = () => {
    setRecentSearches(getRecentSearches());
    setDropdownOpen(true);
    if (searchQuery.trim()) doSearch(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setDropdownOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === "Enter") {
      handleSubmitSearch(searchQuery);
    }
  };

  const handleSubmitSearch = (term: string) => {
    if (!term.trim()) return;
    saveRecentSearch(term.trim());
    setRecentSearches(getRecentSearches());
    setDropdownOpen(false);
    setSearchQuery("");
    router.push(`/busca?q=${encodeURIComponent(term.trim())}`);
  };

  const handleProductClick = (product: SearchProduct) => {
    saveRecentSearch(product.name);
    setRecentSearches(getRecentSearches());
    setDropdownOpen(false);
    setSearchQuery("");
    router.push(`/produto/${product.id}`);
  };

  const handleRecentClick = (term: string) => {
    setSearchQuery(term);
    handleSubmitSearch(term);
  };

  const showDropdown = dropdownOpen;
  const showRecentSearches = !searchQuery.trim() && recentSearches.length > 0;
  const showResults = !!searchQuery.trim();

  const navLinks = [
    { label: "Sobre Nós", href: "/sobre" },
    { label: "Contato", href: "/contato" },
  ];

  const staticCategories = [
    { name: "Jardinagem", slug: "jardinagem" },
    { name: "Pet Shop", slug: "petshop" },
    { name: "Agropecuária", slug: "agropecuaria" },
    { name: "Ferramentas", slug: "ferramentas" },
    { name: "Irrigação", slug: "irrigacao" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 shadow-xs">
      {/* Top Banner */}
      <div className="w-full bg-[#1b4332] text-[#d8f3dc] py-2 px-4 text-center text-xs font-semibold flex flex-col sm:flex-row items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-1.5 justify-center">
          <Truck className="h-4 w-4 text-emerald-400" />
          <span>Frete Grátis para Itu/SP em pedidos acima de R$ 150</span>
        </div>
        <div className="flex gap-4 items-center justify-center">
          <div className="flex items-center gap-1">
            <Leaf className="h-3.5 w-3.5 text-emerald-400" />
            <span>Qualidade e Tradição Agropecuária</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <Phone className="h-3.5 w-3.5 text-emerald-400" />
            <span>Whatsapp: (11) 4023-3503</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Mobile inline search (shown when search icon tapped) */}
        {mobileSearchOpen && (
          <div ref={searchRef} className="md:hidden absolute inset-x-0 top-0 z-50 bg-white px-4 py-3 shadow-lg animate-fade-in-down">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                autoFocus
                type="text"
                placeholder="Buscar produtos, insumos, rações..."
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onKeyDown={handleKeyDown}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all placeholder-gray-400"
              />
              <button
                onClick={() => { setMobileSearchOpen(false); setDropdownOpen(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Fechar busca"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Mobile dropdown results */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 max-h-[70vh] overflow-y-auto">
                  {showRecentSearches && (
                    <div>
                      <div className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="h-3 w-3" /> Buscas recentes
                      </div>
                      {recentSearches.map((term, i) => (
                        <button
                          key={i}
                          onClick={() => handleRecentClick(term)}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
                        >
                          <Clock className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                          {term}
                        </button>
                      ))}
                    </div>
                  )}

                  {showResults && (
                    loadingSearch ? (
                      <div className="px-4 py-6 text-center text-sm text-gray-400">Buscando...</div>
                    ) : searchResults.length > 0 ? (
                      <>
                        <div className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Produtos</div>
                        {searchResults.map((product) => {
                          const price = product.promoPrice ?? product.price;
                          return (
                            <button
                              key={product.id}
                              onClick={() => handleProductClick(product)}
                              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3"
                            >
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                                {product.images?.[0] ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center"><Search className="h-4 w-4 text-gray-300" /></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                                {product.category && <p className="text-[10px] text-gray-400">{product.category.name}</p>}
                              </div>
                              <span className="text-sm font-extrabold text-primary flex-shrink-0">R$ {Number(price).toFixed(2)}</span>
                            </button>
                          );
                        })}
                        <div className="border-t border-gray-50">
                          <button
                            onClick={() => handleSubmitSearch(searchQuery)}
                            className="w-full px-4 py-3 text-sm font-semibold text-primary hover:bg-primary-light flex items-center justify-between"
                          >
                            <span>Ver todos os resultados para &quot;{searchQuery}&quot;</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm text-gray-500">Nenhum produto encontrado para</p>
                        <p className="text-sm font-bold text-gray-700">&quot;{searchQuery}&quot;</p>
                        <button
                          onClick={() => handleSubmitSearch(searchQuery)}
                          className="mt-3 text-xs text-primary font-semibold hover:underline"
                        >
                          Buscar mesmo assim →
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <Link href="/" className="flex items-center group flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Agromil Logo"
            className="h-14 md:h-18 w-auto object-contain transition-transform group-hover:scale-102"
          />
        </Link>

        {/* Autocomplete Search Bar — desktop */}
        <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl relative">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar produtos, insumos, rações..."
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all placeholder-gray-400"
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

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in-up">
              {/* Recent Searches */}
              {showRecentSearches && (
                <div>
                  <div className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> Buscas recentes
                  </div>
                  {recentSearches.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => handleRecentClick(term)}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                    >
                      <Clock className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                      {term}
                    </button>
                  ))}
                  <div className="border-t border-gray-50 mt-1" />
                </div>
              )}

              {/* Category Chips */}
              {!showResults && categories.length > 0 && (
                <div className="px-4 py-3">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Tag className="h-3 w-3" /> Categorias
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/categoria/${cat.slug}`}
                        onClick={() => setDropdownOpen(false)}
                        className="inline-flex items-center text-xs font-semibold bg-primary-light text-primary rounded-full px-3 py-1 hover:bg-primary hover:text-white transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Results */}
              {showResults && (
                <div>
                  {loadingSearch ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-400">Buscando...</div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <div className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Produtos
                      </div>
                      {searchResults.map((product) => {
                        const price = product.promoPrice ?? product.price;
                        return (
                          <button
                            key={product.id}
                            onClick={() => handleProductClick(product)}
                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                              {product.images?.[0] ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Search className="h-4 w-4 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                              {product.category && (
                                <p className="text-[10px] text-gray-400">{product.category.name}</p>
                              )}
                            </div>
                            <span className="text-sm font-extrabold text-primary flex-shrink-0">
                              R$ {Number(price).toFixed(2)}
                            </span>
                          </button>
                        );
                      })}
                      <div className="border-t border-gray-50">
                        <button
                          onClick={() => handleSubmitSearch(searchQuery)}
                          className="w-full px-4 py-3 text-sm font-semibold text-primary hover:bg-primary-light flex items-center justify-between transition-colors"
                        >
                          <span>Ver todos os resultados para &quot;{searchQuery}&quot;</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <p className="text-sm text-gray-500">Nenhum produto encontrado para</p>
                      <p className="text-sm font-bold text-gray-700">&quot;{searchQuery}&quot;</p>
                      <button
                        onClick={() => handleSubmitSearch(searchQuery)}
                        className="mt-3 text-xs text-primary font-semibold hover:underline"
                      >
                        Buscar mesmo assim →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Category chips when there are results */}
              {showResults && searchResults.length > 0 && categories.length > 0 && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Filtrar por categoria</div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/busca?q=${encodeURIComponent(searchQuery)}&categoryId=${cat.id}`}
                        onClick={() => setDropdownOpen(false)}
                        className="inline-flex items-center text-xs font-semibold bg-white border border-gray-200 text-gray-600 rounded-full px-3 py-1 hover:border-primary hover:text-primary transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-700">
          <Link href="/" className="hover:text-primary transition-colors">
            Início
          </Link>

          {/* Categories Dropdown */}
          <div className="relative group py-2">
            <span className="hover:text-primary cursor-pointer transition-colors flex items-center gap-1">
              Categorias
              <svg className="h-4 w-4 fill-current mt-0.5" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </span>
            <div className="absolute top-full left-0 hidden group-hover:block bg-white shadow-lg border border-gray-100 rounded-lg py-2 w-52 z-50 transition-all duration-200">
              {staticCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categoria/${cat.slug}`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-light hover:text-primary transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action Icons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Mobile Search Icon */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setMobileSearchOpen(true);
              setDropdownOpen(true);
            }}
            className="md:hidden rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-primary transition-colors"
            aria-label="Buscar"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* User Account */}
          <Link
            href={customerSession ? "/minha-conta" : "/login"}
            className="rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-primary transition-colors flex items-center gap-1.5"
            title={customerSession ? `Minha Conta (${customerSession.name})` : "Entrar / Cadastrar"}
          >
            <User className="h-5 w-5" />
            {customerSession && (
              <span className="hidden lg:inline text-[10px] font-black uppercase text-gray-700 max-w-[80px] truncate">
                Olá, {customerSession.name.split(" ")[0]}
              </span>
            )}
          </Link>

          <button
            onClick={() => toggleCart(true)}
            className={`relative rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-primary transition-all active-pop ${
              cartBouncing ? "animate-cart-pop" : ""
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#e2b13c] text-[#1b4332] text-[9px] font-black rounded-full h-5 w-5 flex items-center justify-center border border-white shadow-2xs">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-primary transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Navigation */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-50 bg-[#0a1912]/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
          />

          {/* Drawer Panel */}
          <div
            className="fixed top-0 bottom-0 left-0 w-[82vw] max-w-[320px] bg-white z-50 flex flex-col shadow-2xl overflow-y-auto"
            style={{
              animation: "slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              paddingTop: "calc(16px + env(safe-area-inset-top))",
              paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
              paddingLeft: "20px",
              paddingRight: "20px"
            }}
          >
            {/* Keyframes injection */}
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes slideInLeft {
                from { transform: translateX(-100%); }
                to { transform: translateX(0); }
              }
            `}} />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-150 pb-3 mb-4">
              <div className="flex items-center bg-white rounded-xl p-1 shadow-xs" style={{ maxWidth: "80px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Agromil Logo" className="w-full h-auto object-contain" />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 transition-colors border border-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content list */}
            <div className="flex-1 flex flex-col gap-5">
              {/* User login / orders profile card */}
              {customerSession ? (
                <div className="bg-gradient-to-br from-[#1b4332] to-[#2d6a4f] text-white p-4 rounded-xl flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="bg-white/10 rounded-full p-2 border border-white/10 text-emerald-300 flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black text-emerald-300 uppercase tracking-widest leading-none">Bem-vindo</p>
                      <p className="text-xs font-black truncate leading-tight mt-0.5">{customerSession.name.split(" ")[0]}</p>
                    </div>
                  </div>
                  <Link
                    href="/minha-conta"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[9px] font-black uppercase text-[#e2b13c] bg-[#e2b13c]/15 border border-[#e2b13c]/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1 flex-shrink-0"
                  >
                    Painel
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-[#1b4332] to-[#2d6a4f] text-white p-4 rounded-xl flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-white/10 rounded-full p-2 border border-white/10 text-emerald-300">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-emerald-300/80 uppercase tracking-widest leading-none">Minha Conta</p>
                      <p className="text-xs font-bold text-white/90 leading-tight mt-0.5">Acesse sua conta</p>
                    </div>
                  </div>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[9px] font-black uppercase text-[#1b4332] bg-[#e2b13c] hover:bg-[#d4a030] px-3 py-1.5 rounded-lg flex-shrink-0"
                  >
                    Entrar
                  </Link>
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Pesquisar na loja..."
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-[10px] font-semibold focus:outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-300"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value;
                      if (val.trim()) {
                        setMobileMenuOpen(false);
                        handleSubmitSearch(val.trim());
                      }
                    }
                  }}
                />
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Categorias</span>
                <div className="grid grid-cols-2 gap-2">
                  {staticCategories.map((cat) => {
                    let IconComponent = Sprout;
                    let bg = "bg-emerald-50/60 border-emerald-100 text-emerald-950";
                    if (cat.slug === "petshop") { IconComponent = Heart; bg = "bg-amber-50/60 border-amber-100 text-amber-950"; }
                    else if (cat.slug === "agropecuaria") { IconComponent = Tractor; bg = "bg-blue-50/60 border-blue-100 text-blue-950"; }
                    else if (cat.slug === "ferramentas") { IconComponent = Wrench; bg = "bg-rose-50/60 border-rose-100 text-rose-950"; }
                    else if (cat.slug === "irrigacao") { IconComponent = Droplet; bg = "bg-teal-50/60 border-teal-100 text-teal-950"; }

                    return (
                      <Link
                        key={cat.slug}
                        href={`/categoria/${cat.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-1.5 p-2 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 ${bg}`}
                      >
                        <IconComponent className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{cat.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Institutional / Links */}
              <div className="space-y-1">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-2">Institucional</span>
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-gray-50 text-[11px] font-bold text-gray-700 transition-colors"
                >
                  <span>Início</span>
                  <ArrowRight className="h-3 w-3 text-gray-400" />
                </Link>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-gray-50 text-[11px] font-bold text-gray-700 transition-colors"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Contacts Footer inside Menu */}
            <div className="border-t border-gray-100 pt-4 mt-auto space-y-2">
              <a
                href="https://wa.me/551140233503"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-xl active:scale-95 transition-all"
              >
                <Phone className="h-3.5 w-3.5" />
                Suporte WhatsApp
              </a>
              <div className="text-[8px] text-gray-400 text-center font-bold">
                Seg a Sex: 07:30 às 18:00 | Sáb: 07:30 às 13:00
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
