import TopNav from '@/components/app/TopNav';
import { PriceProvider } from '@/lib/usePrices';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PriceProvider>
      <TopNav />
      <main>{children}</main>
    </PriceProvider>
  );
}
