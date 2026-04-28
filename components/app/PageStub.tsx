'use client';

type Props = { title: string; oneLiner: string };

export default function PageStub({ title, oneLiner }: Props) {
  return (
    <div className="animate-in" style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ padding: '4px 0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink-1)', margin: 0 }}>
            {title}
          </h1>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{ fontSize: 11, color: 'var(--cobalt)', textDecoration: 'none', fontWeight: 500 }}
          >
            Learn more →
          </a>
        </div>
        <p style={{ fontSize: 12, color: 'var(--ink-3)', maxWidth: 680, lineHeight: 1.5, margin: 0 }}>{oneLiner}</p>
      </div>

      <div
        className="glass"
        style={{
          marginTop: 32,
          padding: 64,
          textAlign: 'center',
          color: 'var(--ink-3)',
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.18em', color: 'var(--lime)', marginBottom: 12 }}>
          UNDER MIGRATION
        </div>
        <p style={{ margin: 0, maxWidth: 480, marginInline: 'auto' }}>
          This page is being ported from the v7 prototype. Visit{' '}
          <a href="/app.html" style={{ color: 'var(--cobalt)' }}>/app.html</a> for the current interactive version while we
          rebuild it on Next.js.
        </p>
      </div>
    </div>
  );
}
