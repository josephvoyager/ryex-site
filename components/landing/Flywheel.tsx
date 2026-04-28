const items = [
  { c: 'c1', h: 'Traders mint and sell', p: 'Open positions become rTokens, hit the AMM, convert to USDC. Supply in.' },
  { c: 'c2', h: 'rYield vaults buy', p: 'USDC deposits route through the AMM into rTokens. Demand in.' },
  { c: 'c3', h: 'LPs collect the spread', p: 'Structural flow. Not speculation. Fees scale linearly with protocol usage.' },
  { c: 'c4', h: 'Arbitrage holds the line', p: 'AMM drifts from oracle? Arbs close it. rTokens track fair value over time.' },
];

const dotColors = {
  c1: 'var(--lime)',
  c2: 'var(--cobalt)',
  c3: 'var(--violet)',
  c4: 'var(--amber)',
} as const;

export default function Flywheel() {
  return (
    <section id="flywheel" className="container-wide" style={{ paddingTop: 'clamp(80px, 10vw, 120px)', paddingBottom: 'clamp(80px, 10vw, 120px)' }}>
      <div className="reveal" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <span className="eyebrow-sm">Flywheel</span>
        <h2 className="section-title" style={{ margin: '0 auto 24px', textAlign: 'center' }}>
          The system feeds itself.
        </h2>
        <p className="section-sub" style={{ margin: '0 auto', textAlign: 'center' }}>
          Trader mint and sell meets rYield buy pressure in the same AMM. Volume prints fees. Fees pull liquidity. Repeat.
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
                className={`dot ${it.c}`}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  marginTop: 5,
                  flexShrink: 0,
                  background: dotColors[it.c as keyof typeof dotColors],
                  boxShadow: `0 0 10px ${dotColors[it.c as keyof typeof dotColors]}`,
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
  // 4 nodes around a circle, with arrows between them indicating flow
  const nodeRadius = 160; // distance from center to node
  const cx = 200;
  const cy = 200;
  const angles = [-90, 0, 90, 180]; // top, right, bottom, left
  const labels = ['Mint', 'AMM', 'rYield', 'LPs'];
  const colors = ['var(--lime)', 'var(--cobalt)', 'var(--violet)', 'var(--amber)'];

  return (
    <div className="flywheel-svg-wrap reveal" style={{ position: 'relative', maxWidth: 'min(440px, 100%)', aspectRatio: '1', margin: '0 auto' }}>
      <svg
        className="flywheel-svg"
        viewBox="0 0 400 400"
        style={{ width: '100%', height: '100%', display: 'block' }}
        aria-hidden
      >
        <defs>
          {colors.map((c, i) => (
            <marker
              key={i}
              id={`arr-${i}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0,0 L 10,5 L 0,10 z" fill={c} />
            </marker>
          ))}
        </defs>

        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={nodeRadius} stroke="var(--line-1)" strokeWidth="1" fill="none" />

        {/* Center: RYex CORE */}
        <circle cx={cx} cy={cy} r="60" fill="var(--bg-2)" stroke="var(--line-2)" strokeWidth="1" />
        <text x={cx} y={cy - 4} textAnchor="middle" fill="var(--ink-1)" fontSize="13" fontWeight="700" fontFamily="Inter">
          RYex
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--ink-3)" fontSize="9" fontWeight="500" fontFamily="JetBrains Mono" letterSpacing="0.18em">
          CORE
        </text>

        {/* Nodes */}
        {angles.map((a, i) => {
          const rad = (a * Math.PI) / 180;
          const x = cx + nodeRadius * Math.cos(rad);
          const y = cy + nodeRadius * Math.sin(rad);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="32" fill="var(--bg-1)" stroke={colors[i]} strokeWidth="1.5" />
              <text x={x} y={y + 4} textAnchor="middle" fill={colors[i]} fontSize="12" fontWeight="700" fontFamily="JetBrains Mono">
                {labels[i]}
              </text>
            </g>
          );
        })}

        {/* Marching-ant arcs between nodes — indicate flow direction */}
        {[0, 1, 2, 3].map((i) => {
          const a1 = angles[i] + 14;
          const a2 = angles[(i + 1) % 4] - 14;
          const r = nodeRadius;
          const rad1 = (a1 * Math.PI) / 180;
          const rad2 = (a2 * Math.PI) / 180;
          const x1 = cx + r * Math.cos(rad1);
          const y1 = cy + r * Math.sin(rad1);
          const x2 = cx + r * Math.cos(rad2);
          const y2 = cy + r * Math.sin(rad2);
          return (
            <path
              key={i}
              d={`M ${x1},${y1} A ${r},${r} 0 0 1 ${x2},${y2}`}
              stroke={colors[i]}
              strokeWidth="2"
              fill="none"
              strokeDasharray="6 10"
              markerEnd={`url(#arr-${i})`}
              style={{
                animation: `flow-march 2s linear infinite`,
              }}
            />
          );
        })}
      </svg>
      <style>{`
        @keyframes flow-march {
          to { stroke-dashoffset: -32; }
        }
      `}</style>
    </div>
  );
}
