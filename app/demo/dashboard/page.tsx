'use client';

import Link from 'next/link';
import { useLivePrices } from '@/lib/usePrices';
import { INIT_POSITIONS, MY_VAULTS, MY_LP_POSITIONS } from '@/lib/data';
import { fmtUSD } from '@/lib/format';
import PageHeader from '@/components/ui/PageHeader';
import StatPill from '@/components/ui/StatPill';

export default function DashboardPage() {
  const { getPrice } = useLivePrices();

  const positionsValue = INIT_POSITIONS.reduce((sum, p) => {
    const live = getPrice(p.asset, p.dex).price || p.current;
    const pnl = (live - p.entry) / p.entry * p.size * (p.dir === 'Long' ? 1 : -1);
    return sum + p.margin + pnl;
  }, 0);
  const totalMinted = INIT_POSITIONS.reduce((s, p) => {
    const px = getPrice(p.asset, p.dex).price || p.current;
    return s + p.minted * px;
  }, 0);
  const yieldEarned = MY_VAULTS.reduce((s, v) => s + v.dailyYield * v.days, 0);
  const lpDeposited = MY_LP_POSITIONS.reduce((s, l) => s + l.deposited, 0);
  const lpUnclaimed = MY_LP_POSITIONS.reduce((s, l) => s + l.unclaimed, 0);

  const totalEquity = positionsValue + MY_VAULTS.reduce((s, v) => s + v.deposited + v.pnl, 0) + lpDeposited;

  return (
    <div className="animate-in" style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader
        title="Dashboard"
        oneLiner="Your positions, vaults, LP shares, and yields across the protocol — at a glance."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <StatPill label="Total equity" value={fmtUSD(totalEquity)} sub="across protocol" tone="lime" />
        <StatPill label="rTokens minted" value={fmtUSD(totalMinted)} sub={`${INIT_POSITIONS.length} positions`} tone="cobalt" />
        <StatPill label="Yield earned 30d" value={fmtUSD(yieldEarned, 2)} sub={`${MY_VAULTS.length} active vaults`} tone="lime" />
        <StatPill label="LP unclaimed" value={fmtUSD(lpUnclaimed, 2)} sub={`${MY_LP_POSITIONS.length} pools`} tone="amber" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
        <SectionCard
          title="Open positions"
          count={INIT_POSITIONS.length}
          subtitle="Trade page · mint rTokens against open positions"
          href="/app/trade"
        >
          {INIT_POSITIONS.slice(0, 4).map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line-1)', fontSize: 12 }}>
              <span><strong>{p.asset}</strong> <span style={{ color: 'var(--ink-4)' }}>{p.lev} {p.dir}</span></span>
              <span className="num" style={{ color: 'var(--pos)', fontWeight: 600 }}>+{fmtUSD(p.pnl)}</span>
            </div>
          ))}
        </SectionCard>

        <SectionCard
          title="rYield vaults"
          count={MY_VAULTS.length}
          subtitle="Each deposit is an isolated delta-neutral vault"
          href="/app/ryield"
        >
          {MY_VAULTS.map((v, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line-1)', fontSize: 12 }}>
              <span><strong>r{v.symbol}</strong> <span style={{ color: 'var(--ink-4)' }}>{fmtUSD(v.deposited)}</span></span>
              <span className="num" style={{ color: 'var(--lime)', fontWeight: 600 }}>{v.apr.toFixed(1)}% APR</span>
            </div>
          ))}
        </SectionCard>

        <SectionCard
          title="LP positions"
          count={MY_LP_POSITIONS.length}
          subtitle="Earn structural fees from rToken AMM flow"
          href="/app/pool"
        >
          {MY_LP_POSITIONS.map((l, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line-1)', fontSize: 12 }}>
              <span><strong>{l.pair}</strong> <span style={{ color: 'var(--ink-4)' }}>{l.type}</span></span>
              <span className="num" style={{ color: 'var(--amber)', fontWeight: 600 }}>+{fmtUSD(l.unclaimed, 2)}</span>
            </div>
          ))}
        </SectionCard>

        <SectionCard
          title="rToken minting"
          count={INIT_POSITIONS.filter(p => p.minted > 0).length}
          subtitle="Liquid ERC-20 against your perp positions"
          href="/app/rtoken"
        >
          {INIT_POSITIONS.filter(p => p.minted > 0).slice(0, 4).map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line-1)', fontSize: 12 }}>
              <span><strong>r{p.asset}</strong> <span style={{ color: 'var(--ink-4)' }}>LTV {p.ltv}%</span></span>
              <span className="num" style={{ color: 'var(--cobalt)', fontWeight: 600 }}>{p.minted.toFixed(3)} r{p.asset}</span>
            </div>
          ))}
        </SectionCard>
      </div>
    </div>
  );
}

function SectionCard({
  title, count, subtitle, href, children,
}: { title: string; count: number; subtitle: string; href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        padding: 20,
        borderRadius: 12,
        background: 'linear-gradient(180deg, var(--bg-1), var(--bg-2))',
        border: '1px solid var(--line-1)',
        transition: 'border-color .2s ease, transform .2s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
          {title} <span style={{ color: 'var(--ink-4)', fontWeight: 500, marginLeft: 6, fontSize: 13 }}>{count}</span>
        </h3>
        <span style={{ color: 'var(--cobalt)', fontSize: 11, fontWeight: 500 }}>Open →</span>
      </div>
      <p style={{ fontSize: 11, color: 'var(--ink-4)', margin: 0, marginBottom: 14 }}>{subtitle}</p>
      <div>{children}</div>
    </Link>
  );
}
