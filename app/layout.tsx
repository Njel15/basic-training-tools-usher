import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.SITE_URL ??
      'https://basic-training-tools-usher.lie-angelica1525.chatgpt.site',
  ),
  title: 'Basic Training & Tools Usher',
  description: 'Absensi online untuk peserta Basic Training & Tools Usher.',
  openGraph: {
    title: 'Basic Training & Tools Usher',
    description: 'Absensi online untuk peserta Basic Training & Tools Usher.',
    type: 'website',
    locale: 'id_ID',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Basic Training & Tools Usher' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Basic Training & Tools Usher',
    description: 'Absensi online untuk peserta Basic Training & Tools Usher.',
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
