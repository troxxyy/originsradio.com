import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local or .env
const loadEnv = () => {
  const envPath = path.join(process.cwd(), '.env.local');
  const envPathAlt = path.join(process.cwd(), '.env');
  
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  } else if (fs.existsSync(envPathAlt)) {
    envContent = fs.readFileSync(envPathAlt, 'utf-8');
  }
  
  const env = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  });
  
  return env;
};

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Generate slug from name (matching app logic)
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, '') // Remove special characters but keep spaces
    .replace(/\s+/g, '') // Remove all spaces
    .trim();
};

// Generate blog slug from title (matching app logic)
const generateBlogSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const generateSitemapXML = (urls) => {
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

const generateSitemap = async () => {
  try {
    console.log('🚀 Generating comprehensive sitemap for Origins Radio...');
    
    const baseUrl = 'https://origins.radio';
    const allUrls = [];
    
    // Static pages with proper priorities
    const staticUrls = [
      {
        url: `${baseUrl}/`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 1.0
      },
      {
        url: `${baseUrl}/artists`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.9
      },
      {
        url: `${baseUrl}/about`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.7
      },
      {
        url: `${baseUrl}/events`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.8
      },
      {
        url: `${baseUrl}/blog`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.8
      },
      {
        url: `${baseUrl}/thisweek`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 0.8
      },
      {
        url: `${baseUrl}/radio/schedule`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 0.7
      },
      {
        url: `${baseUrl}/gocrazy`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.6
      }
    ];
    
    allUrls.push(...staticUrls);
    console.log(`✅ Added ${staticUrls.length} static pages`);

    // Fetch artists from Supabase
    let artistUrls = [];
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: artists, error: artistsError } = await supabase
          .from('artists')
          .select('slug, updated_at, created_at, featured, name')
          .order('name');
        
        if (artistsError) {
          console.warn('⚠️  Error fetching artists:', artistsError.message);
        } else if (artists && artists.length > 0) {
          artistUrls = artists.map(artist => {
            // Use slug if available, otherwise generate from name
            const slug = artist.slug || generateSlug(artist.name);
            return {
              url: `${baseUrl}/artists/${slug}`,
              lastmod: artist.updated_at || artist.created_at || new Date().toISOString(),
              changefreq: 'weekly',
              priority: artist.featured ? 0.9 : 0.7
            };
          });
          console.log(`✅ Added ${artistUrls.length} artist pages`);
        } else {
          console.log('ℹ️  No artists found in database');
        }
      } catch (error) {
        console.warn('⚠️  Could not fetch artists:', error.message);
      }
    } else {
      console.warn('⚠️  Supabase credentials not found. Skipping dynamic content.');
    }
    
    allUrls.push(...artistUrls);

    // Fetch events/projects from Supabase
    let eventUrls = [];
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: events, error: eventsError } = await supabase
          .from('our_work_projects')
          .select('slug, updated_at, created_at, title, upcoming')
          .order('created_at', { ascending: false });
        
        if (eventsError) {
          console.warn('⚠️  Error fetching events:', eventsError.message);
        } else if (events && events.length > 0) {
          eventUrls = events
            .filter(event => event.slug) // Only include events with slugs
            .map(event => {
              const slug = event.slug || generateSlug(event.title || 'event');
              return {
                url: `${baseUrl}/events/${slug}`,
                lastmod: event.updated_at || event.created_at || new Date().toISOString(),
                changefreq: event.upcoming ? 'weekly' : 'monthly',
                priority: event.upcoming ? 0.8 : 0.6
              };
            });
          console.log(`✅ Added ${eventUrls.length} event pages`);
        } else {
          console.log('ℹ️  No events found in database');
        }
      } catch (error) {
        console.warn('⚠️  Could not fetch events:', error.message);
      }
    }
    
    allUrls.push(...eventUrls);

    // Fetch published blogs from Supabase
    let blogUrls = [];
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: blogs, error: blogsError } = await supabase
          .from('blogs')
          .select('slug, updated_at, published_at, created_at, featured, title')
          .eq('status', 'published')
          .order('published_at', { ascending: false });
        
        if (blogsError) {
          console.warn('⚠️  Error fetching blogs:', blogsError.message);
        } else if (blogs && blogs.length > 0) {
          blogUrls = blogs.map(blog => {
            const slug = blog.slug || generateBlogSlug(blog.title || 'blog');
            return {
              url: `${baseUrl}/blog/${slug}`,
              lastmod: blog.updated_at || blog.published_at || blog.created_at || new Date().toISOString(),
              changefreq: 'monthly',
              priority: blog.featured ? 0.8 : 0.6
            };
          });
          console.log(`✅ Added ${blogUrls.length} blog pages`);
        } else {
          console.log('ℹ️  No published blogs found in database');
        }
      } catch (error) {
        console.warn('⚠️  Could not fetch blogs:', error.message);
      }
    }
    
    allUrls.push(...blogUrls);

    // Sort URLs by priority (highest first) then alphabetically
    allUrls.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return a.url.localeCompare(b.url);
    });

    // Generate XML
    const sitemapXML = generateSitemapXML(allUrls);

    // Write to file
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemapXML, 'utf-8');

    console.log('\n📊 Sitemap Summary:');
    console.log(`   Total URLs: ${allUrls.length}`);
    console.log(`   📄 Static pages: ${staticUrls.length}`);
    console.log(`   🎵 Artist pages: ${artistUrls.length}`);
    console.log(`   🎉 Event pages: ${eventUrls.length}`);
    console.log(`   📝 Blog pages: ${blogUrls.length}`);
    console.log(`   💾 Sitemap saved to: ${sitemapPath}`);

    // Update robots.txt with better formatting
    const robotsContent = `# Origins Radio Robots.txt
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
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Additional directives for better SEO
Allow: /favicon.ico
Allow: /manifest.json
Allow: /robots.txt`;

    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
    fs.writeFileSync(robotsPath, robotsContent, 'utf-8');
    console.log('🤖 Robots.txt updated');

    // Create a sitemap index if we have many URLs (optional, for future use)
    if (allUrls.length > 50000) {
      const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;
      
      const sitemapIndexPath = path.join(process.cwd(), 'public', 'sitemap-index.xml');
      fs.writeFileSync(sitemapIndexPath, sitemapIndex, 'utf-8');
      console.log('📑 Sitemap index created');
    }

    console.log('\n🎯 Next steps:');
    console.log('   1. Review the generated sitemap.xml');
    console.log('   2. Deploy the updated sitemap');
    console.log('   3. Submit to Google Search Console');
    console.log('   4. Test sitemap validation');
    console.log('\n✨ Sitemap generation complete!');

  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
};

// Run the script
generateSitemap();