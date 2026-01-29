import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff2',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff2',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://agentotp.com'),
  title: {
    default: 'Agent OTP - One-Time Permissions for AI Agents',
    template: '%s | Agent OTP',
  },
  description:
    'Lightweight OTP service for AI Agents. Enable scoped, ephemeral, and human-approved access to sensitive operations with simple SDK integration.',
  keywords: [
    'AI agent security',
    'one-time permissions',
    'agent authentication',
    'AI safety',
    'human-in-the-loop',
    'agent permissions',
    'OTP for AI',
    'agentic AI security',
  ],
  authors: [{ name: 'Agent OTP Team' }],
  creator: 'Agent OTP',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://agentotp.com',
    siteName: 'Agent OTP',
    title: 'Agent OTP - One-Time Permissions for AI Agents',
    description:
      'Lightweight OTP service for AI Agents. Enable scoped, ephemeral, and human-approved access to sensitive operations.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Agent OTP - Secure AI Agent Permissions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agent OTP - One-Time Permissions for AI Agents',
    description:
      'Lightweight OTP service for AI Agents. Enable scoped, ephemeral, and human-approved access to sensitive operations.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
