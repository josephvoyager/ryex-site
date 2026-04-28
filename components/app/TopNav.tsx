'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { id: 'trade', label: 'Trade' },
  { id: 'rtoken', label: 'rToken' },
  { id: 'ryield', label: 'rYield' },
  { id: 'swap', label: 'Swap' },
  { id: 'pool', label: 'Pool' },
  { id: 'liquidation', label: 'Liquidation' },
  { id: 'dashboard', label: 'Dashboard' },
];

export default function TopNav() {
  const pathname = usePathname();
  const current = pathname?.split('/')[2] ?? '';

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '12px clamp(20px, 3vw, 28px)',
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        background: 'rgba(6,7,12,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--line-1)',
      }}
    >
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 6,
            background: 'linear-gradient(135deg, var(--lime), var(--cobalt))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 800,
            color: 'var(--bg-0)',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          R
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em' }}>RYex</span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: 'oklch(0.80 0.15 75)',
              padding: '3px 7px',
              border: '1px solid oklch(0.80 0.15 75 / 0.35)',
              background: 'oklch(0.80 0.15 75 / 0.10)',
              borderRadius: 4,
              textTransform: 'uppercase',
              fontFamily: 'JetBrains Mono, monospace',
              lineHeight: 1,
            }}
          >
            Demo
          </span>
        </div>
      </Link>

      <div style={{ display: 'flex', gap: 4, marginLeft: 16 }}>
        {tabs.map((t) => {
          const active = current === t.id;
          return (
            <Link
              key={t.id}
              href={`/app/${t.id}`}
              style={{
                padding: '7px 14px',
                borderRadius: 7,
                background: active ? 'var(--bg-2)' : 'transparent',
                color: active ? 'var(--ink-1)' : 'var(--ink-3)',
                fontSize: 12,
                fontWeight: active ? 600 : 500,
                boxShadow: active ? 'inset 0 1px 0 rgba(255,255,255,0.06)' : 'none',
                transition: 'background .15s ease, color .15s ease',
              }}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid var(--line-2)',
            background: 'var(--bg-1)',
            color: 'var(--ink-2)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Connect Wallet
        </button>
      </div>
    </nav>
  );
}
