'use client';

import { useEffect } from 'react';

type Props = { onClose: () => void };

export default function DemoAccessModal({ onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(6, 7, 12, 0.78)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn .25s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 480,
          width: '100%',
          background: 'linear-gradient(180deg, var(--bg-1), var(--bg-2))',
          border: '1px solid var(--line-2)',
          borderRadius: 18,
          padding: 'clamp(28px, 4vw, 36px)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          position: 'relative',
          animation: 'fadeUp .35s cubic-bezier(.2,.7,.25,1)',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            background: 'transparent',
            border: 'none',
            color: 'var(--ink-3)',
            cursor: 'pointer',
            fontSize: 22,
            lineHeight: 1,
            borderRadius: 6,
            transition: 'background .15s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-2)')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          ×
        </button>

        <div style={{ marginBottom: 16 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.18em',
              color: 'var(--amber)',
              textTransform: 'uppercase',
              fontWeight: 600,
              padding: '4px 10px',
              border: '1px solid oklch(0.80 0.15 75 / 0.35)',
              background: 'oklch(0.80 0.15 75 / 0.10)',
              borderRadius: 999,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                background: 'var(--amber)',
                boxShadow: '0 0 8px var(--amber)',
                animation: 'pulse 1.8s ease-in-out infinite',
              }}
            />
            Preview
          </span>
        </div>

        <h2
          style={{
            fontSize: 'clamp(22px, 3vw, 28px)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            lineHeight: 1.15,
            marginBottom: 14,
            color: 'var(--ink-1)',
          }}
        >
          Want an early look?
        </h2>

        <p
          style={{
            fontSize: 14.5,
            color: 'var(--ink-3)',
            lineHeight: 1.65,
            marginBottom: 26,
            margin: '0 0 26px 0',
          }}
        >
          Demo is shipping daily. Ping us on Telegram for the live link.
        </p>

        <a
          href="https://t.me/zzarong"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '14px 20px',
            borderRadius: 12,
            background: 'var(--lime)',
            color: 'var(--bg-0)',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '-0.005em',
            textDecoration: 'none',
            marginBottom: 10,
            transition: 'transform .15s ease, box-shadow .15s ease',
            boxShadow: '0 8px 24px oklch(0.84 0.17 128 / 0.30)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 12px 32px oklch(0.84 0.17 128 / 0.40)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px oklch(0.84 0.17 128 / 0.30)';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
          </svg>
          Message us on Telegram
        </a>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px 20px',
            borderRadius: 12,
            background: 'transparent',
            border: '1px solid var(--line-2)',
            color: 'var(--ink-3)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'border-color .15s ease, color .15s ease',
            fontFamily: 'inherit',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = 'var(--line-3)';
            e.currentTarget.style.color = 'var(--ink-1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'var(--line-2)';
            e.currentTarget.style.color = 'var(--ink-3)';
          }}
        >
          Close
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
