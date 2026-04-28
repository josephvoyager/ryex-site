type Props = {
  /** Deviation in percent (e.g., 0.05 means +0.05%) */
  dev: number;
  size?: 'sm' | 'md' | 'lg';
  showPct?: boolean;
};

export default function PegTag({ dev, size = 'md', showPct = true }: Props) {
  const mag = Math.abs(dev);
  const kind = mag < 0.05 ? 'peg' : dev > 0 ? 'premium' : 'discount';

  const colorMap = {
    premium: { col: 'var(--amber)', bg: 'var(--amber-soft)', border: 'oklch(0.80 0.15 75 / 0.35)', arrow: '▲', label: 'Premium' },
    discount: { col: 'var(--pos)', bg: 'var(--pos-soft)', border: 'oklch(0.78 0.17 150 / 0.35)', arrow: '▼', label: 'Discount' },
    peg: { col: 'var(--ink-2)', bg: 'var(--glass-3)', border: 'var(--line-1)', arrow: '●', label: 'At peg' },
  } as const;

  const c = colorMap[kind];
  const fs = size === 'lg' ? 13 : size === 'sm' ? 10 : 11;
  const pad = size === 'lg' ? '6px 12px' : size === 'sm' ? '2px 8px' : '4px 10px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: pad,
        borderRadius: 999,
        background: c.bg,
        border: '1px solid ' + c.border,
        color: c.col,
        fontSize: fs,
        fontWeight: 700,
        letterSpacing: '-0.01em',
      }}
    >
      <span style={{ fontSize: fs - 1 }}>{c.arrow}</span>
      <span>{c.label}</span>
      {showPct && (
        <span className="num" style={{ fontWeight: 800, opacity: 0.9 }}>
          {dev >= 0 ? '+' : ''}
          {dev.toFixed(3)}%
        </span>
      )}
    </span>
  );
}
