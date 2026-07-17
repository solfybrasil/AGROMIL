"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 1. Service Worker registration
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((err) => {
          console.warn("ServiceWorker registration failed: ", err);
        });
      });
    }

    // 2. Listen to install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if dismissed recently
      const dismissedUntil = localStorage.getItem("agromil_pwa_dismissed");
      if (dismissedUntil && new Date().getTime() < Number(dismissedUntil)) {
        return;
      }

      // Show banner after 4 seconds
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 4000);

      return () => clearTimeout(timer);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("User accepted PWA installation");
    }
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismissClick = () => {
    // Dismiss for 3 days
    const nextShow = new Date().getTime() + 1000 * 60 * 60 * 24 * 3;
    localStorage.setItem("agromil_pwa_dismissed", nextShow.toString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-[#1b4332] text-white border border-[#2d6a4f] rounded-3xl p-5 shadow-2xl z-50 animate-slide-up select-none">
      <div className="flex items-start gap-4">
        <div className="bg-emerald-400/25 p-2.5 rounded-2xl flex-shrink-0 text-emerald-300">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-black uppercase tracking-wider">Instalar Aplicativo</h4>
          <p className="text-[10px] text-emerald-100 font-semibold leading-relaxed mt-1">
            Instale o app do Agromil na tela inicial do seu celular para compras e rastreamento mais rápidos.
          </p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleInstallClick}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase py-2 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Instalar
            </button>
            <button
              onClick={handleDismissClick}
              className="bg-transparent border border-white/20 hover:bg-white/5 text-white text-[10px] font-bold py-2 px-4 rounded-xl transition-all cursor-pointer"
            >
              Depois
            </button>
          </div>
        </div>
        <button
          onClick={handleDismissClick}
          className="text-white/40 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
