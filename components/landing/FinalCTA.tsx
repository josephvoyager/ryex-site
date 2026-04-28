export default function FinalCTA() {
  return (
    <section
      className="cta-final"
      style={{
        padding: 'clamp(88px, 10vw, 140px) clamp(20px, 4vw, 32px)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--lime-soft), transparent 60%)',
          opacity: 0.6,
          animation: 'breathe 8s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      <div className="cta-final-inner reveal" style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto' }}>
        <h2
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(32px, 6vw, 72px)',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            lineHeight: 1.04,
            marginBottom: 18,
          }}
        >
          Be first when we open the gates.
        </h2>
        <p style={{ fontSize: 17, color: 'var(--ink-3)', marginBottom: 36, lineHeight: 1.55, maxWidth: 520, margin: '0 auto 36px' }}>
          Early access opens to traders, LPs, and partners aligned with what we're building.
        </p>
        <button
          data-tally-open="ODj9Lk"
          data-tally-layout="modal"
          data-tally-width="500"
          className="btn-primary"
          style={{ padding: '18px 32px', fontSize: 15, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Join Waitlist
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
        <div
          className="contact-line"
          style={{
            marginTop: 28,
            fontSize: 13,
            color: 'var(--ink-3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            flexWrap: 'wrap',
            justifyContent: 'center',
            lineHeight: 1.6,
          }}
        >
          For partnerships, integrations, and institutional inquiries
          <a
            href="https://t.me/zzarong"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--lime)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 10px',
              border: '1px solid var(--lime-line)',
              borderRadius: 999,
              background: 'var(--lime-soft)',
              transition: 'background .2s ease, transform .2s ease',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
            </svg>
            Contact
          </a>
        </div>
      </div>
    </section>
  );
}
