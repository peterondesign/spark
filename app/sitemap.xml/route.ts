import { MetadataRoute } from 'next';
import sitemap from '../sitemap';

export async function GET() {
  try {
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
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
      status: 500,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}

/**
 * Convert the sitemap data to XML format
 * Includes validation to ensure all URLs are properly formatted
 */
function generateSitemapXml(sitemapData: MetadataRoute.Sitemap): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Track processed URLs to avoid duplicates
  const processedUrls = new Set<string>();
  
  // Count stats for logging
  let validEntries = 0;
  let skippedEntries = 0;
  
  for (const entry of sitemapData) {
    // Skip if URL is missing, invalid format, or duplicate
    if (!entry.url || processedUrls.has(entry.url)) {
      skippedEntries++;
      continue;
    }
    
    try {
      // Validate URL format
      new URL(entry.url);
      
      // Mark URL as processed
      processedUrls.add(entry.url);
      validEntries++;
      
      // Add to XML
      xml += '  <url>\n';
      xml += `    <loc>${escapeXml(entry.url)}</loc>\n`;
      
      if (entry.lastModified) {
        const lastModifiedDate = new Date(entry.lastModified);
        if (!isNaN(lastModifiedDate.getTime())) {
          xml += `    <lastmod>${lastModifiedDate.toISOString()}</lastmod>\n`;
        }
      }
      
      if (entry.changeFrequency && isValidChangeFreq(entry.changeFrequency)) {
        xml += `    <changefreq>${entry.changeFrequency}</changefreq>\n`;
      }
      
      if (typeof entry.priority === 'number' && entry.priority >= 0 && entry.priority <= 1) {
        xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
      }
      
      xml += '  </url>\n';
    } catch (error) {
      // Skip invalid URLs
      skippedEntries++;
      console.warn(`Skipping invalid URL in sitemap: ${entry.url}`);
    }
  }
  
  xml += '</urlset>';
  
  // Log statistics
  console.log(`Sitemap generated with ${validEntries} valid entries. Skipped ${skippedEntries} invalid entries.`);
  
  return xml;
}

/**
 * Validate changeFrequency value
 */
function isValidChangeFreq(freq: string): boolean {
  const validValues = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
  return validValues.includes(freq);
}

/**
 * Escape special XML characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}