import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/artistcontrolsecret/',
          '/originsradio/adminuploads',
          '/_next/',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://origins.radio/sitemap.xml',
  }
}


