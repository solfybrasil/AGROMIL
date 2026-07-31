// Helper de armazenamento resiliente no navegador (IndexedDB + localStorage)
export const heroStorage = {
  async setSlides(slides: any[]): Promise<void> {
    // 1. Tentar localStorage primeiro
    try {
      localStorage.setItem("siluet_hero_slides", JSON.stringify(slides));
      localStorage.setItem("agromil_hero_slides", JSON.stringify(slides));
    } catch (err) {
      console.warn("localStorage quota excedida, salvando no IndexedDB...", err);
    }

    // 2. Tentar IndexedDB (capacidade ilimitada para fotos de alta resolução)
    try {
      const db = await heroStorage.openDB();
      const tx = db.transaction("hero_store", "readwrite");
      const store = tx.objectStore("hero_store");
      store.put(slides, "active_slides");
    } catch (err) {
      console.warn("IndexedDB error:", err);
    }
  },

  async getSlides(): Promise<any[] | null> {
    // 1. Tentar localStorage
    try {
      const stored = typeof window !== "undefined" ? (localStorage.getItem("siluet_hero_slides") || localStorage.getItem("agromil_hero_slides")) : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    // 2. Fallback para IndexedDB
    try {
      const db = await heroStorage.openDB();
      return new Promise((resolve) => {
        const tx = db.transaction("hero_store", "readonly");
        const store = tx.objectStore("hero_store");
        const req = store.get("active_slides");
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },

  openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !("indexedDB" in window)) {
        reject(new Error("No IndexedDB support"));
        return;
      }
      const req = indexedDB.open("siluet_atelier_db", 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("hero_store")) {
          db.createObjectStore("hero_store");
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },
};
