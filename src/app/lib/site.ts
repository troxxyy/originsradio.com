/** Public origin shared by metadata, structured data and crawler endpoints. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://originsradio.com').replace(/\/+$/, '')
