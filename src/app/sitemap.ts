import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://puantou-revolution-travel.vercel.app'

  // Fetch active destinations from database
  const destinations = await prisma.destination.findMany({
    where: { isActive: true },
    select: {
      id: true,
      updatedAt: true,
    },
  })

  const destinationUrls = destinations.map((dest) => ({
    url: `${baseUrl}/#destinations`,
    lastModified: dest.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      images: [`${baseUrl}/logo-image.png`],
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/flights`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services/hotels`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services/cars`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...destinationUrls,
  ]
}
