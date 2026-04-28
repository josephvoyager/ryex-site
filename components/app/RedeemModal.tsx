'use client';

import { useState } from 'react';
import { useLivePrices } from '@/lib/usePrices';
import { fmtUSD } from '@/lib/format';
import type { EnrichedLiqVault } from '@/lib/data';

type Props = { vault: EnrichedLiqVault; onClose: () => void };

export default function RedeemModal({ vault, onClose }: Props) {
  const { getPrice } = useLivePrices();
  const price = getPrice(vault.asset, 'gmx').price || 1;
  const maxRTokens = vault.debt / price;
  const [amt, setAmt] = useState(maxRTokens.toFixed(4));
  const amtNum = Math.max(0, Math.min(+amt || 0, maxRTokens));

  const usdValue = amtNum * price;
  const fee = usdValue * 0.002;
  const userReceives = usdValue - fee;

  const setPct = (p: number) => setAmt((maxRTokens * p / 100).toFixed(4));

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 460,
          width: '100%',
          background: 'var(--bg-1)',
          border: '1px solid var(--line-2)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--line-1)', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Redeem Position</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
              Close debt at oracle price, earn the 0.2% spread on settlement
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: 6,
              borderRadius: 6,
              border: 'none',
              background: 'transparent',
              color: 'var(--ink-3)',
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              ['Position', vault.id, 'var(--ink-1)'],
              ['Asset', 'r' + vault.asset, 'var(--cobalt)'],
              ['Leverage', vault.lev, 'var(--ink-1)'],
              ['Collateral', fmtUSD(vault.collateral), 'var(--ink-1)'],
              ['Debt', fmtUSD(vault.debt), 'var(--cobalt)'],
              ['LTV', vault.ltv + '%', 'var(--amber)'],
            ].map(([l, v, col], i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--line-1)' }}>
                <div style={{ fontSize: 9, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{l}</div>
                <div className="num" style={{ fontSize: 13, fontWeight: 700, color: col }}>{v}</div>
              </div>
            ))}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Redeem Amount (r{vault.asset})</span>
              <span style={{ fontSize: 10, color: 'var(--ink-3)', fontFamily: 'JetBrains Mono' }}>
                Max: {maxRTokens.toFixed(4)} r{vault.asset}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 8 }}>
              <input
                type="number"
                value={amt}
                onChange={e => setAmt(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--ink-1)',
                  fontSize: 18,
                  fontFamily: 'JetBrains Mono',
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'JetBrains Mono' }}>r{vault.asset}</span>
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
              {[25, 50, 75, 100].map(p => (
                <button
                  key={p}
                  onClick={() => setPct(p)}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    borderRadius: 6,
                    border: '1px solid var(--line-1)',
                    background: 'var(--bg-2)',
                    color: 'var(--ink-3)',
                    fontSize: 11,
                    cursor: 'pointer',
                    fontFamily: 'JetBrains Mono',
                    fontWeight: 600,
                  }}
                >
                  {p === 100 ? 'Max' : p + '%'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: 14, borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--line-1)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              ['You provide', amtNum.toFixed(4) + ' r' + vault.asset, 'var(--cobalt)', false],
              ['Oracle value', '+' + fmtUSD(usdValue, 2), 'var(--pos)', false],
              ['Redemption fee (0.2%)', '−$' + fee.toFixed(2), 'var(--neg)', false],
              ['You receive (USDC)', fmtUSD(userReceives, 2), 'var(--pos)', true],
            ].map(([l, v, col, bold], i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  paddingTop: bold ? 6 : 0,
                  borderTop: bold ? '1px solid var(--line-1)' : 'none',
                  marginTop: bold ? 2 : 0,
                }}
              >
                <span style={{ color: 'var(--ink-3)', fontWeight: bold ? 600 : 500 }}>{l}</span>
                <span className="num" style={{ fontWeight: bold ? 800 : 600, color: col as string }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
            <button
              onClick={onClose}
              style={{
                padding: '13px 0',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 10,
                border: '1px solid var(--line-2)',
                background: 'var(--bg-2)',
                color: 'var(--ink-1)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              disabled={amtNum <= 0}
              style={{
                padding: '13px 0',
                borderRadius: 10,
                border: 'none',
                cursor: amtNum > 0 ? 'pointer' : 'not-allowed',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.04em',
                background: amtNum > 0 ? 'linear-gradient(180deg, var(--cobalt), oklch(0.58 0.17 258))' : 'var(--bg-2)',
                color: amtNum > 0 ? '#fff' : 'var(--ink-4)',
                boxShadow: amtNum > 0 ? '0 8px 24px var(--cobalt-soft), inset 0 1px 0 rgba(255,255,255,0.2)' : 'none',
              }}
            >
              Confirm Redeem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
