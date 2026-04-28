'use client';

import { useMemo, useState } from 'react';
import { useLivePrices } from '@/lib/usePrices';
import { INIT_POSITIONS, MINTABLE_ASSETS, getRLTQueue } from '@/lib/data';
import { fmtUSD } from '@/lib/format';
import PageHeader from '@/components/ui/PageHeader';
import StatPill from '@/components/ui/StatPill';

export default function RTokenPage() {
  const { getPrice } = useLivePrices();
  const [selectedPosId, setSelectedPosId] = useState<number | null>(INIT_POSITIONS[0]?.id ?? null);
  const [mintAmt, setMintAmt] = useState('1000');

  const selectedPos = INIT_POSITIONS.find(p => p.id === selectedPosId);
  const meta = selectedPos ? MINTABLE_ASSETS.find(m => m.symbol === selectedPos.asset) : null;
  const oraclePrice = selectedPos ? (getPrice(selectedPos.asset, selectedPos.dex).price || selectedPos.current) : 0;

  const lev = selectedPos ? +selectedPos.lev.replace('x', '') : 1;
  const maxLTV = meta?.maxLTV[lev] || 80;

  const positionValue = selectedPos ? selectedPos.margin + (oraclePrice - selectedPos.entry) / selectedPos.entry * selectedPos.size * (selectedPos.dir === 'Long' ? 1 : -1) : 0;
  const maxBorrow = positionValue * maxLTV / 100;
  const currentDebt = selectedPos ? selectedPos.minted * oraclePrice : 0;
  const availableBorrow = Math.max(0, maxBorrow - currentDebt);

  const rltQueue = useMemo(() => getRLTQueue(), []);
  const totalSupply = INIT_POSITIONS.reduce((s, p) => s + p.minted * (getPrice(p.asset, p.dex).price || p.current), 0);

  return (
    <div className="animate-in" style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader
        title="rToken"
        oneLiner="Liquid ERC-20 minted against any open perp position. Trade stays alive, capital walks free."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 14 }}>
        <StatPill label="rToken supply" value={fmtUSD(184_320_000)} sub="minted across all assets" tone="cobalt" />
        <StatPill label="Active vaults" value="2,847" sub="open positions minting" tone="lime" />
        <StatPill label="Collateral locked" value={fmtUSD(356_100_000)} sub="perp position notional" />
        <StatPill label="RLT capacity" value={`${rltQueue.length} vaults`} sub="redeemable now" tone="amber" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Mint card */}
        <div style={{ background: 'linear-gradient(180deg, var(--bg-1), var(--bg-2))', border: '1px solid var(--line-1)', borderRadius: 12, padding: 20 }}>
          <div className="lbl" style={{ marginBottom: 14 }}>Mint rToken</div>

          {/* Position selector */}
          <div style={{ marginBottom: 16 }}>
            <div className="lbl" style={{ marginBottom: 6, fontSize: 9 }}>Select open position</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 180, overflowY: 'auto' }}>
              {INIT_POSITIONS.map(p => {
                const sel = p.id === selectedPosId;
                const live = getPrice(p.asset, p.dex).price || p.current;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPosId(p.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: `1px solid ${sel ? 'var(--lime-line)' : 'var(--line-1)'}`,
                      background: sel ? 'var(--lime-soft)' : 'var(--bg-2)',
                      color: 'var(--ink-1)',
                      cursor: 'pointer',
                      fontSize: 12,
                      textAlign: 'left',
                    }}
                  >
                    <span>
                      <strong>{p.asset}</strong> <span style={{ color: 'var(--ink-4)' }}>{p.lev} {p.dir}</span>
                    </span>
                    <span className="num" style={{ color: 'var(--ink-2)' }}>{fmtUSD(p.size)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedPos && (
            <>
              {/* Position details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
                {[
                  ['Net value', fmtUSD(positionValue), 'var(--ink-1)'],
                  ['Max LTV', maxLTV + '%', 'var(--lime)'],
                  ['Available', fmtUSD(availableBorrow), 'var(--cobalt)'],
                ].map(([l, v, c], i) => (
                  <div key={i} style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--line-1)' }}>
                    <div style={{ fontSize: 9, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{l}</div>
                    <div className="num" style={{ fontSize: 13, fontWeight: 700, color: c }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Mint amount input */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>Mint amount</span>
                  <span style={{ fontSize: 10, color: 'var(--ink-3)', fontFamily: 'JetBrains Mono' }}>
                    Max: {fmtUSD(availableBorrow)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 8 }}>
                  <input
                    type="number"
                    value={mintAmt}
                    onChange={e => setMintAmt(e.target.value)}
                    style={{ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', color: 'var(--ink-1)', fontSize: 18, fontFamily: 'JetBrains Mono', outline: 'none' }}
                  />
                  <span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'JetBrains Mono' }}>USDC</span>
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  {[25, 50, 75, 100].map(p => (
                    <button
                      key={p}
                      onClick={() => setMintAmt(String(Math.round(availableBorrow * p / 100)))}
                      style={{ flex: 1, padding: '6px 0', borderRadius: 6, border: '1px solid var(--line-1)', background: 'var(--bg-2)', color: 'var(--ink-3)', fontSize: 11, cursor: 'pointer', fontFamily: 'JetBrains Mono', fontWeight: 600 }}
                    >
                      {p === 100 ? 'Max' : p + '%'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={+mintAmt <= 0 || +mintAmt > availableBorrow}
                style={{
                  width: '100%',
                  padding: '14px 0',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  background: +mintAmt > 0 && +mintAmt <= availableBorrow ? 'var(--lime)' : 'var(--bg-2)',
                  color: +mintAmt > 0 && +mintAmt <= availableBorrow ? 'var(--bg-0)' : 'var(--ink-4)',
                }}
              >
                Mint {(+mintAmt / oraclePrice).toFixed(4)} r{selectedPos.asset}
              </button>
            </>
          )}
        </div>

        {/* My rToken positions */}
        <div style={{ background: 'linear-gradient(180deg, var(--bg-1), var(--bg-2))', border: '1px solid var(--line-1)', borderRadius: 12, padding: 20 }}>
          <div className="lbl" style={{ marginBottom: 14 }}>Your minted rTokens</div>
          {INIT_POSITIONS.filter(p => p.minted > 0).map(p => {
            const live = getPrice(p.asset, p.dex).price || p.current;
            const debt = p.minted * live;
            return (
              <div key={p.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--line-1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700 }}>r{p.asset}</span>
                  <span className="num" style={{ color: 'var(--cobalt)', fontWeight: 700 }}>{p.minted.toFixed(4)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-4)' }}>
                  <span>LTV {p.ltv}% · Health {p.health.toFixed(2)}</span>
                  <span className="num">{fmtUSD(debt)}</span>
                </div>
              </div>
            );
          })}
          <p style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 12, lineHeight: 1.5 }}>
            Total minted across all positions: <strong style={{ color: 'var(--ink-1)' }}>{fmtUSD(totalSupply)}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
