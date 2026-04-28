import Link from 'next/link';

export default function Hero() {
  return (
    <section
      className="hero"
      style={{
        position: 'relative',
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '96px clamp(20px, 4vw, 32px) 160px',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      {/* Animated background blobs */}
      <div
        className="hero-bg"
        aria-hidden
        style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', filter: 'blur(80px)' }}
      >
        <div
          style={{
            position: 'absolute',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'var(--cobalt)',
            top: -200,
            left: -150,
            opacity: 0.22,
            mixBlendMode: 'screen',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: 'var(--lime)',
            bottom: -300,
            right: -200,
            opacity: 0.28,
            mixBlendMode: 'screen',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'var(--violet)',
            top: '30%',
            left: '40%',
            opacity: 0.20,
            mixBlendMode: 'screen',
          }}
        />
      </div>

      <div className="hero-inner" style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto' }}>
        <span className="eyebrow" style={{ animation: 'fadeUp 1s 0.15s forwards cubic-bezier(.2,.7,.25,1)', opacity: 0 }}>
          <span
            className="dot"
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              background: 'var(--lime)',
              boxShadow: '0 0 10px var(--lime)',
              animation: 'pulse 1.8s ease-in-out infinite',
            }}
          />
          The Capital Layer for Perp Markets
        </span>

        <h1
          style={{
            fontFamily: 'Inter, Helvetica Neue, sans-serif',
            fontSize: 'clamp(38px, 6.6vw, 82px)',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            lineHeight: 1.05,
            color: 'var(--ink-1)',
            marginBottom: 'clamp(20px, 3vw, 28px)',
            opacity: 0,
            transform: 'translateY(20px)',
            animation: 'fadeUp 1s 0.35s forwards cubic-bezier(.2,.7,.25,1)',
            marginTop: '24px',
          }}
        >
          Your open positions are dead weight.
          <br />
          <span className="accent" style={{ display: 'block', color: 'var(--lime)', fontWeight: 800 }}>
            Not anymore.
          </span>
        </h1>

        <p
          className="sub"
          style={{
            fontSize: 'clamp(15px, 1.6vw, 18px)',
            color: 'var(--ink-3)',
            maxWidth: 640,
            margin: '0 auto clamp(28px, 4vw, 42px)',
            lineHeight: 1.6,
            opacity: 0,
            transform: 'translateY(16px)',
            animation: 'fadeUp 1s 0.55s forwards cubic-bezier(.2,.7,.25,1)',
            padding: '0 12px',
          }}
        >
          RYex turns live perp positions into liquid, composable capital. Trade once. Deploy everywhere.
        </p>

        <div
          className="ctas"
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            opacity: 0,
            transform: 'translateY(16px)',
            animation: 'fadeUp 1s 0.75s forwards cubic-bezier(.2,.7,.25,1)',
            flexWrap: 'wrap',
          }}
        >
          <Link href="/app" className="btn-primary">
            Launch App
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <a href="#products" className="btn-ghost">
            See how it works
          </a>
        </div>
      </div>
    </section>
  );
}
