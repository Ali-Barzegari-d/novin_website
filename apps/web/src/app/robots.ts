import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const releaseReady = process.env.NEXT_PUBLIC_RELEASE_READY === 'true';
  return { rules: releaseReady ? [{ userAgent: '*', allow: '/', disallow: ['/account', '/admin', '/offer/', '/pay/', '/invoice/'] }] : [{ userAgent: '*', disallow: '/' }], sitemap: releaseReady ? `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://karafintech.ir'}/sitemap.xml` : undefined };
}
