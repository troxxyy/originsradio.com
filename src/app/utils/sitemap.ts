import { getSupabaseClient } from '@/lib/supabase';

export interface SitemapUrl {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const generateArtistSitemap = async (): Promise<SitemapUrl[]> => {
  try {
    const supabase = getSupabaseClient();
    const { data: artists, error } = await supabase
      .from('artists')
      .select('id, name, updated_at, created_at')
      .eq('active', true);

    if (error) {
      console.error('Error fetching artists for sitemap:', error);
      return [];
    }

    return artists?.map(artist => {
      const slug = artist.name.toLowerCase().replace(/[^a-z0-9\s]+/g, '').replace(/\s+/g, '').trim();
      return {
        url: `https://originsradio.com/artists/${slug}`,
        lastmod: artist.updated_at || artist.created_at,
        changefreq: 'weekly' as const,
        priority: 0.8
      };
    }) || [];
  } catch (error) {
    console.error('Error generating artist sitemap:', error);
    return [];
  }
};

export const generateSitemapXML = (urls: SitemapUrl[]): string => {
  const xmlUrls = urls.map(url => {
    const lastmod = url.lastmod ? new Date(url.lastmod).toISOString() : undefined;
    return `  <url>
    <loc>${url.url}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;
};

export const generateRobotsTxt = (sitemapUrl: string): string => {
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${sitemapUrl}`;
}; 