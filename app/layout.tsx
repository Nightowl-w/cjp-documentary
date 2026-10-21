import type { Metadata, Viewport } from 'next';
import { fontDisplay, fontBody, fontMono } from './fonts';
import './globals.css';
import { PreferencesProvider } from '@/components/providers/PreferencesProvider';

export const metadata: Metadata = {
  title: 'Cockroach Janta Party at Jantar Mantar — An Interactive Documentary',
  description:
    'An immersive documentary on the 2026 CJP protest at Jantar Mantar, New Delhi — real recordings, a reported timeline, and the youth movement that forced an education minister’s resignation.',
  keywords: [
    'CJP',
    'Cockroach Janta Party',
    'Jantar Mantar',
    'NEET paper leak',
    'protest',
    'documentary',
    'exam reform',
    'Delhi',
  ],
  authors: [{ name: 'CJP Documentary Project (unofficial)' }],
  creator: 'CJP Documentary Project',
  publisher: 'CJP Documentary Project',
  robots: 'index, follow',
  metadataBase: new URL('https://cjp-documentary.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://cjp-documentary.vercel.app',
    siteName: 'Cockroach Janta Party at Jantar Mantar',
    title: 'Cockroach Janta Party at Jantar Mantar — An Interactive Documentary',
    description:
      'An immersive documentary on the 2026 CJP protest at Jantar Mantar, New Delhi — real recordings, a reported timeline, and the movement that forced an education minister’s resignation.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Jantar Mantar silhouetted against a protest sky',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cockroach Janta Party at Jantar Mantar',
    description:
      'An immersive documentary on the 2026 CJP protest at Jantar Mantar, New Delhi — real recordings and a reported timeline.',
    images: ['/og-image.jpg'],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      <body className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable} font-body antialiased`}>
        <PreferencesProvider>
          {children}
        </PreferencesProvider>
      </body>
    </html>
  );
}