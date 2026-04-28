'use client';

import { useEffect, useRef } from 'react';
import { fmtPrice } from '@/lib/format';

const CANDLE_COUNT = 80;

type Candle = { o: number; c: number; h: number; l: number; v: number };

type Props = {
  asset: { symbol: string; dex: string; price: number };
  h?: number;
  tick?: number;
  fill?: boolean;
};

export default function CandleChart({ asset, h = 380, tick = 0, fill = false }: Props) {
  const ref = useRef<Candle[] | null>(null);
  const sym = useRef(asset.symbol + asset.dex);

  if (!ref.current || sym.current !== asset.symbol + asset.dex) {
    const c: Candle[] = [];
    let p = asset.price * 0.97;
    for (let i = 0; i < CANDLE_COUNT; i++) {
      const o = p;
      const cl = o + (Math.random() - 0.48) * asset.price * 0.005;
      const hi = Math.max(o, cl) + Math.random() * asset.price * 0.0025;
      const lo = Math.min(o, cl) - Math.random() * asset.price * 0.0025;
      c.push({ o, c: cl, h: hi, l: lo, v: 20 + Math.random() * 80 });
      p = cl;
    }
    ref.current = c;
    sym.current = asset.symbol + asset.dex;
  }

  useEffect(() => {
    if (!ref.current || tick === 0) return;
    const c = ref.current;
    const last = c[c.length - 1];
    if (tick % 3 === 0) {
      const openPrice = last ? last.c : asset.price;
      const closePrice = asset.price;
      const hi = Math.max(openPrice, closePrice) + Math.random() * asset.price * 0.0025;
      const lo = Math.min(openPrice, closePrice) - Math.random() * asset.price * 0.0025;
      c.push({ o: openPrice, c: closePrice, h: hi, l: lo, v: 20 + Math.random() * 80 });
      while (c.length > CANDLE_COUNT) c.shift();
    } else if (last) {
      last.c = asset.price;
      last.h = Math.max(last.h, asset.price);
      last.l = Math.min(last.l, asset.price);
    }
  }, [tick, asset.price]);

  const candles = ref.current;
  const vals = candles.flatMap((c) => [c.h, c.l]);
  const mn = Math.min(...vals), mx = Math.max(...vals), rng = mx - mn || 1;
  const W = 900, GUTTER = 72, plotW = W - GUTTER;
  const gutterPct = (GUTTER / W) * 100;
  const toY = (v: number) => 4 + ((mx - v) / rng) * (h - 8);
  const candleSlot = plotW / candles.length;
  const cw = candleSlot * 0.62;
  const priceYPct = (toY(asset.price) / h) * 100;
  const yAxisLabels = [0.15, 0.35, 0.55, 0.75, 0.95].map((p) => {
    const v = mx - rng * p;
    return { y: (toY(v) / h) * 100, value: v };
  });

  return (
    <div style={{ position: 'relative', width: '100%', height: fill ? '100%' : h }}>
      <svg
        viewBox={`0 0 ${W} ${h}`}
        preserveAspectRatio={fill ? 'none' : 'xMidYMid meet'}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.84 0.17 128)" stopOpacity="0.06" />
            <stop offset="100%" stopColor="oklch(0.84 0.17 128)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.2, 0.4, 0.6, 0.8].map((p) => (
          <line key={p} x1="0" y1={h * p} x2={plotW} y2={h * p} stroke="rgba(255,255,255,0.03)" strokeDasharray="2 4" />
        ))}
        <line x1={plotW} y1="0" x2={plotW} y2={h} stroke="var(--line-1)" strokeWidth="0.5" />
        <polygon
          points={`0,${h} ${candles.map((c, i) => `${(i + 0.5) * candleSlot},${toY(c.c)}`).join(' ')} ${plotW},${h}`}
          fill="url(#cg)"
        />
        {candles.map((c, i) => {
          const x = (i + 0.5) * candleSlot;
          const col = c.c >= c.o ? 'oklch(0.78 0.17 150)' : 'oklch(0.68 0.20 20)';
          return (
            <g key={i}>
              <line x1={x} y1={toY(c.h)} x2={x} y2={toY(c.l)} stroke={col} strokeWidth="0.8" opacity="0.55" />
              <rect
                x={x - cw / 2}
                y={Math.min(toY(c.o), toY(c.c))}
                width={cw}
                height={Math.max(0.5, Math.abs(toY(c.o) - toY(c.c)))}
                fill={col}
                rx="0.5"
              />
            </g>
          );
        })}
        <line
          x1="0" y1={toY(asset.price)} x2={plotW} y2={toY(asset.price)}
          stroke="oklch(0.84 0.17 128)" strokeWidth="0.6" strokeDasharray="4 4" opacity="0.6"
        />
      </svg>

      {/* Y-axis price labels — HTML overlay */}
      {yAxisLabels.map((l, i) => (
        <div
          key={i}
          style={{
            position: 'absolute', right: 6, top: `calc(${l.y}% - 5px)`,
            fontSize: 9, color: 'var(--ink-4)', fontFamily: 'JetBrains Mono',
            pointerEvents: 'none', lineHeight: 1,
          }}
        >
          {l.value.toFixed(2)}
        </div>
      ))}

      {/* Current price chip */}
      <div
        style={{
          position: 'absolute', right: 3, top: `calc(${priceYPct}% - 9px)`,
          width: `calc(${gutterPct}% - 6px)`, minWidth: 56, maxWidth: 70, height: 18,
          borderRadius: 3, background: 'oklch(0.84 0.17 128)', color: '#0a0a0f',
          fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', boxShadow: '0 0 8px oklch(0.84 0.17 128 / 0.3)',
        }}
      >
        {fmtPrice(asset.price)}
      </div>
    </div>
  );
}
