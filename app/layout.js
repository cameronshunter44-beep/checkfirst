import './globals.css';

const SITE_URL = 'https://checkfirst-6ptl.vercel.app';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'CheckFirst — Check Before You Commit',
    template: '%s | CheckFirst',
  },
  description: 'Understand the real cost behind major financial decisions before you sign.',
  applicationName: 'CheckFirst',
  manifest: '/manifest.webmanifest',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'CheckFirst — Check Before You Commit',
    description: 'Run a quick second-opinion check on cars, homes, loans, solar, rent, financed purchases and job offers.',
    url: SITE_URL,
    siteName: 'CheckFirst',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'CheckFirst — Check Before You Commit',
    description: 'Understand the real cost behind major financial decisions before you sign.',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#06100e',
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
