import type { MetadataRoute } from 'next';

const routes = ['', '/solutions/public', '/solutions/private', '/capabilities', '/process', '/initial-assessment', '/projects', '/about', '/request', '/contact', '/terms', '/privacy', '/cancellation', '/complaints'];
export default function sitemap(): MetadataRoute.Sitemap { const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://karafintech.ir'; return routes.map((route) => ({ url: `${base}${route}`, changeFrequency: route === '' ? 'weekly' : 'monthly', priority: route === '' ? 1 : route === '/request' ? .9 : .7 })); }
