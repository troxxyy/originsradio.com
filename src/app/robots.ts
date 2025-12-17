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
          '/artist/',
          '/_next/',
          '/api/',
          '/uploads/',
        ],
      },
    ],
    sitemap: 'https://origins.radio/sitemap.xml',
  }
}


