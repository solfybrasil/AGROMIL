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
        const res = await fetch(`/api/favoritos?checkIds=${productId}`);
        if (res.ok) {
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

    // Optimistic Update
    const previous = isFavorited;
    setIsFavorited(!previous);

    try {
      if (previous) {
        // Remove
        const res = await fetch(`/api/favoritos?productId=${productId}`, { method: "DELETE" });
        if (!res.ok) {
          if (res.status === 401) {
            router.push(`/login?redirect=${window.location.pathname}`);
            setIsFavorited(previous);
          } else {
            setIsFavorited(previous);
          }
        }
      } else {
        // Add
        const res = await fetch("/api/favoritos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        if (!res.ok) {
          if (res.status === 401) {
            router.push(`/login?redirect=${window.location.pathname}`);
            setIsFavorited(previous);
          } else {
            setIsFavorited(previous);
          }
        }
      }
    } catch {
      setIsFavorited(previous);
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
