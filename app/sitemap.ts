import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://yash-ghodele.pages.dev/LocalMD',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },

  ]
}
