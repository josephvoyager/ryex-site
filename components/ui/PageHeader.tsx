type Props = { title: string; oneLiner: string };

export default function PageHeader({ title, oneLiner }: Props) {
  return (
    <div style={{ padding: '4px 0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink-1)', margin: 0 }}>
          {title}
        </h1>
        <span style={{ fontSize: 11, color: 'var(--cobalt)', fontWeight: 500 }}>Learn more →</span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--ink-3)', maxWidth: 680, lineHeight: 1.5, margin: 0 }}>{oneLiner}</p>
    </div>
  );
}
