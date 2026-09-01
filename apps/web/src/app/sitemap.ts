import type { MetadataRoute } from 'next';
const paths = ['', '/solutions/public', '/solutions/private', '/capabilities', '/process', '/initial-assessment', '/projects', '/about', '/contact', '/terms', '/privacy', '/cancellation', '/complaints'];
export default function sitemap(): MetadataRoute.Sitemap { const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3050'; return paths.map((path) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: 'monthly', priority: path === '' ? 1 : .7 })); }
