import type { ReactNode } from 'react';

type Props = {
  l: ReactNode;
  v: ReactNode;
  sub?: ReactNode;
};

export default function Stat({ l, v, sub }: Props) {
  return (
    <div>
      <div className="lbl" style={{ marginBottom: 4 }}>{l}</div>
      <div className="num" style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>
        {v}
      </div>
      {sub && (
        <div className="num" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>
          {sub}
        </div>
      )}
    </div>
  );
}
