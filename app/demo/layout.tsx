import type { Metadata } from 'next';
import TopNav from '@/components/app/TopNav';
import { PriceProvider } from '@/lib/usePrices';

export const metadata: Metadata = {
  title: 'RYex · Demo',
  description: 'Private demo — invite-only.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <PriceProvider>
      <TopNav />
      <main>{children}</main>
    </PriceProvider>
  );
}
