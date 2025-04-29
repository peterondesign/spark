// This file is intentionally a .js file to avoid webpack processing
// It handles browser-less scraping functionality using jsdom
const { JSDOM } = require('jsdom');

/**
 * Scrapes a website using JSDOM without launching a browser
 * @param {string} url - The URL to scrape
 * @returns {Promise<Object>} - Promise with the scraped data
 */
interface ScrapedData {
  title: string;
  description: string;
  content: string;
  links: string[];
  metadata: {
    url: string;
    scrapedAt: string;
    imageUrls: string[];
  };
}

async function scrapeWithJsdom(url: string): Promise<ScrapedData> {
  // Validate the URL
  try {
    new URL(url);
  } catch (error) {
    throw new Error('Invalid URL provided');
  }

  try {
    console.log(`Scraping ${url} without launching a browser...`);
    
    // Fetch the page content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // Parse the HTML with JSDOM
    const dom = new JSDOM(html, {
      url: url,
      referrer: url,
      contentType: 'text/html',
      includeNodeLocations: false,
      storageQuota: 10000000
    });

    const document = dom.window.document;
    
    // Extract the page content
    const title = document.title;
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    
    // Get main content, preferring article content if available
    let content = '';
    const mainContent = document.querySelector('main') || 
                       document.querySelector('article') || 
                       document.querySelector('.content') || 
                       document.body;
    
    if (mainContent) {
      content = mainContent.textContent || '';
    }
    
    // Get all links from the page
    const linkElements = document.querySelectorAll('a');
    const links = Array.from(linkElements)
      .map((link) => (link as HTMLAnchorElement).href)
      .filter(href => href && !href.startsWith('javascript:') && !href.startsWith('#'));
    
    // Get all images
      const imageElements = document.querySelectorAll('img');
      const imageUrls = Array.from(imageElements)
        .map((img) => {
        // Resolve relative image URLs to absolute URLs
        const src = imageElements.getAttribute('src');
        if (!src) return '';
        if (!src) return '';
        try {
          return new URL(src, url).href;
        } catch (e) {
          return '';
        }
      })
      .filter(src => src && src !== '');
    
    console.log('Scraping completed successfully');

    // Return formatted data
    return {
      title,
      description,
      content,
      links: Array.from(new Set(links)),
      metadata: {
        url: url,
        scrapedAt: new Date().toISOString(),
        imageUrls: Array.from(new Set(imageUrls)),
      },
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to scrape website: ${errorMessage}`);
  }
}

// Make sure it's explicitly exported as default and named export
module.exports = scrapeWithJsdom;
module.exports.scrapeWithJsdom = scrapeWithJsdom;