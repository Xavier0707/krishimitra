import type { Metadata, Viewport } from 'next';
import { Manrope, DM_Sans } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/context';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['500', '600', '700', '800'],
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KrishiConnect AI | Smart Agriculture & Decision Intelligence',
  description:
    'A farmer-first decision intelligence platform for India. Transparent mandi prices, weather risk advisories, soil suitability, and net-return calculations.',
  applicationName: 'KrishiConnect AI',
  keywords: [
    'Smart Agriculture',
    'Mandi Prices Madhya Pradesh',
    'Agmarknet',
    'Kisan Decision Platform',
    'Open-Meteo Weather',
    'Crop Doctor AI',
    'Krishi Copilot',
  ],
  authors: [{ name: 'KrishiConnect AI Team' }],
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#10312B',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" className={`${manrope.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-[#F3F8F2] text-[#10312B] antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
