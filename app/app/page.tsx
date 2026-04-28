'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AppEntry() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/app/dashboard');
  }, [router]);

  return (
    <div
      style={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--ink-3)',
        fontSize: 13,
        fontFamily: 'JetBrains Mono, monospace',
        letterSpacing: '0.1em',
      }}
    >
      LOADING…
    </div>
  );
}
