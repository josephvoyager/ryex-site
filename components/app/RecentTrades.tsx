'use client';

import { useMemo } from 'react';
import { fmtPrice } from '@/lib/format';

type Trade = { p: number; s: number; buy: boolean; t: string };

export default function RecentTrades({ asset }: { asset: { price: number } }) {
  const trades = useMemo<Trade[]>(() => {
    const a: Trade[] = [];
    for (let i = 0; i < 40; i++) {
      const p = asset.price + (Math.random() - 0.5) * asset.price * 0.004;
      a.push({
        p,
        s: Math.random() * 20 + 0.5,
        buy: Math.random() > 0.45,
        t: `${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      });
    }
    return a.sort((x, y) => (x.t < y.t ? 1 : -1));
  }, [Math.round(asset.price * 100)]);

  return (
    <div style={{ fontSize: 11, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '8px 10px 4px', fontSize: 9, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        <span>Price</span>
        <span style={{ textAlign: 'right' }}>Size</span>
        <span style={{ textAlign: 'right' }}>Time</span>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {trades.map((t, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '2px 10px', fontSize: 11 }}>
            <span className="num" style={{ color: t.buy ? 'oklch(0.82 0.17 150)' : 'oklch(0.78 0.20 20)' }}>
              {fmtPrice(t.p)}
            </span>
            <span className="num" style={{ textAlign: 'right' }}>{t.s.toFixed(2)}</span>
            <span className="num" style={{ textAlign: 'right', color: 'var(--ink-3)' }}>{t.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
