const steps = [
  {
    n: '01',
    h: 'Open the position',
    p: 'Trade Hyperliquid, GMX, or Ostium through RYex. Same liquidity. Same leverage. Same fills.',
  },
  {
    n: '02',
    h: 'Mint against it',
    p: 'Pull up to 88% of net value as rBTC, rETH, rWTI, rTSLA, or any listed asset. Your trade stays open. Your capital comes with you.',
  },
  {
    n: '03',
    h: 'Deploy anywhere',
    p: 'Sell on the AMM. LP for fees. Deposit into rYield for delta-neutral funding. Or take them onchain anywhere ERC-20s are accepted.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="container-wide" style={{ paddingTop: 'clamp(80px, 10vw, 120px)', paddingBottom: 'clamp(80px, 10vw, 120px)' }}>
      <div className="reveal" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <span className="eyebrow-sm">How it works</span>
        <h2 className="section-title" style={{ margin: '0 auto 24px', textAlign: 'center' }}>
          Three steps. One transaction.
        </h2>
        <p className="section-sub" style={{ margin: '0 auto', textAlign: 'center' }}>
          RYex routes into the venues you already trust — Hyperliquid, GMX, Ostium. Same execution. New superpower.
        </p>
      </div>

      <div
        className="how-steps"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 0,
          marginTop: 'clamp(64px, 8vw, 96px)',
          position: 'relative',
        }}
      >
        <div
          className="step-line"
          aria-hidden
          style={{
            content: '""',
            position: 'absolute',
            top: 50,
            left: '10%',
            right: '10%',
            height: 1,
            background: 'linear-gradient(90deg, transparent, var(--line-2) 20%, var(--line-2) 80%, transparent)',
            zIndex: 0,
          }}
        />
        {steps.map((s, i) => (
          <div
            key={s.n}
            className={`step reveal d${i + 1}`}
            style={{ position: 'relative', zIndex: 1, padding: '0 24px', textAlign: 'center' }}
          >
            <div
              className="num"
              style={{
                width: 100,
                height: 100,
                margin: '0 auto 26px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), var(--bg-1))',
                border: '1px solid var(--line-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                fontSize: 34,
                color: 'var(--ink-1)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {s.n}
              <span
                aria-hidden
                style={{
                  content: '""',
                  position: 'absolute',
                  inset: -8,
                  borderRadius: '50%',
                  border: '1px solid var(--line-1)',
                  opacity: 0.5,
                }}
              />
            </div>
            <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.01em' }}>{s.h}</h4>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6, maxWidth: 280, margin: '0 auto' }}>{s.p}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
