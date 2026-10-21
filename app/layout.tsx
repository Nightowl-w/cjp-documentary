import type { Metadata, Viewport } from 'next';
import { fontDisplay, fontBody, fontMono } from './fonts';
import './globals.css';
import { PreferencesProvider } from '@/components/providers/PreferencesProvider';

export const metadata: Metadata = {
  title: 'CJP Protest at Jantar Mantar — An Interactive Documentary',
  description: 'An immersive documentary exploring the Citizens for Justice and Peace protest at Jantar Mantar, New Delhi. Voices, timeline, and ground truth.',
  keywords: ['CJP', 'Jantar Mantar', 'protest', 'documentary', 'human rights', 'justice', 'Delhi'],
  authors: [{ name: 'Citizens for Justice and Peace Documentation Team' }],
  creator: 'CJP Documentary Project',
  publisher: 'CJP Documentary Project',
  robots: 'index, follow',
  metadataBase: new URL('https://cjp-documentary.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://cjp-documentary.vercel.app',
    siteName: 'CJP Protest at Jantar Mantar',
    title: 'CJP Protest at Jantar Mantar — An Interactive Documentary',
    description: 'An immersive documentary exploring the Citizens for Justice and Peace protest at Jantar Mantar, New Delhi.',
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
    title: 'CJP Protest at Jantar Mantar',
    description: 'An immersive documentary exploring the Citizens for Justice and Peace protest at Jantar Mantar, New Delhi.',
    images: ['/og-image.jpg'],
  },
  verification: {
    other: {
      'google-site-verification': 'your-verification-code',
    },
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