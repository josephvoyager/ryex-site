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
    <nav className="app-nav" style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(6,7,12,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--line-1)' }}>
      {/* Top row: brand + tabs (desktop) / wallet (mobile) */}
      <div className="app-nav-top" style={{ padding: '12px clamp(20px, 3vw, 28px)', display: 'flex', alignItems: 'center', gap: 18 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="RYex" width={26} height={26} style={{ borderRadius: 6, display: 'block' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em' }}>RYex</span>
            <span
              style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
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

        {/* Desktop tabs (hidden on mobile, replaced by scrollable bottom row) */}
        <div className="app-nav-tabs-desktop" style={{ display: 'flex', gap: 4, marginLeft: 16 }}>
          {tabs.map((t) => {
            const active = current === t.id;
            return (
              <Link
                key={t.id}
                href={`/demo/${t.id}`}
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

        {/* Wallet pills cluster */}
        <div className="app-nav-wallet" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* USDC balance pill — hidden on mobile */}
          <div className="wallet-pill wallet-pill--balance" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, border: '1px solid var(--line-1)', background: 'var(--bg-2)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
            <span
              style={{
                width: 16, height: 16, borderRadius: 8,
                background: 'oklch(0.65 0.18 258)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 800, color: '#fff',
              }}
            >
              $
            </span>
            <span style={{ fontWeight: 600, color: 'var(--ink-1)' }}>48,230</span>
            <span style={{ color: 'var(--ink-4)', fontSize: 11 }}>USDC</span>
          </div>

          {/* Network — hidden on mobile */}
          <div className="wallet-pill wallet-pill--network" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', borderRadius: 8, border: '1px solid var(--line-1)', background: 'var(--bg-2)', fontSize: 12, fontWeight: 600, color: 'var(--ink-2)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: 'oklch(0.72 0.17 228)', boxShadow: '0 0 6px oklch(0.72 0.17 228)' }} />
            <span>Arbitrum</span>
          </div>

          {/* Address pill — always visible */}
          <button className="wallet-pill" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 8, border: '1px solid var(--line-1)', background: 'var(--bg-2)', color: 'var(--ink-1)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            <span
              style={{
                width: 8, height: 8, borderRadius: 4,
                background: 'var(--pos)',
                boxShadow: '0 0 6px var(--pos)',
                animation: 'pulse 2.4s ease-in-out infinite',
              }}
            />
            <span className="num" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.02em' }}>
              0x71a…3d4f
            </span>
            <span style={{ color: 'var(--ink-4)', fontSize: 9 }}>▾</span>
          </button>
        </div>
      </div>

      {/* Bottom row: scrollable tabs (mobile only) */}
      <div className="app-nav-tabs-mobile" style={{ display: 'none' }}>
        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: '6px 14px 8px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            borderTop: '1px solid var(--line-1)',
          }}
        >
          {tabs.map((t) => {
            const active = current === t.id;
            return (
              <Link
                key={t.id}
                href={`/demo/${t.id}`}
                style={{
                  padding: '7px 12px',
                  borderRadius: 7,
                  background: active ? 'var(--bg-2)' : 'transparent',
                  color: active ? 'var(--ink-1)' : 'var(--ink-3)',
                  fontSize: 12,
                  fontWeight: active ? 600 : 500,
                  boxShadow: active ? 'inset 0 1px 0 rgba(255,255,255,0.06)' : 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
