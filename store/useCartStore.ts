import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { SignConfig, SignMetrics } from '@/lib/types';

export interface CartItem {
  id: string;
  addedAt: number;
  config: SignConfig;
  metrics: SignMetrics;
  /** Client-side estimate at add time. The server re-prices everything at checkout. */
  unitPrice: number;
  thumbnail: string | null;
  qty: number;
}

interface CartState {
  items: CartItem[];
  addItem: (i: Omit<CartItem, 'id' | 'addedAt' | 'qty'>) => void;
  setQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
}

// localStorage can throw (quota — an uploaded SVG can be ~1.5 MB — or private mode) and is absent on the server.
const safeStorage = {
  getItem: (k: string) => (typeof window === 'undefined' ? null : window.localStorage.getItem(k)),
  setItem: (k: string, v: string) => {
    try { window.localStorage.setItem(k, v); } catch { /* keep in-memory cart working */ }
  },
  removeItem: (k: string) => {
    try { window.localStorage.removeItem(k); } catch { /* noop */ }
  },
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (i) =>
        set((s) => ({ items: [...s.items, { ...i, id: crypto.randomUUID(), addedAt: Date.now(), qty: 1 }] })),
      setQty: (id, qty) =>
        set((s) => ({ items: s.items.map((it) => (it.id === id ? { ...it, qty: Math.max(1, Math.min(100, qty)) } : it)) })),
      removeItem: (id) => set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'cre8-cart', version: 1, storage: createJSONStorage(() => safeStorage) },
  ),
);
