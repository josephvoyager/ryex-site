'use client';

import { useState } from 'react';
import { RYIELD_VAULTS, MY_VAULTS } from '@/lib/data';
import { fmtUSD } from '@/lib/format';
import PageHeader from '@/components/ui/PageHeader';
import StatPill from '@/components/ui/StatPill';
import Sparkline, { genSpark } from '@/components/ui/Sparkline';

export default function RYieldPage() {
  const [selSym, setSelSym] = useState(RYIELD_VAULTS[0].symbol);
  const [depositAmt, setDepositAmt] = useState('1000');

  const totalTVL = RYIELD_VAULTS.reduce((s, v) => s + v.tvl, 0);
  const avgAPR = RYIELD_VAULTS.reduce((s, v) => s + v.aprNeutral * v.tvl, 0) / totalTVL;
  const selVault = RYIELD_VAULTS.find(v => v.symbol === selSym) || RYIELD_VAULTS[0];

  return (
    <div className="animate-in" style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader
        title="rYield"
        oneLiner="Each USDC deposit opens its own isolated vault. The protocol buys rTokens on the AMM and opens a matching short perp — your delta is hedged, funding becomes the yield."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
        <StatPill label="Total TVL" value={fmtUSD(totalTVL)} sub={`across ${RYIELD_VAULTS.length} vaults`} tone="lime" />
        <StatPill label="Avg APR" value={avgAPR.toFixed(1) + '%'} sub="TVL-weighted" tone="lime" />
        <StatPill label="Yield generated 30d" value="$412K" sub="paid to depositors" />
      </div>

      {/* Your vaults */}
      {MY_VAULTS.length > 0 && (
        <div style={{ background: 'linear-gradient(180deg, var(--bg-1), var(--bg-2))', border: '1px solid var(--line-1)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line-1)', display: 'flex', justifyContent: 'space-between' }}>
            <div className="lbl">Your rYield vaults</div>
            <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em' }}>
              {MY_VAULTS.length} ISOLATED · each closes independently
            </span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line-1)' }}>
                {['Vault ID', 'Asset', 'Deposited', 'Long (rToken)', 'Short notional', 'APR', 'Yield earned', 'Net PnL', ''].map((h, i) => (
                  <th key={i} style={{ textAlign: i > 1 ? 'right' : 'left', padding: '10px 14px', fontSize: 10, color: 'var(--ink-4)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MY_VAULTS.map((v, i) => {
                const yieldEarned = v.dailyYield * v.days;
                const vaultId = `Y-${String(i + 1).padStart(3, '0')}`;
                return (
                  <tr key={v.symbol} style={{ borderBottom: '1px solid var(--line-1)' }}>
                    <td className="num" style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--ink-2)' }}>{vaultId}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="num" style={{ fontWeight: 700 }}>r{v.symbol}</span>
                    </td>
                    <td className="num" style={{ padding: '12px 14px', textAlign: 'right' }}>{fmtUSD(v.deposited)}</td>
                    <td className="num" style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--ink-2)' }}>{v.rtokenShort.toFixed(4)}</td>
                    <td className="num" style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--ink-2)' }}>{fmtUSD(v.shortNotional)}</td>
                    <td className="num" style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--lime)' }}>{v.apr.toFixed(1)}%</td>
                    <td className="num" style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--pos)', fontWeight: 700 }}>+${yieldEarned.toFixed(2)}</td>
                    <td className="num" style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: v.pnl >= 0 ? 'var(--pos)' : 'var(--neg)' }}>
                      {v.pnl >= 0 ? '+' : ''}{fmtUSD(v.pnl, 2)}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button style={{ padding: '4px 12px', fontSize: 10, fontWeight: 700, borderRadius: 6, border: '1px solid oklch(0.68 0.20 20 / 0.40)', background: 'oklch(0.68 0.20 20 / 0.20)', color: 'oklch(0.80 0.20 20)', cursor: 'pointer' }}>
                        Close vault
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ padding: '10px 20px', borderTop: '1px solid var(--line-1)', fontSize: 11, color: 'var(--ink-4)' }}>
            <span style={{ color: 'var(--lime)', fontWeight: 700, fontFamily: 'JetBrains Mono', marginRight: 6 }}>+</span>
            To open another vault, deposit USDC in any vault below — even on the same asset, it spawns a new isolated position.
          </div>
        </div>
      )}

      {/* Available vaults + deposit panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* Available vaults */}
        <div style={{ background: 'linear-gradient(180deg, var(--bg-1), var(--bg-2))', border: '1px solid var(--line-1)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line-1)', display: 'flex', justifyContent: 'space-between' }}>
            <div className="lbl">Available vaults</div>
            <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'JetBrains Mono' }}>{RYIELD_VAULTS.length} LIVE</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line-1)' }}>
                {['Vault', 'Cat.', 'TVL', 'Funding 8h', 'Trend 30d', 'APR'].map((h, i) => (
                  <th key={i} style={{ textAlign: i > 1 ? 'right' : 'left', padding: '10px 14px', fontSize: 10, color: 'var(--ink-4)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RYIELD_VAULTS.map(v => {
                const sel = selSym === v.symbol;
                return (
                  <tr
                    key={v.symbol}
                    onClick={() => setSelSym(v.symbol)}
                    style={{
                      borderBottom: '1px solid var(--line-1)',
                      cursor: 'pointer',
                      background: sel ? 'rgba(189,227,64,0.05)' : 'transparent',
                      borderLeft: sel ? '2px solid var(--lime)' : '2px solid transparent',
                    }}
                  >
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <span className="num" style={{ fontWeight: 700 }}>r{v.symbol} vault</span>
                      <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 1 }}>{v.name}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'var(--bg-2)', border: '1px solid var(--line-2)', color: 'var(--ink-3)' }}>{v.cat}</span>
                    </td>
                    <td className="num" style={{ padding: '12px 14px', textAlign: 'right' }}>{fmtUSD(v.tvl)}</td>
                    <td className="num" style={{ padding: '12px 14px', textAlign: 'right', color: v.funding8h > 0.015 ? 'var(--lime)' : 'var(--ink-2)' }}>{v.funding8h.toFixed(4)}%</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <Sparkline data={genSpark(100, 24, 0.02)} color={v.highlight ? 'var(--lime)' : 'var(--ink-3)'} w={64} h={16} />
                    </td>
                    <td className="num" style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: v.aprNeutral >= 15 ? 'var(--lime)' : v.aprNeutral >= 5 ? 'var(--ink-1)' : 'var(--ink-3)' }}>
                      {v.aprNeutral.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Deposit panel */}
        <div style={{ background: 'linear-gradient(180deg, var(--bg-1), var(--bg-2))', border: '1px solid var(--line-1)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>r{selVault.symbol} · {selVault.name}</div>
              <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2, fontFamily: 'JetBrains Mono', letterSpacing: '0.08em' }}>SELECTED VAULT</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="lbl">Current APR</div>
              <div className="num" style={{ fontSize: 26, fontWeight: 700, color: 'var(--lime)' }}>{selVault.aprNeutral.toFixed(1)}%</div>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div className="lbl" style={{ marginBottom: 6, fontSize: 9 }}>Deposit (USDC)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 8 }}>
              <input
                type="number"
                value={depositAmt}
                onChange={e => setDepositAmt(e.target.value)}
                style={{ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', color: 'var(--ink-1)', fontSize: 18, fontFamily: 'JetBrains Mono', outline: 'none' }}
              />
              <span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'JetBrains Mono' }}>USDC</span>
            </div>
          </div>

          <div style={{ padding: 14, borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--line-1)', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
            <div className="lbl" style={{ marginBottom: 4 }}>Execution · one tx</div>
            <Row l="Long leg" v={`Buy ${(+depositAmt * 0.667 / selVault.price).toFixed(4)} r${selVault.symbol} on AMM`} sub={fmtUSD(+depositAmt * 0.667)} c="var(--cobalt)" />
            <Row l="Short leg" v={`Open short on ${selVault.symbol} perp`} sub={fmtUSD(+depositAmt * 0.333) + ' margin'} c="var(--violet)" />
          </div>

          <button
            disabled={+depositAmt <= 0}
            style={{
              width: '100%',
              padding: '14px 0',
              borderRadius: 10,
              border: 'none',
              cursor: +depositAmt > 0 ? 'pointer' : 'not-allowed',
              fontSize: 13,
              fontWeight: 700,
              background: +depositAmt > 0 ? 'var(--lime)' : 'var(--bg-2)',
              color: +depositAmt > 0 ? 'var(--bg-0)' : 'var(--ink-4)',
            }}
          >
            Open isolated vault
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ l, v, sub, c }: { l: string; v: string; sub: string; c: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: 11 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: c, marginTop: 5, flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 600, color: 'var(--ink-2)' }}>{l}</div>
          <div style={{ color: 'var(--ink-4)', marginTop: 2 }}>{v}</div>
        </div>
      </div>
      <span className="num" style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{sub}</span>
    </div>
  );
}
