'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { ALL_ASSETS } from './data';

type PriceData = { price: number; change: number; high: number; low: number; dir: number };
type PriceMap = Record<string, PriceData>;

type PriceContextValue = {
  prices: PriceMap;
  getPrice: (sym: string, dex: string) => PriceData;
  tick: number;
};

const PriceCtx = createContext<PriceContextValue | null>(null);
export const useLivePrices = () => {
  const ctx = useContext(PriceCtx);
  if (!ctx) {
    return {
      prices: {} as PriceMap,
      getPrice: () => ({ price: 0, change: 0, high: 0, low: 0, dir: 0 }),
      tick: 0,
    };
  }
  return ctx;
};

export function PriceProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<PriceMap>(() => {
    const m: PriceMap = {};
    ALL_ASSETS.forEach(a => {
      m[a.symbol + '_' + a.dex] = {
        price: a.price,
        change: a.change,
        high: a.high ?? a.price,
        low: a.low ?? a.price,
        dir: 0,
      };
    });
    return m;
  });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setPrices(prev => {
        const next: PriceMap = { ...prev };
        Object.keys(next).forEach(k => {
          const p = next[k];
          const vol = k.startsWith('HYPE') ? 0.003
            : k.startsWith('SOL') ? 0.002
            : k.startsWith('XAUT') ? 0.0005
            : 0.0012;
          const delta = (Math.random() - 0.48) * p.price * vol;
          const np = Math.max(p.price * 0.95, p.price + delta);
          const base = ALL_ASSETS.find(a => a.symbol + '_' + a.dex === k);
          const ch = base ? ((np - base.price) / base.price) * 100 : p.change;
          next[k] = {
            price: np,
            change: +ch.toFixed(2),
            high: Math.max(p.high, np),
            low: Math.min(p.low, np),
            dir: np > p.price ? 1 : np < p.price ? -1 : 0,
          };
        });
        return next;
      });
      setTick(t => t + 1);
    }, 1500);
    return () => clearInterval(iv);
  }, []);

  const getPrice = useCallback(
    (sym: string, dex: string): PriceData =>
      prices[sym + '_' + dex] || { price: 0, change: 0, high: 0, low: 0, dir: 0 },
    [prices]
  );

  return (
    <PriceCtx.Provider value={{ prices, getPrice, tick }}>
      {children}
    </PriceCtx.Provider>
  );
}
