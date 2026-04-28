'use client';

import { useMemo, useState } from 'react';
import { useLivePrices } from '@/lib/usePrices';
import { POOLS } from '@/lib/data';
import { fmtPrice, fmtUSD } from '@/lib/format';
import PageHeader from '@/components/ui/PageHeader';
import StatPill from '@/components/ui/StatPill';

type Pool = (typeof POOLS)[0];
type Filter = 'all' | 'V2' | 'V3';

const parseTvl = (s: string) => parseFloat(s.replace(/[$MK]/g, '').replace(',', '')) * (s.includes('M') ? 1e6 : 1e3);

export default function PoolPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [addingTo, setAddingTo] = useState<Pool | null>(null);

  const filtered = POOLS.filter((p) => filter === 'all' || p.type === filter);
  const totalTVL = POOLS.reduce((s, p) => s + parseTvl(p.tvl), 0);

  if (addingTo) return <AddLiquidityPage pool={addingTo} onBack={() => setAddingTo(null)} />;

  const aprSplit = (p: Pool) => ({
    fee: +(p.apr * 0.35).toFixed(2),
    incentives: +(p.apr * 0.65).toFixed(2),
  });

  return (
    <div className="animate-in" style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader
        title="Pool"
        oneLiner="LP into rToken/USDC pools. Earn structural fees from trader mints meeting rYield buy pressure. RYex emissions on top."
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <StatPill label="Total TVL" value={fmtUSD(totalTVL)} sub={`across ${POOLS.length} pools`} tone="lime" />
        <StatPill label="24h volume" value="$12.44M" sub="+18.2% wow" />
        <StatPill label="Total fees (24h)" value="$41.2K" sub="distributed to LPs" />
        <StatPill label="Avg APR" value="13.6%" tone="lime" />
      </div>

      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 12,
          padding: 3,
          background: 'var(--bg-inset)',
          border: '1px solid var(--line-1)',
          borderRadius: 10,
          width: 'fit-content',
        }}
      >
        {([['all', 'All'], ['V2', 'V2 · rToken/USDC'], ['V3', 'V3 · Correlated']] as const).map(([id, l]) => (
          <button
            key={id}
            onClick={() => setFilter(id as Filter)}
            style={{
              padding: '7px 14px',
              border: 'none',
              borderRadius: 7,
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: filter === id ? 700 : 500,
              background: filter === id ? 'var(--glass-hover)' : 'transparent',
              color: filter === id ? 'var(--ink-1)' : 'var(--ink-3)',
              fontFamily: 'inherit',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="glass" style={{ padding: 0, overflow: 'visible' }}>
        <table>
          <thead>
            <tr>
              {['Pool', 'Type', 'TVL', '24h Volume', 'APR', 'Fee tier', ''].map((h, i) => (
                <th key={i} style={{ textAlign: i > 1 ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const [a, b] = p.pair.split('/');
              const split = aprSplit(p);
              return (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ display: 'flex' }}>
                        <div
                          style={{
                            width: 28, height: 28, borderRadius: 14,
                            background: 'var(--cobalt-soft)',
                            border: '2px solid var(--bg-1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 9, fontWeight: 700, color: 'var(--cobalt)',
                            fontFamily: 'JetBrains Mono', zIndex: 1,
                          }}
                        >
                          {a.slice(1, 3)}
                        </div>
                        <div
                          style={{
                            width: 28, height: 28, borderRadius: 14,
                            background: 'var(--glass-3)',
                            border: '2px solid var(--bg-1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 9, fontWeight: 700, color: 'var(--ink-2)',
                            fontFamily: 'JetBrains Mono', marginLeft: -10,
                          }}
                        >
                          {b.slice(0, 3)}
                        </div>
                      </div>
                      <span className="num" style={{ fontWeight: 700, fontSize: 13 }}>{p.pair}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className="chip"
                      style={{
                        background: p.type === 'V3' ? 'var(--violet-soft)' : 'var(--cobalt-soft)',
                        color: p.type === 'V3' ? 'var(--violet)' : 'var(--cobalt)',
                        borderColor: p.type === 'V3' ? 'oklch(0.72 0.16 300 / 0.3)' : 'var(--cobalt-line)',
                      }}
                    >
                      {p.type}
                    </span>
                  </td>
                  <td className="num" style={{ textAlign: 'right' }}>{p.tvl}</td>
                  <td className="num" style={{ textAlign: 'right', color: 'var(--ink-2)' }}>{p.vol}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div
                      className="apr-tooltip-wrap"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, position: 'relative' }}
                    >
                      <span className="num" style={{ fontWeight: 700, color: 'var(--lime)', fontSize: 13 }}>
                        {p.apr.toFixed(2)}%
                      </span>
                      <span style={{ display: 'inline-flex', color: 'var(--ink-4)', cursor: 'help' }} title={`Fees ${split.fee}% + Incentives ${split.incentives}%`}>
                        ⓘ
                      </span>
                    </div>
                  </td>
                  <td className="num" style={{ textAlign: 'right', color: 'var(--ink-3)' }}>{p.fee}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '5px 12px', fontSize: 11 }}
                      onClick={() => setAddingTo(p)}
                    >
                      Add liquidity
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =============== Add Liquidity sub-page ===============
function AddLiquidityPage({ pool, onBack }: { pool: Pool; onBack: () => void }) {
  const { getPrice } = useLivePrices();
  const [a, b] = pool.pair.split('/');
  const symA = a.startsWith('r') ? a.slice(1) : null;
  const pxA = symA ? getPrice(symA, 'gmx').price || 1 : a === 'WBTC' ? 75000 : a === 'WETH' ? 2340 : 1;
  const pxB = b === 'USDC' ? 1 : b.startsWith('r') ? getPrice(b.slice(1), 'gmx').price || 1 : b === 'WBTC' ? 75000 : b === 'WETH' ? 2340 : 1;
  const currentRate = pxA / pxB;

  const [rangePreset, setRangePreset] = useState<'3' | '8' | '15' | 'full'>(pool.type === 'V3' ? '8' : 'full');
  const [low, setLow] = useState((currentRate * 0.92).toFixed(currentRate < 1 ? 6 : 4));
  const [high, setHigh] = useState((currentRate * 1.08).toFixed(currentRate < 1 ? 6 : 4));
  const [amtA, setAmtA] = useState('');
  const [amtB, setAmtB] = useState('');

  const applyPreset = (p: '3' | '8' | '15' | 'full') => {
    setRangePreset(p);
    if (p === 'full') {
      setLow('0');
      setHigh('∞');
      return;
    }
    const pct = p === '3' ? 0.03 : p === '8' ? 0.08 : 0.15;
    setLow((currentRate * (1 - pct)).toFixed(currentRate < 1 ? 6 : 4));
    setHigh((currentRate * (1 + pct)).toFixed(currentRate < 1 ? 6 : 4));
  };

  const setFromA = (v: string) => { setAmtA(v); const n = +v || 0; setAmtB(((n * pxA) / pxB).toFixed(pxB < 1 ? 6 : 4)); };
  const setFromB = (v: string) => { setAmtB(v); const n = +v || 0; setAmtA(((n * pxB) / pxA).toFixed(pxA < 1 ? 6 : 4)); };

  const usdA = (+amtA || 0) * pxA;
  const usdB = (+amtB || 0) * pxB;
  const totalUsd = usdA + usdB;
  const tvlNum = parseTvl(pool.tvl);
  const poolShare = totalUsd > 0 ? (totalUsd / (tvlNum + totalUsd)) * 100 : 0;
  const est24hFee = (totalUsd * (pool.apr * 0.35) / 100) / 365;

  const bins = useMemo(() => {
    const n = 40;
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
      const x = (i - n / 2) / (n / 4);
      arr.push(Math.exp(-x * x) * (0.7 + Math.random() * 0.3));
    }
    return arr;
  }, [pool.pair]);

  const lowNum = +low || 0;
  const highNum = high === '∞' ? Infinity : +high || 0;
  const binRange = { lo: currentRate * 0.5, hi: currentRate * 1.5 };
  const binCenter = (i: number) => binRange.lo + (i / 40) * (binRange.hi - binRange.lo);
  const inRange = (i: number) => {
    const c = binCenter(i);
    return c >= lowNum && c <= (highNum === Infinity ? Number.MAX_VALUE : highNum);
  };
  const currentBinIdx = Math.round(((currentRate - binRange.lo) / (binRange.hi - binRange.lo)) * 40);

  return (
    <div className="animate-in" style={{ padding: '24px 32px', maxWidth: 720, margin: '0 auto' }}>
      <button
        onClick={onBack}
        style={{
          background: 'transparent', border: 'none', color: 'var(--ink-3)',
          cursor: 'pointer', fontSize: 12, marginBottom: 14, padding: 0,
          display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        ‹ All pools
      </button>

      <div className="glass" style={{ padding: '18px 22px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="lbl" style={{ marginBottom: 6 }}>New deposit</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex' }}>
              <TokenIcon sym={a} z={1} />
              <TokenIcon sym={b} z={0} ml={-12} />
            </div>
            <div>
              <div className="num" style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>{pool.pair}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
                <span
                  className="chip"
                  style={{
                    background: pool.type === 'V3' ? 'var(--violet-soft)' : 'var(--cobalt-soft)',
                    color: pool.type === 'V3' ? 'var(--violet)' : 'var(--cobalt)',
                    borderColor: pool.type === 'V3' ? 'oklch(0.72 0.16 300 / 0.3)' : 'var(--cobalt-line)',
                    fontSize: 10,
                  }}
                >
                  {pool.type} · {pool.fee}
                </span>
                {pool.type === 'V3' && <span className="chip" style={{ fontSize: 10 }}>Concentrated</span>}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn" style={{ padding: '7px 14px', fontSize: 11 }}>Pool info</button>
          <button className="btn" style={{ padding: '7px 14px', fontSize: 11 }} onClick={onBack}>Change</button>
        </div>
      </div>

      {/* Current price */}
      <div className="glass" style={{ padding: '12px 20px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="hstack" style={{ gap: 10 }}>
          <div style={{ width: 18, height: 18, borderRadius: 9, background: 'var(--lime-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lime)', fontSize: 12 }}>✓</div>
          <div>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Current price</span>
            <span className="num" style={{ fontSize: 12, color: 'var(--ink-3)', marginLeft: 10 }}>
              1 {a} = {fmtPrice(currentRate)} {b}
            </span>
          </div>
        </div>
        <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>≈ {fmtUSD(pxA, 2)}</span>
      </div>

      {/* V3 only: Range */}
      {pool.type === 'V3' && (
        <div className="glass" style={{ padding: 22, marginBottom: 14 }}>
          <div className="spread" style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Set price range</div>
            <span className="num" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
              1 {a} = {fmtPrice(currentRate)} {b}
            </span>
          </div>

          <div className="spread" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--bg-inset)', border: '1px solid var(--line-1)', borderRadius: 8 }}>
              {([['3', '±3%'], ['8', '±8%'], ['15', '±15%'], ['full', 'Full']] as const).map(([id, l]) => (
                <button
                  key={id}
                  onClick={() => applyPreset(id)}
                  style={{
                    padding: '6px 14px', border: 'none', borderRadius: 5, cursor: 'pointer',
                    fontSize: 11, fontWeight: rangePreset === id ? 700 : 500,
                    background: rangePreset === id ? 'var(--glass-hover)' : 'transparent',
                    color: rangePreset === id ? 'var(--ink-1)' : 'var(--ink-3)',
                    fontFamily: 'inherit',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="hstack" style={{ gap: 8 }}>
              <span className="chip" style={{ fontSize: 10, background: 'var(--lime-soft)', color: 'var(--lime)', borderColor: 'var(--lime-line)' }}>● Autopilot</span>
              <span className="num" style={{ fontSize: 12, fontWeight: 700, color: 'var(--lime)' }}>{pool.apr.toFixed(1)}% APR</span>
            </div>
          </div>

          {/* Liquidity histogram */}
          <div style={{ position: 'relative', height: 120, padding: '0 2px', marginBottom: 14 }}>
            <svg viewBox="0 0 400 120" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
              {bins.map((h, i) => {
                const x = (i / 40) * 400;
                const w = 400 / 40 - 1.5;
                const barH = h * 90;
                const y = 105 - barH;
                const active = inRange(i);
                return <rect key={i} x={x} y={y} width={w} height={barH} rx="1" fill={active ? 'oklch(0.70 0.17 258 / 0.55)' : 'rgba(255,255,255,0.10)'} />;
              })}
              {currentBinIdx >= 0 && currentBinIdx < 40 && (
                <line x1={(currentBinIdx / 40) * 400 + 5} y1="0" x2={(currentBinIdx / 40) * 400 + 5} y2="110" stroke="var(--lime)" strokeWidth="1.5" strokeDasharray="3 3" />
              )}
            </svg>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: -8, display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--ink-4)', fontFamily: 'JetBrains Mono' }}>
              {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                <span key={i}>{fmtPrice(binRange.lo + p * (binRange.hi - binRange.lo))}</span>
              ))}
            </div>
          </div>

          {/* Low / High */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {([['Low', low, setLow], ['High', high, setHigh]] as const).map(([lbl, val, setter]) => (
              <div key={lbl} style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-inset)', border: '1px solid var(--line-1)' }}>
                <div className="spread" style={{ marginBottom: 8 }}>
                  <span className="lbl">{lbl}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      style={{ padding: '2px 8px', border: '1px solid var(--line-1)', borderRadius: 5, fontSize: 12, cursor: 'pointer', background: 'transparent', color: 'var(--ink-3)' }}
                      onClick={() => { if (val === '∞') return; const n = +val; setter((n * 0.995).toFixed(pxB < 1 ? 6 : 4)); }}
                    >
                      −
                    </button>
                    <button
                      style={{ padding: '2px 8px', border: '1px solid var(--line-1)', borderRadius: 5, fontSize: 12, cursor: 'pointer', background: 'transparent', color: 'var(--ink-3)' }}
                      onClick={() => { if (val === '∞') return; const n = +val; setter((n * 1.005).toFixed(pxB < 1 ? 6 : 4)); }}
                    >
                      +
                    </button>
                    {lbl === 'High' && (
                      <button
                        style={{ padding: '2px 8px', border: '1px solid var(--line-1)', borderRadius: 5, fontSize: 11, cursor: 'pointer', color: 'var(--ink-3)', background: 'transparent' }}
                        onClick={() => setter('∞')}
                      >
                        ∞
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  value={val}
                  onChange={(e) => setter(e.target.value)}
                  style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--ink-1)', fontSize: 18, fontWeight: 700, fontFamily: 'JetBrains Mono', letterSpacing: '-0.01em', padding: 0 }}
                />
                <div className="num" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>
                  ≈ {val === '∞' ? '—' : fmtUSD((+val || 0) * pxB, 2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deposit amount */}
      <div className="glass" style={{ padding: 22, marginBottom: 14 }}>
        <div className="spread" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Set deposit amount</div>
          <div className="num" style={{ fontSize: 10, color: 'var(--ink-3)' }}>Auto-ratio enforced</div>
        </div>

        <DepositRow sym={a} balance={`12.50 ${a}`} amount={amtA} setAmount={setFromA} usd={usdA} />
        <DepositRow sym={b} balance={`48,230 ${b}`} amount={amtB} setAmount={setFromB} usd={usdB} extraStyle={{ marginTop: 10 }} />

        <div style={{ marginTop: 14, padding: 14, borderRadius: 10, background: 'var(--bg-inset)', border: '1px solid var(--line-1)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            ['Your share of pool', poolShare > 0.01 ? poolShare.toFixed(3) + '%' : '<0.01%'],
            ['Est. fees / 24h', fmtUSD(est24hFee, 2)],
            ['Pool APR', pool.apr.toFixed(2) + '%'],
            ['LP token', pool.type === 'V3' ? 'LP-NFT' : 'ERC-20 LP'],
          ].map(([l, v], i) => (
            <div key={i} className="spread" style={{ fontSize: 11 }}>
              <span style={{ color: 'var(--ink-3)' }}>{l}</span>
              <span className="num" style={{ fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 10 }}>
        <button onClick={onBack} className="btn" style={{ padding: '13px 0', fontSize: 13, fontWeight: 600, justifyContent: 'center' }}>
          Change pool
        </button>
        <button
          disabled={totalUsd <= 0}
          style={{
            padding: '13px 0', borderRadius: 10, border: 'none',
            cursor: totalUsd > 0 ? 'pointer' : 'not-allowed',
            fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
            background: totalUsd > 0 ? 'linear-gradient(180deg, var(--lime), oklch(0.72 0.17 128))' : 'var(--glass-2)',
            color: totalUsd > 0 ? '#0a0a0f' : 'var(--ink-4)',
            boxShadow: totalUsd > 0 ? '0 8px 24px oklch(0.84 0.17 128 / 0.2), inset 0 1px 0 rgba(255,255,255,0.2)' : 'none',
            fontFamily: 'inherit',
          }}
        >
          {totalUsd > 0 ? `Deposit ${fmtUSD(totalUsd, 0)}` : 'Deposit'}
        </button>
      </div>
    </div>
  );
}

function TokenIcon({ sym, z = 0, ml = 0 }: { sym: string; z?: number; ml?: number }) {
  const isR = sym.startsWith('r');
  const label = isR ? sym.slice(1, 3) : sym.slice(0, 2);
  return (
    <div
      style={{
        width: 32, height: 32, borderRadius: 16,
        background: isR ? 'var(--cobalt-soft)' : 'var(--glass-3)',
        border: '2px solid var(--bg-1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 700,
        color: isR ? 'var(--cobalt)' : 'var(--ink-2)',
        fontFamily: 'JetBrains Mono', zIndex: z, marginLeft: ml,
      }}
    >
      {label.toUpperCase()}
    </div>
  );
}

function DepositRow({
  sym, balance, amount, setAmount, usd, extraStyle,
}: {
  sym: string; balance: string; amount: string; setAmount: (s: string) => void; usd: number; extraStyle?: React.CSSProperties;
}) {
  const isR = sym.startsWith('r');
  const label = isR ? sym.slice(1, 3) : sym.slice(0, 2);
  return (
    <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--bg-inset)', border: '1px solid var(--line-1)', ...extraStyle }}>
      <div className="spread" style={{ marginBottom: 8 }}>
        <span className="lbl">Amount</span>
        <span style={{ fontSize: 10, color: 'var(--ink-3)', fontFamily: 'JetBrains Mono' }}>Balance {balance}</span>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 999,
            border: '1px solid var(--line-2)',
            background: 'linear-gradient(180deg, var(--glass-2), var(--glass-3))',
          }}
        >
          <div
            style={{
              width: 22, height: 22, borderRadius: 11,
              background: isR ? 'var(--cobalt-soft)' : 'var(--glass-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700,
              color: isR ? 'var(--cobalt)' : 'var(--ink-2)',
              fontFamily: 'JetBrains Mono',
            }}
          >
            {label.toUpperCase()}
          </div>
          <span className="num" style={{ fontWeight: 700, fontSize: 13 }}>{sym}</span>
        </div>
        <input
          type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0"
          style={{
            flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--ink-1)', fontSize: 26, fontWeight: 700,
            fontFamily: 'JetBrains Mono', letterSpacing: '-0.02em', padding: 0, textAlign: 'right',
          }}
        />
      </div>
      <div className="num" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6, textAlign: 'right' }}>
        ≈ {fmtUSD(usd, 2)}
      </div>
    </div>
  );
}
