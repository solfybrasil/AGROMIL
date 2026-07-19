"use client";

import { useEffect, useState } from "react";
import { Product } from "@/lib/cart-store";
import { useAddToCart } from "@/lib/useAddToCart";
import { ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RelatedProductsProps {
  categoryId: string;
  excludeProductId: string;
}

export default function RelatedProducts({ categoryId, excludeProductId }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const addToCart = useAddToCart();

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await fetch(`/api/produtos?categoryId=${categoryId}&activeOnly=true`);
        if (res.ok) {
          const data = await res.json();
          // Filter out current product
          const filtered = data.filter((p: Product) => p.id !== excludeProductId).slice(0, 4);
          
          if (filtered.length > 0) {
            setProducts(filtered);
          } else {
            // Fallback: load general featured products
            const fallbackRes = await fetch("/api/produtos?featured=true&activeOnly=true");
            if (fallbackRes.ok) {
              const fallbackData = await fallbackRes.json();
              setProducts(fallbackData.filter((p: Product) => p.id !== excludeProductId).slice(0, 4));
            }
          }
        }
      } catch (err) {
        console.warn("Failed to load related products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRelated();
  }, [categoryId, excludeProductId]);

  if (loading) {
    return (
      <div className="space-y-4 pt-10 border-t border-gray-150 select-none">
        <h3 className="font-serif text-xl font-extrabold text-[#1b4332]">🏷️ Compre Junto</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3 animate-pulse">
              <div className="bg-gray-100 rounded-xl aspect-square w-full" />
              <div className="h-3 bg-gray-150 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="space-y-4 pt-10 border-t border-gray-150 select-none">
      <h3 className="font-serif text-xl font-extrabold text-[#1b4332]">
        🏷️ Compre Junto — Clientes também levaram
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {products.map((p) => {
          const hasPromo = p.promoPrice !== null && p.promoPrice !== undefined;
          const price = hasPromo ? Number(p.promoPrice) : Number(p.price);
          return (
            <div
              key={p.id}
              className="bg-white border border-gray-100 rounded-2xl p-4 shadow-3xs hover:shadow-2xs transition-shadow flex flex-col justify-between group"
            >
              <Link href={`/produto/${p.id}`} className="space-y-3 block">
                {/* Image */}
                <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center relative">
                  {p.images?.[0] ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                    />
                  ) : (
                    <ShoppingCart className="h-6 w-6 text-gray-200" />
                  )}
                </div>
                {/* Title */}
                <div>
                  <h4 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-primary transition-colors min-h-[32px]">
                    {p.name}
                  </h4>
                  <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">por {p.unit}</span>
                </div>
              </Link>

              {/* Price & Buy row */}
              <div className="mt-4 pt-2 border-t border-gray-50 flex items-center justify-between gap-1.5">
                <div className="flex flex-col">
                  {hasPromo && (
                    <span className="text-[9px] text-gray-400 line-through">R$ {Number(p.price).toFixed(2)}</span>
                  )}
                  <span className="text-sm font-black text-primary">R$ {price.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => addToCart(p, 1)}
                  className="bg-primary hover:bg-[#1b4332] text-white p-2 rounded-xl shadow-xs transition-colors flex-shrink-0 cursor-pointer"
                  title="Adicionar ao Carrinho"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
