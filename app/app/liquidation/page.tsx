'use client';

import { useMemo, useState } from 'react';
import { getRLTQueue, EnrichedLiqVault } from '@/lib/data';
import { fmtUSD } from '@/lib/format';
import PageHeader from '@/components/ui/PageHeader';
import StatPill from '@/components/ui/StatPill';
import RedeemModal from '@/components/app/RedeemModal';

const PAGE_SIZE = 10;

export default function LiquidationPage() {
  const queue = useMemo(() => getRLTQueue(), []);
  const [assetFilter, setAssetFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [redeemTarget, setRedeemTarget] = useState<EnrichedLiqVault | null>(null);

  const filtered = assetFilter === 'all' ? queue : queue.filter(v => v.asset === assetFilter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalCapacity = filtered.reduce((s, v) => s + v.debt, 0);
  const assetCounts = queue.reduce((acc, v) => {
    acc[v.asset] = (acc[v.asset] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="animate-in" style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader
        title="Liquidation"
        oneLiner="RLT redemption queue. FIFO ordering. Hand rTokens to the protocol; the most at-risk vault is closed and you receive the oracle value of its collateral."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
        <StatPill label="Redeemable positions" value={queue.length} sub="in RLT queue" tone="amber" />
        <StatPill label="RLT capacity" value={fmtUSD(totalCapacity)} sub="debt available to redeem" tone="lime" />
        <StatPill label="Assets" value={Object.keys(assetCounts).length} sub="in queue" />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <FilterChip label="All" count={queue.length} active={assetFilter === 'all'} onClick={() => { setAssetFilter('all'); setPage(1); }} />
        {Object.entries(assetCounts).map(([a, c]) => (
          <FilterChip key={a} label={`r${a}`} count={c} active={assetFilter === a} onClick={() => { setAssetFilter(a); setPage(1); }} />
        ))}
      </div>

      <div style={{ background: 'linear-gradient(180deg, var(--bg-1), var(--bg-2))', border: '1px solid var(--line-1)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line-1)', display: 'flex', justifyContent: 'space-between' }}>
          <div className="lbl">RLT redemption queue</div>
          <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em' }}>
            {filtered.length} {assetFilter === 'all' ? '' : `r${assetFilter} · `}AVAILABLE · FIFO
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line-1)' }}>
              {['Vault', 'Owner', 'Asset', 'Collateral', 'Debt', 'LTV', 'Health', ''].map((h, i) => (
                <th key={i} style={{ textAlign: i > 2 ? 'right' : 'left', padding: '10px 14px', fontSize: 10, color: 'var(--ink-4)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map(v => (
              <tr key={v.id} style={{ borderBottom: '1px solid var(--line-1)' }}>
                <td className="num" style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--ink-2)' }}>{v.id}</td>
                <td className="num" style={{ padding: '10px 14px', fontSize: 11, color: 'var(--ink-3)' }}>{v.owner}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span className="num" style={{ fontWeight: 700 }}>{v.asset}</span>{' '}
                  <span style={{ color: 'var(--ink-4)', fontSize: 10 }}>{v.lev}</span>
                </td>
                <td className="num" style={{ padding: '10px 14px', textAlign: 'right' }}>{fmtUSD(v.collateral)}</td>
                <td className="num" style={{ padding: '10px 14px', textAlign: 'right' }}>{fmtUSD(v.debt)}</td>
                <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                    <div style={{ width: 80, height: 5, borderRadius: 3, background: 'var(--line-1)', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--pos), var(--amber), var(--neg))', opacity: 0.18 }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--pos), var(--amber), var(--neg))', clipPath: `inset(0 ${100 - Math.min(v.ltv, 100)}% 0 0)` }} />
                      <div style={{ position: 'absolute', left: `${v.mx}%`, top: -1, bottom: -1, width: 1, background: 'var(--ink-2)', opacity: 0.7 }} />
                      <div style={{ position: 'absolute', left: `${v.ll}%`, top: -1, bottom: -1, width: 1, background: 'var(--neg)' }} />
                    </div>
                    <span className="num" style={{ fontWeight: 700, color: v.ltv >= v.ll ? 'var(--neg)' : v.ltv >= v.mx ? 'var(--amber)' : 'var(--pos)', minWidth: 42, textAlign: 'right' }}>
                      {v.ltv}%
                    </span>
                  </div>
                </td>
                <td className="num" style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: v.healthVal < 1.05 ? 'var(--amber)' : 'var(--pos)' }}>
                  {v.healthVal.toFixed(2)}
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                  <button
                    onClick={() => setRedeemTarget(v)}
                    style={{
                      padding: '5px 14px',
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: 6,
                      border: '1px solid var(--cobalt-line)',
                      background: 'var(--cobalt-soft)',
                      color: 'var(--cobalt)',
                      cursor: 'pointer',
                    }}
                  >
                    Redeem
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length > PAGE_SIZE && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--line-1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>
              Showing <span className="num" style={{ color: 'var(--ink-1)', fontWeight: 600 }}>
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
              </span>{' '}
              of <span className="num" style={{ color: 'var(--ink-1)', fontWeight: 600 }}>{filtered.length}</span>
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <PageBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹ Prev</PageBtn>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <PageBtn key={n} onClick={() => setPage(n)} active={page === n}>{n}</PageBtn>
              ))}
              <PageBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next ›</PageBtn>
            </div>
          </div>
        )}
      </div>

      {redeemTarget && <RedeemModal vault={redeemTarget} onClose={() => setRedeemTarget(null)} />}
    </div>
  );
}

function FilterChip({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 12px',
        borderRadius: 999,
        border: `1px solid ${active ? 'var(--lime-line)' : 'var(--line-2)'}`,
        background: active ? 'var(--lime-soft)' : 'var(--bg-1)',
        color: active ? 'var(--lime)' : 'var(--ink-2)',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {label}
      <span style={{ fontSize: 10, opacity: 0.7, fontFamily: 'JetBrains Mono' }}>{count}</span>
    </button>
  );
}

function PageBtn({ onClick, disabled, active, children }: { onClick: () => void; disabled?: boolean; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 28,
        height: 28,
        padding: '0 10px',
        borderRadius: 6,
        border: active ? '1px solid var(--line-3)' : '1px solid var(--line-1)',
        background: active ? 'var(--bg-2)' : 'transparent',
        color: active ? 'var(--ink-1)' : 'var(--ink-3)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        fontSize: 11,
        fontWeight: active ? 700 : 500,
        fontFamily: 'JetBrains Mono',
      }}
    >
      {children}
    </button>
  );
}
