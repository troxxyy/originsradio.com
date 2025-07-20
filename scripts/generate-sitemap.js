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
    console.log('Generating sitemap...');
    
    // Static pages
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
        url: 'https://originsradio.com/ourwork',
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.8
      }
    ];

    // Sample artist URLs (these would be dynamically generated from database)
    const sampleArtists = [
      'DJ Techno Master',
      'House Music Producer',
      'Electronic Artist',
      'Underground DJ'
    ];

    const artistUrls = sampleArtists.map(artist => {
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

    console.log(`Sitemap generated successfully with ${allUrls.length} URLs`);
    console.log(`Static pages: ${staticUrls.length}`);
    console.log(`Artist pages: ${artistUrls.length}`);
    console.log(`Sitemap saved to: ${sitemapPath}`);

    // Also update robots.txt
    const robotsContent = `User-agent: *
Allow: /

# Disallow admin areas
Disallow: /admin/
Disallow: /originsradio/adminuploads

# Allow important pages
Allow: /artists/
Allow: /about
Allow: /ourwork

# Sitemap
Sitemap: https://originsradio.com/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1`;

    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
    fs.writeFileSync(robotsPath, robotsContent);
    console.log('Robots.txt updated');

  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
};

// Run the script
generateSitemap(); 