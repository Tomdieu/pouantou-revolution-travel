import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/dashboard/', '/api/'],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User'],
        allow: '/',
      },
      {
        userAgent: ['PerplexityBot'],
        allow: '/',
      },
      {
        userAgent: ['ClaudeBot', 'anthropic-ai'],
        allow: '/',
      },
      {
        userAgent: ['Google-Extended'],
        allow: '/',
      },
      {
        userAgent: ['CCBot'],
        disallow: '/',
      },
    ],
    sitemap: 'https://puantou-revolution-travel.vercel.app/sitemap.xml',
  }
}
