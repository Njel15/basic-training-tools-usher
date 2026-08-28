import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.SITE_URL ??
      'https://usher-gmscentralpark.web.id',
  ),
  title: 'Usher Event · Absensi Training',
  description: 'Servolution - Usher GMS Central Park',
  openGraph: {
    title: 'Usher Event · Absensi Training',
    description: 'Servolution - Usher GMS Central Park',
    type: 'website',
    locale: 'id_ID',
    images: [{ url: '/og-usher-crowd.jpg', width: 1200, height: 675, alt: 'Usher Crowd Management' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Usher Event · Absensi Training',
    description: 'Servolution - Usher GMS Central Park',
    images: ['/og-usher-crowd.jpg'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
