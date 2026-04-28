import type { Metadata } from 'next';
import { DM_Serif_Display, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const dmSerifDisplay = DM_Serif_Display({ weight: '400', subsets: ['latin'], variable: '--font-dm-serif' });
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-dm-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400','500'], variable: '--font-jetbrains-mono' });

export const metadata: Metadata = {
  title: 'FinSight Dashboard',
  description: 'Enterprise-grade finance dashboard platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSerifDisplay.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans bg-bg text-gray-900" suppressHydrationWarning>{children}</body>
    </html>
  );
}
