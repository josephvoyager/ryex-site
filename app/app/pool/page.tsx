'use client';

import { POOLS, MY_LP_POSITIONS } from '@/lib/data';
import { fmtUSD } from '@/lib/format';
import PageHeader from '@/components/ui/PageHeader';
import StatPill from '@/components/ui/StatPill';

export default function PoolPage() {
  const totalDeposited = MY_LP_POSITIONS.reduce((s, l) => s + l.deposited, 0);
  const totalUnclaimed = MY_LP_POSITIONS.reduce((s, l) => s + l.unclaimed, 0);
  const totalDailyYield = MY_LP_POSITIONS.reduce((s, l) => s + l.dailyYield, 0);

  return (
    <div className="animate-in" style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader
        title="Pool"
        oneLiner="LP into rToken/USDC pools. Earn structural fees from trader mints meeting rYield buy pressure."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
        <StatPill label="Your LP value" value={fmtUSD(totalDeposited)} sub={`${MY_LP_POSITIONS.length} positions`} tone="lime" />
        <StatPill label="Unclaimed" value={fmtUSD(totalUnclaimed, 2)} sub="ready to harvest" tone="amber" />
        <StatPill label="Daily yield" value={fmtUSD(totalDailyYield, 2)} sub="fees + incentives" tone="cobalt" />
      </div>

      {/* My LP positions */}
      {MY_LP_POSITIONS.length > 0 && (
        <div style={{ background: 'linear-gradient(180deg, var(--bg-1), var(--bg-2))', border: '1px solid var(--line-1)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line-1)' }}>
            <div className="lbl">Your LP positions</div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line-1)' }}>
                {['Pair', 'Type', 'Deposited', 'Fees', 'Incentives', 'Daily', 'Unclaimed', ''].map((h, i) => (
                  <th key={i} style={{ textAlign: i > 1 ? 'right' : 'left', padding: '10px 14px', fontSize: 10, color: 'var(--ink-4)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MY_LP_POSITIONS.map((l, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--line-1)' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <span className="num" style={{ fontWeight: 700 }}>{l.pair}</span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'var(--cobalt-soft)', color: 'var(--cobalt)', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{l.type}</span>
                  </td>
                  <td className="num" style={{ padding: '12px 14px', textAlign: 'right' }}>{fmtUSD(l.deposited)}</td>
                  <td className="num" style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--pos)' }}>+{fmtUSD(l.feesEarned, 2)}</td>
                  <td className="num" style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--lime)' }}>+{fmtUSD(l.incentivesEarned, 2)}</td>
                  <td className="num" style={{ padding: '12px 14px', textAlign: 'right' }}>+{fmtUSD(l.dailyYield, 2)}</td>
                  <td className="num" style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--amber)', fontWeight: 700 }}>+{fmtUSD(l.unclaimed, 2)}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <button style={{ padding: '5px 12px', fontSize: 11, fontWeight: 600, borderRadius: 6, border: '1px solid var(--line-2)', background: 'var(--bg-2)', color: 'var(--ink-1)', cursor: 'pointer' }}>Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Available pools */}
      <div style={{ background: 'linear-gradient(180deg, var(--bg-1), var(--bg-2))', border: '1px solid var(--line-1)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line-1)', display: 'flex', justifyContent: 'space-between' }}>
          <div className="lbl">Available pools</div>
          <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em' }}>{POOLS.length} LIVE</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line-1)' }}>
              {['Pair', 'Type', 'TVL', '24h Vol', 'Fee', 'APR', ''].map((h, i) => (
                <th key={i} style={{ textAlign: i > 1 ? 'right' : 'left', padding: '10px 14px', fontSize: 10, color: 'var(--ink-4)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {POOLS.map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--line-1)' }}>
                <td style={{ padding: '12px 14px' }}>
                  <span className="num" style={{ fontWeight: 700 }}>{p.pair}</span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'var(--cobalt-soft)', color: 'var(--cobalt)', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{p.type}</span>
                </td>
                <td className="num" style={{ padding: '12px 14px', textAlign: 'right' }}>{p.tvl}</td>
                <td className="num" style={{ padding: '12px 14px', textAlign: 'right' }}>{p.vol}</td>
                <td className="num" style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--ink-3)' }}>{p.fee}</td>
                <td className="num" style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: p.apr >= 15 ? 'var(--lime)' : 'var(--ink-1)' }}>{p.apr.toFixed(1)}%</td>
                <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                  <button style={{ padding: '5px 12px', fontSize: 11, fontWeight: 600, borderRadius: 6, border: '1px solid var(--lime-line)', background: 'var(--lime-soft)', color: 'var(--lime)', cursor: 'pointer' }}>Add liquidity</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
