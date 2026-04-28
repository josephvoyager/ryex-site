'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLivePrices } from '@/lib/usePrices';
import { INIT_POSITIONS, MY_VAULTS, MY_LP_POSITIONS } from '@/lib/data';
import { fmtUSD } from '@/lib/format';
import PageHeader from '@/components/ui/PageHeader';

type YieldTf = 'daily' | 'monthly' | 'yearly';

export default function DashboardPage() {
  const { getPrice } = useLivePrices();
  const [yieldTf, setYieldTf] = useState<YieldTf>('daily');
  const cycleTf = () => setYieldTf((t) => (t === 'daily' ? 'monthly' : t === 'monthly' ? 'yearly' : 'daily'));
  const tfMul = yieldTf === 'daily' ? 1 : yieldTf === 'monthly' ? 30 : 365;
  const tfSuffix = yieldTf === 'daily' ? '/d' : yieldTf === 'monthly' ? '/mo' : '/yr';

  const totalEquity = 105230;
  const positions = INIT_POSITIONS;
  const totalPnL = positions.reduce((s, p) => s + p.pnl, 0);

  const ryDaily = MY_VAULTS.reduce((s, v) => s + v.dailyYield, 0);
  const lpDaily = MY_LP_POSITIONS.reduce((s, p) => s + p.dailyYield, 0);
  const totalDaily = ryDaily + lpDaily;
  const totalYieldFor = (d: number) => d * tfMul;

  const perpCount = positions.length;
  const perpNotional = positions.reduce((s, p) => s + p.size, 0);

  const mintVaults = positions.filter((p) => p.minted > 0);
  const totalDebt = mintVaults.reduce((s, p) => s + p.minted * (getPrice(p.asset, p.dex).price || p.current), 0);

  const ryTotal = MY_VAULTS.reduce((s, v) => s + v.deposited, 0);
  const lpTotal = MY_LP_POSITIONS.reduce((s, p) => s + p.deposited, 0);
  const lpUnclaimed = MY_LP_POSITIONS.reduce((s, p) => s + p.unclaimed, 0);

  const nearest = positions.slice().sort((a, b) => a.health - b.health)[0];
  const nearestRisky = nearest && nearest.health < 2;

  return (
    <div className="animate-in" style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader
        title="Dashboard"
        oneLiner="Your positions, vaults, LP shares, and yields across the protocol — at a glance."
      />

      {/* Hero — Total portfolio + Total yield */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14, marginBottom: 14 }}>
        <div className="glass" style={{ padding: '22px 26px' }}>
          <div className="lbl">Total portfolio value</div>
          <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--ink-1)', letterSpacing: '-0.02em', marginTop: 6, fontFamily: 'Inter, sans-serif' }}>
            {fmtUSD(totalEquity)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--pos)', marginTop: 4, fontWeight: 600 }}>+$2,818 · 24h</div>
        </div>
        <div
          className="glass"
          onClick={cycleTf}
          style={{ padding: '22px 26px', cursor: 'pointer', userSelect: 'none' }}
          title="Click to cycle daily / monthly / yearly"
        >
          <div className="spread">
            <div className="lbl">Total yield ({yieldTf})</div>
            <div style={{ display: 'flex', gap: 2, padding: 2, borderRadius: 6, background: 'var(--bg-inset)', border: '1px solid var(--line-1)' }}>
              {(['daily', 'monthly', 'yearly'] as YieldTf[]).map((t) => (
                <span
                  key={t}
                  style={{
                    padding: '3px 8px', borderRadius: 4, fontSize: 9,
                    fontWeight: yieldTf === t ? 700 : 500,
                    background: yieldTf === t ? 'var(--glass-hover)' : 'transparent',
                    color: yieldTf === t ? 'var(--ink-1)' : 'var(--ink-3)',
                    fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}
                >
                  {t === 'daily' ? '1d' : t === 'monthly' ? '1mo' : '1y'}
                </span>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--lime)', letterSpacing: '-0.02em', marginTop: 6, fontFamily: 'Inter, sans-serif' }}>
            +{fmtUSD(totalYieldFor(totalDaily), 2)}{tfSuffix}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
            rYield +{fmtUSD(totalYieldFor(ryDaily), 2)} · LP fees+rewards +{fmtUSD(totalYieldFor(lpDaily), 2)}
          </div>
        </div>
      </div>

      {/* Nearest-liq alert */}
      {nearestRisky && (
        <Link href="/demo/rtoken" style={{ display: 'block', textDecoration: 'none' }}>
          <div className="glass" style={{ padding: '12px 18px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 14, borderLeft: '3px solid var(--amber)', cursor: 'pointer' }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--amber)', boxShadow: '0 0 8px var(--amber)', animation: 'pulse 1.8s ease-in-out infinite' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)' }}>Position near liquidation</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
                <span className="num" style={{ color: 'var(--ink-2)' }}>
                  {nearest.asset} {nearest.dir} {nearest.lev}
                </span>{' '}
                · size {fmtUSD(nearest.size)} · liq @ {fmtUSD(nearest.liqPrice, nearest.liqPrice >= 1000 ? 0 : 2)} · health {nearest.health.toFixed(2)}
              </div>
            </div>
            <button className="btn" style={{ padding: '6px 14px', fontSize: 11 }}>Manage debt →</button>
          </div>
        </Link>
      )}

      {/* 4 clickable section cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

        {/* Perp Positions */}
        <SectionCard href="/demo/trade" lbl="Perp positions" value={fmtUSD(perpNotional)} valueSub={`notional · ${perpCount} open`} rightLbl="Open PnL" rightVal={`${totalPnL >= 0 ? '+' : ''}${fmtUSD(totalPnL)}`} rightColor={totalPnL >= 0 ? 'var(--pos)' : 'var(--neg)'} cta="Manage in Trade →">
          <table>
            <thead>
              <tr>{['Asset', 'Side', 'Size', 'PnL', 'Health'].map((h, i) => <th key={i} style={{ textAlign: i > 1 ? 'right' : 'left' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {positions.slice(0, 4).map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 11, background: 'var(--glass-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: 'var(--ink-2)', fontFamily: 'JetBrains Mono' }}>{p.asset.slice(0, 3)}</div>
                      <span className="num" style={{ fontWeight: 700 }}>{p.asset}</span>
                    </div>
                  </td>
                  <td><span className="chip zone-safe" style={{ fontSize: 10 }}>{p.dir} {p.lev}</span></td>
                  <td className="num" style={{ textAlign: 'right' }}>{fmtUSD(p.size)}</td>
                  <td className="num" style={{ textAlign: 'right', color: p.pnl >= 0 ? 'var(--pos)' : 'var(--neg)', fontWeight: 700 }}>
                    {p.pnl >= 0 ? '+' : ''}{fmtUSD(p.pnl)}
                  </td>
                  <td className="num" style={{ textAlign: 'right', fontWeight: 700, color: p.health > 2 ? 'var(--pos)' : p.health > 1.5 ? 'var(--amber)' : 'var(--neg)' }}>
                    {p.health.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        {/* rToken Mints */}
        <SectionCard href="/demo/rtoken" lbl="rToken debt" valueColor="var(--cobalt)" value={fmtUSD(totalDebt)} valueSub={`${mintVaults.length} vaults`} rightLbl="Borrow APR" rightVal="3.2%" rightColor="var(--lime)" cta="Manage in rToken →">
          <table>
            <thead>
              <tr>{['Asset', 'Minted', 'Debt', 'LTV', 'Health'].map((h, i) => <th key={i} style={{ textAlign: i > 1 ? 'right' : 'left' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {mintVaults.slice(0, 4).map((p) => {
                const pxNow = getPrice(p.asset, p.dex).price || p.current;
                const debtUSD = p.minted * pxNow;
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 22, height: 22, borderRadius: 11, background: 'var(--cobalt-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: 'var(--cobalt)', fontFamily: 'JetBrains Mono' }}>{p.asset.slice(0, 3)}</div>
                        <span className="num" style={{ fontWeight: 700 }}>r{p.asset}</span>
                      </div>
                    </td>
                    <td className="num" style={{ textAlign: 'right', color: 'var(--ink-2)' }}>{p.minted.toFixed(4)}</td>
                    <td className="num" style={{ textAlign: 'right', color: 'var(--cobalt)', fontWeight: 700 }}>{fmtUSD(debtUSD)}</td>
                    <td className="num" style={{ textAlign: 'right', fontWeight: 600 }}>{p.ltv}%</td>
                    <td className="num" style={{ textAlign: 'right', fontWeight: 700, color: p.health > 2 ? 'var(--pos)' : p.health > 1.5 ? 'var(--amber)' : 'var(--neg)' }}>
                      {p.health.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </SectionCard>

        {/* rYield Vaults */}
        <SectionCard href="/demo/ryield" lbl="rYield vaults" valueColor="var(--lime)" value={fmtUSD(ryTotal)} valueSub={`${MY_VAULTS.length} active`} rightLbl={`Earning (${yieldTf})`} rightVal={`+${fmtUSD(totalYieldFor(ryDaily), 2)}${tfSuffix}`} rightColor="var(--pos)" cta="Manage in rYield →">
          <table>
            <thead>
              <tr>{['Vault', 'Deposit', 'APR', 'Daily', 'Yield earned'].map((h, i) => <th key={i} style={{ textAlign: i > 0 ? 'right' : 'left' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {MY_VAULTS.map((v) => {
                const yieldEarned = v.dailyYield * v.days;
                return (
                  <tr key={v.symbol}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 22, height: 22, borderRadius: 11, background: 'var(--lime-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: 'var(--lime)', fontFamily: 'JetBrains Mono' }}>{v.symbol.slice(0, 3)}</div>
                        <span className="num" style={{ fontWeight: 700 }}>r{v.symbol}</span>
                      </div>
                    </td>
                    <td className="num" style={{ textAlign: 'right' }}>{fmtUSD(v.deposited)}</td>
                    <td className="num" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--lime)' }}>{v.apr.toFixed(1)}%</td>
                    <td className="num" style={{ textAlign: 'right', color: 'var(--pos)', fontWeight: 600 }}>+${(v.dailyYield * tfMul).toFixed(2)}</td>
                    <td className="num" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--pos)' }}>+${yieldEarned.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </SectionCard>

        {/* LP Positions */}
        <SectionCard href="/demo/pool" lbl="LP positions" valueColor="var(--violet)" value={fmtUSD(lpTotal)} valueSub={`${MY_LP_POSITIONS.length} pools`} rightLbl={`Earning (${yieldTf})`} rightVal={`+${fmtUSD(totalYieldFor(lpDaily), 2)}${tfSuffix}`} rightColor="var(--pos)" cta={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%' }}>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
              Unclaimed rewards: <span className="num" style={{ color: 'var(--lime)', fontWeight: 700, fontSize: 12 }}>${lpUnclaimed.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                className="btn btn-primary"
                style={{ padding: '5px 14px', fontSize: 11, fontWeight: 600 }}
                disabled={lpUnclaimed <= 0}
                onClick={(e) => e.stopPropagation()}
              >
                Claim all
              </button>
              <span style={{ fontSize: 11, color: 'var(--cobalt)', fontWeight: 600 }}>Manage in Pool →</span>
            </div>
          </div>
        }>
          <table>
            <thead>
              <tr>{['Pool', 'Type', 'Deposit', 'Daily', 'Unclaimed'].map((h, i) => <th key={i} style={{ textAlign: i > 1 ? 'right' : 'left' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {MY_LP_POSITIONS.map((p) => (
                <tr key={p.pair}>
                  <td className="num" style={{ fontWeight: 700 }}>{p.pair}</td>
                  <td>
                    <span
                      className="chip"
                      style={{
                        fontSize: 9,
                        background: p.type === 'V3' ? 'var(--violet-soft)' : 'var(--cobalt-soft)',
                        color: p.type === 'V3' ? 'var(--violet)' : 'var(--cobalt)',
                        borderColor: p.type === 'V3' ? 'oklch(0.72 0.16 300 / 0.3)' : 'var(--cobalt-line)',
                      }}
                    >
                      {p.type}
                    </span>
                  </td>
                  <td className="num" style={{ textAlign: 'right' }}>{fmtUSD(p.deposited)}</td>
                  <td className="num" style={{ textAlign: 'right', color: 'var(--pos)', fontWeight: 600 }}>+${(p.dailyYield * tfMul).toFixed(2)}</td>
                  <td className="num" style={{ textAlign: 'right', color: 'var(--lime)', fontWeight: 700 }}>+${p.unclaimed.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      </div>

      {/* Recent activity */}
      <div className="glass" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line-1)' }}>
          <div className="lbl">Recent activity</div>
        </div>
        <div style={{ padding: '4px 0' }}>
          {([
            ['Opened', 'BTC Long 2× · $20,000', '2h ago', 'var(--pos)'],
            ['Minted', '0.115 rBTC · $7,984', '2h ago', 'var(--cobalt)'],
            ['Deposited', '$2,000 into rWTI vault', '6h ago', 'var(--lime)'],
            ['Funding', '+$12.40 rWTI short', '8h ago', 'var(--pos)'],
            ['LP fees', '+$4.82 rBTC/USDC', '1d ago', 'var(--violet)'],
            ['Closed', 'ETH Long 2× · +$1,464', '1d ago', 'var(--pos)'],
          ] as const).map(([a, b, c, col], i) => (
            <div
              key={i}
              style={{
                padding: '10px 20px',
                borderBottom: i < 5 ? '1px solid var(--line-1)' : 'none',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: 3, background: col, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{a}</span>
                <span style={{ fontSize: 11, color: 'var(--ink-3)', marginLeft: 8 }}>{b}</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'JetBrains Mono', flexShrink: 0 }}>{c}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============== SectionCard ===============
type SectionCardProps = {
  href: string;
  lbl: string;
  value: string;
  valueColor?: string;
  valueSub: string;
  rightLbl: string;
  rightVal: string;
  rightColor: string;
  cta: React.ReactNode;
  children: React.ReactNode;
};

function SectionCard(p: SectionCardProps) {
  return (
    <Link href={p.href} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        className="glass"
        style={{
          padding: 0, overflow: 'hidden', cursor: 'pointer',
          transition: 'border-color .2s ease, transform .2s ease',
        }}
      >
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="lbl">{p.lbl}</div>
            <div className="num" style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: p.valueColor || 'var(--ink-1)' }}>
              {p.value}
              <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500, marginLeft: 6 }}>{p.valueSub}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{p.rightLbl}</div>
            <div className="num" style={{ fontSize: 15, fontWeight: 700, color: p.rightColor }}>{p.rightVal}</div>
          </div>
        </div>
        {p.children}
        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--line-1)', fontSize: 11, color: 'var(--cobalt)', fontWeight: 600, textAlign: 'right' }}>
          {p.cta}
        </div>
      </div>
    </Link>
  );
}
