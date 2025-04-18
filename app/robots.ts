import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      // Special rule for TikTok's bots
      {
        userAgent: 'Tiktok',
        allow: '/',
        // No crawl delays for TikTok bots
      }
    ],
    sitemap: 'https://nabulines.com/sitemap.xml',
  };
} 