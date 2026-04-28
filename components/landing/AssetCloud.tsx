type Pill = { mini: string; sym: string; nm?: string };

const inner: Pill[] = [
  { mini: 'BTC', sym: 'rBTC', nm: 'Bitcoin' },
  { mini: 'ETH', sym: 'rETH', nm: 'Ethereum' },
  { mini: 'SOL', sym: 'rSOL', nm: 'Solana' },
  { mini: 'WTI', sym: 'rWTI', nm: 'Crude Oil' },
  { mini: 'TSL', sym: 'rTSLA', nm: 'Tesla' },
  { mini: 'XAU', sym: 'rXAUT', nm: 'Gold' },
];

const mid: Pill[] = [
  { mini: 'HYP', sym: 'rHYPE' },
  { mini: 'NVD', sym: 'rNVDA' },
  { mini: 'XRP', sym: 'rXRP' },
  { mini: 'APL', sym: 'rAAPL' },
  { mini: 'SPX', sym: 'rSPX' },
  { mini: 'AVX', sym: 'rAVAX' },
  { mini: 'DOG', sym: 'rDOGE' },
  { mini: 'MSF', sym: 'rMSFT' },
];

const ghost: Pill[] = [
  { mini: 'ADA', sym: 'rADA' },
  { mini: 'LTC', sym: 'rLTC' },
  { mini: 'MAT', sym: 'rMATIC' },
  { mini: 'NG', sym: 'rNGAS' },
  { mini: 'CU', sym: 'rCOPPER' },
  { mini: 'MET', sym: 'rMETA' },
  { mini: 'AMZ', sym: 'rAMZN' },
  { mini: 'GGL', sym: 'rGOOGL' },
  { mini: 'SUI', sym: 'rSUI' },
  { mini: 'TON', sym: 'rTON' },
];

const innerAngles = [-90, -30, 30, 90, 150, 210];
const midAngles = [-112, -67, -22, 23, 68, 113, 158, 203];
const ghostAngles = [-95, -59, -23, 13, 49, 85, 121, 157, 193, 229];

export default function AssetCloud() {
  return (
    <section className="container-wide" style={{ paddingTop: 'clamp(80px, 10vw, 120px)', paddingBottom: 80 }}>
      <div className="reveal" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <span className="eyebrow-sm">Supported assets</span>
        <h2 className="section-title" style={{ margin: '0 auto 24px', textAlign: 'center' }}>
          Crypto. Commodities. Equities.
        </h2>
        <p className="section-sub" style={{ margin: '0 auto', textAlign: 'center' }}>
          RYex tokenizes perp positions. Continuous exposure. No custody. No expiries. No excuses.
        </p>
      </div>

      <div
        className="asset-cloud-wrap reveal d1"
        style={{
          position: 'relative',
          margin: 'clamp(40px,5vw,72px) auto 0',
          width: 'min(860px, 96vw)',
          aspectRatio: '1 / 1',
          maxHeight: 720,
          overflow: 'hidden',
        }}
      >
        <div
          className="asset-cloud"
          style={{
            position: 'absolute',
            inset: 0,
            WebkitMaskImage:
              'radial-gradient(ellipse at center, #000 32%, rgba(0,0,0,0.9) 58%, rgba(0,0,0,0.3) 80%, transparent 94%)',
            maskImage:
              'radial-gradient(ellipse at center, #000 32%, rgba(0,0,0,0.9) 58%, rgba(0,0,0,0.3) 80%, transparent 94%)',
          }}
        >
          {inner.map((p, i) => (
            <CPill key={p.sym} pill={p} angle={innerAngles[i]} ring="inner" />
          ))}
          {mid.map((p, i) => (
            <CPill key={p.sym} pill={p} angle={midAngles[i]} ring="mid" />
          ))}
          {ghost.map((p, i) => (
            <CPill key={p.sym} pill={p} angle={ghostAngles[i]} ring="ghost" />
          ))}
        </div>

        <div
          className="cloud-center"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 3,
            padding: '20px 28px',
            borderRadius: 24,
            background:
              'radial-gradient(ellipse at center, rgba(10,11,16,0.92) 0%, rgba(10,11,16,0.78) 55%, rgba(10,11,16,0) 90%)',
          }}
        >
          <div
            className="big inf"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(88px,13vw,160px)',
              fontWeight: 300,
              lineHeight: 0.8,
              background: 'linear-gradient(135deg, var(--lime) 0%, var(--cobalt) 55%, var(--violet) 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              letterSpacing: '-0.02em',
              filter: 'drop-shadow(0 0 24px rgba(189,227,64,0.18))',
              animation: 'inf-glow 6s ease-in-out infinite',
            }}
          >
            ∞
          </div>
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              letterSpacing: '-0.01em',
              color: 'var(--ink-2)',
              marginTop: 14,
              fontWeight: 500,
            }}
          >
            If it has a perp,
          </div>
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              letterSpacing: '-0.01em',
              color: 'var(--lime)',
              marginTop: 4,
              fontWeight: 600,
            }}
          >
            it has an rToken.
          </div>
        </div>
      </div>
      <style>{`
        @keyframes orbit-cw { to { --spin: 360deg } }
        @keyframes orbit-ccw { to { --spin: -360deg } }
        @keyframes inf-glow {
          0%, 100% { filter: drop-shadow(0 0 18px rgba(189,227,64,0.15)); }
          50% { filter: drop-shadow(0 0 32px rgba(189,227,64,0.28)); }
        }
        @property --spin { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
      `}</style>
    </section>
  );
}

function CPill({ pill, angle, ring }: { pill: Pill; angle: number; ring: 'inner' | 'mid' | 'ghost' }) {
  const ringR = ring === 'inner' ? 185 : ring === 'mid' ? 285 : 375;
  const animation =
    ring === 'mid' ? 'orbit-ccw 160s linear infinite' : ring === 'ghost' ? 'orbit-cw 220s linear infinite' : 'orbit-cw 110s linear infinite';

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: ring === 'inner' ? '9px 14px' : ring === 'mid' ? '8px 12px' : '7px 11px',
    border:
      ring === 'ghost' ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--line-1)',
    borderRadius: 999,
    background: ring === 'ghost' ? 'rgba(18,20,30,0.5)' : 'rgba(18,20,30,0.72)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    whiteSpace: 'nowrap',
    transition: 'border-color .25s ease, background .25s ease',
    opacity: ring === 'mid' ? 0.92 : ring === 'ghost' ? 0.55 : 1,
    // CSS custom properties for orbit animation
    ['--r' as string]: `${ringR}px`,
    ['--a' as string]: `${angle}deg`,
    ['--spin' as string]: '0deg',
    transform:
      'translate(-50%,-50%) translate(calc(var(--r) * cos(calc(var(--a) + var(--spin)))), calc(var(--r) * sin(calc(var(--a) + var(--spin)))))',
    animation,
  };

  return (
    <div className={`cpill ${ring}`} style={baseStyle}>
      <div
        className="mini"
        style={{
          width: ring === 'inner' ? 22 : ring === 'mid' ? 20 : 18,
          height: ring === 'inner' ? 22 : ring === 'mid' ? 20 : 18,
          borderRadius: 11,
          background: ring === 'ghost' ? 'rgba(255,255,255,0.04)' : 'var(--cobalt-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: ring === 'inner' ? 8 : ring === 'mid' ? 8 : 7,
          fontWeight: 700,
          color: ring === 'ghost' ? 'var(--ink-3)' : 'var(--cobalt)',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        {pill.mini}
      </div>
      <span
        className="sym"
        style={{
          fontWeight: 700,
          fontSize: ring === 'inner' ? 13 : ring === 'mid' ? 12 : 11,
          fontFamily: 'JetBrains Mono, monospace',
          color: ring === 'ghost' ? 'var(--ink-3)' : 'var(--ink-1)',
        }}
      >
        {pill.sym}
      </span>
      {ring === 'inner' && pill.nm && (
        <span className="nm" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
          {pill.nm}
        </span>
      )}
    </div>
  );
}
