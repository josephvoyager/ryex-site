'use client';

import { useState } from 'react';
import { useLivePrices } from '@/lib/usePrices';
import { MINTABLE_ASSETS } from '@/lib/data';
import { fmtUSD, fmtPct } from '@/lib/format';
import PageHeader from '@/components/ui/PageHeader';

export default function SwapPage() {
  const { getPrice } = useLivePrices();
  const [fromSym, setFromSym] = useState('USDC');
  const [toSym, setToSym] = useState('rBTC');
  const [amt, setAmt] = useState('1000');

  const target = MINTABLE_ASSETS.find(a => 'r' + a.symbol === toSym) || MINTABLE_ASSETS[0];
  const oraclePrice = getPrice(target.symbol, 'gmx').price || target.price;
  const ammPrice = oraclePrice * (0.998 + Math.random() * 0.004); // small drift simulation
  const peg = (ammPrice / oraclePrice - 1) * 100;

  const amtNum = +amt || 0;
  const out = fromSym === 'USDC' ? amtNum / ammPrice : amtNum * ammPrice;

  return (
    <div className="animate-in" style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader
        title="Swap"
        oneLiner="rToken ↔ USDC AMM. Arbitrage holds the peg. No emissions, no tricks — just structural flow."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, maxWidth: 480, margin: '24px auto 0' }}>
        {/* Swap card */}
        <div style={{ padding: 24, background: 'linear-gradient(180deg, var(--bg-1), var(--bg-2))', border: '1px solid var(--line-1)', borderRadius: 16 }}>
          <div style={{ marginBottom: 20 }}>
            <div className="lbl" style={{ marginBottom: 8 }}>From</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '12px 14px', background: 'var(--bg-2)', borderRadius: 10, border: '1px solid var(--line-1)' }}>
              <input
                type="number"
                value={amt}
                onChange={e => setAmt(e.target.value)}
                style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--ink-1)', fontSize: 22, outline: 'none', fontFamily: 'JetBrains Mono' }}
              />
              <select
                value={fromSym}
                onChange={e => { setFromSym(e.target.value); setToSym(e.target.value === 'USDC' ? 'rBTC' : 'USDC'); }}
                style={{ background: 'var(--bg-1)', border: '1px solid var(--line-2)', borderRadius: 8, padding: '8px 10px', color: 'var(--ink-1)', fontSize: 12, fontWeight: 600, fontFamily: 'JetBrains Mono', cursor: 'pointer' }}
              >
                <option value="USDC">USDC</option>
                {MINTABLE_ASSETS.map(a => (
                  <option key={a.symbol} value={'r' + a.symbol}>r{a.symbol}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '-8px 0' }}>
            <button
              onClick={() => { const t = fromSym; setFromSym(toSym); setToSym(t); }}
              style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--line-2)', background: 'var(--bg-2)', cursor: 'pointer', color: 'var(--ink-2)', fontSize: 14 }}
            >
              ↓
            </button>
          </div>

          <div style={{ marginTop: 12 }}>
            <div className="lbl" style={{ marginBottom: 8 }}>To</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '12px 14px', background: 'var(--bg-2)', borderRadius: 10, border: '1px solid var(--line-1)' }}>
              <span className="num" style={{ flex: 1, color: out > 0 ? 'var(--ink-1)' : 'var(--ink-4)', fontSize: 22 }}>
                {out.toFixed(out < 1 ? 4 : 2)}
              </span>
              <select
                value={toSym}
                onChange={e => setToSym(e.target.value)}
                style={{ background: 'var(--bg-1)', border: '1px solid var(--line-2)', borderRadius: 8, padding: '8px 10px', color: 'var(--ink-1)', fontSize: 12, fontWeight: 600, fontFamily: 'JetBrains Mono', cursor: 'pointer' }}
              >
                <option value="USDC">USDC</option>
                {MINTABLE_ASSETS.map(a => (
                  <option key={a.symbol} value={'r' + a.symbol}>r{a.symbol}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            disabled={amtNum <= 0}
            style={{
              width: '100%',
              marginTop: 20,
              padding: '14px 0',
              borderRadius: 10,
              border: 'none',
              cursor: amtNum > 0 ? 'pointer' : 'not-allowed',
              fontSize: 13,
              fontWeight: 700,
              background: amtNum > 0 ? 'var(--lime)' : 'var(--bg-2)',
              color: amtNum > 0 ? 'var(--bg-0)' : 'var(--ink-4)',
            }}
          >
            {amtNum > 0 ? 'Swap' : 'Enter amount'}
          </button>
        </div>

        {/* Peg card */}
        <div style={{ padding: 18, background: 'linear-gradient(180deg, var(--bg-1), var(--bg-2))', border: '1px solid var(--line-1)', borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div className="lbl">{toSym} peg vs oracle</div>
            <span style={{ fontSize: 11, color: Math.abs(peg) < 0.5 ? 'var(--pos)' : 'var(--amber)', fontWeight: 700, fontFamily: 'JetBrains Mono' }}>
              {fmtPct(peg, 3)}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 11 }}>
            <div>
              <div style={{ color: 'var(--ink-4)', marginBottom: 3 }}>Oracle</div>
              <div className="num" style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-1)' }}>{fmtUSD(oraclePrice, 2)}</div>
            </div>
            <div>
              <div style={{ color: 'var(--ink-4)', marginBottom: 3 }}>AMM mark</div>
              <div className="num" style={{ fontSize: 14, fontWeight: 600, color: 'var(--cobalt)' }}>{fmtUSD(ammPrice, 2)}</div>
            </div>
          </div>
          <p style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 12, lineHeight: 1.5 }}>
            When AMM drifts from oracle, arbitrageurs close the gap. rTokens track fair value over time.
          </p>
        </div>
      </div>
    </div>
  );
}
