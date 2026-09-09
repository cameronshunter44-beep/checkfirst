export default function manifest() {
  return {
    name: 'CheckFirst',
    short_name: 'CheckFirst',
    description: 'Understand the real cost behind major financial decisions before you commit.',
    start_url: '/',
    display: 'standalone',
    background_color: '#06100e',
    theme_color: '#06100e',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
