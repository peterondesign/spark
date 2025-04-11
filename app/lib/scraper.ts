import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';

// Add plugins to make puppeteer stealthier and block ads
puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

interface ScrapedData {
  title: string;
  description?: string;
  content: string;
  links: string[];
  metadata: {
    url: string;
    scrapedAt: string;
    imageUrls?: string[];
  };
}

/**
 * Scrapes a website using puppeteer-extra with stealth capabilities
 * @param url The URL to scrape
 * @returns Promise with the scraped data
 */
export async function scrapeWebsite(url: string): Promise<ScrapedData> {
  // Validate the URL
  try {
    new URL(url);
  } catch (error) {
    throw new Error('Invalid URL provided');
  }

  let browser;
  try {
    // Launch a browser with stealth mode
    browser = await puppeteer.launch({
      headless: true, // Use headless mode for better stealth
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
      ],
      defaultViewport: { width: 1920, height: 1080 },
    });

    const page = await browser.newPage();

    // Set a realistic user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    );

    // Add extra headers to appear more like a real browser
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    });

    // Randomize the navigation timing to appear more human
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Add random delay to mimic human behavior
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1000) + 500));

    // Perform some random mouse movements to appear more human-like
    await page.mouse.move(
      Math.random() * 500,
      Math.random() * 500,
      { steps: 10 }
    );

    // Extract the page content
    const data = await page.evaluate(() => {
      const title = document.title;
      const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      
      // Get main content, preferring article content if available
      let content = '';
      const mainContent = document.querySelector('main') || 
                          document.querySelector('article') || 
                          document.querySelector('.content') || 
                          document.body;
      
      if (mainContent) {
        content = mainContent.innerText;
      }
      
      // Get all links from the page
      const linkElements = document.querySelectorAll('a');
      const links = Array.from(linkElements)
        .map(link => link.href)
        .filter(href => href && !href.startsWith('javascript:') && !href.startsWith('#'));
      
      // Get all images
      const imageElements = document.querySelectorAll('img');
      const imageUrls = Array.from(imageElements)
        .map(img => img.src)
        .filter(src => src && src !== '');
      
      return {
        title,
        description,
        content,
        links: Array.from(new Set(links)), // Fixed: Using Array.from instead of spread
        imageUrls: Array.from(new Set(imageUrls)), // Fixed: Using Array.from instead of spread
      };
    });

    // Return formatted data
    return {
      title: data.title,
      description: data.description,
      content: data.content,
      links: data.links,
      metadata: {
        url: url,
        scrapedAt: new Date().toISOString(),
        imageUrls: data.imageUrls,
      },
    };
  } catch (error: unknown) {
    // Fix: Type the error properly
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to scrape website: ${errorMessage}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}