import './globals.css';

export const metadata = {
  title: 'CheckFirst — Check Before You Commit',
  description: 'Understand the real cost behind major financial decisions before you sign.'
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
