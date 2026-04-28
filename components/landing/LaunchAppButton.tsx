'use client';

import { useState, ReactNode, CSSProperties } from 'react';
import DemoAccessModal from './DemoAccessModal';

type Props = {
  /** Size variant — 'sm' for nav, 'md' for hero/CTA */
  tagSize?: 'sm' | 'md';
  /** Override label text (defaults to "Launch App") */
  label?: string;
  /** Optional content rendered before label (e.g., icon) */
  before?: ReactNode;
  /** Whether to show the arrow icon */
  showArrow?: boolean;
};

export default function LaunchAppButton({
  tagSize = 'sm',
  label = 'Launch App',
  before,
  showArrow = true,
}: Props) {
  const [open, setOpen] = useState(false);

  const isLarge = tagSize === 'md';

  const buttonStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: isLarge ? 10 : 8,
    padding: isLarge ? '16px 26px' : '9px 16px',
    fontSize: isLarge ? 15 : 13,
    fontWeight: 700,
    letterSpacing: '-0.01em',
    borderRadius: 999,
    background:
      'linear-gradient(180deg, oklch(0.90 0.17 128) 0%, oklch(0.84 0.17 128) 50%, oklch(0.78 0.17 128) 100%)',
    color: 'var(--bg-0)',
    border: '1px solid oklch(0.78 0.17 128)',
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.10), 0 8px 24px oklch(0.84 0.17 128 / 0.35)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform .15s ease, box-shadow .15s ease, filter .15s ease',
  };

  const tagStyle: CSSProperties = {
    fontSize: isLarge ? 9.5 : 8.5,
    padding: isLarge ? '4px 9px' : '3px 7px',
    letterSpacing: isLarge ? '0.16em' : '0.14em',
    fontWeight: 700,
    borderRadius: 5,
    background: 'rgba(0, 0, 0, 0.22)',
    color: 'rgba(0, 0, 0, 0.85)',
    textTransform: 'uppercase',
    fontFamily: 'JetBrains Mono, monospace',
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    border: '1px solid rgba(0, 0, 0, 0.15)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
    position: 'relative',
    zIndex: 1,
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`launch-app-btn ${isLarge ? 'launch-app-btn--lg' : 'launch-app-btn--sm'}`}
        style={buttonStyle}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow =
            'inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.12), 0 12px 32px oklch(0.84 0.17 128 / 0.45)';
          e.currentTarget.style.filter = 'brightness(1.04)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = buttonStyle.boxShadow as string;
          e.currentTarget.style.filter = 'brightness(1)';
        }}
      >
        {before}
        <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
        <span aria-hidden className="launch-app-btn__chip" style={tagStyle}>
          <span
            style={{
              width: isLarge ? 5 : 4,
              height: isLarge ? 5 : 4,
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.7)',
              boxShadow: '0 0 6px rgba(0, 0, 0, 0.4)',
              animation: 'pulse 1.8s ease-in-out infinite',
            }}
          />
          Preview
        </span>
        {showArrow && (
          <svg
            width={isLarge ? 14 : 12}
            height={isLarge ? 14 : 12}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden
            style={{ position: 'relative', zIndex: 1 }}
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        )}
      </button>
      {open && <DemoAccessModal onClose={() => setOpen(false)} />}
    </>
  );
}
