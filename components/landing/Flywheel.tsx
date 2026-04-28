const items = [
  { c: 'c1', h: 'Traders mint and sell', p: 'Open positions become rTokens, hit the AMM, convert to USDC. Supply in.' },
  { c: 'c2', h: 'rYield vaults buy', p: 'USDC deposits route through the AMM into rTokens. Demand in.' },
  { c: 'c3', h: 'LPs collect the spread', p: 'Structural flow. Not speculation. Fees scale linearly with protocol usage.' },
  { c: 'c4', h: 'Arbitrage holds the line', p: 'AMM drifts from oracle? Arbs close it. rTokens track fair value. Always.' },
];

const dotColors: Record<string, string> = {
  c1: 'oklch(0.84 0.17 128)', // lime
  c2: 'oklch(0.70 0.17 258)', // cobalt
  c3: 'oklch(0.72 0.16 300)', // violet
  c4: 'oklch(0.80 0.15 75)',  // amber
};

export default function Flywheel() {
  return (
    <section
      id="flywheel"
      className="container-wide"
      style={{ paddingTop: 'clamp(80px, 10vw, 120px)', paddingBottom: 'clamp(80px, 10vw, 120px)' }}
    >
      <div className="reveal" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <span className="eyebrow-sm">Flywheel</span>
        <h2 className="section-title" style={{ margin: '0 auto 24px', textAlign: 'center' }}>
          The system feeds itself.
        </h2>
        <p className="section-sub" style={{ margin: '0 auto', textAlign: 'center' }}>
          Trader mint-sell meets rYield buy pressure in the same AMM. Volume prints fees. Fees pull liquidity. Repeat.
        </p>
      </div>

      <div
        className="flywheel-wrap"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'clamp(40px, 6vw, 80px)',
          alignItems: 'center',
          marginTop: 'clamp(64px, 8vw, 96px)',
        }}
      >
        <FlywheelDiagram />

        <div className="flywheel-list reveal d1" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map((it) => (
            <div
              key={it.h}
              className="item"
              style={{
                padding: '16px 18px',
                borderRadius: 12,
                background: 'linear-gradient(180deg, var(--bg-1), var(--bg-2))',
                border: '1px solid var(--line-1)',
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  marginTop: 5,
                  flexShrink: 0,
                  background: dotColors[it.c],
                  boxShadow: `0 0 10px ${dotColors[it.c]}`,
                }}
              />
              <div>
                <h5 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{it.h}</h5>
                <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.55, margin: 0 }}>{it.p}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FlywheelDiagram() {
  return (
    <div className="flywheel-svg-wrap reveal" style={{ width: '100%', maxWidth: 'min(520px, 100%)', margin: '0 auto' }}>
      <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', aspectRatio: '1', display: 'block' }}>
        <defs>
          <filter id="glow"><feGaussianBlur stdDeviation="3" /></filter>
          <marker id="arr-lime" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="oklch(0.84 0.17 128)" />
          </marker>
          <marker id="arr-cob" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="oklch(0.70 0.17 258)" />
          </marker>
          <marker id="arr-vio" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="oklch(0.72 0.16 300)" />
          </marker>
          <marker id="arr-amb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="oklch(0.80 0.15 75)" />
          </marker>
        </defs>

        {/* Outer rings */}
        <circle cx="200" cy="200" r="180" fill="none" stroke="var(--line-1)" strokeWidth="1" />
        <circle
          cx="200"
          cy="200"
          r="160"
          fill="none"
          stroke="var(--line-2)"
          strokeWidth="1"
          strokeDasharray="4 6"
          style={{ transformOrigin: '200px 200px', animation: 'spin 60s linear infinite' }}
        />
        <circle cx="200" cy="200" r="90" fill="none" stroke="var(--line-1)" strokeWidth="1" />

        {/* Center label */}
        <text
          x="200" y="195" textAnchor="middle" fontSize="12" fill="var(--ink-3)"
          style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}
        >
          RYex
        </text>
        <text
          x="200" y="212" textAnchor="middle" fill="var(--ink-1)" fontSize="11" fontWeight="700"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          CORE
        </text>

        {/* Nodes: traders top, rYield right, LPs bottom, Arbs left */}
        <g style={{ filter: 'drop-shadow(0 0 12px oklch(0.84 0.17 128))' }}>
          <circle cx="200" cy="40" r="10" fill="oklch(0.84 0.17 128)" />
        </g>
        <text x="200" y="22" textAnchor="middle" fill="var(--ink-1)" fontSize="14" fontWeight="600" style={{ fontFamily: 'Inter, sans-serif' }}>Traders</text>
        <text x="200" y="62" textAnchor="middle" fill="var(--ink-3)" fontSize="10" fontWeight="500" style={{ fontFamily: 'Inter, sans-serif' }}>mint → sell</text>

        <g style={{ filter: 'drop-shadow(0 0 12px oklch(0.70 0.17 258))' }}>
          <circle cx="360" cy="200" r="10" fill="oklch(0.70 0.17 258)" />
        </g>
        <text x="360" y="186" textAnchor="middle" fill="var(--ink-1)" fontSize="14" fontWeight="600" style={{ fontFamily: 'Inter, sans-serif' }}>rYield</text>
        <text x="360" y="222" textAnchor="middle" fill="var(--ink-3)" fontSize="10" fontWeight="500" style={{ fontFamily: 'Inter, sans-serif' }}>buys rTokens</text>

        <g style={{ filter: 'drop-shadow(0 0 12px oklch(0.72 0.16 300))' }}>
          <circle cx="200" cy="360" r="10" fill="oklch(0.72 0.16 300)" />
        </g>
        <text x="200" y="345" textAnchor="middle" fill="var(--ink-1)" fontSize="14" fontWeight="600" style={{ fontFamily: 'Inter, sans-serif' }}>LPs</text>
        <text x="200" y="382" textAnchor="middle" fill="var(--ink-3)" fontSize="10" fontWeight="500" style={{ fontFamily: 'Inter, sans-serif' }}>earn swap fees</text>

        <g style={{ filter: 'drop-shadow(0 0 12px oklch(0.80 0.15 75))' }}>
          <circle cx="40" cy="200" r="10" fill="oklch(0.80 0.15 75)" />
        </g>
        <text x="40" y="186" textAnchor="middle" fill="var(--ink-1)" fontSize="14" fontWeight="600" style={{ fontFamily: 'Inter, sans-serif' }}>Arbs</text>
        <text x="40" y="222" textAnchor="middle" fill="var(--ink-3)" fontSize="10" fontWeight="500" style={{ fontFamily: 'Inter, sans-serif' }}>peg + redeem</text>

        {/* Flow arrows (clockwise marching ants, shortened arcs sit clear of node labels) */}
        <path
          d="M 255,50 A 160,160 0 0 1 350,145"
          fill="none"
          stroke="oklch(0.84 0.17 128)"
          strokeWidth="2"
          opacity="0.85"
          strokeDasharray="6 10"
          markerEnd="url(#arr-lime)"
          style={{ animation: 'flow-march 6s linear infinite' }}
        />
        <path
          d="M 350,255 A 160,160 0 0 1 255,350"
          fill="none"
          stroke="oklch(0.70 0.17 258)"
          strokeWidth="2"
          opacity="0.85"
          strokeDasharray="6 10"
          markerEnd="url(#arr-cob)"
          style={{ animation: 'flow-march 6s linear infinite' }}
        />
        <path
          d="M 145,350 A 160,160 0 0 1 50,255"
          fill="none"
          stroke="oklch(0.72 0.16 300)"
          strokeWidth="2"
          opacity="0.85"
          strokeDasharray="6 10"
          markerEnd="url(#arr-vio)"
          style={{ animation: 'flow-march 6s linear infinite' }}
        />
        <path
          d="M 50,145 A 160,160 0 0 1 145,50"
          fill="none"
          stroke="oklch(0.80 0.15 75)"
          strokeWidth="2"
          opacity="0.85"
          strokeDasharray="6 10"
          markerEnd="url(#arr-amb)"
          style={{ animation: 'flow-march 6s linear infinite' }}
        />
      </svg>
    </div>
  );
}
