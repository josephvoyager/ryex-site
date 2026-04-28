type AprRow = { asset: string; range: string };
type Pillar = {
  iconPath: string;
  title: string;
  subtitle?: string;
  body: string;
  meta?: string[];
  aprRows?: AprRow[];
  tagline?: string;
};

const pillars: Pillar[] = [
  {
    iconPath: 'M12 2v20M2 12h20',
    title: 'rToken',
    subtitle: 'Non rebasing · Transferable',
    body:
      'Mint ERC-20 against any live perp. Non rebasing. Transferable. Redeemable at oracle, any block, no questions.',
    meta: ['Max LTV 88%'],
  },
  {
    iconPath: 'M3 17l6-6 4 4 8-8',
    title: 'rYield',
    subtitle: 'Delta neutral vault',
    body:
      'Deposit USDC. Get isolated delta-neutral exposure to funding rate. Long rToken, short matching perp — protocol manages both legs.',
    aprRows: [
      { asset: 'rWTI', range: '18.8% → 28.4%' },
      { asset: 'rTSLA', range: '8.6% → 12.9%' },
      { asset: 'rSOL', range: '3.6% → 8.6%' },
      { asset: 'rETH', range: '1.1% → 5.5%' },
      { asset: 'rBTC', range: '0.5% → 3.6%' },
    ],
    tagline: 'Price risk hedged. Funding is the product.',
  },
  {
    iconPath: 'M4 6h16M4 12h16M4 18h10',
    title: 'Composable',
    subtitle: 'Standard ERC-20',
    body:
      'rTokens are standard ERC-20. LP them. Swap them. Lend them. Use them anywhere ERC-20 is accepted. Arbitrage holds the peg. No emissions. No tricks.',
  },
];

export default function Pillars() {
  return (
    <section id="products" className="container-wide" style={{ paddingTop: 'clamp(120px, 14vw, 180px)', paddingBottom: 'clamp(80px, 10vw, 120px)' }}>
      <div className="reveal" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 64px' }}>
        <span className="eyebrow-sm">Three primitives. One unlock.</span>
        <h2 className="section-title" style={{ margin: '0 auto 24px', textAlign: 'center' }}>
          Tokenize the trade.
          <br />
          <span style={{ color: 'var(--ink-3)', fontWeight: 800 }}>Compose the capital.</span>
        </h2>
        <p className="section-sub" style={{ margin: '0 auto', textAlign: 'center' }}>
          Three primitives that share one truth: a live perp position is collateral. RYex turns it into liquid ERC-20, hedged
          yield, and protocol-grade integrations.
        </p>
      </div>

      <div
        className="pillars-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 18,
          marginTop: 'clamp(48px, 6vw, 64px)',
        }}
      >
        {pillars.map((p, i) => (
          <div
            key={p.title}
            className={`pillar reveal d${i + 1}`}
            style={{
              padding: 'clamp(28px, 3vw, 40px) clamp(24px, 3vw, 32px) clamp(32px, 3.5vw, 44px)',
              borderRadius: 16,
              background: 'linear-gradient(180deg, var(--bg-1), var(--bg-2))',
              border: '1px solid var(--line-1)',
              transition: 'border-color .3s ease, transform .3s ease',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              className="icon"
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'var(--lime-soft)',
                border: '1px solid var(--lime-line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                color: 'var(--lime)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={p.iconPath} />
              </svg>
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', margin: 0, marginBottom: 8, display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
              {p.title}
              {p.subtitle && (
                <span className="muted" style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 500, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {p.subtitle}
                </span>
              )}
            </h3>

            <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.6, margin: 0 }}>{p.body}</p>

            {p.meta && (
              <div style={{ marginTop: 14, display: 'flex', gap: 12, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.02em' }}>
                {p.meta.map((m, j) => (
                  <span key={j}>{m}</span>
                ))}
              </div>
            )}

            {p.aprRows && (
              <div className="apr-table" style={{ marginTop: 14, borderTop: '1px solid var(--line-1)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {p.aprRows.map((r) => (
                  <div
                    key={r.asset}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 11,
                      padding: '5px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                    }}
                  >
                    <span style={{ color: 'var(--ink-3)' }}>{r.asset}</span>
                    <span style={{ color: 'var(--cobalt)', fontWeight: 700 }}>{r.range}</span>
                  </div>
                ))}
              </div>
            )}

            {p.tagline && (
              <div
                style={{
                  fontSize: 12.5,
                  color: 'var(--ink-1)',
                  fontWeight: 600,
                  marginTop: 14,
                  paddingTop: 12,
                  borderTop: '1px solid var(--line-1)',
                }}
              >
                {p.tagline}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
