import { z } from 'zod';
import { chromium, BrowserContext, Page } from 'playwright';
import LLMScraper from 'llm-scraper';
import { openai } from '@ai-sdk/openai';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

// Define your schema for GetYourGuide results
const getYourGuideSchema = z.object({
  activities: z
    .array(
      z.object({
        title: z.string().describe('The title of the activity'),
        url: z.string().url().describe('The URL to the activity details page'),
        image: z.string().url().optional().describe('The image URL of the activity'),
        price: z.string().optional().describe('The price of the activity if available'),
        rating: z.string().optional().describe('The rating of the activity if available'),
        description: z.string().optional().describe('A short description of the activity'),
      })
    )
    .min(0)
    .max(5)
    .describe('List of activities found on GetYourGuide'),
});

export type GetYourGuideResult = z.infer<typeof getYourGuideSchema>;

// Cached browser instance to improve performance
let browserInstance: BrowserContext | null = null;

async function getBrowserContext() {
  if (!browserInstance) {
    const browser = await chromium.launch({
      headless: true,
    });
    browserInstance = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    });
  }
  return browserInstance;
}

export async function scrapeGetYourGuide(activityName: string, location: string): Promise<GetYourGuideResult> {
  console.log(`Scraping GetYourGuide for "${activityName}" in "${location}"`);
  
  try {
    // Initialize OpenAI
    const llm = openai.chat('gpt-4o');
    
    // Create LLM Scraper
    const scraper = new LLMScraper(llm);
    
    // Get browser context
    const context = await getBrowserContext();
    
    // Create new page
    const page = await context.newPage();
    
    // Construct the URL
    const searchUrl = `https://www.getyourguide.com/s/?q=${encodeURIComponent(activityName)}+${encodeURIComponent(location)}&searchSource=3`;
    
    console.log(`Navigating to: ${searchUrl}`);
    
    // Navigate to the page with a timeout
    try {
      await page.goto(searchUrl, { timeout: 30000 });
    } catch (error) {
      console.error(`Navigation error: ${error instanceof Error ? error.message : String(error)}`);
      await page.close();
      
      // Return fallback data if navigation fails
      return {
        activities: [
          {
            title: `${activityName} in ${location}`,
            url: searchUrl,
            description: `Explore ${activityName} activities in ${location}`,
          }
        ]
      };
    }
    
    // Wait for the page to load properly
    await page.waitForLoadState('networkidle');
    
    console.log('Page loaded, scraping content...');
    
    // Run the scraper
    const result = await scraper.run(page, getYourGuideSchema, {
      format: 'html',
    });
    
    // Close the page
    await page.close();
    
    if (!result.data) {
      console.error(`Scraper error: ${result}`);
      return { activities: [] };
    }
    
    return result.data;
  } catch (error) {
    console.error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    return { activities: [] };
  }
}

// Example function to extract content using Readability and JSDOM
export async function extractPageContent(page: Page): Promise<{title: string, content: string}> {
  // Get the HTML content from the page
  const html = await page.content();
  
  // Create a new JSDOM instance with the HTML content
  const dom = new JSDOM(html, {
    url: page.url()
  });
  
  // Create a new Readability instance with the document
  const reader = new Readability(dom.window.document);
  
  // Parse the content
  const article = reader.parse();
  
  if (!article) {
    return { title: '', content: '' };
  }
  
  return {
    title: article.title || '',
    content: article.textContent || article.content || ''
  };
}

// Cleanup function to close the browser when the server shuts down
export async function cleanup() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

// Make sure to call cleanup when Node process exits
if (typeof process !== 'undefined') {
  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}