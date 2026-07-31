// Recommendation Engine - SILUET Atelier
// Algorithm inspired by Pinterest/Instagram feed personalization

export type InteractionEvent = 'click' | 'view' | 'favorite' | 'cart' | 'purchase' | 'preference';

const EVENT_WEIGHTS: Record<InteractionEvent, number> = { click: 1, view: 2, favorite: 3, cart: 5, purchase: 10, preference: 8 };

interface Interaction { productId: string; categorySlug: string; event: InteractionEvent; ts: number; }

function getKey(u: string) { return 'siluet_interactions_' + u; }

function loadInteractions(userId: string): Interaction[] {
  if (typeof window === 'undefined') return [];
  try { const r = localStorage.getItem(getKey(userId)); return r ? JSON.parse(r) : []; }
  catch { return []; }
}

function saveInteractions(userId: string, items: Interaction[]) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(getKey(userId), JSON.stringify(items.slice(-500))); } catch {}
}

export function getCurrentUserId(): string {
  if (typeof window === 'undefined') return 'guest';
  try {
    const r = localStorage.getItem('siluet_customer_session');
    if (r) { const p = JSON.parse(r); return p?.id || p?.user?.id || 'guest'; }
  } catch {}
  return 'guest';
}

export function saveOnboardingPreferences(
  userId: string,
  categorySlugs: string[],
  sizes?: { sizeTop?: string; sizeBottom?: string; sizeShoe?: string }
) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      'siluet_user_preferences_' + userId,
      JSON.stringify({ categories: categorySlugs, sizes: sizes || {}, savedAt: Date.now() })
    );
  } catch {}
}

export function loadOnboardingPreferences(userId: string): string[] {
  if (typeof window === 'undefined') return [];
  try { const r = localStorage.getItem('siluet_user_preferences_' + userId); return r ? (JSON.parse(r)?.categories || []) : []; } catch { return []; }
}

export function trackInteraction(userId: string, productId: string, categorySlug: string, event: InteractionEvent) {
  if (!userId || userId === 'guest') return;
  const items = loadInteractions(userId);
  items.push({ productId, categorySlug, event, ts: Date.now() });
  saveInteractions(userId, items);
}

function computeCategoryScores(userId: string): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const slug of loadOnboardingPreferences(userId)) scores[slug] = (scores[slug] || 0) + 50;
  for (const ix of loadInteractions(userId)) {
    const w = EVENT_WEIGHTS[ix.event] || 1;
    const age = (Date.now() - ix.ts) / 86400000;
    scores[ix.categorySlug] = (scores[ix.categorySlug] || 0) + w * (age < 7 ? 1.5 : 1);
  }
  return scores;
}

function computeProductScores(userId: string): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const ix of loadInteractions(userId)) {
    const w = EVENT_WEIGHTS[ix.event] || 1;
    const age = (Date.now() - ix.ts) / 86400000;
    scores[ix.productId] = (scores[ix.productId] || 0) + w * (age < 7 ? 1.5 : age < 30 ? 1.2 : 1);
  }
  return scores;
}

export interface RecommendableProduct { id: string; categoryId?: string; categorySlug?: string; featured?: boolean; [key: string]: any; }

export function getRecommendations(userId: string, allProducts: RecommendableProduct[], limit = 12): RecommendableProduct[] {
  if (!userId || userId === 'guest' || allProducts.length === 0) {
    return [...allProducts].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).slice(0, limit);
  }
  const catScores = computeCategoryScores(userId);
  const prodScores = computeProductScores(userId);
  const scored = allProducts.map((p) => {
    const cat = catScores[p.categorySlug || p.categoryId || ''] || 0;
    const direct = prodScores[p.id] || 0;
    return { p, score: direct + cat * 0.5 + (p.featured ? 5 : 0) + (direct > 10 ? -3 : 0) };
  });
  scored.sort((a, b) => Math.abs(b.score - a.score) < 1 ? Math.random() - 0.5 : b.score - a.score);
  return scored.slice(0, limit).map((s) => s.p);
}

export function hasPersonalization(userId: string): boolean {
  if (!userId || userId === 'guest') return false;
  return loadOnboardingPreferences(userId).length > 0 || loadInteractions(userId).length >= 3;
}
