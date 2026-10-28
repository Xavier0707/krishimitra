import type { Metadata, Viewport } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/context';

export const metadata: Metadata = {
  title: 'KrashiMitra AI | Smart Agriculture & Decision Intelligence',
  description:
    'A farmer-first decision intelligence platform for India. Transparent mandi prices, weather risk advisories, soil suitability, and net-return calculations.',
  applicationName: 'KrashiMitra AI',
  keywords: [
    'Smart Agriculture',
    'Mandi Prices Madhya Pradesh',
    'Agmarknet',
    'Kisan Decision Platform',
    'Open-Meteo Weather',
    'Crop Doctor AI',
    'Krishi Copilot',
  ],
  authors: [{ name: 'KrashiMitra AI Team' }],
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
    <html lang="hi" suppressHydrationWarning>
      <body className="min-h-screen bg-[#F3F8F2] text-[#10312B] antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
