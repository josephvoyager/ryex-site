'use client';

import { useState } from 'react';
import { useLivePrices } from '@/lib/usePrices';
import { ALL_ASSETS, INIT_POSITIONS, INIT_ORDERS, INIT_HISTORY, DEXES } from '@/lib/data';
import { fmtUSD, fmtPct } from '@/lib/format';

export default function TradePage() {
  const { getPrice, tick } = useLivePrices();
  const [selDex, setSelDex] = useState('gmx');
  const [selSym, setSelSym] = useState('BTC');
  const [side, setSide] = useState<'long' | 'short'>('long');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [size, setSize] = useState('1000');
  const [lev, setLev] = useState(2);
  const [tab, setTab] = useState<'positions' | 'orders' | 'history'>('positions');

  const venueAssets = ALL_ASSETS.filter(a => a.dex === selDex);
  const sel = venueAssets.find(a => a.symbol === selSym) || venueAssets[0];
  const live = getPrice(sel.symbol, sel.dex);
  const price = live.price || sel.price;

  return (
    <div className="animate-in" style={{ padding: '12px 16px', maxWidth: 1600, margin: '0 auto', minHeight: 'calc(100vh - 64px)' }}>
      {/* Top bar with venue + asset + price */}
      <div style={{ background: 'linear-gradient(180deg, var(--bg-1), var(--bg-2))', border: '1px solid var(--line-1)', borderRadius: 10, padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {DEXES.map(d => {
            const active = selDex === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelDex(d.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: `1px solid ${active ? d.color : 'var(--line-1)'}`,
                  background: active ? `${d.color.replace(')', ' / 0.12)')}` : 'transparent',
                  color: active ? d.color : 'var(--ink-3)',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {d.name}
              </button>
            );
          })}
        </div>

        <select
          value={selSym}
          onChange={e => setSelSym(e.target.value)}
          style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 8, padding: '7px 10px', color: 'var(--ink-1)', fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono', cursor: 'pointer' }}
        >
          {venueAssets.map(a => (
            <option key={a.symbol} value={a.symbol}>{a.symbol}/USD</option>
          ))}
        </select>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginLeft: 12 }}>
          <span className="num" style={{ fontSize: 22, fontWeight: 700, color: live.dir > 0 ? 'var(--pos)' : live.dir < 0 ? 'var(--neg)' : 'var(--ink-1)' }}>
            ${price.toFixed(price < 1 ? 4 : 2)}
          </span>
          <span className="num" style={{ fontSize: 12, color: live.change >= 0 ? 'var(--pos)' : 'var(--neg)', fontWeight: 600 }}>
            {fmtPct(live.change)}
          </span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 18, fontSize: 11 }}>
          <Stat l="24h Vol" v={sel.vol || '—'} />
          <Stat l="Open Interest" v={sel.oi || '—'} />
          <Stat l="Funding" v={sel.funding} />
        </div>
      </div>

      {/* Main 3-column layout: chart | order entry | book */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 12 }}>
        {/* Chart placeholder */}
        <div style={{ background: 'linear-gradient(180deg, var(--bg-1), var(--bg-2))', border: '1px solid var(--line-1)', borderRadius: 10, padding: 16, minHeight: 380 }}>
          <ChartMock asset={sel} tick={tick} />
        </div>

        {/* Order entry */}
        <div style={{ background: 'linear-gradient(180deg, var(--bg-1), var(--bg-2))', border: '1px solid var(--line-1)', borderRadius: 10, padding: 16 }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            <SideBtn active={side === 'long'} onClick={() => setSide('long')} color="var(--pos)">Long</SideBtn>
            <SideBtn active={side === 'short'} onClick={() => setSide('short')} color="var(--neg)">Short</SideBtn>
          </div>

          <div style={{ display: 'flex', gap: 4, marginBottom: 12, fontSize: 11 }}>
            {(['market', 'limit'] as const).map(t => (
              <button
                key={t}
                onClick={() => setOrderType(t)}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: 6,
                  border: 'none',
                  background: orderType === t ? 'var(--bg-2)' : 'transparent',
                  color: orderType === t ? 'var(--ink-1)' : 'var(--ink-3)',
                  fontWeight: orderType === t ? 600 : 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 12 }}>
            <div className="lbl" style={{ fontSize: 9, marginBottom: 4 }}>Size (USDC)</div>
            <input
              type="number"
              value={size}
              onChange={e => setSize(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 8, color: 'var(--ink-1)', fontSize: 16, fontFamily: 'JetBrains Mono', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span className="lbl" style={{ fontSize: 9 }}>Leverage</span>
              <span className="num" style={{ fontSize: 11, fontWeight: 700, color: 'var(--lime)' }}>{lev}x</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={lev}
              onChange={e => setLev(+e.target.value)}
              style={{ width: '100%', accentColor: 'var(--lime)' }}
            />
          </div>

          <div style={{ padding: 12, borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--line-1)', display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, marginBottom: 14 }}>
            <Row l="Notional" v={fmtUSD(+size * lev)} />
            <Row l="Margin" v={fmtUSD(+size)} />
            <Row l="Entry" v={'$' + price.toFixed(2)} />
            <Row l="Liq. price" v={'$' + (side === 'long' ? price * (1 - 0.9 / lev) : price * (1 + 0.9 / lev)).toFixed(2)} c="var(--neg)" />
          </div>

          <button
            disabled={+size <= 0}
            style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: 8,
              border: 'none',
              background: side === 'long' ? 'var(--pos)' : 'var(--neg)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: +size > 0 ? 'pointer' : 'not-allowed',
              opacity: +size > 0 ? 1 : 0.5,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {side === 'long' ? 'Buy / Long' : 'Sell / Short'} {selSym}
          </button>
        </div>
      </div>

      {/* Bottom: positions / orders / history */}
      <div style={{ background: 'linear-gradient(180deg, var(--bg-1), var(--bg-2))', border: '1px solid var(--line-1)', borderRadius: 10, marginTop: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--line-1)' }}>
          {(['positions', 'orders', 'history'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '12px 20px',
                background: 'transparent',
                border: 'none',
                color: tab === t ? 'var(--ink-1)' : 'var(--ink-3)',
                fontSize: 12,
                fontWeight: tab === t ? 600 : 500,
                cursor: 'pointer',
                borderBottom: tab === t ? '2px solid var(--lime)' : '2px solid transparent',
                textTransform: 'capitalize',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'positions' && <PositionsTable />}
        {tab === 'orders' && <OrdersTable />}
        {tab === 'history' && <HistoryTable />}
      </div>
    </div>
  );
}

function Stat({ l, v }: { l: string; v: string }) {
  return (
    <div>
      <div style={{ color: 'var(--ink-4)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</div>
      <div className="num" style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{v}</div>
    </div>
  );
}

function SideBtn({ active, onClick, color, children }: { active: boolean; onClick: () => void; color: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '10px 0',
        borderRadius: 8,
        border: `1px solid ${active ? color : 'var(--line-1)'}`,
        background: active ? `${color.replace(')', ' / 0.15)')}` : 'transparent',
        color: active ? color : 'var(--ink-3)',
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      {children}
    </button>
  );
}

function Row({ l, v, c }: { l: string; v: string; c?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--ink-4)' }}>{l}</span>
      <span className="num" style={{ color: c || 'var(--ink-2)', fontWeight: 600 }}>{v}</span>
    </div>
  );
}

function ChartMock({ asset, tick }: { asset: any; tick: number }) {
  // Simple SVG line chart placeholder. Real CandleChart can be ported in next session.
  const N = 80;
  const seed = asset.symbol.charCodeAt(0);
  const rng = (i: number) => Math.sin(seed + i + tick * 0.01) * 0.5 + Math.cos(seed * i * 0.1) * 0.3 + 0.5;
  const data = Array.from({ length: N }, (_, i) => asset.price * (1 + (rng(i) - 0.5) * 0.05));
  const mn = Math.min(...data), mx = Math.max(...data);
  const w = 800, h = 340;
  const pts = data.map((v, i) => `${(i / (N - 1)) * w},${h - ((v - mn) / (mx - mn || 1)) * (h - 20) - 10}`).join(' ');

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, fontSize: 11 }}>
        {['1m', '5m', '15m', '1h', '4h', '1d'].map(tf => (
          <span key={tf} style={{ padding: '4px 10px', borderRadius: 4, background: tf === '15m' ? 'var(--bg-2)' : 'transparent', color: tf === '15m' ? 'var(--ink-1)' : 'var(--ink-3)', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>
            {tf}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 340, display: 'block' }}>
        <polygon points={`0,${h} ${pts} ${w},${h}`} fill="var(--lime)" opacity="0.08" />
        <polyline points={pts} fill="none" stroke="var(--lime)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function PositionsTable() {
  const { getPrice } = useLivePrices();
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--line-1)' }}>
          {['Asset', 'Side', 'Size', 'Margin', 'Entry', 'Mark', 'PnL', 'LTV', 'rTokens', 'Health', ''].map((h, i) => (
            <th key={i} style={{ textAlign: i > 1 ? 'right' : 'left', padding: '10px 14px', fontSize: 10, color: 'var(--ink-4)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {INIT_POSITIONS.map(p => {
          const live = getPrice(p.asset, p.dex).price || p.current;
          const pnl = (live - p.entry) / p.entry * p.size * (p.dir === 'Long' ? 1 : -1);
          return (
            <tr key={p.id} style={{ borderBottom: '1px solid var(--line-1)' }}>
              <td style={{ padding: '10px 14px' }}><span className="num" style={{ fontWeight: 700 }}>{p.asset}</span> <span style={{ color: 'var(--ink-4)', fontSize: 10 }}>{p.lev}</span></td>
              <td style={{ padding: '10px 14px' }}>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: p.dir === 'Long' ? 'oklch(0.78 0.17 150 / 0.12)' : 'oklch(0.68 0.20 20 / 0.12)', color: p.dir === 'Long' ? 'var(--pos)' : 'var(--neg)', fontWeight: 700 }}>{p.dir}</span>
              </td>
              <td className="num" style={{ padding: '10px 14px', textAlign: 'right' }}>{fmtUSD(p.size)}</td>
              <td className="num" style={{ padding: '10px 14px', textAlign: 'right' }}>{fmtUSD(p.margin)}</td>
              <td className="num" style={{ padding: '10px 14px', textAlign: 'right' }}>${p.entry.toFixed(2)}</td>
              <td className="num" style={{ padding: '10px 14px', textAlign: 'right' }}>${live.toFixed(2)}</td>
              <td className="num" style={{ padding: '10px 14px', textAlign: 'right', color: pnl >= 0 ? 'var(--pos)' : 'var(--neg)', fontWeight: 700 }}>{pnl >= 0 ? '+' : ''}{fmtUSD(pnl, 2)}</td>
              <td className="num" style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--amber)' }}>{p.ltv}%</td>
              <td className="num" style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--cobalt)' }}>{p.minted.toFixed(3)}</td>
              <td className="num" style={{ padding: '10px 14px', textAlign: 'right', color: p.health < 1.2 ? 'var(--amber)' : 'var(--pos)', fontWeight: 700 }}>{p.health.toFixed(2)}</td>
              <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                <button style={{ padding: '4px 10px', fontSize: 10, fontWeight: 700, borderRadius: 6, border: '1px solid oklch(0.68 0.20 20 / 0.40)', background: 'oklch(0.68 0.20 20 / 0.20)', color: 'oklch(0.80 0.20 20)', cursor: 'pointer' }}>Close</button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function OrdersTable() {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--line-1)' }}>
          {['Asset', 'Type', 'Side', 'Lev', 'Price', 'Size', 'Status', ''].map((h, i) => (
            <th key={i} style={{ textAlign: i > 2 ? 'right' : 'left', padding: '10px 14px', fontSize: 10, color: 'var(--ink-4)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {INIT_ORDERS.map(o => (
          <tr key={o.id} style={{ borderBottom: '1px solid var(--line-1)' }}>
            <td className="num" style={{ padding: '10px 14px', fontWeight: 700 }}>{o.asset}</td>
            <td className="num" style={{ padding: '10px 14px', color: 'var(--ink-3)' }}>{o.type}</td>
            <td style={{ padding: '10px 14px', color: 'var(--pos)' }}>{o.dir}</td>
            <td className="num" style={{ padding: '10px 14px', textAlign: 'right' }}>{o.lev}</td>
            <td className="num" style={{ padding: '10px 14px', textAlign: 'right' }}>${o.price.toFixed(2)}</td>
            <td className="num" style={{ padding: '10px 14px', textAlign: 'right' }}>{fmtUSD(o.size)}</td>
            <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--lime)', fontSize: 11, fontWeight: 600 }}>{o.status}</td>
            <td style={{ padding: '10px 14px', textAlign: 'right' }}>
              <button style={{ padding: '4px 10px', fontSize: 10, borderRadius: 6, border: '1px solid var(--line-2)', background: 'var(--bg-2)', color: 'var(--ink-2)', cursor: 'pointer' }}>Cancel</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function HistoryTable() {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--line-1)' }}>
          {['Asset', 'Side', 'Lev', 'Entry', 'Exit', 'PnL', 'Time'].map((h, i) => (
            <th key={i} style={{ textAlign: i > 2 ? 'right' : 'left', padding: '10px 14px', fontSize: 10, color: 'var(--ink-4)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {INIT_HISTORY.map((h, i) => (
          <tr key={i} style={{ borderBottom: '1px solid var(--line-1)' }}>
            <td className="num" style={{ padding: '10px 14px', fontWeight: 700 }}>{h.asset}</td>
            <td style={{ padding: '10px 14px', color: 'var(--pos)' }}>{h.dir}</td>
            <td className="num" style={{ padding: '10px 14px', textAlign: 'right' }}>{h.lev}</td>
            <td className="num" style={{ padding: '10px 14px', textAlign: 'right' }}>${h.entry.toFixed(2)}</td>
            <td className="num" style={{ padding: '10px 14px', textAlign: 'right' }}>${h.exit.toFixed(2)}</td>
            <td className="num" style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--pos)', fontWeight: 700 }}>+{fmtUSD(h.pnl, 2)}</td>
            <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--ink-4)', fontSize: 11 }}>{h.time}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
