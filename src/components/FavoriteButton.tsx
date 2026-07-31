"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  productId: string;
  size?: "sm" | "md" | "lg";
}

export default function FavoriteButton({ productId, size = "md" }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        // Check localStorage first
        const localFavs = JSON.parse(localStorage.getItem("siluet_favorites") || "[]");
        if (Array.isArray(localFavs) && localFavs.includes(productId)) {
          setIsFavorited(true);
          return;
        }

        const res = await fetch(`/api/favoritos?checkIds=${productId}`);
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          const favoritedIds = await res.json();
          if (Array.isArray(favoritedIds) && favoritedIds.includes(productId)) {
            setIsFavorited(true);
          }
        }
      } catch (err) {
        console.warn("Failed to check favorite status:", err);
      }
    };
    checkFavoriteStatus();
  }, [productId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;
    setLoading(true);

    const previous = isFavorited;
    const nextState = !previous;
    setIsFavorited(nextState);

    // Save to localStorage
    try {
      const localFavs: string[] = JSON.parse(localStorage.getItem("siluet_favorites") || "[]");
      const updated = nextState
        ? Array.from(new Set([...localFavs, productId]))
        : localFavs.filter((id) => id !== productId);
      localStorage.setItem("siluet_favorites", JSON.stringify(updated));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("siluet_favorites_updated"));
      }
    } catch {}

    try {
      if (previous) {
        await fetch(`/api/favoritos?productId=${productId}`, { method: "DELETE" }).catch(() => {});
      } else {
        await fetch("/api/favoritos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        }).catch(() => {});
      }
    } catch {
      // Keep optimistic state
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2.5 rounded-full bg-white border border-gray-150 hover:bg-gray-50 active:scale-95 transition-all text-gray-400 hover:text-rose-500 shadow-3xs cursor-pointer ${
        isFavorited ? "text-rose-500" : ""
      }`}
      title={isFavorited ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
    >
      <Heart className={`${sizeClasses[size]} ${isFavorited ? "fill-rose-500 text-rose-500" : ""}`} />
    </button>
  );
}
