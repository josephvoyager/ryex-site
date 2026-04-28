'use client';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--line-1)', padding: '40px 32px', marginTop: 0 }}>
      <div
        className="footer-inner"
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <a
          href="#"
          className="brand"
          style={{ justifySelf: 'start', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 14 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="RYex" width={22} height={22} style={{ borderRadius: 5, display: 'block' }} />
          RYex
        </a>

        <div
          className="links"
          style={{ justifySelf: 'center', display: 'flex', gap: 24, fontSize: 12, color: 'var(--ink-3)', flexWrap: 'wrap' }}
        >
          <a href="#" onClick={(e) => e.preventDefault()} style={{ position: 'relative' }}>
            Docs
          </a>
          <a href="#" onClick={(e) => e.preventDefault()}>Blog</a>
          <a href="https://x.com/RYex_finance" target="_blank" rel="noopener noreferrer">
            X
          </a>
          <a href="https://t.me/zzarong" target="_blank" rel="noopener noreferrer">
            Telegram
          </a>
          <a href="#" onClick={(e) => e.preventDefault()}>GitHub</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Audits</a>
        </div>

        <div
          className="copy"
          style={{ justifySelf: 'end', fontSize: 11, color: 'var(--ink-4)', fontFamily: 'JetBrains Mono, monospace' }}
        >
          RYex Protocol · 2026
        </div>
      </div>
    </footer>
  );
}
