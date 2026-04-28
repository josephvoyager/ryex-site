type Tone = 'lime' | 'cobalt' | 'amber' | 'violet' | 'default';

type Props = {
  label: string;
  value: string | number;
  sub?: string;
  tone?: Tone;
};

const toneColor: Record<Tone, string> = {
  lime: 'var(--lime)',
  cobalt: 'var(--cobalt)',
  amber: 'var(--amber)',
  violet: 'var(--violet)',
  default: 'var(--ink-1)',
};

export default function StatPill({ label, value, sub, tone = 'default' }: Props) {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: 10,
        background: 'linear-gradient(180deg, var(--bg-1), var(--bg-2))',
        border: '1px solid var(--line-1)',
      }}
    >
      <div className="lbl" style={{ marginBottom: 6 }}>{label}</div>
      <div className="num" style={{ fontSize: 22, fontWeight: 700, color: toneColor[tone], letterSpacing: '-0.02em' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
