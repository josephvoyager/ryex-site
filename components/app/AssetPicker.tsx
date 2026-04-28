'use client';

import { useMemo, useState } from 'react';
import { ALL_ASSETS, DEXES, type Asset } from '@/lib/data';
import { fmtPrice, fmtPct } from '@/lib/format';

type Dex = (typeof DEXES)[0];

type Props = {
  selAsset: Asset;
  setSelAsset: (a: Asset) => void;
  selDex: Dex;
  setSelDex: (d: Dex) => void;
  getPrice: (sym: string, dex: string) => { price: number; change: number };
};

export default function AssetPicker({ selAsset, setSelAsset, selDex, setSelDex, getPrice }: Props) {
  const [open, setOpen] = useState(false);
  const dexAssets = ALL_ASSETS.filter((a) => a.dex === selDex.id);
  const cats = useMemo(() => {
    const c: Record<string, Asset[]> = {};
    dexAssets.forEach((a) => {
      (c[a.cat] = c[a.cat] || []).push(a);
    });
    return c;
  }, [selDex.id]);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 12px', borderRadius: 8,
          border: '1px solid var(--line-2)', background: 'var(--glass-2)',
          cursor: 'pointer', color: 'var(--ink-1)',
          boxShadow: 'var(--shadow-inset)', fontFamily: 'inherit',
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: 3, background: selDex.color, boxShadow: `0 0 6px ${selDex.color}` }} />
        <span className="num" style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>
          {selAsset.symbol}
          <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>/USD</span>
        </span>
        <span style={{ color: 'var(--ink-3)', fontSize: 9 }}>▾</span>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
          <div
            className="glass"
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
              width: 620, maxHeight: 540, overflow: 'auto', padding: 8,
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', gap: 4, padding: '4px 4px 8px', borderBottom: '1px solid var(--line-1)', marginBottom: 6 }}>
              {DEXES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelDex(d)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 10px', borderRadius: 6,
                    border: selDex.id === d.id ? `1px solid ${d.color}` : '1px solid transparent',
                    background: selDex.id === d.id ? `color-mix(in oklch, ${d.color}, transparent 85%)` : 'transparent',
                    color: 'var(--ink-1)', cursor: 'pointer', fontSize: 11, fontWeight: 500,
                    fontFamily: 'inherit',
                  }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: d.color }} />
                  {d.name}
                  <span style={{ color: 'var(--ink-4)', fontSize: 9 }}>{d.chain}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', padding: '4px 10px', fontSize: 9, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <span>Asset</span>
              <span style={{ textAlign: 'right' }}>Price</span>
              <span style={{ textAlign: 'right' }}>24h</span>
              <span style={{ textAlign: 'right' }}>Pool APR</span>
              <span style={{ textAlign: 'right' }}>DN APR</span>
              <span style={{ textAlign: 'right' }}>Max LTV</span>
            </div>
            {Object.entries(cats).map(([cat, assets]) => (
              <div key={cat}>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', padding: '8px 10px 4px', fontWeight: 500 }}>{cat}</div>
                {assets.map((a) => {
                  const lp = getPrice(a.symbol, a.dex);
                  return (
                    <button
                      key={a.symbol + a.dex}
                      onClick={() => { setSelAsset(a); setOpen(false); }}
                      style={{
                        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                        alignItems: 'center', width: '100%', padding: '8px 10px',
                        border: 'none', borderRadius: 6, cursor: 'pointer',
                        background: a.symbol === selAsset.symbol && a.dex === selAsset.dex ? 'var(--glass-hover)' : 'transparent',
                        color: 'var(--ink-1)', fontFamily: 'inherit',
                      }}
                    >
                      <span style={{ textAlign: 'left', display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span className="num" style={{ fontWeight: 700, fontSize: 12 }}>{a.symbol}</span>
                        <span style={{ color: 'var(--ink-3)', fontSize: 10 }}>{a.name}</span>
                      </span>
                      <span className="num" style={{ textAlign: 'right', fontSize: 11 }}>{fmtPrice(lp.price)}</span>
                      <span className="num" style={{ textAlign: 'right', fontSize: 11, color: lp.change >= 0 ? 'var(--pos)' : 'var(--neg)' }}>
                        {fmtPct(lp.change)}
                      </span>
                      <span className="num" style={{ textAlign: 'right', fontSize: 11, color: 'var(--lime)', fontWeight: 600 }}>
                        {a.poolAPR ? a.poolAPR + '%' : '—'}
                      </span>
                      <span className="num" style={{ textAlign: 'right', fontSize: 11, color: 'var(--cobalt)', fontWeight: 600 }}>
                        {a.dnAPR ? a.dnAPR + '%' : '—'}
                      </span>
                      <span className="num" style={{ textAlign: 'right', fontSize: 11, color: 'var(--ink-3)' }}>
                        {a.maxLTV1x ? a.maxLTV1x + '%' : '—'}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function VenuePicker({ selDex, setSelDex }: { selDex: Dex; setSelDex: (d: Dex) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="chip"
        style={{
          cursor: 'pointer',
          borderColor: selDex.color + '55',
          background: `color-mix(in oklch, ${selDex.color}, transparent 85%)`,
          color: selDex.color,
          padding: '5px 12px', fontSize: 11, fontFamily: 'inherit',
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: 3, background: selDex.color, boxShadow: `0 0 6px ${selDex.color}` }} />
        routed via <b style={{ fontWeight: 700 }}>{selDex.name}</b>
        <span style={{ marginLeft: 4, fontSize: 9 }}>▾</span>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
          <div
            className="glass"
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
              minWidth: 200, padding: 6,
            }}
          >
            {DEXES.map((d) => (
              <button
                key={d.id}
                onClick={() => { setSelDex(d); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                  padding: '8px 10px', border: 'none', borderRadius: 6,
                  background: selDex.id === d.id ? 'var(--glass-hover)' : 'transparent',
                  color: 'var(--ink-1)', cursor: 'pointer',
                  textAlign: 'left', fontSize: 12, fontFamily: 'inherit',
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: 3, background: d.color }} />
                <span style={{ flex: 1 }}>{d.name}</span>
                <span style={{ color: 'var(--ink-4)', fontSize: 10 }}>{d.chain}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
