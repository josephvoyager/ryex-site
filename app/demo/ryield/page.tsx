'use client';

import { useMemo, useState } from 'react';
import { RYIELD_VAULTS, MY_VAULTS, type RYieldVault } from '@/lib/data';
import { fmtUSD } from '@/lib/format';
import PageHeader from '@/components/ui/PageHeader';
import StatPill from '@/components/ui/StatPill';
import Sparkline, { genSpark } from '@/components/ui/Sparkline';

type Timeframe = '7d' | '30d' | '90d' | '1y';
const TF_DAYS: Record<Timeframe, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };

type EnrichedVault = RYieldVault & {
  apr: number;
  capacity: number;
  utilization: number;
  spark: number[];
};

const enrich = (v: RYieldVault): EnrichedVault => ({
  ...v,
  apr: +v.aprNeutral.toFixed(1),
  capacity: v.tvl * 3,
  utilization: Math.min(95, Math.round((v.tvl / (v.tvl * 3)) * 100)),
  spark: genSpark(v.funding8h * 100, 30, 0.12),
});

export default function RYieldPage() {
  const [selSym, setSelSym] = useState(
    (RYIELD_VAULTS.find((v) => v.highlight) || RYIELD_VAULTS[0]).symbol
  );
  const [deposit, setDeposit] = useState('10000');
  const [closingSym, setClosingSym] = useState<string | null>(null);
  const [closedSyms, setClosedSyms] = useState<string[]>([]);
  const [aprTf, setAprTf] = useState<Timeframe>('30d');

  const vaults = useMemo(() => RYIELD_VAULTS.map(enrich), []);
  const selected = useMemo(
    () => enrich(RYIELD_VAULTS.find((v) => v.symbol === selSym) || RYIELD_VAULTS[0]),
    [selSym]
  );

  // APR history simulation — gentle walk + occasional regime shifts
  const aprHistory = useMemo(() => {
    const days = TF_DAYS[aprTf];
    const base = selected.aprNeutral;
    const arr: number[] = [];
    let cur = base * 0.9;
    for (let i = 0; i < days; i++) {
      const shock = Math.random() < 0.04 ? (Math.random() - 0.5) * base * 0.4 : 0;
      cur = cur * 0.92 + base * 0.08 + (Math.random() - 0.5) * base * 0.06 + shock;
      cur = Math.max(base * 0.2, Math.min(base * 1.8, cur));
      arr.push(+cur.toFixed(2));
    }
    return arr;
  }, [selected.symbol, aprTf, selected.aprNeutral]);

  const aprMin = Math.min(...aprHistory);
  const aprMax = Math.max(...aprHistory);
  const aprAvg = aprHistory.reduce((s, v) => s + v, 0) / aprHistory.length;

  const activeMyVaults = MY_VAULTS.filter((v) => !closedSyms.includes(v.symbol));
  const totalTVL = vaults.reduce((s, v) => s + v.tvl, 0);
  const avgAPR = vaults.reduce((s, v) => s + v.apr * v.tvl, 0) / totalTVL;

  // Deposit economics — 2x short ⇒ 66.7% to long leg, 33.3% to short margin
  const depUSD = +deposit || 0;
  const longRTokenUSD = depUSD * 0.667;
  const shortMargin = depUSD * 0.333;
  const shortNotional = shortMargin * 2;

  const closePosition = (sym: string) => {
    setClosingSym(sym);
    setTimeout(() => {
      setClosedSyms((prev) => [...prev, sym]);
      setClosingSym(null);
    }, 900);
  };

  const mine = activeMyVaults.find((v) => v.symbol === selected.symbol);

  return (
    <div className="animate-in" style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader
        title="rYield"
        oneLiner="Each USDC deposit opens its own isolated vault. The protocol buys rTokens on the AMM and opens a matching short perp — your delta is hedged, funding becomes the yield."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
        <StatPill label="Total TVL" value={fmtUSD(totalTVL)} sub={`across ${vaults.length} vaults`} tone="lime" />
        <StatPill label="Avg APR" value={avgAPR.toFixed(1) + '%'} sub="TVL-weighted" tone="lime" />
        <StatPill label="Yield generated 30d" value="$412K" sub="paid to depositors" />
      </div>

      {/* Your rYield vaults */}
      {activeMyVaults.length > 0 && (
        <div className="glass" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
          <div className="spread" style={{ padding: '14px 20px', borderBottom: '1px solid var(--line-1)' }}>
            <div className="lbl">Your rYield vaults</div>
            <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em' }}>
              {activeMyVaults.length} ISOLATED · each vault closes independently
            </span>
          </div>
          <table>
            <thead>
              <tr>
                {['Vault ID', 'Asset', 'Deposited', 'rToken (long)', 'Short notional', 'APR', 'Yield earned', 'Net PnL', ''].map((h, i) => (
                  <th key={i} style={{ textAlign: i > 2 ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeMyVaults.map((v, idx) => {
                const isClosing = closingSym === v.symbol;
                const yieldEarned = v.dailyYield * v.days;
                const vaultId = `Y-${String(idx + 1).padStart(3, '0')}`;
                return (
                  <tr key={v.symbol} style={{ opacity: isClosing ? 0.5 : 1, transition: 'opacity .2s' }}>
                    <td className="num" style={{ fontWeight: 700, color: 'var(--ink-2)', fontSize: 12 }}>{vaultId}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 12, background: 'var(--lime-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'var(--lime)', fontFamily: 'JetBrains Mono' }}>
                          {v.symbol.slice(0, 3)}
                        </div>
                        <div className="num" style={{ fontWeight: 700 }}>r{v.symbol}</div>
                      </div>
                    </td>
                    <td className="num" style={{ textAlign: 'right' }}>{fmtUSD(v.deposited)}</td>
                    <td className="num" style={{ textAlign: 'right', color: 'var(--ink-2)' }}>{v.rtokenShort.toFixed(4)}</td>
                    <td className="num" style={{ textAlign: 'right', color: 'var(--ink-2)' }}>{fmtUSD(v.shortNotional)}</td>
                    <td className="num" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--lime)' }}>{v.apr.toFixed(1)}%</td>
                    <td className="num" style={{ textAlign: 'right', color: 'var(--pos)', fontWeight: 700 }}>
                      +${yieldEarned.toFixed(2)}{' '}
                      <span style={{ fontSize: 9, color: 'var(--ink-4)', fontWeight: 400, marginLeft: 3 }}>
                        +${v.dailyYield.toFixed(2)}/d
                      </span>
                    </td>
                    <td className="num" style={{ textAlign: 'right', fontWeight: 700, color: v.pnl >= 0 ? 'var(--pos)' : 'var(--neg)' }}>
                      {v.pnl >= 0 ? '+' : ''}{fmtUSD(v.pnl, 2)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-neg"
                        style={{ padding: '4px 12px', fontSize: 10, fontWeight: 700 }}
                        disabled={isClosing}
                        onClick={() => closePosition(v.symbol)}
                      >
                        {isClosing ? 'Closing…' : 'Close vault'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ padding: '10px 20px', borderTop: '1px solid var(--line-1)', fontSize: 11, color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--lime)', fontWeight: 700, fontFamily: 'JetBrains Mono' }}>+</span>
            <span>To open another vault, deposit USDC in any vault below — even on the same asset, it spawns a new isolated position.</span>
          </div>
        </div>
      )}

      {/* Two-column: vault list + detail panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* LEFT: Available vaults table */}
        <div className="glass" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="spread" style={{ padding: '14px 20px', borderBottom: '1px solid var(--line-1)' }}>
            <div className="lbl">Available vaults</div>
            <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em' }}>
              {vaults.length} LIVE
            </span>
          </div>
          <table style={{ tableLayout: 'auto' }}>
            <thead>
              <tr>
                {['Vault', 'Cat.', 'TVL', 'Funding 8h', 'Trend 30d', 'APR', 'Capacity'].map((h, i) => (
                  <th key={i} style={{ textAlign: i > 1 ? 'right' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vaults.map((v) => {
                const sel = selected.symbol === v.symbol;
                const uMine = activeMyVaults.find((m) => m.symbol === v.symbol);
                return (
                  <tr
                    key={v.symbol}
                    onClick={() => setSelSym(v.symbol)}
                    style={{
                      cursor: 'pointer',
                      background: sel ? 'var(--glass-tint)' : 'transparent',
                      borderLeft: sel ? '2px solid var(--lime)' : '2px solid transparent',
                    }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 13, background: v.highlight ? 'var(--lime-soft)' : 'var(--glass-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: v.highlight ? 'var(--lime)' : 'var(--ink-2)', fontFamily: 'JetBrains Mono', flexShrink: 0 }}>
                          {v.symbol.slice(0, 3)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div className="num" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                            r{v.symbol}{' '}
                            {uMine && (
                              <span className="chip" style={{ marginLeft: 4, background: 'var(--cobalt-soft)', color: 'var(--cobalt)', borderColor: 'var(--cobalt-line)', fontSize: 9, padding: '1px 5px' }}>
                                MY
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 1, whiteSpace: 'nowrap' }}>{v.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="chip" style={{ fontSize: 9, whiteSpace: 'nowrap' }}>{v.cat}</span>
                    </td>
                    <td className="num" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{fmtUSD(v.tvl)}</td>
                    <td className="num" style={{ textAlign: 'right', color: v.funding8h > 0.015 ? 'var(--lime)' : 'var(--ink-2)', whiteSpace: 'nowrap' }}>
                      {v.funding8h.toFixed(4)}%
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Sparkline data={v.spark} color={v.highlight ? 'oklch(0.84 0.17 128)' : 'var(--ink-3)'} w={64} h={16} />
                    </td>
                    <td className="num" style={{ textAlign: 'right', fontWeight: 700, color: v.apr >= 15 ? 'var(--lime)' : v.apr >= 5 ? 'var(--ink-1)' : 'var(--ink-3)', fontSize: 13, whiteSpace: 'nowrap' }}>
                      {v.apr.toFixed(1)}%
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', whiteSpace: 'nowrap' }}>
                        <div style={{ width: 44, height: 4, borderRadius: 2, background: 'var(--line-1)', flexShrink: 0 }}>
                          <div style={{ width: `${v.utilization}%`, height: '100%', borderRadius: 2, background: v.utilization > 85 ? 'var(--amber)' : 'var(--lime)' }} />
                        </div>
                        <span className="num" style={{ fontSize: 10, color: 'var(--ink-3)', minWidth: 28, textAlign: 'right' }}>{v.utilization}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* RIGHT: Vault detail + APR chart + deposit form */}
        <div className="glass" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 72 }}>
          <div className="spread">
            <div>
              <div className="lbl">Selected vault</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink-1)', marginTop: 3, letterSpacing: '-0.01em' }}>
                r{selected.symbol} · {selected.name}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Current APR</div>
              <div className="num" style={{ fontSize: 28, fontWeight: 800, color: 'var(--lime)', letterSpacing: '-0.02em' }}>
                {selected.apr.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* APR history chart */}
          <div style={{ padding: 14, borderRadius: 10, background: 'var(--bg-inset)', border: '1px solid var(--line-1)' }}>
            <div className="spread" style={{ marginBottom: 10 }}>
              <div className="lbl">APR history</div>
              <div style={{ display: 'flex', gap: 2, padding: 2, borderRadius: 6, background: 'var(--bg-inset)', border: '1px solid var(--line-1)' }}>
                {(['7d', '30d', '90d', '1y'] as Timeframe[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setAprTf(t)}
                    style={{
                      padding: '3px 9px', border: 'none', borderRadius: 4, cursor: 'pointer',
                      fontSize: 10, fontWeight: aprTf === t ? 700 : 500,
                      fontFamily: 'JetBrains Mono',
                      background: aprTf === t ? 'var(--glass-hover)' : 'transparent',
                      color: aprTf === t ? 'var(--ink-1)' : 'var(--ink-3)',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ position: 'relative', height: 130 }}>
              <Sparkline data={aprHistory} color="oklch(0.84 0.17 128)" w={440} h={130} fill />
              {/* Average dashed line */}
              <div
                style={{
                  position: 'absolute',
                  left: 0, right: 0,
                  top: `${(1 - (aprAvg - aprMin) / (aprMax - aprMin || 1)) * 115 + 5}px`,
                  borderTop: '1px dashed oklch(0.84 0.17 128 / 0.5)',
                  pointerEvents: 'none',
                }}
              />
              <div style={{ position: 'absolute', left: 4, top: 2, fontSize: 9, color: 'var(--ink-4)', fontFamily: 'JetBrains Mono' }}>
                {aprMax.toFixed(1)}%
              </div>
              <div style={{ position: 'absolute', left: 4, bottom: 2, fontSize: 9, color: 'var(--ink-4)', fontFamily: 'JetBrains Mono' }}>
                {aprMin.toFixed(1)}%
              </div>
              <div
                style={{
                  position: 'absolute', right: 4,
                  top: `${(1 - (aprAvg - aprMin) / (aprMax - aprMin || 1)) * 115}px`,
                  fontSize: 9, color: 'var(--lime)', fontFamily: 'JetBrains Mono', fontWeight: 700,
                }}
              >
                avg {aprAvg.toFixed(1)}%
              </div>
            </div>
            <div style={{ display: 'flex', gap: 18, marginTop: 8, fontSize: 10, color: 'var(--ink-3)' }}>
              <div className="hstack" style={{ gap: 4 }}>
                <span style={{ color: 'var(--ink-4)' }}>Min</span>
                <span className="num" style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{aprMin.toFixed(1)}%</span>
              </div>
              <div className="hstack" style={{ gap: 4 }}>
                <span style={{ color: 'var(--ink-4)' }}>Avg</span>
                <span className="num" style={{ color: 'var(--lime)', fontWeight: 700 }}>{aprAvg.toFixed(1)}%</span>
              </div>
              <div className="hstack" style={{ gap: 4 }}>
                <span style={{ color: 'var(--ink-4)' }}>Max</span>
                <span className="num" style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{aprMax.toFixed(1)}%</span>
              </div>
              <div style={{ flex: 1 }} />
              <div className="num" style={{ color: 'var(--ink-4)', fontFamily: 'JetBrains Mono' }}>
                {aprTf} · simulated
              </div>
            </div>
          </div>

          {/* Your position card (if exists in selected vault) */}
          {mine && (() => {
            const yieldEarned = mine.dailyYield * mine.days;
            return (
              <div style={{ padding: 14, borderRadius: 10, background: 'var(--cobalt-soft)', border: '1px solid var(--cobalt-line)' }}>
                <div className="spread" style={{ marginBottom: 10 }}>
                  <div className="lbl" style={{ color: 'var(--cobalt)' }}>Your position</div>
                  <span className="num" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{mine.days}d active</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 9, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Deposited</div>
                    <div className="num" style={{ fontSize: 14, fontWeight: 700, marginTop: 3 }}>{fmtUSD(mine.deposited)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Daily yield</div>
                    <div className="num" style={{ fontSize: 14, fontWeight: 700, marginTop: 3, color: 'var(--pos)' }}>+${mine.dailyYield.toFixed(2)}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingTop: 10, borderTop: '1px solid var(--line-1)' }}>
                  <div>
                    <div style={{ fontSize: 9, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Yield earned</div>
                    <div className="num" style={{ fontSize: 14, fontWeight: 700, marginTop: 3, color: 'var(--pos)' }}>+${yieldEarned.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Net PnL</div>
                    <div className="num" style={{ fontSize: 14, fontWeight: 700, marginTop: 3, color: mine.pnl >= 0 ? 'var(--pos)' : 'var(--neg)' }}>
                      {mine.pnl >= 0 ? '+' : ''}${mine.pnl.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Deposit input */}
          <div>
            <div className="spread" style={{ marginBottom: 6 }}>
              <span className="lbl">Deposit (USDC)</span>
              <span style={{ fontSize: 10, color: 'var(--ink-3)', fontFamily: 'JetBrains Mono' }}>Balance 48,230</span>
            </div>
            <div className="field">
              <input type="number" value={deposit} onChange={(e) => setDeposit(e.target.value)} />
              <span className="field-affix">USDC</span>
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
              {[10, 25, 50, 75, 100].map((p) => (
                <button
                  key={p}
                  onClick={() => setDeposit(Math.round((48230 * p) / 100).toString())}
                  style={{
                    flex: 1, padding: '5px 0', borderRadius: 5,
                    border: '1px solid var(--line-1)', background: 'transparent',
                    color: 'var(--ink-3)', fontSize: 10, cursor: 'pointer',
                    fontFamily: 'JetBrains Mono',
                  }}
                >
                  {p === 100 ? 'MAX' : p + '%'}
                </button>
              ))}
            </div>
          </div>

          {/* Execution steps */}
          <div style={{ padding: 14, borderRadius: 10, background: 'var(--bg-inset)', border: '1px solid var(--line-1)' }}>
            <div className="lbl" style={{ marginBottom: 10 }}>Execution · one tx</div>
            {([
              ['Long leg', `Buy ${longRTokenUSD > 0 ? (longRTokenUSD / selected.price).toFixed(4) : '—'} r${selected.symbol} on AMM`, fmtUSD(longRTokenUSD, 0), 'lime'],
              ['Short leg', `Open ${selected.symbol}/USD short perp @ 2×`, fmtUSD(shortMargin, 0) + ' margin', 'lime'],
              ['Net delta', 'Long rToken + Short perp = 0', '$0', 'cobalt'],
            ] as const).map(([a, b, c, dot], i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0',
                  borderTop: i > 0 ? '1px solid var(--line-1)' : 'none',
                }}
              >
                <div
                  style={{
                    width: 8, height: 8, borderRadius: 4,
                    background: dot === 'cobalt' ? 'var(--cobalt)' : 'var(--lime)',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{a}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 1 }}>{b}</div>
                </div>
                <div className="num" style={{ fontSize: 11, color: 'var(--ink-2)', fontWeight: 500 }}>{c}</div>
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
            {mine ? `Top up r${selected.symbol} vault` : `Deposit into r${selected.symbol} vault`}
          </button>

          <div style={{ fontSize: 10, color: 'var(--ink-4)', textAlign: 'center', lineHeight: 1.5 }}>
            Negative funding periods are covered by the Reserve Fund before impacting principal.
          </div>
        </div>
      </div>
    </div>
  );
}
