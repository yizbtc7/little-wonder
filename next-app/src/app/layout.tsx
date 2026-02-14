import type { Metadata } from 'next';
import { Nunito, Young_Serif } from 'next/font/google';
import './globals.css';
import AppProviders from '@/components/AppProviders';

const youngSerif = Young_Serif({
  variable: '--font-display',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

const nunito = Nunito({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Little Wonder — Curiosity Companion',
  description: 'See the extraordinary things your child is already doing.',
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'Little Wonder',
    description: 'See the extraordinary things your child is already doing.',
    url: 'https://littlewonder.ai',
    images: ['https://littlewonder.ai/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${youngSerif.variable} ${nunito.variable}`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
