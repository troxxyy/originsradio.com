import type { Metadata } from 'next'
import { SITE_URL } from './site'

export const ORGANIZATION_ID = `${SITE_URL}/#organization`

export function absoluteUrl(path: string) {
  return new URL(path, `${SITE_URL}/`).toString()
}

export function pageMetadata(title: string, description: string, path: string, image = '/opengraph-image'): Metadata {
  const fullTitle = `${title} | OriginsRadio`
  return {
    title: { absolute: fullTitle }, description,
    alternates: { canonical: path },
    openGraph: { title: fullTitle, description, url: path, siteName: 'OriginsRadio', type: 'website', images: [{ url: image }] },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [image] },
  }
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: absoluteUrl(item.path) })) }
}

export function excerpt(text: string, length = 160) {
  return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, length)
}
