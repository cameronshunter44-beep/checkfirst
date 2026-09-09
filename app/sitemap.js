export default function sitemap() {
  const base = 'https://checkfirst-6ptl.vercel.app';
  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/privacy`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: 'monthly', priority: 0.3 }
  ];
}
