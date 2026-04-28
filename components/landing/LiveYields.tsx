type Row = {
  sym: string;
  nm: string;
  apr: number;
  tvl: string;
  fund: string;
  vol: string;
  hl?: boolean;
};

const yields: Row[] = [
  { sym: 'WTI', nm: 'Crude Oil', apr: 22.2, tvl: '$7.0M', fund: '+0.030%', vol: 'moderate', hl: true },
  { sym: 'TSLA', nm: 'Tesla', apr: 12.9, tvl: '$2.1M', fund: '+0.018%', vol: 'high' },
  { sym: 'SOL', nm: 'Solana', apr: 9.8, tvl: '$8.5M', fund: '+0.012%', vol: 'high' },
  { sym: 'HYPE', nm: 'Hyperliquid', apr: 6.7, tvl: '$4.2M', fund: '+0.015%', vol: 'very-high' },
  { sym: 'BTC', nm: 'Bitcoin', apr: 3.6, tvl: '$34.0M', fund: '+0.010%', vol: 'moderate' },
  { sym: 'ETH', nm: 'Ethereum', apr: 3.6, tvl: '$21.0M', fund: '+0.008%', vol: 'moderate' },
  { sym: 'XAUT', nm: 'Tether Gold', apr: 2.4, tvl: '$12.0M', fund: '+0.005%', vol: 'low' },
];

const aprColor = (apr: number) =>
  apr >= 15 ? 'var(--lime)' : apr >= 6 ? 'var(--ink-1)' : 'var(--ink-3)';

const volColor = (v: string) =>
  v === 'very-high' ? 'var(--neg)' : /high|moderate-high/.test(v) ? 'var(--amber)' : v === 'low' ? 'var(--pos)' : 'var(--ink-3)';

export default function LiveYields() {
  return (
    <section
      id="yields"
      className="container-wide"
      style={{ paddingTop: 'clamp(80px, 10vw, 120px)', paddingBottom: 'clamp(80px, 10vw, 120px)' }}
    >
      <div className="reveal" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
        <span className="eyebrow-sm">Yields</span>
        <h2 className="section-title" style={{ margin: '0 auto 24px', textAlign: 'center' }}>
          Funding-rate <span style={{ color: 'var(--lime)' }}>differentials.</span>
        </h2>
        <p className="section-sub" style={{ margin: '0 auto', textAlign: 'center' }}>
          Mint rTokens, short the matching perps. Earn delta-neutral yield through rTokens.
        </p>
      </div>

      <div
        className="reveal d1"
        style={{
          maxWidth: 960,
          margin: '0 auto',
          background: 'linear-gradient(180deg, var(--bg-1), var(--bg-2))',
          border: '1px solid var(--line-1)',
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        <table className="yields-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line-1)' }}>
              {['Vault', 'APR (delta-neutral)', 'TVL', 'Funding 8h', 'Vol'].map((h, i) => (
                <th
                  key={i}
                  style={{
                    textAlign: i > 0 ? 'right' : 'left',
                    padding: '16px 20px',
                    fontSize: 11,
                    color: 'var(--ink-4)',
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {yields.map((y) => (
              <tr
                key={y.sym}
                style={{
                  borderBottom: '1px solid var(--line-1)',
                  background: y.hl ? 'oklch(0.84 0.17 128 / 0.04)' : 'transparent',
                }}
              >
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        background: y.hl ? 'var(--lime-soft)' : 'var(--bg-2)',
                        border: y.hl ? '1px solid var(--lime-line)' : '1px solid var(--line-1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 9,
                        fontWeight: 700,
                        color: y.hl ? 'var(--lime)' : 'var(--ink-2)',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}
                    >
                      {y.sym.slice(0, 3)}
                    </div>
                    <div>
                      <div className="num" style={{ fontWeight: 700, fontSize: 14 }}>r{y.sym}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 1 }}>{y.nm}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <span
                    className="num"
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: aprColor(y.apr),
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {y.apr.toFixed(1)}%
                  </span>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <span className="num" style={{ color: 'var(--ink-2)', fontSize: 13 }}>{y.tvl}</span>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <span className="num" style={{ color: 'var(--ink-3)', fontSize: 13 }}>{y.fund}</span>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 11,
                      color: volColor(y.vol),
                      fontFamily: 'JetBrains Mono, monospace',
                      letterSpacing: '0.02em',
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        background: volColor(y.vol),
                        boxShadow: `0 0 6px ${volColor(y.vol)}`,
                      }}
                    />
                    {y.vol}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p
        className="reveal d2"
        style={{
          maxWidth: 960,
          margin: '20px auto 0',
          fontSize: 11,
          color: 'var(--ink-4)',
          textAlign: 'center',
          fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.04em',
        }}
      >
        Illustrative figures · numbers reflect target ranges, not live yields.
      </p>
    </section>
  );
}
