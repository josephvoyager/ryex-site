'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLivePrices } from '@/lib/usePrices';
import { INIT_POSITIONS, MINTABLE_ASSETS, getRLTQueue, type MintableAsset } from '@/lib/data';
import { fmtUSD, fmtPct, getZone } from '@/lib/format';
import PageHeader from '@/components/ui/PageHeader';
import StatPill from '@/components/ui/StatPill';
import Stat from '@/components/ui/Stat';
import PegTag from '@/components/ui/PegTag';

type Tab = 'mint' | 'redeem';
type MintMode = 'new' | 'existing';
type RedeemMode = 'repay' | 'external';

const USER_BALANCES: Record<string, number> = {
  BTC: 0.115, ETH: 3.55, SOL: 12.6, HYPE: 0, XAUT: 4.82, WTI: 0, TSLA: 0,
};
const USDC_BALANCE = 48230;

export default function RTokenPage() {
  const { getPrice } = useLivePrices();
  const [tab, setTab] = useState<Tab>('mint');
  const [mintMode, setMintMode] = useState<MintMode>('new');
  const [redeemMode, setRedeemMode] = useState<RedeemMode>('repay');
  const [selAsset, setSelAsset] = useState<MintableAsset>(MINTABLE_ASSETS[0]);
  const [collateral, setCollateral] = useState('10000');
  const [leverage, setLeverage] = useState(2);
  const [targetLTV, setTargetLTV] = useState(selAsset.maxLTV[2] - 5);
  const [fromPosId, setFromPosId] = useState<number>(INIT_POSITIONS[0]?.id ?? 1);
  const [redeemAmt, setRedeemAmt] = useState('');

  useEffect(() => {
    if (mintMode === 'existing') {
      const pos = INIT_POSITIONS.find((p) => p.id === fromPosId);
      if (pos) {
        const mi = MINTABLE_ASSETS.find((m) => m.symbol === pos.asset);
        const lev = +pos.lev.replace('x', '');
        if (mi) setTargetLTV(mi.maxLTV[lev] - 5);
      }
    } else {
      setTargetLTV(selAsset.maxLTV[leverage] - 5);
    }
  }, [selAsset, leverage, mintMode, fromPosId]);

  const lp = getPrice(selAsset.symbol, 'gmx');
  const price = lp.price || selAsset.price;
  const ammDev = useMemo(
    () => Math.sin(Date.now() / 8000 + selAsset.symbol.length) * 0.0007,
    [selAsset.symbol, Math.round(price)]
  );
  const ammPrice = price * (1 + ammDev);

  const myVaults = useMemo(
    () =>
      INIT_POSITIONS.filter((p) => p.minted > 0).map((p) => {
        const mi = MINTABLE_ASSETS.find((m) => m.symbol === p.asset);
        const lev = +p.lev.replace('x', '');
        const mx = mi?.maxLTV[lev] || 80;
        const rl = mi?.rlt[lev] || 85;
        const ll = mi?.lltv[lev] || 90;
        const pxNow = getPrice(p.asset, p.dex).price || p.current;
        const debtUSD = p.minted * pxNow;
        const collVal = p.size + p.pnl;
        const ltvNow = Math.min(99, Math.round((debtUSD / collVal) * 100 * 10) / 10);
        const zone = getZone(ltvNow, mx, rl, ll);
        const liqPrice =
          p.dir === 'Long'
            ? p.entry * (1 - (1 - (p.minted * p.entry) / collVal / (ll / 100)) / lev)
            : p.entry;
        return { ...p, debtUSD, collVal, ltvNow, zone, mx, rl, ll, liqPrice, pxNow };
      }),
    [getPrice]
  );

  const collUSD = +collateral || 0;
  const existingPos = INIT_POSITIONS.find((p) => p.id === fromPosId);
  const srcNetValue =
    mintMode === 'existing' && existingPos ? existingPos.size + existingPos.pnl : collUSD * leverage;
  const posValue = srcNetValue;
  const mintedUSD = posValue * (targetLTV / 100);
  const mintedToken = mintedUSD / price;

  const effLev = mintMode === 'existing' && existingPos ? +existingPos.lev.replace('x', '') : leverage;
  const ctxAsset =
    mintMode === 'existing' && existingPos
      ? MINTABLE_ASSETS.find((m) => m.symbol === existingPos.asset) || selAsset
      : selAsset;
  const maxLTV = ctxAsset.maxLTV[effLev] || 80;
  const rlt = ctxAsset.rlt[effLev] || 85;
  const lltv = ctxAsset.lltv[effLev] || 90;
  const zone = getZone(targetLTV, maxLTV, rlt, lltv);
  const liqDrop = effLev > 1 ? (100 - (targetLTV * 100) / lltv).toFixed(1) : '—';
  const effPrice =
    mintMode === 'existing' && existingPos
      ? getPrice(existingPos.asset, existingPos.dex).price || existingPos.current
      : price;
  const liqPriceCalc = effLev > 1 ? effPrice * (1 - (lltv - targetLTV) / 100 / effLev) : 0;

  const redeemTokens = +redeemAmt || 0;
  const redeemGrossOracle = redeemTokens * price;
  const redeemFee = redeemGrossOracle * 0.002;
  const redeemNetUSD = redeemGrossOracle - redeemFee;

  const ownDebts: Record<string, number> = {};
  myVaults.forEach((v) => {
    ownDebts[v.asset] = (ownDebts[v.asset] || 0) + v.minted;
  });
  const userBal = USER_BALANCES[selAsset.symbol] || 0;
  const ownDebt = ownDebts[selAsset.symbol] || 0;

  const avail = MINTABLE_ASSETS.filter((a) => a.available);

  const rltQueue = useMemo(() => getRLTQueue(), []);
  const rltCapacity = useMemo(() => {
    const cap: Record<string, { debt: number; positions: number }> = {};
    rltQueue.forEach((v) => {
      if (!cap[v.asset]) cap[v.asset] = { debt: 0, positions: 0 };
      cap[v.asset].debt += v.debt;
      cap[v.asset].positions += 1;
    });
    return cap;
  }, [rltQueue]);
  const totalRltCapacity = Object.values(rltCapacity).reduce((s, v) => s + v.debt, 0);

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
        <StatPill label="RLT capacity" value={fmtUSD(totalRltCapacity)} sub={`${rltQueue.length} vaults redeemable`} tone="amber" />
      </div>

      {myVaults.length > 0 && (
        <div className="glass" style={{ padding: 0, overflow: 'hidden', marginBottom: 18 }}>
          <div className="spread" style={{ padding: '14px 20px', borderBottom: '1px solid var(--line-1)' }}>
            <div className="lbl">Your mint vaults</div>
            <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em' }}>
              {myVaults.length} OPEN
            </span>
          </div>
          <table>
            <thead>
              <tr>
                {['Asset', 'Position', 'Minted', 'Debt (USD)', 'Live LTV', 'Liq. price', 'Health', 'Zone', ''].map((h, i) => (
                  <th key={i} style={{ textAlign: i > 1 ? 'right' : 'left' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myVaults.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 12, background: 'var(--cobalt-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'var(--cobalt)', fontFamily: 'JetBrains Mono' }}>
                        {v.asset.slice(0, 3)}
                      </div>
                      <span className="num" style={{ fontWeight: 700 }}>r{v.asset}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                    <span className="chip zone-safe" style={{ fontSize: 10 }}>{v.dir} {v.lev}</span>
                    <span className="num" style={{ color: 'var(--ink-3)', marginLeft: 6 }}>{fmtUSD(v.size)}</span>
                  </td>
                  <td className="num" style={{ textAlign: 'right' }}>{v.minted.toFixed(4)}</td>
                  <td className="num" style={{ textAlign: 'right', color: 'var(--cobalt)', fontWeight: 600 }}>{fmtUSD(v.debtUSD)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                      <div style={{ width: 90, height: 5, borderRadius: 3, background: 'var(--bg-inset)', position: 'relative', overflow: 'hidden', border: '1px solid var(--line-1)' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--pos), var(--amber), var(--neg))', opacity: 0.18 }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--pos), var(--amber), var(--neg))', clipPath: `inset(0 ${100 - Math.min(v.ltvNow, 100)}% 0 0)` }} />
                        <div style={{ position: 'absolute', left: `${v.mx}%`, top: -1, bottom: -1, width: 1, background: 'var(--ink-2)', opacity: 0.7 }} />
                        <div style={{ position: 'absolute', left: `${v.ll}%`, top: -1, bottom: -1, width: 1, background: 'var(--neg)' }} />
                      </div>
                      <span className="num" style={{ fontWeight: 700, minWidth: 40, textAlign: 'right' }}>{v.ltvNow.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="num" style={{ textAlign: 'right' }}>
                    {v.liqPrice > 0 ? fmtUSD(v.liqPrice, v.liqPrice >= 1000 ? 0 : 2) : '—'}
                  </td>
                  <td className="num" style={{ textAlign: 'right', fontWeight: 700, color: v.health > 2 ? 'var(--pos)' : v.health > 1.5 ? 'var(--amber)' : 'var(--neg)' }}>
                    {v.health.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={`chip ${v.zone.cls}`}>{v.zone.label}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 4 }}>
                      <button
                        className="btn"
                        style={{ padding: '4px 9px', fontSize: 10 }}
                        onClick={() => { setTab('mint'); setMintMode('existing'); setFromPosId(v.id); }}
                      >
                        Mint+
                      </button>
                      <button
                        className="btn"
                        style={{ padding: '4px 9px', fontSize: 10 }}
                        onClick={() => {
                          setTab('redeem');
                          setRedeemMode('repay');
                          setSelAsset(MINTABLE_ASSETS.find((m) => m.symbol === v.asset) || selAsset);
                        }}
                      >
                        Repay
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 20 }}>
        <div className="glass" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 10, background: 'var(--bg-inset)', border: '1px solid var(--line-1)' }}>
            {(['mint', 'redeem'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  border: 'none',
                  borderRadius: 7,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  background: tab === t ? 'var(--glass-hover)' : 'transparent',
                  color: tab === t ? 'var(--ink-1)' : 'var(--ink-3)',
                  boxShadow: tab === t ? 'var(--shadow-inset)' : 'none',
                  fontFamily: 'inherit',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'mint' ? (
            <MintForm
              mintMode={mintMode}
              setMintMode={setMintMode}
              fromPosId={fromPosId}
              setFromPosId={setFromPosId}
              selAsset={selAsset}
              setSelAsset={setSelAsset}
              collateral={collateral}
              setCollateral={setCollateral}
              leverage={leverage}
              setLeverage={setLeverage}
              targetLTV={targetLTV}
              setTargetLTV={setTargetLTV}
              avail={avail}
              maxLTV={maxLTV}
              rlt={rlt}
              lltv={lltv}
              zone={zone}
              existingPos={existingPos}
            />
          ) : (
            <RedeemForm
              redeemMode={redeemMode}
              setRedeemMode={setRedeemMode}
              selAsset={selAsset}
              setSelAsset={setSelAsset}
              redeemAmt={redeemAmt}
              setRedeemAmt={setRedeemAmt}
              avail={avail}
              userBal={userBal}
              ownDebt={ownDebt}
              ownDebts={ownDebts}
              rltCapacity={rltCapacity}
              rltQueue={rltQueue}
              totalRltCapacity={totalRltCapacity}
              ammDev={ammDev * 100}
              price={price}
              ammPrice={ammPrice}
              redeemTokens={redeemTokens}
              redeemGrossOracle={redeemGrossOracle}
              redeemFee={redeemFee}
              redeemNetUSD={redeemNetUSD}
            />
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tab === 'mint' ? (
            <div className="glass" style={{ padding: 24 }}>
              <div className="spread" style={{ marginBottom: 16 }}>
                <div className="lbl">Position preview</div>
                <span className={`chip ${zone.cls}`} style={{ fontSize: 11, padding: '3px 10px' }}>{zone.label}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                <Stat l="Collateral" v={fmtUSD(mintMode === 'existing' && existingPos ? existingPos.margin : collUSD)} />
                <Stat l="Position notional" v={fmtUSD(posValue)} />
                <Stat
                  l="You mint"
                  v={
                    <span>
                      {mintedToken.toFixed(4)}{' '}
                      <span style={{ color: 'var(--cobalt)' }}>r{mintMode === 'existing' && existingPos ? existingPos.asset : selAsset.symbol}</span>
                    </span>
                  }
                  sub={`≈ ${fmtUSD(mintedUSD)}`}
                />
                <Stat
                  l="Liquidation price"
                  v={liqPriceCalc > 0 ? fmtUSD(liqPriceCalc, liqPriceCalc >= 1000 ? 0 : 2) : '— (1×)'}
                  sub={liqDrop !== '—' ? `${liqDrop}% drop` : 'no liq risk at 1× except fees'}
                />
              </div>
              <div style={{ padding: 16, borderRadius: 10, background: 'var(--bg-inset)', border: '1px solid var(--line-1)', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  ['Entry price', fmtUSD(effPrice, 2)],
                  ['Max LTV', maxLTV + '%'],
                  ['Redeemable zone', `${rlt}% → ${lltv}%`],
                  ['Liquidation LTV', `${lltv}% (+5% penalty)`],
                  ['Mint fee (0.1%)', '$' + (mintedUSD * 0.001).toFixed(2)],
                ].map(([l, v], i) => (
                  <div key={i} className="spread" style={{ fontSize: 12 }}>
                    <span style={{ color: 'var(--ink-3)' }}>{l}</span>
                    <span className="num" style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <RedeemPreview
              redeemMode={redeemMode}
              selAsset={selAsset}
              ownDebt={ownDebt}
              price={price}
              lp={lp}
              rltCapacity={rltCapacity}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ============== MINT FORM ==============
type MintFormProps = {
  mintMode: MintMode;
  setMintMode: (m: MintMode) => void;
  fromPosId: number;
  setFromPosId: (id: number) => void;
  selAsset: MintableAsset;
  setSelAsset: (a: MintableAsset) => void;
  collateral: string;
  setCollateral: (s: string) => void;
  leverage: number;
  setLeverage: (n: number) => void;
  targetLTV: number;
  setTargetLTV: (n: number) => void;
  avail: MintableAsset[];
  maxLTV: number;
  rlt: number;
  lltv: number;
  zone: ReturnType<typeof getZone>;
  existingPos: typeof INIT_POSITIONS[0] | undefined;
};

function MintForm(p: MintFormProps) {
  const { getPrice } = useLivePrices();

  return (
    <>
      <div style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 8, background: 'var(--bg-inset)', border: '1px solid var(--line-1)' }}>
        {([['existing', 'From existing position'], ['new', 'Open new + mint']] as const).map(([id, l]) => (
          <button
            key={id}
            onClick={() => p.setMintMode(id)}
            style={{
              flex: 1, padding: '7px 0', border: 'none', borderRadius: 6, cursor: 'pointer',
              fontSize: 11, fontWeight: p.mintMode === id ? 700 : 500,
              background: p.mintMode === id ? 'var(--glass-hover)' : 'transparent',
              color: p.mintMode === id ? 'var(--ink-1)' : 'var(--ink-3)', fontFamily: 'inherit',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {p.mintMode === 'existing' ? (
        <div>
          <div className="lbl" style={{ marginBottom: 6 }}>Choose open position</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {INIT_POSITIONS.map((pos) => {
              const sel = p.fromPosId === pos.id;
              const mi = MINTABLE_ASSETS.find((m) => m.symbol === pos.asset);
              const headroomPct = mi ? mi.maxLTV[+pos.lev.replace('x', '')] - pos.ltv : 20;
              return (
                <button
                  key={pos.id}
                  onClick={() => p.setFromPosId(pos.id)}
                  style={{
                    display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 12,
                    padding: '10px 12px', borderRadius: 8,
                    border: sel ? '1px solid var(--lime-line)' : '1px solid var(--line-1)',
                    background: sel ? 'var(--lime-soft)' : 'var(--bg-inset)',
                    cursor: 'pointer', color: 'var(--ink-1)', textAlign: 'left',
                    alignItems: 'center', fontFamily: 'inherit',
                  }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 14, background: 'var(--glass-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'var(--ink-2)', fontFamily: 'JetBrains Mono' }}>
                    {pos.asset}
                  </div>
                  <div>
                    <div className="num" style={{ fontWeight: 700, fontSize: 12 }}>
                      {pos.asset} {pos.dir} {pos.lev}
                      <span style={{ color: 'var(--ink-4)', fontWeight: 500, marginLeft: 4 }}>{fmtUSD(pos.size)}</span>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>
                      Minted {pos.minted.toFixed(4)} r{pos.asset} · PnL {pos.pnl >= 0 ? '+' : ''}{fmtUSD(pos.pnl)}
                    </div>
                  </div>
                  <div className="num" style={{ fontSize: 11, color: 'var(--ink-3)' }}>LTV {pos.ltv}%</div>
                  <div className="num" style={{ fontSize: 11, color: headroomPct > 10 ? 'var(--pos)' : 'var(--amber)', fontWeight: 600 }}>
                    +{headroomPct.toFixed(0)}% left
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          <div>
            <div className="lbl" style={{ marginBottom: 6 }}>Underlying asset</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
              {p.avail.map((a) => {
                const sel = p.selAsset.symbol === a.symbol;
                const pxNow = getPrice(a.symbol, 'gmx').price || a.price;
                return (
                  <button
                    key={a.symbol}
                    onClick={() => p.setSelAsset(a)}
                    style={{
                      display: 'grid', gridTemplateColumns: '28px 1fr auto auto', gap: 10,
                      alignItems: 'center', padding: '9px 12px', borderRadius: 7,
                      border: sel ? '1px solid var(--lime-line)' : '1px solid var(--line-1)',
                      background: sel ? 'var(--lime-soft)' : 'var(--bg-inset)',
                      cursor: 'pointer', color: 'var(--ink-1)', textAlign: 'left', fontFamily: 'inherit',
                    }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: 14, background: sel ? 'var(--lime-soft)' : 'var(--glass-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: sel ? 'var(--lime)' : 'var(--ink-2)', fontFamily: 'JetBrains Mono' }}>
                      {a.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="num" style={{ fontWeight: 700, fontSize: 12 }}>
                        r{a.symbol}
                        <span style={{ color: 'var(--ink-4)', fontWeight: 500, marginLeft: 4 }}>{a.name}</span>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 1 }}>
                        {a.cat} · Max {a.maxLev}× · LTV {a.maxLTV[1]}%
                      </div>
                    </div>
                    <div className="num" style={{ fontSize: 11, color: 'var(--ink-2)', fontWeight: 600, textAlign: 'right' }}>
                      {fmtUSD(pxNow, pxNow >= 1000 ? 0 : 2)}
                    </div>
                    <div className="num" style={{ fontSize: 12, color: sel ? 'var(--lime)' : 'var(--ink-4)', textAlign: 'right', minWidth: 16 }}>
                      {sel ? '✓' : '›'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="spread" style={{ marginBottom: 6 }}>
              <span className="lbl">Collateral (USDC)</span>
              <span style={{ fontSize: 10, color: 'var(--ink-3)', fontFamily: 'JetBrains Mono' }}>
                Balance {USDC_BALANCE.toLocaleString()}
              </span>
            </div>
            <div className="field">
              <input type="number" value={p.collateral} onChange={(e) => p.setCollateral(e.target.value)} />
              <span className="field-affix">USDC</span>
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
              {[10, 25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  onClick={() => p.setCollateral(Math.round((USDC_BALANCE * pct) / 100).toString())}
                  style={{ flex: 1, padding: '5px 0', borderRadius: 5, border: '1px solid var(--line-1)', background: 'transparent', color: 'var(--ink-3)', fontSize: 10, cursor: 'pointer', fontFamily: 'JetBrains Mono' }}
                >
                  {pct === 100 ? 'MAX' : pct + '%'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="spread" style={{ marginBottom: 8 }}>
              <span className="lbl">Leverage</span>
              <span className="num" style={{ fontWeight: 800, fontSize: 14, color: p.leverage >= 5 ? 'var(--neg)' : p.leverage >= 3 ? 'var(--amber)' : 'var(--lime)' }}>
                {p.leverage}×
              </span>
            </div>
            <input
              type="range" min={1} max={p.selAsset.maxLev} step={1}
              value={p.leverage}
              onChange={(e) => p.setLeverage(+e.target.value)}
              style={{ width: '100%', accentColor: 'var(--lime)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, gap: 4 }}>
              {[...new Set([1, 2, 3, 5, p.selAsset.maxLev].filter((l) => l <= p.selAsset.maxLev))]
                .sort((a, b) => a - b)
                .map((l) => (
                  <button
                    key={l}
                    onClick={() => p.setLeverage(l)}
                    style={{
                      flex: 1, padding: '5px 0', borderRadius: 4,
                      border: p.leverage === l ? '1px solid var(--line-3)' : '1px solid transparent',
                      fontSize: 10, fontWeight: p.leverage === l ? 700 : 500, cursor: 'pointer',
                      fontFamily: 'JetBrains Mono',
                      background: p.leverage === l ? 'var(--glass-hover)' : 'transparent',
                      color: p.leverage === l ? 'var(--ink-1)' : 'var(--ink-4)',
                    }}
                  >
                    {l}×
                  </button>
                ))}
            </div>
          </div>
        </>
      )}

      <div>
        <div className="spread" style={{ marginBottom: 10 }}>
          <span className="lbl">Target LTV</span>
          <span className="num" style={{ fontWeight: 800, fontSize: 14, color: p.zone.key === 'safe' ? 'var(--pos)' : p.zone.key === 'redeem' ? 'var(--amber)' : 'var(--neg)' }}>
            {p.targetLTV.toFixed(1)}%
          </span>
        </div>
        <div className="ltv-bar" style={{ marginBottom: 10 }}>
          <div className="fill" style={{ width: `${p.targetLTV}%`, opacity: 0.85 }} />
          <div className="tick" style={{ left: `${p.maxLTV}%` }} title={`Max LTV ${p.maxLTV}%`} />
          <div className="tick" style={{ left: `${p.rlt}%`, background: 'var(--amber)' }} title={`RLT ${p.rlt}%`} />
          <div className="tick" style={{ left: `${p.lltv}%`, background: 'var(--neg)' }} title={`LLTV ${p.lltv}%`} />
        </div>
        <input
          type="range" min={0} max={p.lltv} step={0.5}
          value={p.targetLTV}
          onChange={(e) => p.setTargetLTV(+e.target.value)}
          style={{ width: '100%', accentColor: 'var(--lime)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9, color: 'var(--ink-4)', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <span>Safe · 0→{p.maxLTV}%</span>
          <span style={{ color: 'var(--amber)' }}>Redeem · →{p.rlt}%</span>
          <span style={{ color: 'var(--neg)' }}>Liq · →{p.lltv}%</span>
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
          {([['Safe', Math.max(0, p.maxLTV * 0.6)], ['Balanced', Math.max(0, p.maxLTV * 0.85)], ['MaxLTV', p.maxLTV - 0.5]] as const).map(([l, v]) => (
            <button
              key={l}
              onClick={() => p.setTargetLTV(+v.toFixed(1))}
              style={{ flex: 1, padding: '5px 0', borderRadius: 5, border: '1px solid var(--line-1)', background: 'transparent', color: 'var(--ink-3)', fontSize: 10, cursor: 'pointer', fontFamily: 'JetBrains Mono' }}
            >
              {l}
            </button>
          ))}
        </div>
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
        {p.mintMode === 'existing' && p.existingPos
          ? `Mint r${p.existingPos.asset} from position`
          : `Open position & mint r${p.selAsset.symbol}`}
      </button>
    </>
  );
}

// ============== REDEEM FORM ==============
type RedeemFormProps = {
  redeemMode: RedeemMode;
  setRedeemMode: (m: RedeemMode) => void;
  selAsset: MintableAsset;
  setSelAsset: (a: MintableAsset) => void;
  redeemAmt: string;
  setRedeemAmt: (s: string) => void;
  avail: MintableAsset[];
  userBal: number;
  ownDebt: number;
  ownDebts: Record<string, number>;
  rltCapacity: Record<string, { debt: number; positions: number }>;
  rltQueue: ReturnType<typeof getRLTQueue>;
  totalRltCapacity: number;
  ammDev: number;
  price: number;
  ammPrice: number;
  redeemTokens: number;
  redeemGrossOracle: number;
  redeemFee: number;
  redeemNetUSD: number;
};

function RedeemForm(p: RedeemFormProps) {
  const { getPrice } = useLivePrices();
  const queueForAsset = p.rltQueue.filter((v) => v.asset === p.selAsset.symbol);

  return (
    <>
      <div style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 8, background: 'var(--bg-inset)', border: '1px solid var(--line-1)' }}>
        {([['repay', 'Repay my debt'], ['external', 'Redeem via RLT']] as const).map(([id, l]) => (
          <button
            key={id}
            onClick={() => p.setRedeemMode(id)}
            style={{
              flex: 1, padding: '7px 0', border: 'none', borderRadius: 6, cursor: 'pointer',
              fontSize: 11, fontWeight: p.redeemMode === id ? 700 : 500,
              background: p.redeemMode === id ? 'var(--glass-hover)' : 'transparent',
              color: p.redeemMode === id ? 'var(--ink-1)' : 'var(--ink-3)', fontFamily: 'inherit',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      <div>
        <div className="spread" style={{ marginBottom: 6 }}>
          <span className="lbl">{p.redeemMode === 'repay' ? 'Select rToken with debt' : 'Available RLT capacity'}</span>
          {p.redeemMode === 'external' && (
            <span style={{ fontSize: 10, color: 'var(--ink-3)', fontFamily: 'JetBrains Mono' }}>
              Total {fmtUSD(p.totalRltCapacity)}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 260, overflowY: 'auto', paddingRight: 4 }}>
          {p.avail.map((a) => {
            const debt = p.ownDebts[a.symbol] || 0;
            const hasDebt = debt > 0;
            const cap = p.rltCapacity[a.symbol];
            const rltDebt = cap?.debt || 0;
            const rltPos = cap?.positions || 0;
            const show = p.redeemMode === 'repay' ? hasDebt : rltDebt > 0;
            const sel = p.selAsset.symbol === a.symbol;
            const pxNow = getPrice(a.symbol, 'gmx').price || a.price;
            return (
              <button
                key={a.symbol}
                disabled={!show}
                onClick={() => { if (show) { p.setSelAsset(a); p.setRedeemAmt(''); } }}
                style={{
                  display: 'grid', gridTemplateColumns: '28px 1fr auto auto', gap: 10,
                  alignItems: 'center', padding: '9px 12px', borderRadius: 7,
                  border: sel ? '1px solid var(--cobalt-line)' : '1px solid var(--line-1)',
                  background: sel ? 'var(--cobalt-soft)' : 'var(--bg-inset)',
                  cursor: show ? 'pointer' : 'not-allowed', color: 'var(--ink-1)', textAlign: 'left',
                  opacity: show ? 1 : 0.3, fontFamily: 'inherit',
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 14, background: sel ? 'var(--cobalt-soft)' : 'var(--glass-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: sel ? 'var(--cobalt)' : 'var(--ink-2)', fontFamily: 'JetBrains Mono' }}>
                  {a.symbol.slice(0, 3)}
                </div>
                <div>
                  <div className="num" style={{ fontWeight: 700, fontSize: 12 }}>
                    r{a.symbol}
                    <span style={{ color: 'var(--ink-4)', fontWeight: 500, marginLeft: 4 }}>{a.name}</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 1 }}>
                    {p.redeemMode === 'repay'
                      ? hasDebt ? `Debt ${debt.toFixed(4)} r${a.symbol} · ${fmtUSD(debt * pxNow)}` : 'no debt'
                      : rltDebt > 0 ? `${rltPos} ${rltPos === 1 ? 'position' : 'positions'} in RLT · FIFO` : 'no RLT capacity'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {p.redeemMode === 'repay' ? (
                    <>
                      <div className="num" style={{ fontSize: 11, color: hasDebt ? 'var(--cobalt)' : 'var(--ink-4)', fontWeight: 700 }}>
                        {hasDebt ? fmtUSD(debt * pxNow) : '—'}
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--ink-4)', marginTop: 1 }}>oracle</div>
                    </>
                  ) : (
                    <>
                      <div className="num" style={{ fontSize: 11, color: rltDebt > 0 ? 'var(--amber)' : 'var(--ink-4)', fontWeight: 700 }}>
                        {rltDebt > 0 ? fmtUSD(rltDebt) : '—'}
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--ink-4)', marginTop: 1 }}>capacity</div>
                    </>
                  )}
                </div>
                <div className="num" style={{ fontSize: 12, color: sel ? 'var(--cobalt)' : 'var(--ink-4)', textAlign: 'right', minWidth: 16 }}>
                  {sel ? '✓' : '›'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="spread" style={{ marginBottom: 6 }}>
          <span className="lbl">Amount (r{p.selAsset.symbol})</span>
          <span style={{ fontSize: 10, color: 'var(--ink-3)', fontFamily: 'JetBrains Mono' }}>
            {p.redeemMode === 'repay' ? 'Debt' : 'Balance'} {(p.redeemMode === 'repay' ? p.ownDebt : p.userBal).toFixed(4)}
          </span>
        </div>
        <div className="field">
          <input
            type="number" value={p.redeemAmt}
            onChange={(e) => p.setRedeemAmt(e.target.value)}
            placeholder="0.00"
          />
          <span className="field-affix">r{p.selAsset.symbol}</span>
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              onClick={() => p.setRedeemAmt((((p.redeemMode === 'repay' ? p.ownDebt : p.userBal) * pct) / 100).toFixed(6))}
              style={{ flex: 1, padding: '5px 0', borderRadius: 5, border: '1px solid var(--line-1)', background: 'transparent', color: 'var(--ink-3)', fontSize: 10, cursor: 'pointer', fontFamily: 'JetBrains Mono' }}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {p.redeemMode === 'repay' && (
        <div style={{ padding: 14, borderRadius: 10, background: 'var(--bg-inset)', border: '1px solid var(--line-1)' }}>
          <div className="spread" style={{ marginBottom: 10 }}>
            <div className="lbl">Peg status · r{p.selAsset.symbol}</div>
            <PegTag dev={p.ammDev} size="sm" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={{ fontSize: 9, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Oracle</div>
              <div className="num" style={{ fontSize: 13, fontWeight: 700, marginTop: 3 }}>{fmtUSD(p.price, 2)}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AMM</div>
              <div className="num" style={{ fontSize: 13, fontWeight: 700, marginTop: 3, color: 'var(--cobalt)' }}>{fmtUSD(p.ammPrice, 2)}</div>
            </div>
          </div>
        </div>
      )}

      {p.redeemMode === 'repay' ? (
        <>
          <div style={{ padding: 16, borderRadius: 12, background: 'var(--cobalt-soft)', border: '1px solid var(--cobalt-line)' }}>
            <div style={{ fontSize: 10, color: 'var(--cobalt)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>Debt reduced</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="num" style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink-1)', letterSpacing: '-0.02em' }}>
                {fmtUSD(p.redeemGrossOracle, 2)}
              </span>
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>USDC</span>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[
                ['Redeem', `${p.redeemTokens.toFixed(4)} r${p.selAsset.symbol}`],
                ['Oracle price', fmtUSD(p.price, 2)],
                ['Debt before', fmtUSD(p.ownDebt * p.price, 2)],
                ['Debt after', fmtUSD(Math.max(0, (p.ownDebt - p.redeemTokens) * p.price), 2)],
                ['Redemption fee', '— (waived for own vault)'],
              ].map(([l, v], i) => (
                <div key={i} className="spread" style={{ fontSize: 11 }}>
                  <span style={{ color: 'var(--ink-3)' }}>{l}</span>
                  <span className="num" style={{ fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 14, borderRadius: 10, background: 'var(--bg-inset)', border: '1px solid var(--line-1)', fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.55 }}>
            <b style={{ color: 'var(--ink-2)' }}>Repay mode.</b> Return r{p.selAsset.symbol} to reduce your vault debt at oracle price. Source the rToken however you want — from a prior mint, from the AMM, or from a transfer.
          </div>
        </>
      ) : (
        <>
          <div style={{ padding: 16, borderRadius: 12, background: 'var(--cobalt-soft)', border: '1px solid var(--cobalt-line)' }}>
            <div style={{ fontSize: 10, color: 'var(--cobalt)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>You receive</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="num" style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink-1)', letterSpacing: '-0.02em' }}>
                {fmtUSD(p.redeemNetUSD, 2)}
              </span>
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>USDC</span>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[
                ['Redeem', `${p.redeemTokens.toFixed(4)} r${p.selAsset.symbol}`],
                ['Oracle value', '+' + fmtUSD(p.redeemGrossOracle, 2)],
                ['Redemption fee (0.2%)', p.redeemFee > 0 ? '−$' + p.redeemFee.toFixed(2) : '—'],
              ].map(([l, v], i) => (
                <div key={i} className="spread" style={{ fontSize: 11 }}>
                  <span style={{ color: 'var(--ink-3)' }}>{l}</span>
                  <span className="num" style={{ fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 14, borderRadius: 10, background: 'var(--bg-inset)', border: '1px solid var(--line-1)' }}>
            <div className="spread" style={{ marginBottom: 8 }}>
              <span className="lbl">RLT queue · r{p.selAsset.symbol}</span>
              <span style={{ fontSize: 10, color: 'var(--ink-3)', fontFamily: 'JetBrains Mono' }}>FIFO</span>
            </div>
            {queueForAsset.length === 0 ? (
              <div style={{ fontSize: 11, color: 'var(--ink-4)', padding: '8px 0' }}>
                No r{p.selAsset.symbol} positions in RLT zone
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {queueForAsset.slice(0, 3).map((v, i) => (
                  <div key={v.id} className="spread" style={{ fontSize: 11, padding: '4px 0', borderBottom: i < Math.min(queueForAsset.length, 3) - 1 ? '1px solid var(--line-1)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="chip" style={{ fontSize: 9, padding: '1px 6px' }}>
                        {i === 0 ? 'NEXT' : `#${i + 1}`}
                      </span>
                      <span className="num" style={{ color: 'var(--ink-2)' }}>{v.id}</span>
                      <span style={{ color: 'var(--ink-4)', fontSize: 10 }}>{v.lev} · LTV {v.ltv}%</span>
                    </div>
                    <span className="num" style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{fmtUSD(v.debt)}</span>
                  </div>
                ))}
                {queueForAsset.length > 3 && (
                  <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2 }}>+{queueForAsset.length - 3} more queued</div>
                )}
              </div>
            )}
          </div>

          <div style={{ padding: 14, borderRadius: 10, background: 'var(--bg-inset)', border: '1px solid var(--line-1)', fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.55 }}>
            <b style={{ color: 'var(--ink-2)' }}>External RLT redeem.</b> Hand r{p.selAsset.symbol} to the protocol; the first vault in the RLT queue is closed and you receive the oracle value of its collateral. No debt, no vault required.
          </div>
        </>
      )}

      <button
        disabled={
          p.redeemTokens <= 0 ||
          p.redeemTokens >
            (p.redeemMode === 'repay'
              ? p.ownDebt
              : (p.rltCapacity[p.selAsset.symbol]?.debt || 0) / p.price)
        }
        style={{
          width: '100%', padding: '13px 0', borderRadius: 10, border: 'none',
          cursor: p.redeemTokens > 0 ? 'pointer' : 'not-allowed',
          fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
          background: p.redeemTokens > 0
            ? 'linear-gradient(180deg, var(--cobalt), oklch(0.58 0.17 258))'
            : 'var(--glass-2)',
          color: p.redeemTokens > 0 ? '#fff' : 'var(--ink-4)',
          boxShadow: p.redeemTokens > 0
            ? '0 8px 24px var(--cobalt-soft), inset 0 1px 0 rgba(255,255,255,0.2)'
            : 'none',
          fontFamily: 'inherit',
        }}
      >
        {p.redeemMode === 'repay'
          ? p.redeemTokens > p.ownDebt ? 'Exceeds your debt' : `Repay r${p.selAsset.symbol} debt`
          : p.redeemTokens * p.price > (p.rltCapacity[p.selAsset.symbol]?.debt || 0)
          ? 'Exceeds RLT capacity'
          : 'Redeem via RLT'}
      </button>
    </>
  );
}

// ============== REDEEM PREVIEW ==============
type RedeemPreviewProps = {
  redeemMode: RedeemMode;
  selAsset: MintableAsset;
  ownDebt: number;
  price: number;
  lp: { change: number };
  rltCapacity: Record<string, { debt: number; positions: number }>;
};

function RedeemPreview(p: RedeemPreviewProps) {
  const cap = p.rltCapacity[p.selAsset.symbol];
  const has = p.redeemMode === 'repay' ? p.ownDebt > 0 : (cap?.debt || 0) > 0;

  return (
    <div className="glass" style={{ padding: 24 }}>
      <div className="spread" style={{ marginBottom: 16 }}>
        <div className="lbl">
          {p.redeemMode === 'repay' ? `Your r${p.selAsset.symbol} debt` : `r${p.selAsset.symbol} RLT summary`}
        </div>
        {p.redeemMode === 'external' && (
          <span className="chip" style={{ background: 'var(--amber-soft)', color: 'var(--amber)', borderColor: 'oklch(0.80 0.15 75 / 0.3)', fontSize: 10 }}>
            {cap?.positions || 0} in queue
          </span>
        )}
      </div>
      {has ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {p.redeemMode === 'repay' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 6 }}>
              <Stat
                l="Outstanding debt"
                v={<span>{p.ownDebt.toFixed(4)} <span style={{ color: 'var(--cobalt)' }}>r{p.selAsset.symbol}</span></span>}
                sub={'≈ ' + fmtUSD(p.ownDebt * p.price)}
              />
              <Stat
                l="Current oracle"
                v={fmtUSD(p.price, 2)}
                sub={<span style={{ color: p.lp.change >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{fmtPct(p.lp.change)}</span>}
              />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 6 }}>
              <Stat
                l="RLT capacity"
                v={fmtUSD(cap?.debt || 0)}
                sub={`${cap?.positions || 0} ${cap?.positions === 1 ? 'vault' : 'vaults'} · FIFO`}
              />
              <Stat
                l="Oracle price"
                v={fmtUSD(p.price, 2)}
                sub={<span style={{ color: p.lp.change >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{fmtPct(p.lp.change)}</span>}
              />
            </div>
          )}
          <div style={{ padding: 14, borderRadius: 10, background: 'var(--bg-inset)', border: '1px solid var(--line-1)', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {(p.redeemMode === 'repay'
              ? [['Redemption path', 'Own vault · oracle'], ['Fee', 'waived (own debt)'], ['Settlement', 'Atomic · 1 tx']]
              : [['Redemption path', 'RLT queue · oracle out'], ['Fee', '0.2%'], ['Settlement', 'Atomic · 1 tx'], ['Queue', `${cap?.positions || 0} vault${cap?.positions === 1 ? '' : 's'}`]]
            ).map(([l, v], i) => (
              <div key={i} className="spread" style={{ fontSize: 12 }}>
                <span style={{ color: 'var(--ink-3)' }}>{l}</span>
                <span className="num" style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: 30, textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>∅</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
            {p.redeemMode === 'repay' ? `No r${p.selAsset.symbol} debt` : `No r${p.selAsset.symbol} in RLT zone`}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 4 }}>
            {p.redeemMode === 'repay'
              ? 'Mint rTokens first to have debt to repay.'
              : 'No positions are currently redeemable for this asset. Wait for an LTV to cross into the RLT range.'}
          </div>
        </div>
      )}
    </div>
  );
}
