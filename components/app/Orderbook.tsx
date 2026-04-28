'use client';

import { useMemo } from 'react';
import { fmtPrice } from '@/lib/format';

type Level = { p: number; s: number; t: number };
type Book = { asks: Level[]; bids: Level[] };

function genBook(mid: number, spread: number): Book {
  const asks: Level[] = [], bids: Level[] = [];
  for (let i = 0; i < 16; i++) {
    asks.push({ p: mid + spread * (i + 1), s: Math.random() * 50 + 5, t: 0 });
  }
  for (let i = 0; i < 16; i++) {
    bids.push({ p: mid - spread * (i + 1), s: Math.random() * 50 + 5, t: 0 });
  }
  let t = 0;
  asks.forEach((a) => { t += a.s; a.t = t; });
  t = 0;
  bids.forEach((b) => { t += b.s; b.t = t; });
  return { asks: asks.reverse(), bids };
}

export default function Orderbook({ asset }: { asset: { price: number } }) {
  const book = useMemo(() => genBook(asset.price, asset.price * 0.0015), [Math.round(asset.price * 100)]);
  const maxT = Math.max(book.asks[0]?.t || 1, book.bids[book.bids.length - 1]?.t || 1);

  const Row = ({ r, side }: { r: Level; side: 'ask' | 'bid' }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '2px 10px', position: 'relative', fontSize: 11 }}>
      <div
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: `${(r.t / maxT) * 100}%`,
          background: side === 'ask' ? 'oklch(0.68 0.20 20 / 0.06)' : 'oklch(0.78 0.17 150 / 0.06)',
          pointerEvents: 'none',
        }}
      />
      <span className="num" style={{ color: side === 'ask' ? 'oklch(0.78 0.20 20)' : 'oklch(0.82 0.17 150)', position: 'relative' }}>
        {fmtPrice(r.p)}
      </span>
      <span className="num" style={{ textAlign: 'right', position: 'relative' }}>{r.s.toFixed(1)}</span>
      <span className="num" style={{ textAlign: 'right', color: 'var(--ink-3)', position: 'relative' }}>{r.t.toFixed(0)}</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontSize: 11 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '8px 10px 4px', fontSize: 9, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        <span>Price</span>
        <span style={{ textAlign: 'right' }}>Size</span>
        <span style={{ textAlign: 'right' }}>Total</span>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 4 }}>
        {book.asks.slice(-11).map((a, i) => <Row key={i} r={a} side="ask" />)}
      </div>
      <div
        style={{
          padding: '8px 10px',
          borderTop: '1px solid var(--line-1)',
          borderBottom: '1px solid var(--line-1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'oklch(0.84 0.17 128 / 0.03)',
        }}
      >
        <span className="num" style={{ fontSize: 15, fontWeight: 700, color: 'var(--lime)' }}>
          {fmtPrice(asset.price)}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 10, color: 'var(--ink-3)', fontFamily: 'JetBrains Mono' }}>
          <span>
            <span style={{ color: 'var(--ink-4)' }}>Spread </span>
            {(asset.price * 0.003).toFixed(asset.price >= 1000 ? 0 : 3)}
          </span>
          <span style={{ color: 'var(--ink-4)' }}>0.300%</span>
        </span>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', paddingTop: 4 }}>
        {book.bids.slice(0, 11).map((b, i) => <Row key={i} r={b} side="bid" />)}
      </div>
    </div>
  );
}
