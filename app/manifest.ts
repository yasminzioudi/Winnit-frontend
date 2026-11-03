import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'WINNIT OS',
    short_name: 'WINNIT',
    description: 'Plateforme e-commerce intelligente pour les entrepreneurs tunisiens',
    lang: 'fr',
    start_url: '/dashboard/profit-os?source=pwa',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#a3e635',
    categories: ['business', 'finance'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: "Vue d'ensemble",
        short_name: 'Dashboard',
        url: '/dashboard/profit-os',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Commandes',
        short_name: 'Commandes',
        url: '/orders',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Coûts',
        short_name: 'Coûts',
        url: '/costs',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'COD',
        short_name: 'COD',
        url: '/cod',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
    ],
  };
}
