'use client';

import { useMemo, useRef, useState } from 'react';
import { useLivePrices } from '@/lib/usePrices';
import { fmtPrice, fmtUSD } from '@/lib/format';
import PageHeader from '@/components/ui/PageHeader';
import PegTag from '@/components/ui/PegTag';

type Token = { s: string; n: string; p: number; sym?: string };

const TOKENS: Token[] = [
  { s: 'USDC', n: 'USD Coin', p: 1 },
  { s: 'rBTC', n: 'RYex BTC', p: 75000, sym: 'BTC' },
  { s: 'rETH', n: 'RYex ETH', p: 2340, sym: 'ETH' },
  { s: 'rSOL', n: 'RYex SOL', p: 85, sym: 'SOL' },
  { s: 'rHYPE', n: 'RYex HYPE', p: 44, sym: 'HYPE' },
  { s: 'rXAUT', n: 'RYex XAUT', p: 4780, sym: 'XAUT' },
  { s: 'WBTC', n: 'Wrapped BTC', p: 75000 },
  { s: 'WETH', n: 'Wrapped ETH', p: 2340 },
];

type Tf = '24h' | '7d' | '30d' | '1y';
const TF_CONFIG: Record<Tf, { n: number; vol: number; diverge: number; meanRev: number }> = {
  '24h': { n: 72, vol: 0.0012, diverge: 0.0018, meanRev: 0.92 },
  '7d': { n: 168, vol: 0.0020, diverge: 0.0030, meanRev: 0.92 },
  '30d': { n: 180, vol: 0.0038, diverge: 0.0050, meanRev: 0.90 },
  '1y': { n: 240, vol: 0.0080, diverge: 0.0110, meanRev: 0.86 },
};

export default function SwapPage() {
  const { getPrice } = useLivePrices();
  const [from, setFrom] = useState<Token>(TOKENS[1]);
  const [to, setTo] = useState<Token>(TOKENS[0]);
  const [amt, setAmt] = useState('1000');
  const [pegTf, setPegTf] = useState<Tf>('7d');

  const liveP = (t: Token) => (t.sym ? getPrice(t.sym, 'gmx').price || t.p : t.p);
  const inUSD = (+amt || 0) * liveP(from);
  const outAmt = inUSD / liveP(to);
  const route = from.s === 'USDC' || to.s === 'USDC' ? `${from.s} → ${to.s}` : `${from.s} → USDC → ${to.s}`;
  const priceImpact = 0.12;

  // Focused rToken (for peg chart) — fallback to rBTC
  const focusToken = from.sym ? from : to.sym ? to : TOKENS[1];

  const pegSeries = useMemo(() => {
    const cfg = TF_CONFIG[pegTf];
    const base = focusToken.p;
    const oracle: number[] = [], amm: number[] = [];
    let o = base * (1 - cfg.vol * 2), a = o;
    for (let i = 0; i < cfg.n; i++) {
      o = o * cfg.meanRev + base * (1 - cfg.meanRev) + (Math.random() - 0.5) * base * cfg.vol;
      const shock = Math.random() < 0.03 ? (Math.random() - 0.5) * base * cfg.diverge * 3 : 0;
      const diverge = Math.sin(i / (cfg.n / 12)) * cfg.diverge + (Math.random() - 0.5) * cfg.diverge * 0.5 + shock / base;
      a = a * 0.88 + o * 0.12 + diverge * base;
      oracle.push(o);
      amm.push(a);
    }
    return { oracle, amm, sym: focusToken.sym, n: cfg.n };
  }, [focusToken.s, pegTf, focusToken.p, focusToken.sym]);

  return (
    <div className="animate-in" style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader
        title="Swap"
        oneLiner="rToken ↔ USDC AMM. Arbitrage holds the peg. No emissions, no tricks — just structural flow."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '480px 1fr', gap: 20, alignItems: 'start', maxWidth: 1100, margin: '0 auto' }}>
        {/* SWAP CARD */}
        <div className="glass" style={{ padding: 24 }}>
          <div className="lbl" style={{ marginBottom: 10 }}>You pay</div>
          <TokenRow tokens={TOKENS} token={from} setToken={setFrom} amt={amt} setAmt={setAmt} usdValue={inUSD} />

          <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
            <button
              onClick={() => { const t = from; setFrom(to); setTo(t); }}
              style={{
                width: 36, height: 36, borderRadius: 10,
                border: '1px solid var(--line-2)', background: 'var(--glass-2)',
                cursor: 'pointer', color: 'var(--ink-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-inset)', fontSize: 16, fontFamily: 'inherit',
              }}
            >
              ↓
            </button>
          </div>

          <div className="lbl" style={{ marginBottom: 10 }}>You receive</div>
          <TokenRow
            tokens={TOKENS} token={to} setToken={setTo}
            amt={outAmt.toFixed(4)} setAmt={() => {}} readOnly
            usdValue={outAmt * liveP(to)}
          />

          <div style={{ margin: '18px 0', padding: 14, borderRadius: 10, background: 'var(--bg-inset)', border: '1px solid var(--line-1)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {([
              ['Rate', `1 ${from.s} = ${(liveP(from) / liveP(to)).toFixed(6)} ${to.s}`, undefined],
              ['Route', route, undefined],
              ['Price impact', priceImpact + '%', priceImpact < 0.5 ? 'var(--pos)' : 'var(--amber)'],
              ['Slippage', '0.50%', undefined],
              ['Fee (0.3%)', '$' + (inUSD * 0.003).toFixed(2), undefined],
            ] as const).map(([l, v, c], i) => (
              <div key={i} className="spread" style={{ fontSize: 11 }}>
                <span style={{ color: 'var(--ink-3)' }}>{l}</span>
                <span className="num" style={{ color: c || 'var(--ink-1)' }}>{v}</span>
              </div>
            ))}
          </div>

          <button
            style={{
              width: '100%', padding: '13px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              background: 'linear-gradient(180deg, var(--lime), oklch(0.72 0.17 128))',
              color: '#0a0a0f',
              boxShadow: '0 8px 24px oklch(0.84 0.17 128 / 0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
              fontFamily: 'inherit',
            }}
          >
            Swap
          </button>
        </div>

        {/* PEG PANEL */}
        <PegPanel focusToken={focusToken} pegSeries={pegSeries} pegTf={pegTf} setPegTf={setPegTf} />
      </div>
    </div>
  );
}

// =============== TokenRow ===============
type TokenRowProps = {
  tokens: Token[]; token: Token; setToken: (t: Token) => void;
  amt: string; setAmt: (s: string) => void;
  readOnly?: boolean; usdValue: number;
};

function TokenRow({ tokens, token, setToken, amt, setAmt, readOnly, usdValue }: TokenRowProps) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--bg-inset)', border: '1px solid var(--line-1)' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          type="text" value={amt}
          onChange={(e) => setAmt(e.target.value)}
          readOnly={readOnly}
          style={{
            flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--ink-1)', fontSize: 28, fontWeight: 700,
            fontFamily: 'JetBrains Mono', letterSpacing: '-0.02em', padding: 0,
          }}
        />
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setOpen((o) => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', borderRadius: 999,
              border: '1px solid var(--line-2)',
              background: 'linear-gradient(180deg, var(--glass-2), var(--glass-3))',
              cursor: 'pointer', color: 'var(--ink-1)',
              boxShadow: 'var(--shadow-inset), 0 2px 8px rgba(0,0,0,0.3)',
              fontFamily: 'inherit',
            }}
          >
            <div
              style={{
                width: 22, height: 22, borderRadius: 11,
                background: token.s.startsWith('r') ? 'var(--cobalt-soft)' : 'var(--glass-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700,
                color: token.s.startsWith('r') ? 'var(--cobalt)' : 'var(--ink-2)',
                fontFamily: 'JetBrains Mono',
              }}
            >
              {token.s.slice(0, 2).toUpperCase()}
            </div>
            <span className="num" style={{ fontWeight: 700, fontSize: 14 }}>{token.s}</span>
            <span style={{ fontSize: 9, color: 'var(--ink-3)' }}>▾</span>
          </button>
          {open && (
            <>
              <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
              <div
                className="glass"
                style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 100,
                  width: 280, maxHeight: 360, overflow: 'auto', padding: 6,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                }}
              >
                {tokens.map((t) => (
                  <button
                    key={t.s}
                    onClick={() => { setToken(t); setOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 10px', width: '100%', border: 'none',
                      borderRadius: 6, cursor: 'pointer',
                      background: t.s === token.s ? 'var(--glass-hover)' : 'transparent',
                      color: 'var(--ink-1)', textAlign: 'left',
                      fontFamily: 'inherit',
                    }}
                  >
                    <div
                      style={{
                        width: 28, height: 28, borderRadius: 14,
                        background: t.s.startsWith('r') ? 'var(--cobalt-soft)' : 'var(--glass-3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700,
                        color: t.s.startsWith('r') ? 'var(--cobalt)' : 'var(--ink-2)',
                        fontFamily: 'JetBrains Mono',
                      }}
                    >
                      {t.s.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="num" style={{ fontSize: 12, fontWeight: 700 }}>{t.s}</div>
                      <div style={{ fontSize: 10, color: 'var(--ink-3)' }}>{t.n}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="num" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>
        ≈ {fmtUSD(usdValue, 2)}
      </div>
    </div>
  );
}

// =============== PegPanel ===============
type PegSeries = { oracle: number[]; amm: number[]; sym?: string; n: number };

function PegPanel({
  focusToken, pegSeries, pegTf, setPegTf,
}: { focusToken: Token; pegSeries: PegSeries; pegTf: Tf; setPegTf: (t: Tf) => void }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const lastIdx = pegSeries.oracle.length - 1;
  const idx = hoverIdx !== null ? hoverIdx : lastIdx;
  const oracleVal = pegSeries.oracle[idx];
  const ammVal = pegSeries.amm[idx];
  const devPct = (ammVal / oracleVal - 1) * 100;

  const timeAgo = (() => {
    if (hoverIdx === null) return 'now';
    const fromEnd = lastIdx - idx;
    const totalPct = fromEnd / lastIdx;
    if (pegTf === '24h') return Math.round(totalPct * 24) + 'h ago';
    if (pegTf === '7d') return Math.round(totalPct * 7) + 'd ago';
    if (pegTf === '30d') return Math.round(totalPct * 30) + 'd ago';
    const d = Math.round(totalPct * 365);
    return d > 60 ? Math.round(d / 30) + 'mo ago' : d + 'd ago';
  })();

  const priceDec = focusToken.p >= 1000 ? 0 : focusToken.p < 1 ? 4 : 2;

  return (
    <div className="glass" style={{ padding: 24 }}>
      <div className="spread" style={{ marginBottom: 12 }}>
        <div>
          <div className="lbl">Peg status</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink-1)', marginTop: 3, letterSpacing: '-0.01em' }}>
            r{pegSeries.sym} · Oracle vs AMM
          </div>
        </div>
        <div className="hstack" style={{ gap: 8 }}>
          <PegTag dev={devPct} size="md" />
          <div style={{ display: 'flex', gap: 2, padding: 2, borderRadius: 6, background: 'var(--bg-inset)', border: '1px solid var(--line-1)' }}>
            {(['24h', '7d', '30d', '1y'] as Tf[]).map((t) => (
              <button
                key={t}
                onClick={() => setPegTf(t)}
                style={{
                  padding: '3px 9px', border: 'none', borderRadius: 4, cursor: 'pointer',
                  fontSize: 10, fontWeight: pegTf === t ? 700 : 500,
                  fontFamily: 'JetBrains Mono',
                  background: pegTf === t ? 'var(--glass-hover)' : 'transparent',
                  color: pegTf === t ? 'var(--ink-1)' : 'var(--ink-3)',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hover-aware readout */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 10, fontSize: 11, color: 'var(--ink-3)', alignItems: 'baseline' }}>
        <div className="hstack" style={{ gap: 6 }}>
          <span style={{ width: 14, height: 2, background: 'var(--ink-2)', borderRadius: 1 }} />
          <span>Oracle</span>
          <span className="num" style={{ color: 'var(--ink-1)', fontWeight: 700, fontSize: 13 }}>
            {fmtUSD(oracleVal, priceDec)}
          </span>
        </div>
        <div className="hstack" style={{ gap: 6 }}>
          <span style={{ width: 14, height: 2, background: 'var(--cobalt)', borderRadius: 1 }} />
          <span>AMM</span>
          <span className="num" style={{ color: 'var(--cobalt)', fontWeight: 700, fontSize: 13 }}>
            {fmtUSD(ammVal, priceDec)}
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <span className="num" style={{ fontSize: 11, color: Math.abs(devPct) < 0.05 ? 'var(--ink-3)' : devPct > 0 ? 'var(--amber)' : 'var(--pos)', fontWeight: 700 }}>
          {devPct >= 0 ? '+' : ''}{devPct.toFixed(3)}%
        </span>
        <span className="num" style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'JetBrains Mono', minWidth: 60, textAlign: 'right' }}>
          {timeAgo}
        </span>
      </div>

      <PegChart oracle={pegSeries.oracle} amm={pegSeries.amm} pegTf={pegTf} priceDec={priceDec} onHover={setHoverIdx} />

      {/* X-axis date labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--ink-4)', fontFamily: 'JetBrains Mono', marginTop: 8, padding: '0 2px' }}>
        {(() => {
          const now = new Date();
          const ms = { '24h': 24 * 3600 * 1000, '7d': 7 * 24 * 3600 * 1000, '30d': 30 * 24 * 3600 * 1000, '1y': 365 * 24 * 3600 * 1000 }[pegTf];
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return [0, 0.25, 0.5, 0.75, 1].map((p, i) => {
            const t = new Date(now.getTime() - ms * (1 - p));
            let lbl: string;
            if (pegTf === '24h') lbl = String(t.getHours()).padStart(2, '0') + ':00';
            else if (pegTf === '7d') lbl = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][t.getDay()] + ' ' + t.getDate();
            else if (pegTf === '30d') lbl = months[t.getMonth()] + ' ' + t.getDate();
            else lbl = months[t.getMonth()] + " '" + String(t.getFullYear()).slice(-2);
            return <span key={i}>{lbl}</span>;
          });
        })()}
      </div>
    </div>
  );
}

// =============== PegChart ===============
function PegChart({
  oracle, amm, pegTf, priceDec = 2, onHover,
}: {
  oracle: number[]; amm: number[]; pegTf: Tf; priceDec?: number; onHover: (i: number | null) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const w = 620, h = 180;
  const all = [...oracle, ...amm];
  const mn = Math.min(...all), mx = Math.max(...all), rng = mx - mn || 1;
  const pad = 8;
  const scaleY = (v: number) => pad + (h - pad * 2) - ((v - mn) / rng) * (h - pad * 2);
  const scaleX = (i: number) => i * (w / (oracle.length - 1));
  const oraclePts = oracle.map((v, i) => `${scaleX(i).toFixed(1)},${scaleY(v).toFixed(1)}`).join(' ');
  const ammPts = amm.map((v, i) => `${scaleX(i).toFixed(1)},${scaleY(v).toFixed(1)}`).join(' ');
  const fillOracle = `0,${h} ${oraclePts} ${w},${h}`;

  const handleMove = (e: React.MouseEvent) => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const idx = Math.round(relX * (oracle.length - 1));
    setHoverIdx(idx);
    onHover(idx);
  };
  const handleLeave = () => {
    setHoverIdx(null);
    onHover(null);
  };

  const dateLabel = (idx: number) => {
    const now = new Date();
    const ms = { '24h': 24 * 3600 * 1000, '7d': 7 * 24 * 3600 * 1000, '30d': 30 * 24 * 3600 * 1000, '1y': 365 * 24 * 3600 * 1000 }[pegTf];
    const fromEnd = (oracle.length - 1 - idx) / (oracle.length - 1);
    const t = new Date(now.getTime() - ms * fromEnd);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (pegTf === '24h') return `${months[t.getMonth()]} ${t.getDate()}, ${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
    return `${months[t.getMonth()]} ${t.getDate()}, ${t.getFullYear()}`;
  };

  const tooltipX = hoverIdx !== null ? (hoverIdx / (oracle.length - 1)) * 100 : 0;
  const translateX = tooltipX < 18 ? '0' : tooltipX > 82 ? '-100%' : '-50%';

  return (
    <div ref={wrapRef} style={{ position: 'relative', cursor: 'crosshair' }} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: h, display: 'block' }}>
        <defs>
          <linearGradient id="pegFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ink-2)" stopOpacity="0.10" />
            <stop offset="100%" stopColor="var(--ink-2)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.2, 0.4, 0.6, 0.8].map((p) => (
          <line key={p} x1="0" y1={h * p} x2={w} y2={h * p} stroke="rgba(255,255,255,0.04)" strokeDasharray="2 4" />
        ))}
        <polygon points={fillOracle} fill="url(#pegFill)" />
        <polyline points={oraclePts} fill="none" stroke="var(--ink-2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <polyline points={ammPts} fill="none" stroke="var(--cobalt)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {hoverIdx !== null && (
          <g style={{ pointerEvents: 'none' }}>
            <line x1={scaleX(hoverIdx)} y1={0} x2={scaleX(hoverIdx)} y2={h} stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />
            <circle cx={scaleX(hoverIdx)} cy={scaleY(oracle[hoverIdx])} r="4.5" fill="var(--bg-1)" stroke="var(--ink-2)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <circle cx={scaleX(hoverIdx)} cy={scaleY(amm[hoverIdx])} r="4.5" fill="var(--bg-1)" stroke="var(--cobalt)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </g>
        )}
      </svg>

      {/* Floating tooltip */}
      {hoverIdx !== null && (
        <div
          style={{
            position: 'absolute', left: `${tooltipX}%`, top: 8,
            transform: `translateX(${translateX})`,
            padding: '10px 14px', borderRadius: 8,
            background: 'linear-gradient(180deg, rgba(28,30,44,0.98), rgba(18,20,30,0.98))',
            border: '1px solid var(--line-2)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            pointerEvents: 'none', zIndex: 10, minWidth: 180,
          }}
        >
          <div className="num" style={{ fontSize: 10, color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8, letterSpacing: '0.02em' }}>
            {dateLabel(hoverIdx)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--ink-2)' }} />
            <span style={{ fontSize: 11, color: 'var(--ink-3)', flex: 1 }}>Oracle</span>
            <span className="num" style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-1)' }}>
              {fmtUSD(oracle[hoverIdx], priceDec)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--cobalt)' }} />
            <span style={{ fontSize: 11, color: 'var(--ink-3)', flex: 1 }}>AMM</span>
            <span className="num" style={{ fontSize: 12, fontWeight: 700, color: 'var(--cobalt)' }}>
              {fmtUSD(amm[hoverIdx], priceDec)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
