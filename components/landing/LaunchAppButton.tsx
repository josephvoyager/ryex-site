'use client';

import { useState, ReactNode, CSSProperties } from 'react';
import DemoAccessModal from './DemoAccessModal';

type Props = {
  className?: string;
  style?: CSSProperties;
  /** Size of the "Preview" tag relative to button */
  tagSize?: 'sm' | 'md';
  /** Whether to show the arrow icon */
  showArrow?: boolean;
  /** Override label text (defaults to "Launch App") */
  label?: string;
  /** Optional content rendered before label (e.g., icon) */
  before?: ReactNode;
};

export default function LaunchAppButton({
  className,
  style,
  tagSize = 'sm',
  showArrow = true,
  label = 'Launch App',
  before,
}: Props) {
  const [open, setOpen] = useState(false);

  const tagStyle: CSSProperties =
    tagSize === 'md'
      ? {
          fontSize: 10,
          padding: '3px 8px',
          letterSpacing: '0.14em',
        }
      : {
          fontSize: 9,
          padding: '2px 6px',
          letterSpacing: '0.12em',
        };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={className}
        style={{
          ...style,
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {before}
        {label}
        <span
          aria-hidden
          style={{
            ...tagStyle,
            fontWeight: 700,
            borderRadius: 4,
            background: 'rgba(0, 0, 0, 0.18)',
            color: 'currentColor',
            opacity: 0.85,
            textTransform: 'uppercase',
            fontFamily: 'JetBrains Mono, monospace',
            lineHeight: 1,
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Preview
        </span>
        {showArrow && (
          <svg
            width={tagSize === 'md' ? 14 : 12}
            height={tagSize === 'md' ? 14 : 12}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        )}
      </button>
      {open && <DemoAccessModal onClose={() => setOpen(false)} />}
    </>
  );
}
