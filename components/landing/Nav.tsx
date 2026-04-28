import Link from 'next/link';

export default function Nav() {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '16px clamp(20px, 4vw, 32px)',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        background: 'rgba(6,7,12,0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid transparent',
        gap: 12,
      }}
    >
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontWeight: 800,
          fontSize: 16,
          justifySelf: 'start',
          letterSpacing: '-0.02em',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.jpg" alt="RYex" width={26} height={26} style={{ borderRadius: 6, display: 'block' }} />
        <span>RYex</span>
      </Link>

      <div
        className="nav-links"
        style={{
          display: 'flex',
          gap: 28,
          fontSize: 13,
          color: 'var(--ink-3)',
          justifySelf: 'center',
        }}
      >
        <a href="#products">Products</a>
        <a href="#how">How it works</a>
        <a href="#flywheel">Flywheel</a>
      </div>

      <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: 16 }}>
        <a
          href="https://t.me/zzarong"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 13, color: 'var(--ink-3)' }}
        >
          Investors
        </a>
        <button
          data-tally-open="ODj9Lk"
          data-tally-layout="modal"
          data-tally-width="500"
          className="launch"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 16px',
            borderRadius: 999,
            background: 'var(--lime)',
            color: 'var(--bg-0)',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Join Waitlist
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
