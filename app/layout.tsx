import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RYex — The Capital Layer for Perp Markets',
  description:
    'RYex turns live perp positions into liquid, composable capital. Trade once. Deploy everywhere.',
  metadataBase: new URL('https://ryex.finance'),
  openGraph: {
    title: 'RYex — The Capital Layer for Perp Markets',
    description: 'Mint ERC-20 against any live perp. Earn delta-neutral funding yield.',
    url: 'https://ryex.finance',
    siteName: 'RYex',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RYex — The Capital Layer for Perp Markets',
    description: 'Mint ERC-20 against any live perp. Earn delta-neutral funding yield.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
