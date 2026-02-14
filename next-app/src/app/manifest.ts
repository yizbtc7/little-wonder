import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Little Wonder',
    short_name: 'Little Wonder',
    description: 'See the extraordinary things your child is already doing.',
    start_url: '/home',
    display: 'standalone',
    background_color: '#FFFBF7',
    theme_color: '#FFFBF7',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
