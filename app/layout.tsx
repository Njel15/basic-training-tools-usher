import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.SITE_URL ??
      'https://usher-gmscentralpark.web.id',
  ),
  title: 'Usher Event · Absensi Training',
  description: 'Absensi online dan arsip event training usher tahunan.',
  openGraph: {
    title: 'Usher Event · Absensi Training',
    description: 'Absensi online dan arsip event training usher tahunan.',
    type: 'website',
    locale: 'id_ID',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Usher Event' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Usher Event · Absensi Training',
    description: 'Absensi online dan arsip event training usher tahunan.',
    images: ['/og.jpg'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
