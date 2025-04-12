import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sparkus.cc';
const outputPath = path.join(__dirname, '../public/sitemap.xml');
const outputRobotsPath = path.join(__dirname, '../public/robots.txt');

async function generateSitemap() {
  console.log('Generating sitemap...');

  // Static routes in your app - add all your important pages here
  const staticPages = [
    '',
    '/blog',
    '/date-ideas-near-me',
    '/date-idea-generator',
    '/spin-the-wheel',
    '/calendar',
    '/terms',
    '/favorites',
    '/alphabet-date-ideas',
    '/date-night-box-subscription',
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (page) => `
    <url>
      <loc>${siteUrl}${page}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.7</priority>
    </url>
  `
    )
    .join('')}
</urlset>`;

  // Create the public directory if it doesn't exist
  if (!fs.existsSync(path.join(__dirname, '../public'))) {
    fs.mkdirSync(path.join(__dirname, '../public'), { recursive: true });
  }

  // Write the sitemap
  fs.writeFileSync(outputPath, sitemap);

  // Create a robots.txt file
  const robotsTxt = `# *
User-agent: *
Allow: /

# Host
Host: ${siteUrl}

# Sitemaps
Sitemap: ${siteUrl}/sitemap.xml`;

  fs.writeFileSync(outputRobotsPath, robotsTxt);

  console.log(`✅ Sitemap was generated at ${outputPath}`);
  console.log(`✅ Robots.txt was generated at ${outputRobotsPath}`);
}

// Run the function
generateSitemap().catch((err) => {
  console.error('Error generating sitemap:', err);
  process.exit(1);
});