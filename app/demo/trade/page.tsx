'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLivePrices } from '@/lib/usePrices';
import { ALL_ASSETS, INIT_POSITIONS, INIT_ORDERS, INIT_HISTORY, MINTABLE_ASSETS, DEXES, type Asset, type Position } from '@/lib/data';
import { fmtPrice, fmtPct, fmtUSD } from '@/lib/format';
import CandleChart from '@/components/app/CandleChart';
import Orderbook from '@/components/app/Orderbook';
import RecentTrades from '@/components/app/RecentTrades';
import AssetPicker, { VenuePicker } from '@/components/app/AssetPicker';

type Dex = (typeof DEXES)[0];
type OrderType = 'market' | 'limit';
type Side = 'long' | 'short';
type ObTab = 'book' | 'trades';
type BottomTab = 'balances' | 'positions' | 'orders' | 'twap' | 'trades' | 'funding' | 'history';

export default function TradePage() {
  const { getPrice, tick } = useLivePrices();
  const [selDex, setSelDex] = useState<Dex>(DEXES[0]);
  const [selAsset, setSelAsset] = useState<Asset>(ALL_ASSETS.filter((a) => a.dex === DEXES[0].id)[0]);
  useEffect(() => {
    const f = ALL_ASSETS.find((a) => a.dex === selDex.id);
    if (f) setSelAsset(f);
  }, [selDex.id]);

  const lp = getPrice(selAsset.symbol, selDex.id);
  const live = { ...selAsset, price: lp.price || selAsset.price, change: lp.change, high: lp.high || selAsset.high || selAsset.price, low: lp.low || selAsset.low || selAsset.price };

  const [leverage, setLeverage] = useState(2);
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [side, setSide] = useState<Side>('long');
  const [size, setSize] = useState('10000');
  const [limitPrice, setLimitPrice] = useState('');
  const [obTab, setObTab] = useState<ObTab>('book');
  const [bottomTab, setBottomTab] = useState<BottomTab>('positions');
  const [tpsl, setTpsl] = useState(false);
  const [reduceOnly, setReduceOnly] = useState(false);
  const [marginMode, setMarginMode] = useState<'isolated' | 'cross'>('isolated');
  const [sizePct, setSizePct] = useState(36);
  const [tp, setTp] = useState('');
  const [sl, setSl] = useState('');
  const [openConfirm, setOpenConfirm] = useState(false);
  const [closeModal, setCloseModal] = useState<Position | null>(null);

  // Mutable in-memory state for positions/orders/history (mock — replaced with on-chain in Phase 4)
  const [positions, setPositions] = useState<Position[]>(INIT_POSITIONS);
  const [orders, setOrders] = useState(INIT_ORDERS);
  const [history, setHistory] = useState(INIT_HISTORY);
  const nextId = useRef(200);

  const mintInfo = MINTABLE_ASSETS.find((m) => m.symbol === selAsset.symbol);
  const maxLTV = mintInfo?.maxLTV?.[leverage] ?? 0;
  const notional = +size * leverage;
  const liqPrice = side === 'long' ? live.price * (1 - 0.9 / leverage) : live.price * (1 + 0.9 / leverage);

  const handleOpen = () => {
    const n = +size;
    if (!n || n <= 0) return;
    setPositions((prev) => [
      {
        id: nextId.current++,
        asset: selAsset.symbol,
        dex: selDex.id,
        dir: side === 'long' ? 'Long' : 'Short',
        lev: leverage + 'x',
        size: notional,
        margin: n,
        entry: live.price,
        current: live.price,
        pnl: 0,
        pnlPct: 0,
        minted: 0,
        ltv: 0,
        liqPrice: +liqPrice.toFixed(2),
        health: 2.0,
        time: 'Just now',
      },
      ...prev,
    ]);
    setOpenConfirm(true);
    setTimeout(() => setOpenConfirm(false), 2200);
  };

  const handleClose = (p: Position) => {
    setPositions((prev) => prev.filter((x) => x.id !== p.id));
    setHistory((prev) => [
      { asset: p.asset, dir: p.dir, lev: p.lev, entry: p.entry, exit: p.current, pnl: p.pnl, pnlPct: p.pnlPct, time: 'Just now' },
      ...prev,
    ]);
    setCloseModal(null);
  };

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)' }}>
      {/* TOP TICKER BAR */}
      <div style={{ display: 'flex', alignItems: 'stretch', padding: '0 16px', gap: 0, borderBottom: '1px solid var(--line-1)', minHeight: 62, position: 'relative', zIndex: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingRight: 18, borderRight: '1px solid var(--line-1)' }}>
          <AssetPicker selAsset={selAsset} setSelAsset={setSelAsset} selDex={selDex} setSelDex={setSelDex} getPrice={getPrice} />
          <VenuePicker selDex={selDex} setSelDex={setSelDex} />
        </div>
        {[
          { l: 'Mark', v: fmtPrice(live.price), mono: true },
          { l: 'Oracle', v: fmtPrice(live.price * (1 + Math.sin(tick * 0.1) * 0.0002)), mono: true },
          {
            l: '24h Change',
            v: `${live.change >= 0 ? '+' : ''}${(live.price * live.change / 100).toFixed(live.price > 100 ? 2 : 4)} / ${fmtPct(live.change)}`,
            color: live.change >= 0 ? 'var(--pos)' : 'var(--neg)',
          },
          { l: '24h Volume', v: selAsset.vol || '—', mono: true },
          { l: 'Open Interest', v: selAsset.oi || '—', mono: true },
          {
            l: 'Funding / Countdown',
            v: (() => {
              const sec = 8 * 3600 - (Math.floor(Date.now() / 1000) % (8 * 3600));
              const hh = String(Math.floor(sec / 3600)).padStart(2, '0');
              const mm = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
              const ss = String(sec % 60).padStart(2, '0');
              return `${selAsset.funding} · ${hh}:${mm}:${ss}`;
            })(),
            color: 'var(--cobalt)',
          },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4,
              padding: '0 18px', borderRight: i < 5 ? '1px solid var(--line-1)' : 'none', minWidth: 100,
            }}
          >
            <span style={{ fontSize: 10, color: 'var(--ink-4)', fontWeight: 500 }}>{s.l}</span>
            <span className={s.mono ? 'num' : ''} style={{ fontSize: 13, fontWeight: 600, color: s.color || 'var(--ink-1)', letterSpacing: '-0.01em' }}>
              {s.v}
            </span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 12 }}>
          <button title="Favorite" style={{ padding: '6px 8px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', background: 'transparent', border: 'none', color: 'var(--ink-3)' }}>☆</button>
          <button title="Share" style={{ padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, background: 'transparent', border: 'none', color: 'var(--ink-3)' }}>Share</button>
        </div>
      </div>

      {/* MAIN AREA — chart | orderbook | order panel */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 260px 340px', minHeight: 0, gap: 0 }}>
        {/* CHART COLUMN */}
        <div style={{ display: 'flex', borderRight: '1px solid var(--line-1)', minHeight: 0 }}>
          {/* Drawing tools rail */}
          <div style={{ width: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '8px 0', borderRight: '1px solid var(--line-1)', background: 'var(--bg-inset)' }}>
            {[
              <svg key="0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="1.5" /><line x1="12" y1="3" x2="12" y2="8" /><line x1="12" y1="16" x2="12" y2="21" /><line x1="3" y1="12" x2="8" y2="12" /><line x1="16" y1="12" x2="21" y2="12" /></svg>,
              <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="4" y1="20" x2="20" y2="4" /><circle cx="4" cy="20" r="1.5" /><circle cx="20" cy="4" r="1.5" /></svg>,
              <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="12" x2="21" y2="12" /><circle cx="12" cy="12" r="1.5" /></svg>,
              <svg key="3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="5" x2="21" y2="5" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="3" y1="14" x2="21" y2="14" /><line x1="3" y1="19" x2="21" y2="19" /></svg>,
              <svg key="4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="6" width="16" height="12" rx="1" /></svg>,
              <svg key="5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 20c4-2 4-8 8-10s6-4 8-6" /></svg>,
              <svg key="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M5 6h14M12 6v14M8 20h8" /></svg>,
              <svg key="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9" /><circle cx="9" cy="10" r=".8" fill="currentColor" /><circle cx="15" cy="10" r=".8" fill="currentColor" /><path d="M8.5 14.5c1.5 1.5 5.5 1.5 7 0" /></svg>,
              <svg key="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21l8-8M11 13l3-3-6-6-3 3zM14 10l5-5 2 2-5 5z" /></svg>,
              <svg key="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 5v6a6 6 0 0 0 12 0V5M6 5h3v5M18 5h-3v5" /></svg>,
              <svg key="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="11" width="14" height="10" rx="1" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>,
              <svg key="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>,
            ].map((icon, i) => (
              <button
                key={i}
                style={{
                  width: 28, height: 28, padding: 0, borderRadius: 4, cursor: 'pointer',
                  color: 'var(--ink-3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'transparent', border: 'none',
                }}
              >
                <span style={{ width: 14, height: 14, display: 'block' }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    {icon.props.children}
                  </svg>
                </span>
              </button>
            ))}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {/* Chart toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', gap: 2, borderBottom: '1px solid var(--line-1)', minHeight: 34 }}>
              {['5m', '1h', 'D'].map((tf, i) => (
                <button
                  key={tf}
                  style={{
                    padding: '3px 8px', borderRadius: 4, border: 'none', fontSize: 11,
                    fontWeight: tf === '1h' ? 600 : 500, cursor: 'pointer',
                    fontFamily: 'JetBrains Mono',
                    background: tf === '1h' ? 'var(--glass-hover)' : 'transparent',
                    color: tf === '1h' ? 'var(--ink-1)' : 'var(--ink-3)',
                  }}
                >
                  {tf}
                  {i < 2 && <span style={{ color: 'var(--ink-4)', marginLeft: 4, fontSize: 8 }}>▾</span>}
                </button>
              ))}
              <div style={{ width: 1, height: 14, background: 'var(--line-1)', margin: '0 6px' }} />
              <button title="Compare" style={{ padding: '3px 6px', borderRadius: 4, fontSize: 12, cursor: 'pointer', color: 'var(--ink-3)', background: 'transparent', border: 'none' }}>◔</button>
              <button title="Indicators" style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, cursor: 'pointer', color: 'var(--ink-3)', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ fontFamily: 'serif', fontStyle: 'italic' }}>ƒ</span> Indicators
              </button>
              <div style={{ flex: 1 }} />
              <button title="Alert" style={{ padding: '3px 6px', borderRadius: 4, fontSize: 12, cursor: 'pointer', color: 'var(--ink-3)', background: 'transparent', border: 'none' }}>◔</button>
              <button title="Fullscreen" style={{ padding: '3px 6px', borderRadius: 4, fontSize: 12, cursor: 'pointer', color: 'var(--ink-3)', background: 'transparent', border: 'none' }}>⛶</button>
            </div>
            {/* OHLC info row */}
            <div style={{ padding: '8px 12px 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
              <span style={{ color: 'var(--ink-3)', fontFamily: 'JetBrains Mono' }}>
                {selDex.id === 'hyperliquid' ? 'xyz' : 'ryex'}:{selAsset.symbol}USD · 1h · {selDex.name}
              </span>
              <span style={{ width: 10, height: 10, borderRadius: 5, border: '1px solid var(--line-2)', display: 'inline-block' }} />
              <span className="num" style={{ color: 'var(--ink-2)', fontSize: 11 }}>
                <span style={{ color: 'var(--ink-4)' }}>O</span>{fmtPrice(live.price * 0.997)}{' '}
                <span style={{ color: 'var(--ink-4)' }}>H</span>{fmtPrice(live.high)}{' '}
                <span style={{ color: 'var(--ink-4)' }}>L</span>{fmtPrice(live.low)}{' '}
                <span style={{ color: 'var(--ink-4)' }}>C</span>{fmtPrice(live.price)}{' '}
                <span style={{ color: live.change >= 0 ? 'var(--pos)' : 'var(--neg)' }}>
                  {live.change >= 0 ? '+' : ''}{(live.price * live.change / 100).toFixed(2)} ({fmtPct(live.change)})
                </span>
              </span>
            </div>
            {/* Chart */}
            <div style={{ flex: 1, padding: '4px 6px 0', overflow: 'hidden', position: 'relative', minHeight: 0 }}>
              <CandleChart asset={live} h={360} tick={tick} fill />
            </div>
            {/* Volume pane */}
            <div style={{ flex: '0 0 110px', borderTop: '1px solid var(--line-1)', padding: '6px 0 0', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 6, left: 12, fontSize: 10, color: 'var(--ink-3)', fontFamily: 'JetBrains Mono', zIndex: 2 }}>
                Volume <span style={{ color: 'var(--violet)', marginLeft: 6 }}>SMA</span>{' '}
                <span style={{ color: 'var(--ink-2)' }}>62.912K</span>
              </div>
              <svg width="100%" height="76" style={{ display: 'block' }} viewBox="0 0 600 76" preserveAspectRatio="none">
                {(() => {
                  const N = 80;
                  const heights = Array.from({ length: N }, (_, i) => {
                    const seed = Math.sin(i * 3.1 + tick * 0.01) * 0.5 + 0.5;
                    return 8 + seed * 58;
                  });
                  const sma = heights.map((_, i) => {
                    const w = 9, lo = Math.max(0, i - w), hi = Math.min(N, i + w);
                    const slice = heights.slice(lo, hi);
                    return slice.reduce((s, v) => s + v, 0) / slice.length;
                  });
                  return (
                    <>
                      {heights.map((h, i) => {
                        const up = (i + Math.floor(tick / 30)) % 3 !== 0;
                        return (
                          <rect key={'b' + i} x={i * 7.4 + 2} y={76 - h} width={5.4} height={h}
                            fill={up ? 'oklch(0.78 0.17 150 / 0.5)' : 'oklch(0.68 0.20 20 / 0.5)'} />
                        );
                      })}
                      <polyline points={sma.map((v, i) => `${i * 7.4 + 4.7},${76 - v}`).join(' ')}
                        fill="none" stroke="var(--violet)" strokeWidth="1.2" strokeLinejoin="round" />
                    </>
                  );
                })()}
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 14px 0', fontSize: 9, color: 'var(--ink-4)', fontFamily: 'JetBrains Mono' }}>
                {(() => {
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const now = new Date();
                  return [0.05, 0.28, 0.5, 0.73, 0.95].map((p, i) => {
                    const hoursAgo = (1 - p) * 80;
                    const t = new Date(now.getTime() - hoursAgo * 3600 * 1000);
                    const isMidnight = t.getHours() < 3;
                    return (
                      <span key={i} style={{ color: isMidnight ? 'var(--ink-2)' : 'var(--ink-4)', fontWeight: isMidnight ? 600 : 400 }}>
                        {isMidnight ? `${t.getDate()} ${months[t.getMonth()]}` : `${String(t.getHours()).padStart(2, '0')}:00`}
                      </span>
                    );
                  });
                })()}
              </div>
            </div>
            {/* Time-range axis */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '4px 12px', borderTop: '1px solid var(--line-1)', gap: 4, fontSize: 10, color: 'var(--ink-3)', fontFamily: 'JetBrains Mono' }}>
              {['5y', '1y', '6m', '3m', '1m', '5d', '1d'].map((r) => (
                <button key={r} style={{ padding: '2px 6px', borderRadius: 3, fontSize: 10, cursor: 'pointer', color: 'var(--ink-3)', background: 'transparent', border: 'none' }}>
                  {r}
                </button>
              ))}
              <div style={{ flex: 1 }} />
              <span>16:07:41 (UTC+9)</span>
              <button style={{ padding: '2px 6px', borderRadius: 3, fontSize: 10, cursor: 'pointer', color: 'var(--ink-3)', background: 'transparent', border: 'none' }}>%</button>
              <button style={{ padding: '2px 6px', borderRadius: 3, fontSize: 10, cursor: 'pointer', color: 'var(--ink-3)', background: 'transparent', border: 'none' }}>log</button>
              <button style={{ padding: '2px 6px', borderRadius: 3, fontSize: 10, cursor: 'pointer', color: 'var(--ink-1)', fontWeight: 600, background: 'transparent', border: 'none' }}>auto</button>
            </div>
          </div>
        </div>

        {/* ORDERBOOK / TRADES COLUMN */}
        <div style={{ borderRight: '1px solid var(--line-1)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--line-1)' }}>
            {([{ id: 'book', l: 'Order Book' }, { id: 'trades', l: 'Trades' }] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setObTab(t.id)}
                style={{
                  flex: 1, padding: '10px 0', border: 'none', fontSize: 11,
                  fontWeight: obTab === t.id ? 600 : 500, cursor: 'pointer',
                  background: 'transparent',
                  color: obTab === t.id ? 'var(--ink-1)' : 'var(--ink-3)',
                  borderBottom: obTab === t.id ? '2px solid var(--lime)' : '2px solid transparent',
                  fontFamily: 'inherit',
                }}
              >
                {t.l}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {obTab === 'book' ? <Orderbook asset={live} /> : <RecentTrades asset={live} />}
          </div>
        </div>

        {/* ORDER PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'auto' }}>
          {/* Margin mode + leverage + classic */}
          <div style={{ display: 'flex', gap: 6, padding: '10px 14px 8px', borderBottom: '1px solid var(--line-1)' }}>
            <button
              onClick={() => setMarginMode(marginMode === 'isolated' ? 'cross' : 'isolated')}
              style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: '1px solid var(--line-2)', background: 'var(--glass-2)', color: 'var(--ink-1)', fontSize: 11, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'inherit' }}
            >
              {marginMode}
            </button>
            <button style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: '1px solid var(--line-2)', background: 'var(--glass-2)', color: 'var(--ink-1)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>
              {leverage}x
            </button>
            <button style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: '1px solid var(--line-2)', background: 'var(--glass-2)', color: 'var(--ink-1)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Classic
            </button>
          </div>
          {/* Order mode tabs */}
          <div style={{ display: 'flex', padding: '0 14px', borderBottom: '1px solid var(--line-1)', gap: 0 }}>
            {([{ id: 'market', l: 'Market' }, { id: 'limit', l: 'Limit' }, { id: 'pro', l: 'Pro' }] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => t.id !== 'pro' && setOrderType(t.id as OrderType)}
                style={{
                  flex: 1, padding: '11px 0', border: 'none', background: 'transparent',
                  cursor: 'pointer', fontSize: 12,
                  fontWeight: orderType === t.id ? 600 : 500,
                  color: orderType === t.id ? 'var(--ink-1)' : 'var(--ink-3)',
                  borderBottom: orderType === t.id ? '2px solid var(--ink-1)' : '2px solid transparent',
                  marginBottom: -1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  fontFamily: 'inherit',
                }}
              >
                {t.l}
                {t.id === 'pro' && <span style={{ fontSize: 9, color: 'var(--ink-4)' }}>▾</span>}
              </button>
            ))}
          </div>
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Buy/Sell */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {([
                { s: 'long', l: 'Buy / Long', c: 'pos' },
                { s: 'short', l: 'Sell / Short', c: 'neg' },
              ] as const).map((x) => (
                <button
                  key={x.s}
                  onClick={() => setSide(x.s as Side)}
                  style={{
                    padding: '10px 0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    background: side === x.s
                      ? x.c === 'pos' ? 'oklch(0.78 0.17 150 / 0.85)' : 'oklch(0.68 0.20 20 / 0.85)'
                      : 'var(--glass-2)',
                    color: side === x.s ? '#0a0a0f' : 'var(--ink-3)',
                    border: side === x.s ? 'none' : '1px solid var(--line-2)',
                    fontFamily: 'inherit',
                  }}
                >
                  {x.l}
                </button>
              ))}
            </div>
            {/* Available / position readout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '2px 0' }}>
              <div className="spread" style={{ fontSize: 12 }}>
                <span style={{ color: 'var(--ink-3)' }}>Available to Trade</span>
                <span className="num" style={{ fontWeight: 500 }}>
                  48,230.00 <span style={{ color: 'var(--ink-4)' }}>USDC</span>
                </span>
              </div>
              <div className="spread" style={{ fontSize: 12 }}>
                <span style={{ color: 'var(--ink-3)' }}>Current Position</span>
                <span className="num" style={{ fontWeight: 500 }}>
                  0.000 <span style={{ color: 'var(--ink-4)' }}>{selAsset.symbol}</span>
                </span>
              </div>
            </div>
            {/* Limit price */}
            {orderType === 'limit' && (
              <div className="field" style={{ padding: '0 10px' }}>
                <span className="lbl" style={{ fontSize: 10 }}>Price</span>
                <input
                  type="number" value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  placeholder={fmtPrice(live.price)}
                  style={{ textAlign: 'right', padding: '9px 0', fontFamily: 'JetBrains Mono' }}
                />
                <span className="field-affix">USD</span>
              </div>
            )}
            {/* Size */}
            <div className="field" style={{ padding: '0 10px' }}>
              <span className="lbl" style={{ fontSize: 10 }}>Size</span>
              <input
                type="number" value={size}
                onChange={(e) => setSize(e.target.value)}
                style={{ textAlign: 'right', padding: '9px 0', fontFamily: 'JetBrains Mono', fontWeight: 500 }}
              />
              <button style={{ padding: '2px 6px', borderRadius: 4, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, color: 'var(--ink-2)', background: 'transparent', border: 'none' }}>
                USDC <span style={{ fontSize: 9, color: 'var(--ink-4)' }}>▾</span>
              </button>
            </div>
            {/* % slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, position: 'relative', padding: '8px 0' }}>
                <input
                  type="range" min={0} max={100} step={1} value={sizePct}
                  onChange={(e) => {
                    const v = +e.target.value;
                    setSizePct(v);
                    setSize(String(((48230 * v / 100) / leverage) | 0));
                  }}
                  style={{
                    width: '100%',
                    background: `linear-gradient(to right, var(--ink-1) ${sizePct}%, var(--line-1) ${sizePct}%)`,
                    position: 'relative', zIndex: 2,
                    accentColor: 'var(--lime)',
                  }}
                />
                <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', display: 'flex', justifyContent: 'space-between', padding: '0 1px', pointerEvents: 'none', zIndex: 1 }}>
                  {[0, 25, 50, 75, 100].map((p) => (
                    <span key={p} style={{ width: 4, height: 4, borderRadius: 2, background: sizePct >= p ? 'var(--lime)' : 'var(--line-3)' }} />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 5, border: '1px solid var(--line-2)', minWidth: 60, justifyContent: 'flex-end' }}>
                <input
                  type="number" value={sizePct}
                  onChange={(e) => {
                    const v = Math.max(0, Math.min(100, +e.target.value || 0));
                    setSizePct(v);
                    setSize(String(((48230 * v / 100) / leverage) | 0));
                  }}
                  style={{ width: 30, background: 'transparent', border: 'none', outline: 'none', color: 'var(--ink-1)', fontSize: 12, fontWeight: 600, fontFamily: 'JetBrains Mono', textAlign: 'right' }}
                />
                <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>%</span>
              </div>
            </div>
            {/* Checkboxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--ink-2)', cursor: 'pointer' }}>
                <input type="checkbox" checked={reduceOnly} onChange={(e) => setReduceOnly(e.target.checked)} style={{ width: 14, height: 14, accentColor: 'var(--lime)' }} />
                Reduce Only
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--ink-2)', cursor: 'pointer' }}>
                <input type="checkbox" checked={tpsl} onChange={(e) => setTpsl(e.target.checked)} style={{ width: 14, height: 14, accentColor: 'var(--lime)' }} />
                Take Profit / Stop Loss
              </label>
              {tpsl && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <div className="field" style={{ padding: '0 10px' }}>
                      <input type="number" value={tp} onChange={(e) => setTp(e.target.value)} placeholder="TP Price" style={{ padding: '7px 0', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                    </div>
                    <div className="field" style={{ padding: '0 10px' }}>
                      <input type="number" placeholder="Gain" style={{ padding: '7px 0', fontSize: 11, fontFamily: 'JetBrains Mono', textAlign: 'right' }} />
                      <span className="field-affix">%</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <div className="field" style={{ padding: '0 10px' }}>
                      <input type="number" value={sl} onChange={(e) => setSl(e.target.value)} placeholder="SL Price" style={{ padding: '7px 0', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                    </div>
                    <div className="field" style={{ padding: '0 10px' }}>
                      <input type="number" placeholder="Loss" style={{ padding: '7px 0', fontSize: 11, fontFamily: 'JetBrains Mono', textAlign: 'right' }} />
                      <span className="field-affix">%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Dynamic CTA */}
            {(() => {
              const balance = 48230;
              const marginReq = notional / leverage;
              const sizeN = +size || 0;
              let label = '', disabled = false, tone: 'pos' | 'neg' | 'muted' = 'pos';
              if (sizeN <= 0) { label = 'Enter size'; disabled = true; tone = 'muted'; }
              else if (marginReq > balance) { label = 'Not Enough Margin'; disabled = true; tone = 'muted'; }
              else { label = `${side === 'long' ? 'Buy / Long' : 'Sell / Short'} ${selAsset.symbol}`; tone = side === 'long' ? 'pos' : 'neg'; }
              const bg = tone === 'muted' ? 'var(--glass-2)' : tone === 'pos' ? 'oklch(0.78 0.17 150)' : 'oklch(0.68 0.20 20)';
              const col = tone === 'muted' ? 'var(--ink-4)' : '#0a0a0f';
              return (
                <button
                  onClick={handleOpen} disabled={disabled}
                  style={{
                    width: '100%', padding: '12px 0', borderRadius: 8,
                    border: tone === 'muted' ? '1px solid var(--line-2)' : 'none',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    fontSize: 13, fontWeight: 700, background: bg, color: col,
                    boxShadow: tone === 'muted' ? 'none' : tone === 'pos'
                      ? '0 4px 14px oklch(0.78 0.17 150 / 0.25)'
                      : '0 4px 14px oklch(0.68 0.20 20 / 0.25)',
                    marginTop: 2, fontFamily: 'inherit',
                  }}
                >
                  {label}
                </button>
              );
            })()}
            {openConfirm && (
              <div style={{ padding: '7px 12px', borderRadius: 6, background: 'var(--pos-soft)', border: '1px solid oklch(0.78 0.17 150 / 0.3)', fontSize: 11, color: 'var(--pos)', fontWeight: 600, textAlign: 'center' }}>
                ✓ Position opened
              </div>
            )}
            {/* Readout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 8, borderTop: '1px solid var(--line-1)' }}>
              {[
                ['Liquidation Price', fmtUSD(liqPrice, 2)],
                ['Order Value', fmtUSD(notional)],
                ['Margin Required', fmtUSD(notional / leverage)],
                ['Slippage', 'Est: 0% / Max: 8.00%'],
                ['Fees', '+0.0086% / 0.0029%'],
              ].map(([l, v], i) => (
                <div key={i} className="spread" style={{ fontSize: 11, padding: '2px 0' }}>
                  <span style={{ color: 'var(--ink-3)', borderBottom: '1px dotted var(--line-2)', paddingBottom: 1, cursor: 'help' }}>{l}</span>
                  <span className="num" style={{ fontWeight: 500, color: 'var(--ink-2)' }}>{v}</span>
                </div>
              ))}
            </div>
            {/* RYex-unique: rToken mint row */}
            {mintInfo && (
              <div style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--cobalt-line)', background: 'var(--cobalt-soft)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="spread">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--cobalt)', fontWeight: 600, letterSpacing: '0.02em' }}>
                    <span style={{ width: 5, height: 5, borderRadius: 3, background: 'var(--cobalt)', boxShadow: '0 0 6px var(--cobalt)' }} />
                    rToken mint available
                  </span>
                  <span className="num" style={{ fontSize: 11, fontWeight: 700, color: 'var(--cobalt)' }}>r{selAsset.symbol}</span>
                </div>
                <div className="spread" style={{ fontSize: 11 }}>
                  <span style={{ color: 'var(--ink-3)' }}>Max LTV at {leverage}×</span>
                  <span className="num" style={{ fontWeight: 700, color: maxLTV >= 50 ? 'var(--pos)' : maxLTV >= 25 ? 'var(--amber)' : maxLTV > 0 ? 'var(--neg)' : 'var(--ink-4)' }}>
                    {maxLTV > 0 ? maxLTV + '%' : 'Disabled'}
                  </span>
                </div>
                {maxLTV > 0 && (
                  <div style={{ position: 'relative', height: 5, borderRadius: 3, background: 'var(--bg-inset)', overflow: 'hidden', marginTop: 2 }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '33%', background: 'var(--pos)', opacity: maxLTV <= 33 ? 1 : 0.25 }} />
                    <div style={{ position: 'absolute', left: '33%', top: 0, height: '100%', width: '33%', background: 'var(--amber)', opacity: maxLTV > 33 && maxLTV <= 66 ? 1 : 0.25 }} />
                    <div style={{ position: 'absolute', left: '66%', top: 0, height: '100%', width: '34%', background: 'var(--neg)', opacity: maxLTV > 66 ? 1 : 0.25 }} />
                    <div style={{ position: 'absolute', left: `calc(${maxLTV}% - 3px)`, top: -2, width: 2, height: 9, background: 'var(--ink-1)', boxShadow: '0 0 4px var(--ink-1)' }} />
                  </div>
                )}
                <div style={{ fontSize: 10, color: 'var(--ink-4)', lineHeight: 1.5 }}>
                  Mint up to {maxLTV}% after fill. Zones: <span style={{ color: 'var(--pos)' }}>safe</span> · <span style={{ color: 'var(--amber)' }}>caution</span> · <span style={{ color: 'var(--neg)' }}>liq</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM TABS */}
      <div style={{ borderTop: '1px solid var(--line-1)', flex: '0 0 240px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', borderBottom: '1px solid var(--line-1)', gap: 0 }}>
          {([
            { id: 'balances', l: 'Balances', n: 13 },
            { id: 'positions', l: 'Positions', n: positions.length },
            { id: 'orders', l: 'Open Orders', n: orders.length },
            { id: 'twap', l: 'TWAP' },
            { id: 'trades', l: 'Trade History' },
            { id: 'funding', l: 'Funding History' },
            { id: 'history', l: 'Order History' },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setBottomTab(t.id as BottomTab)}
              style={{
                padding: '10px 14px', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: bottomTab === t.id ? 600 : 500,
                background: 'transparent',
                color: bottomTab === t.id ? 'var(--ink-1)' : 'var(--ink-3)',
                borderBottom: bottomTab === t.id ? '2px solid var(--ink-1)' : '2px solid transparent',
                fontFamily: 'inherit',
              }}
            >
              {t.l}
              {('n' in t) && t.n != null && (
                <span style={{ marginLeft: 5, fontSize: 11, color: 'var(--ink-4)', fontFamily: 'JetBrains Mono' }}>({t.n})</span>
              )}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button style={{ padding: '6px 10px', borderRadius: 5, fontSize: 11, cursor: 'pointer', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none' }}>
            Filter <span style={{ fontSize: 9, color: 'var(--ink-4)' }}>▾</span>
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {bottomTab === 'positions' && (
            <table style={{ tableLayout: 'fixed', width: '100%' }}>
              <colgroup>
                <col style={{ width: '9%' }} />
                <col style={{ width: '7%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '7%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '9%' }} />
              </colgroup>
              <thead>
                <tr>
                  {['Asset', 'Venue', 'Side', 'Size', 'Entry', 'Mark', 'PnL', 'Health', 'Liq.', 'Minted', ''].map((h, i) => (
                    <th key={i} style={{ textAlign: i > 2 ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => {
                  const mintUSD = p.minted * p.current;
                  const dex = DEXES.find((d) => d.id === p.dex);
                  return (
                    <tr key={p.id} onClick={() => setCloseModal(p)} style={{ cursor: 'pointer' }}>
                      <td><span className="num" style={{ fontWeight: 700 }}>{p.asset}/USD</span></td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--ink-3)' }}>
                          <span style={{ width: 5, height: 5, borderRadius: 3, background: dex?.color, flexShrink: 0 }} />
                          {dex?.name}
                        </span>
                      </td>
                      <td>
                        <span className={p.dir === 'Long' ? 'chip zone-safe' : 'chip zone-liq'} style={{ fontSize: 10 }}>
                          {p.dir} {p.lev}
                        </span>
                      </td>
                      <td className="num" style={{ textAlign: 'right' }}>{fmtUSD(p.size)}</td>
                      <td className="num" style={{ textAlign: 'right' }}>{fmtPrice(p.entry)}</td>
                      <td className="num" style={{ textAlign: 'right' }}>{fmtPrice(p.current)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="num" style={{ fontWeight: 700, color: p.pnl >= 0 ? 'var(--pos)' : 'var(--neg)' }}>
                          {p.pnl >= 0 ? '+' : ''}{fmtUSD(p.pnl)}
                        </div>
                        <div className="num" style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2 }}>
                          {p.pnlPct >= 0 ? '+' : ''}{p.pnlPct}%
                        </div>
                      </td>
                      <td className="num" style={{ textAlign: 'right', fontWeight: 700, color: p.health > 2 ? 'var(--pos)' : p.health > 1.3 ? 'var(--amber)' : 'var(--neg)' }}>
                        {Math.min(5, Math.max(1.01, p.health)).toFixed(2)}
                      </td>
                      <td className="num" style={{ textAlign: 'right', color: 'var(--ink-3)' }}>
                        {p.liqPrice > 0 ? fmtUSD(p.liqPrice, 2) : 'n/a'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {p.minted > 0 ? (
                          <>
                            <div className="num" style={{ color: 'var(--cobalt)', fontWeight: 700, fontSize: 12 }}>
                              {p.minted.toFixed(2)} r{p.asset}
                            </div>
                            <div className="num" style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2 }}>≈ {fmtUSD(mintUSD)}</div>
                          </>
                        ) : (
                          <span style={{ color: 'var(--ink-4)' }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          {p.minted === 0 && (
                            <button
                              onClick={(e) => e.stopPropagation()}
                              style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid var(--cobalt-line)', background: 'var(--cobalt-soft)', color: 'var(--cobalt)', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}
                            >
                              Mint
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setCloseModal(p); }}
                            style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid var(--line-1)', background: 'transparent', color: 'var(--ink-3)', fontSize: 10, cursor: 'pointer' }}
                          >
                            Close
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {bottomTab === 'orders' && (
            <table>
              <thead>
                <tr>
                  {['Asset', 'Venue', 'Type', 'Side', 'Price', 'Size', 'Status', 'Time', ''].map((h, i) => (
                    <th key={i} style={{ textAlign: i > 3 ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const dex = DEXES.find((d) => d.id === o.dex);
                  return (
                    <tr key={o.id}>
                      <td className="num" style={{ fontWeight: 700 }}>{o.asset}/USD</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--ink-3)' }}>
                          <span style={{ width: 5, height: 5, borderRadius: 3, background: dex?.color }} />
                          {dex?.name}
                        </span>
                      </td>
                      <td>
                        <span className="chip" style={{ background: 'var(--cobalt-soft)', color: 'var(--cobalt)', borderColor: 'var(--cobalt-line)' }}>{o.type}</span>
                      </td>
                      <td style={{ color: o.dir === 'Long' ? 'var(--pos)' : 'var(--neg)', fontWeight: 500 }}>
                        {o.dir} {o.lev}
                      </td>
                      <td className="num" style={{ textAlign: 'right' }}>{fmtUSD(o.price, 2)}</td>
                      <td className="num" style={{ textAlign: 'right' }}>{fmtUSD(o.size)}</td>
                      <td style={{ textAlign: 'right', color: 'var(--amber)', fontSize: 11 }}>{o.status}</td>
                      <td style={{ textAlign: 'right', color: 'var(--ink-3)', fontSize: 11 }}>{o.time}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setOrders((prev) => prev.filter((x) => x.id !== o.id))}
                          style={{ padding: '3px 10px', borderRadius: 4, border: '1px solid oklch(0.68 0.20 20 / 0.3)', background: 'var(--neg-soft)', color: 'var(--neg)', fontSize: 10, cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {bottomTab === 'trades' && (
            <table>
              <thead>
                <tr>
                  {['Asset', 'Side', 'Entry', 'Exit', 'PnL', 'Date'].map((h, i) => (
                    <th key={i} style={{ textAlign: i > 1 ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i}>
                    <td className="num" style={{ fontWeight: 700 }}>{h.asset}/USD</td>
                    <td style={{ color: h.dir === 'Long' ? 'var(--pos)' : 'var(--neg)', fontWeight: 500 }}>
                      {h.dir} {h.lev}
                    </td>
                    <td className="num" style={{ textAlign: 'right' }}>{fmtUSD(h.entry, 2)}</td>
                    <td className="num" style={{ textAlign: 'right' }}>{fmtUSD(h.exit, 2)}</td>
                    <td className="num" style={{ textAlign: 'right', fontWeight: 700, color: h.pnl >= 0 ? 'var(--pos)' : 'var(--neg)' }}>
                      {h.pnl >= 0 ? '+' : ''}{fmtUSD(h.pnl)} ({h.pnlPct}%)
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--ink-3)', fontSize: 11 }}>{h.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {(bottomTab === 'balances' || bottomTab === 'twap' || bottomTab === 'funding' || bottomTab === 'history') && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12 }}>
              {bottomTab === 'balances' && 'Wallet balances will appear here once a wallet is connected.'}
              {bottomTab === 'twap' && 'No active TWAP orders.'}
              {bottomTab === 'funding' && 'No funding payments yet.'}
              {bottomTab === 'history' && 'No order history yet.'}
            </div>
          )}
        </div>
      </div>

      {/* CLOSE MODAL */}
      {closeModal && (() => {
        const cm = closeModal;
        const posVal = cm.size + cm.pnl;
        const debtUSD = cm.minted * cm.current;
        const redeemFee = debtUSD * 0.002;
        const closeFee = cm.size * 0.0004;
        const youGet = posVal - debtUSD - redeemFee - closeFee;
        const hasDebt = cm.minted > 0;
        return (
          <div
            onClick={() => setCloseModal(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 100, padding: 20,
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: 460, width: '100%',
                background: 'var(--bg-1)', border: '1px solid var(--line-2)',
                borderRadius: 16, overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ padding: '18px 22px 12px', borderBottom: '1px solid var(--line-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Close position</div>
                  <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2, letterSpacing: '-0.01em' }}>
                    {cm.asset}/USD <span style={{ fontSize: 14, color: 'var(--ink-3)', fontWeight: 500 }}>— {cm.dir} {cm.lev}</span>
                  </div>
                </div>
                <button
                  onClick={() => setCloseModal(null)}
                  style={{ padding: 8, borderRadius: 6, cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--ink-3)', fontSize: 18, lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
              <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ['Position size', fmtUSD(cm.size)],
                  ['Entry → Mark', `${fmtPrice(cm.entry)} → ${fmtPrice(cm.current)}`],
                  ['Unrealized PnL', `${cm.pnl >= 0 ? '+' : ''}${fmtUSD(cm.pnl)} (${cm.pnlPct}%)`, cm.pnl >= 0 ? 'var(--pos)' : 'var(--neg)'],
                ].map(([l, v, c], i) => (
                  <div key={i} className="spread" style={{ fontSize: 12 }}>
                    <span style={{ color: 'var(--ink-3)' }}>{l}</span>
                    <span className="num" style={{ fontWeight: 600, color: c || 'var(--ink-1)' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ margin: '0 22px', padding: 14, borderRadius: 10, background: hasDebt ? 'var(--cobalt-soft)' : 'var(--pos-soft)', border: `1px solid ${hasDebt ? 'var(--cobalt-line)' : 'oklch(0.78 0.17 150 / 0.3)'}` }}>
                <div className="lbl" style={{ color: hasDebt ? 'var(--cobalt)' : 'var(--pos)', marginBottom: 10 }}>
                  {hasDebt ? 'Auto-repay settlement' : 'Settlement'}
                </div>
                {([
                  ['Position value', fmtUSD(posVal), 'var(--ink-1)'],
                  hasDebt ? [`rToken debt · ${cm.minted.toFixed(4)} r${cm.asset}`, `−${fmtUSD(debtUSD)}`, 'var(--neg)'] : null,
                  hasDebt ? ['↳ Redeem fee', `−$${redeemFee.toFixed(2)}`, 'var(--ink-3)'] : null,
                  ['↳ Close fee', `−$${closeFee.toFixed(2)}`, 'var(--ink-3)'],
                ].filter(Boolean) as [string, string, string][]).map(([l, v, c], i) => (
                  <div key={i} className="spread" style={{ fontSize: 11, padding: '3px 0' }}>
                    <span style={{ color: i === 0 ? 'var(--ink-2)' : 'var(--ink-3)' }}>{l}</span>
                    <span className="num" style={{ fontWeight: 600, color: c }}>{v}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: 'var(--line-1)', margin: '8px 0' }} />
                <div className="spread">
                  <span style={{ fontWeight: 700, fontSize: 12 }}>You receive</span>
                  <span className="num" style={{ fontSize: 16, fontWeight: 800, color: youGet >= 0 ? 'var(--pos)' : 'var(--neg)' }}>
                    {fmtUSD(youGet)} <span style={{ color: 'var(--ink-3)', fontWeight: 400, fontSize: 11 }}>USDC</span>
                  </span>
                </div>
              </div>
              {hasDebt && (
                <div style={{ margin: '14px 22px 0', padding: '10px 14px', borderRadius: 8, background: 'var(--glass-3)', border: '1px solid var(--line-1)', fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.55 }}>
                  The protocol atomically buys back {cm.minted.toFixed(4)} r{cm.asset} from the AMM pool to repay your debt, then returns remaining USDC. Single transaction.
                </div>
              )}
              <div style={{ padding: '20px 22px', display: 'flex', gap: 10 }}>
                <button onClick={() => setCloseModal(null)} className="btn" style={{ flex: 1, padding: '12px 0', justifyContent: 'center' }}>
                  Cancel
                </button>
                <button
                  onClick={() => handleClose(cm)}
                  className="btn-neg"
                  style={{ flex: 1, padding: '12px 0', justifyContent: 'center', borderRadius: 8, cursor: 'pointer', fontWeight: 700, border: '1px solid oklch(0.68 0.20 20 / 0.4)' }}
                >
                  {hasDebt ? 'Close & repay' : 'Confirm close'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
