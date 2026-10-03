import { SITE_URL } from './site'

export const discoveryOverview = `# OriginsRadio

> OriginsRadio (Origins Radio) is an independent electronic music radio and community covering DJ sets, artists, events and scene culture in Ankara and beyond. OriginsRadio, Ankara ve çevresindeki elektronik müzik kültürünü DJ setleri, sanatçılar, radyo yayınları ve etkinliklerle bir araya getirir.

Official website: ${SITE_URL}/. Contact: info@originsradio.com.
The public pages below are the sources for names, biographies, published articles and event details. Radio programme times are displayed in Europe/Istanbul (Turkey, UTC+3). Check the current programme for availability; an empty programme does not establish that broadcasting has stopped. Event archives describe past events, not current ticket availability. Merch is currently paused, and This Week is a coming-soon preview.

## Listen and discover

- [OriginsRadio home](${SITE_URL}/): Radio player and current listening information.
- [Weekly radio schedule](${SITE_URL}/radio/schedule): Current weekly DJ programme; times in Europe/Istanbul.
- [Ankara elektronik müzik](${SITE_URL}/ankara-elektronik-muzik): Turkish guide to Ankara artists, electronic music, radio and past events.
- [Artists](${SITE_URL}/artists): Public DJ profiles, genres, biographies and sets.
- [Events](${SITE_URL}/events): Event information and archives; check each page for its status and dates.
- [Blog](${SITE_URL}/blog): Published music and scene articles.
- [About OriginsRadio](${SITE_URL}/about): The team and community's story.

## Text catalogue

- [Public content catalogue](${SITE_URL}/llms-full.txt): Automatically updated plain-text artist biographies, article summaries and event descriptions with canonical source links. This is a catalogue, not a transcript of every page or audio recording.

## Optional

- [Sitemap](${SITE_URL}/sitemap.xml): Complete list of indexable public page URLs.
- [Instagram](https://www.instagram.com/origins.radio/): Official social profile.
- [YouTube](https://www.youtube.com/@originsradiotr): Official video channel.
`

// Public fields can contain rich text. Never expose script/style contents in the text catalogue.
export function catalogueText(value: string | null | undefined) {
  return (value || '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function catalogueLink(label: string, path: string) {
  const safeLabel = catalogueText(label).replace(/[\\[\]]/g, '\\$&')
  return `[${safeLabel}](${SITE_URL}${path})`
}

export function discoveryResponse(content: string) {
  return new Response(content, { headers: {
    'Content-Type': 'text/plain; charset=utf-8',
    'Link': '</llms.txt>; rel="describedby"',
    // These supplementary representations point readers to the canonical HTML pages.
    'X-Robots-Tag': 'noindex, follow',
  } })
}
