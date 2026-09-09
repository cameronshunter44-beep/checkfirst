import './globals.css';

export const metadata = {
  metadataBase: new URL('https://checkfirst-6ptl.vercel.app'),
  title: {
    default: 'CheckFirst — Check Before You Commit',
    template: '%s | CheckFirst'
  },
  description: 'Understand the real cost behind major financial decisions before you sign.',
  applicationName: 'CheckFirst',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'CheckFirst — Check Before You Commit',
    description: 'Run a quick second-opinion check on cars, homes, loans, solar, rent, financed purchases and job offers.',
    url: 'https://checkfirst-6ptl.vercel.app',
    siteName: 'CheckFirst',
    type: 'website'
  }
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
