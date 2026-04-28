type Props = {
  data: number[];
  color?: string;
  w?: number;
  h?: number;
  fill?: boolean;
};

export default function Sparkline({ data, color = 'var(--ink-2)', w = 60, h = 16, fill = true }: Props) {
  if (!data || !data.length) return null;
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / rng) * (h - 2) - 1}`).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      {fill && <polygon points={`0,${h} ${pts} ${w},${h}`} fill={color} opacity="0.15" />}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function genSpark(base: number, n: number = 24, vol: number = 0.01): number[] {
  const a: number[] = [];
  let p = base;
  for (let i = 0; i < n; i++) {
    p = p * (1 + (Math.random() - 0.48) * vol);
    a.push(p);
  }
  return a;
}
