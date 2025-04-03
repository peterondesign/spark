import { z } from 'zod';
import { chromium, BrowserContext, Page } from 'playwright';
import LLMScraper from 'llm-scraper';
import { openai } from '@ai-sdk/openai';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import * as cheerio from 'cheerio';
import { OpenAI } from 'openai';
import { Experience } from './multi_scraper';

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

// Get OpenAI API key from environment variables
const openaiApiKey = process.env.OPENAI_API_KEY;

// Initialize OpenAI client
const openaiClient = new OpenAI({
  apiKey: openaiApiKey,
});

interface EventSource {
  name: string;
  urlPattern: string;
  parser: (html: string, city: string, category: string) => Promise<Experience[]>;
}

/**
 * Main function to scrape events from multiple sources using LLM
 */
export async function scrapeEventsWithLLM(
  city: string, 
  category: string, 
  limit: number = 10
): Promise<Experience[]> {
  console.log(`[LLMScraper] Starting multi-source scrape for ${city}, ${category}`);
  
  const sources: EventSource[] = [
    {
      name: 'Luma',
      urlPattern: `https://lu.ma/${city}`,
      parser: parseLumaEvents,
    },
    {
      name: 'Eventbrite',
      urlPattern: `https://www.eventbrite.com/d/${city}/${category}/`,
      parser: parseEventbriteEvents,
    },
    {
      name: 'Timeout',
      urlPattern: `https://www.timeout.com/${city}`,
      parser: parseTimeoutEvents,
    },
    {
      name: 'Meetup',
      urlPattern: `https://www.meetup.com/find/?suggested=true&source=EVENTS&keywords=${category}&location=${city}`,
      parser: parseMeetupEvents,
    }
  ];
  
  const allExperiences: Experience[] = [];
  const sourcesToProcess = sources.slice(0, Math.min(sources.length, 4)); // Process up to 4 sources
  
  for (const source of sourcesToProcess) {
    try {
      console.log(`[LLMScraper] Processing source: ${source.name}`);
      const sourceURL = formatSourceURL(source.urlPattern, city, category);
      console.log(`[LLMScraper] Fetching URL: ${sourceURL}`);
      
      // Use proxy to avoid CORS issues
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(sourceURL)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`${source.name} request failed with status ${response.status}`);
      }
      
      const html = await response.text();
      console.log(`[LLMScraper] Received HTML length: ${html.length} characters`);
      
      // Use source-specific parser
      const experiences = await source.parser(html, city, category);
      console.log(`[LLMScraper] Extracted ${experiences.length} experiences from ${source.name}`);
      
      // Add source name to each experience
      experiences.forEach(exp => {
        exp.source = source.name;
      });
      
      allExperiences.push(...experiences);
      
    } catch (error) {
      console.error(`[LLMScraper] Error processing ${source.name}:`, error);
    }
  }
  
  // Return the specified limit of experiences
  return allExperiences.slice(0, limit);
}

/**
 * Format URL with city and category parameters
 */
function formatSourceURL(urlPattern: string, city: string, category: string): string {
  // Replace placeholders with actual values
  let formatted = urlPattern.replace(/\$\{city\}/g, encodeURIComponent(city))
    .replace(/\$\{category\}/g, encodeURIComponent(category));
    
  // Handle special cases
  if (urlPattern.includes('eventbrite.com')) {
    // Eventbrite uses dashes for URL formatting
    const dashCity = city.toLowerCase().replace(/\s+/g, '-');
    const dashCategory = category.toLowerCase().replace(/\s+/g, '-');
    formatted = `https://www.eventbrite.com/d/${dashCity}/${dashCategory}/`;
  }
  
  return formatted;
}

/**
 * Parse HTML from Luma using OpenAI
 */
async function parseLumaEvents(html: string, city: string, category: string): Promise<Experience[]> {
  try {
    console.log('[LLMParser:Luma] Starting LLM parsing');
    
    // Clean and simplify the HTML to focus on relevant content
    const $ = cheerio.load(html);
    
    // Remove script tags, styles, and other non-content elements
    $('script, style, noscript, svg, iframe').remove();
    
    // Get main content area where events are likely to be
    const mainContent = $('main').html() || $('body').html();
    
    if (!mainContent) {
      throw new Error('No content found to parse');
    }
    
    // Use OpenAI to extract structured data
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert web scraper that extracts structured data from HTML content.
          Extract events from the Luma website HTML. Focus on event cards or listings.
          For each event, extract: title, description, date/time, image URL (if available), and event URL.
          Return the data in JSON format with an array of events, each containing the extracted fields.`
        },
        {
          role: "user",
          content: `Extract events from this Luma HTML content for ${city}:\n\n${mainContent.substring(0, 15000)}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });
    
    // Parse the response
    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error('Empty response from OpenAI');
    }
    
    const parsedData = JSON.parse(responseContent);
    console.log(`[LLMParser:Luma] Extracted ${parsedData.events?.length || 0} events`);
    
    // Convert to Experience format
    return (parsedData.events || []).map((event: any, index: number) => ({
      id: `luma-${index}-${Date.now()}`,
      title: event.title || 'Luma Event',
      description: event.description || `Event in ${city}`,
      imageUrl: event.imageUrl || '/placeholder.jpg',
      url: event.url || `https://lu.ma/${city}`,
      price: event.price,
      source: 'Luma'
    }));
  } catch (error) {
    console.error('[LLMParser:Luma] Error during parsing:', error);
    return [];
  }
}

/**
 * Parse HTML from Eventbrite using OpenAI
 */
async function parseEventbriteEvents(html: string, city: string, category: string): Promise<Experience[]> {
  try {
    console.log('[LLMParser:Eventbrite] Starting LLM parsing');
    
    // Clean and simplify the HTML to focus on relevant content
    const $ = cheerio.load(html);
    
    // Remove script tags, styles, and other non-content elements
    $('script, style, noscript, svg, iframe').remove();
    
    // Get main content where events are likely to be
    const mainContent = $('.search-results-panel-content').html() || 
                        $('.search-main-content').html() || 
                        $('main').html() || 
                        $('body').html();
    
    if (!mainContent) {
      throw new Error('No content found to parse');
    }
    
    // Use OpenAI to extract structured data
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [
        {
          role: "system",
          content: `You are an expert web scraper that extracts structured data from HTML content.
          Extract events from the Eventbrite website HTML. Focus on event cards or listings.
          For each event, extract: title, description (if available), date/time, price (if available), location, image URL (if available), and event URL.
          Return the data in JSON format with an array of events, each containing the extracted fields.`
        },
        {
          role: "user",
          content: `Extract events from this Eventbrite HTML content for ${category} in ${city}:\n\n${mainContent.substring(0, 15000)}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });
    
    // Parse the response
    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error('Empty response from OpenAI');
    }
    
    const parsedData = JSON.parse(responseContent);
    console.log(`[LLMParser:Eventbrite] Extracted ${parsedData.events?.length || 0} events`);
    
    // Convert to Experience format
    return (parsedData.events || []).map((event: any, index: number) => ({
      id: `eventbrite-${index}-${Date.now()}`,
      title: event.title || `${category} Event`,
      description: event.description || `${category} event in ${city}`,
      imageUrl: event.imageUrl || '/placeholder.jpg',
      url: event.url || `https://www.eventbrite.com/d/${city}/${category}/`,
      price: event.price,
      source: 'Eventbrite'
    }));
  } catch (error) {
    console.error('[LLMParser:Eventbrite] Error during parsing:', error);
    return [];
  }
}

/**
 * Parse HTML from Timeout using OpenAI
 */
async function parseTimeoutEvents(html: string, city: string, category: string): Promise<Experience[]> {
  try {
    console.log('[LLMParser:Timeout] Starting LLM parsing');
    
    // Clean and simplify the HTML to focus on relevant content
    const $ = cheerio.load(html);
    
    // Remove script tags, styles, and other non-content elements
    $('script, style, noscript, svg, iframe').remove();
    
    // Get main content where events are likely to be
    const mainContent = $('.main').html() || 
                        $('.cards-grid').html() || 
                        $('main').html() || 
                        $('body').html();
    
    if (!mainContent) {
      throw new Error('No content found to parse');
    }
    
    // Use OpenAI to extract structured data
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert web scraper that extracts structured data from HTML content.
          Extract events and activities from the Timeout website HTML. Focus on event cards, listings, or "things to do" sections.
          For each item, extract: title, description (if available), location, image URL (if available), and event URL.
          Return the data in JSON format with an array of events, each containing the extracted fields.`
        },
        {
          role: "user",
          content: `Extract events and activities from this Timeout HTML content for ${city}:\n\n${mainContent.substring(0, 15000)}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });
    
    // Parse the response
    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error('Empty response from OpenAI');
    }
    
    const parsedData = JSON.parse(responseContent);
    console.log(`[LLMParser:Timeout] Extracted ${parsedData.events?.length || 0} events`);
    
    // Convert to Experience format
    return (parsedData.events || []).map((event: any, index: number) => ({
      id: `timeout-${index}-${Date.now()}`,
      title: event.title || `${city} Activity`,
      description: event.description || `Activity in ${city}`,
      imageUrl: event.imageUrl || '/placeholder.jpg',
      url: event.url || `https://www.timeout.com/${city}`,
      source: 'Timeout'
    }));
  } catch (error) {
    console.error('[LLMParser:Timeout] Error during parsing:', error);
    return [];
  }
}

/**
 * Parse HTML from Meetup using OpenAI
 */
async function parseMeetupEvents(html: string, city: string, category: string): Promise<Experience[]> {
  try {
    console.log('[LLMParser:Meetup] Starting LLM parsing');
    
    // Clean and simplify the HTML to focus on relevant content
    const $ = cheerio.load(html);
    
    // Remove script tags, styles, and other non-content elements
    $('script, style, noscript, svg, iframe').remove();
    
    // Get main content where events are likely to be
    const mainContent = $('.search-results').html() || 
                         $('.event-cards').html() ||
                         $('main').html() || 
                         $('body').html();
    
    if (!mainContent) {
      throw new Error('No content found to parse');
    }
    
    // Use OpenAI to extract structured data
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert web scraper that extracts structured data from HTML content.
          Extract events from the Meetup website HTML. Focus on event cards or listings.
          For each event, extract: title, description (if available), date/time, group name, attendees (if available), location, image URL (if available), and event URL.
          Return the data in JSON format with an array of events, each containing the extracted fields.`
        },
        {
          role: "user",
          content: `Extract events from this Meetup HTML content for ${category} in ${city}:\n\n${mainContent.substring(0, 15000)}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });
    
    // Parse the response
    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error('Empty response from OpenAI');
    }
    
    const parsedData = JSON.parse(responseContent);
    console.log(`[LLMParser:Meetup] Extracted ${parsedData.events?.length || 0} events`);
    
    // Convert to Experience format
    return (parsedData.events || []).map((event: any, index: number) => ({
      id: `meetup-${index}-${Date.now()}`,
      title: event.title || `${category} Meetup`,
      description: event.description || `${event.groupName ? event.groupName + ': ' : ''}${category} meetup in ${city}`,
      imageUrl: event.imageUrl || '/placeholder.jpg',
      url: event.url || `https://www.meetup.com/find/?keywords=${encodeURIComponent(category)}&location=${encodeURIComponent(city)}`,
      rating: event.attendees ? Math.min(5, event.attendees / 10) : undefined,
      reviewCount: event.attendees,
      source: 'Meetup'
    }));
  } catch (error) {
    console.error('[LLMParser:Meetup] Error during parsing:', error);
    return [];
  }
}