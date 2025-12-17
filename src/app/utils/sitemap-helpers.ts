import { getSupabaseClient } from '@/lib/supabase';
import { generateSlug } from '@/lib/supabase-utils';

export interface SitemapUrl {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

const BASE_URL = 'https://origins.radio';

/**
 * Generate sitemap URLs for all artists
 * Uses proper slug generation and includes featured priority
 */
export const generateArtistSitemap = async (): Promise<SitemapUrl[]> => {
  try {
    const supabase = getSupabaseClient();
    const { data: artists, error } = await supabase
      .from('artists')
      .select('slug, name, updated_at, created_at, featured');

    if (error) {
      console.error('Error fetching artists for sitemap:', error);
      return [];
    }

    return artists?.map(artist => {
      // Use slug if available, otherwise generate from name
      const slug = artist.slug || generateSlug(artist.name);
      return {
        url: `${BASE_URL}/artists/${slug}`,
        lastmod: artist.updated_at || artist.created_at,
        changefreq: 'weekly' as SitemapUrl['changefreq'],
        priority: artist.featured ? 0.9 : 0.7
      };
    }) || [];
  } catch (error) {
    console.error('Error generating artist sitemap:', error);
    return [];
  }
};

/**
 * Generate sitemap URLs for all events/projects
 */
export const generateEventSitemap = async (): Promise<SitemapUrl[]> => {
  try {
    const supabase = getSupabaseClient();
    const { data: events, error } = await supabase
      .from('our_work_projects')
      .select('slug, title, updated_at, created_at, upcoming')
      .not('slug', 'is', null);

    if (error) {
      console.error('Error fetching events for sitemap:', error);
      return [];
    }

    return events?.map(event => {
      const changefreq: 'weekly' | 'monthly' = event.upcoming ? 'weekly' : 'monthly';
      return {
        url: `${BASE_URL}/events/${event.slug}`,
        lastmod: event.updated_at || event.created_at,
        changefreq,
        priority: event.upcoming ? 0.8 : 0.6
      };
    }) || [];
  } catch (error) {
    console.error('Error generating event sitemap:', error);
    return [];
  }
};

/**
 * Generate sitemap URLs for all published blog posts
 */
export const generateBlogSitemap = async (): Promise<SitemapUrl[]> => {
  try {
    const supabase = getSupabaseClient();
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('slug, title, updated_at, published_at, created_at, featured')
      .eq('status', 'published');

    if (error) {
      console.error('Error fetching blogs for sitemap:', error);
      return [];
    }

    return blogs?.map(blog => {
      const slug = blog.slug || generateSlug(blog.title || 'blog');
      return {
        url: `${BASE_URL}/blog/${slug}`,
        lastmod: blog.updated_at || blog.published_at || blog.created_at,
        changefreq: 'monthly' as SitemapUrl['changefreq'],
        priority: blog.featured ? 0.8 : 0.6
      };
    }) || [];
  } catch (error) {
    console.error('Error generating blog sitemap:', error);
    return [];
  }
};

/**
 * Generate static page URLs for the sitemap
 */
export const generateStaticSitemap = (): SitemapUrl[] => {
  const now = new Date().toISOString();
  
  return [
    {
      url: `${BASE_URL}/`,
      lastmod: now,
      changefreq: 'daily',
      priority: 1.0
    },
    {
      url: `${BASE_URL}/artists`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.9
    },
    {
      url: `${BASE_URL}/about`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.7
    },
    {
      url: `${BASE_URL}/events`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.8
    },
    {
      url: `${BASE_URL}/blog`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.8
    },
    {
      url: `${BASE_URL}/thisweek`,
      lastmod: now,
      changefreq: 'daily',
      priority: 0.8
    },
    {
      url: `${BASE_URL}/radio/schedule`,
      lastmod: now,
      changefreq: 'daily',
      priority: 0.7
    },
    {
      url: `${BASE_URL}/gocrazy`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.6
    }
  ];
};

/**
 * Generate complete sitemap XML from array of URLs
 */
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

/**
 * Generate robots.txt content
 */
export const generateRobotsTxt = (sitemapUrl: string = `${BASE_URL}/sitemap.xml`): string => {
  return `# Origins Radio Robots.txt
# Allow all search engines to crawl our site

User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /artistcontrolsecret/
Disallow: /originsradio/adminuploads
Disallow: /artist/
Disallow: /_next/
Disallow: /api/
Disallow: /uploads/

# Allow important pages
Allow: /artists/
Allow: /about
Allow: /events
Allow: /blog
Allow: /thisweek
Allow: /radio/schedule
Allow: /gocrazy

# Sitemap location
Sitemap: ${sitemapUrl}

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Additional directives for better SEO
Allow: /favicon.ico
Allow: /manifest.json
Allow: /robots.txt`;
}; 