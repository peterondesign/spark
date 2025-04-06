import { MetadataRoute } from 'next';
import sitemap from '../sitemap';

export async function GET() {
  // Get the sitemap data using the existing sitemap function
  const sitemapData = await sitemap();
  
  // Generate XML from the sitemap data
  const xml = generateSitemapXml(sitemapData);
  
  // Return the XML with the correct content type
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    },
  });
}

/**
 * Convert the sitemap data to XML format
 */
function generateSitemapXml(sitemapData: MetadataRoute.Sitemap): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  for (const entry of sitemapData) {
    xml += '  <url>\n';
    xml += `    <loc>${entry.url}</loc>\n`;
    
    if (entry.lastModified) {
      const lastModifiedDate = new Date(entry.lastModified);
      xml += `    <lastmod>${lastModifiedDate.toISOString()}</lastmod>\n`;
    }
    
    if (entry.changeFrequency) {
      xml += `    <changefreq>${entry.changeFrequency}</changefreq>\n`;
    }
    
    if (entry.priority !== undefined) {
      xml += `    <priority>${entry.priority}</priority>\n`;
    }
    
    xml += '  </url>\n';
  }
  
  xml += '</urlset>';
  return xml;
}