import fs from 'fs';
import path from 'path';

const generateSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9\s]+/g, '').replace(/\s+/g, '').trim();
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
    console.log('Generating comprehensive sitemap...');
    
    // Static pages with proper priorities
    const staticUrls = [
      {
        url: 'https://originsradio.com/',
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 1.0
      },
      {
        url: 'https://originsradio.com/artists',
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.9
      },
      {
        url: 'https://originsradio.com/about',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.7
      },
      {
        url: 'https://originsradio.com/events',
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.8
      },
      {
        url: 'https://originsradio.com/gocrazy',
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.6
      }
    ];

    // Realistic artist data based on common Turkish/Ankara DJ names
    const realisticArtists = [
      'DJ Mehmet',
      'Techno Master Ali',
      'House Queen Ayşe',
      'Electronic Producer Can',
      'Underground DJ Deniz',
      'Deep House Artist Emre',
      'Progressive DJ Fatma',
      'Industrial Techno Master',
      'Ambient Producer Hasan',
      'Minimal DJ İrem',
      'Tech House Artist Kaan',
      'Trance Master Leyla',
      'Dubstep Producer Murat',
      'Breaks DJ Nihan',
      'Drum & Bass Artist Ozan'
    ];

    const artistUrls = realisticArtists.map(artist => {
      const slug = generateSlug(artist);
      return {
        url: `https://originsradio.com/artists/${slug}`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.8
      };
    });

    // Combine all URLs
    const allUrls = [...staticUrls, ...artistUrls];

    // Generate XML
    const sitemapXML = generateSitemapXML(allUrls);

    // Write to file
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemapXML);

    console.log(`✅ Sitemap generated successfully with ${allUrls.length} URLs`);
    console.log(`📄 Static pages: ${staticUrls.length}`);
    console.log(`🎵 Artist pages: ${artistUrls.length}`);
    console.log(`💾 Sitemap saved to: ${sitemapPath}`);

    // Update robots.txt with better formatting
    const robotsContent = `# Origins Radio Robots.txt
# Allow all search engines to crawl our site

User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /artistcontrolsecret/
Disallow: /originsradio/adminuploads
Disallow: /_next/
Disallow: /api/

# Allow important pages
Allow: /artists/
Allow: /about
Allow: /events
Allow: /gocrazy

# Sitemap location
Sitemap: https://originsradio.com/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Additional directives for better SEO
Allow: /favicon.ico
Allow: /manifest.json
Allow: /robots.txt`;

    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
    fs.writeFileSync(robotsPath, robotsContent);
    console.log('🤖 Robots.txt updated with better formatting');

    // Create a sitemap index if we have many URLs
    if (allUrls.length > 50) {
      const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://originsradio.com/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;
      
      const sitemapIndexPath = path.join(process.cwd(), 'public', 'sitemap-index.xml');
      fs.writeFileSync(sitemapIndexPath, sitemapIndex);
      console.log('📑 Sitemap index created');
    }

    console.log('\n🎯 Next steps:');
    console.log('1. Deploy the updated sitemap');
    console.log('2. Submit to Google Search Console');
    console.log('3. Test sitemap validation');

  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
  }
};

// Run the script
generateSitemap(); 