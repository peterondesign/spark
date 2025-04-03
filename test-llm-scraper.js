// Test script for LLM-based scraping
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import * as cheerio from 'cheerio';

// Load environment variables
dotenv.config();

// Define Experience interface structure
const defaultExperience = {
  id: '',
  title: '',
  description: '',
  imageUrl: '/placeholder.jpg',
  url: '',
  source: ''
};

// Google Maps scraper using LLM and OpenAI
async function scrapeGoogleMaps(city, category, limit = 5) {
  try {
    console.log(`[GoogleMaps] Starting LLM-based scrape for ${city}, ${category}`);
    const searchQuery = `${category} in ${city}`;
    const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&tbm=lcl`;
    console.log(`[GoogleMaps] Fetching URL: ${targetUrl}`);
    
    // For testing purposes, use direct fetch instead of proxy
    const response = await fetch(targetUrl);
    
    if (!response.ok) {
      throw new Error(`GoogleMaps request failed: ${response.status}`);
    }
    
    const html = await response.text();
    console.log(`[GoogleMaps] Received HTML length: ${html.length} characters`);
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Clean the HTML with cheerio to remove unnecessary elements
    const $ = cheerio.load(html);
    // Remove script tags, styles, and other non-content elements
    $('script, style, noscript, iframe').remove();
    
    // Get the main content area with local results
    const mainContent = $('#search').html() || $('body').html();
    
    if (!mainContent) {
      throw new Error('No content found to parse');
    }
    
    console.log(`[GoogleMaps] Sending ${Math.min(mainContent.length, 15000)} characters to OpenAI for parsing`);
    
    // Use OpenAI to extract structured data from the HTML content
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using a smaller, faster model for cost efficiency
      messages: [
        {
          role: "system",
          content: `You are an expert web scraper that extracts structured data from HTML content.
          Extract places from Google Maps search results HTML. Focus only on the local business/place listings.
          For each place, extract: 
          - name (required)
          - address or location (if available)
          - description or category (if available)
          - rating (numeric value if available)
          - number of reviews (numeric value if available)
          - any other relevant details

          Return the data in JSON format with an array of places, each containing the extracted fields.
          `
        },
        {
          role: "user",
          content: `Extract places from these Google Maps search results for "${category} in ${city}":\n\n${mainContent.substring(0, 15000)}`
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
    console.log(`[GoogleMaps] Extracted ${parsedData.places?.length || 0} places using LLM parsing`);
    
    // Log a sample result for debugging
    if (parsedData.places?.length > 0) {
      console.log('[GoogleMaps] Sample place data:', JSON.stringify(parsedData.places[0], null, 2));
    }
    
    // Convert to Experience format
    const experiences = (parsedData.places || []).map((place, index) => {
      // Create a better description by combining details
      let description = place.description || place.category || '';
      if (place.address && !description.includes(place.address)) {
        description = description ? `${description} - ${place.address}` : place.address;
      }
      
      return {
        id: `gm-${index}-${Date.now()}`,
        title: place.name || `${category} in ${city}`,
        description: description || `${category} location in ${city}`,
        imageUrl: place.imageUrl || '/placeholder.jpg',
        url: place.url || `https://www.google.com/maps/search/${encodeURIComponent(place.name + ' ' + city)}`,
        rating: place.rating ? parseFloat(place.rating) : undefined,
        reviewCount: place.reviews ? parseInt(place.reviews.toString().replace(/[^0-9]/g, '')) : undefined,
        source: 'Google Maps'
      };
    });
    
    console.log(`[GoogleMaps] Successfully processed ${experiences.length} places`);
    return experiences.slice(0, limit);
    
  } catch (error) {
    console.error('[GoogleMaps] Error with LLM scraping:', error);
    return [];
  }
}

// Mock function for multi-source scraping (simplified for this test)
async function scrapeEventsWithLLM(city, category, limit = 8) {
  // For this test script, we'll just return some mock data
  console.log(`[LLMScraper] Would normally scrape ${category} events in ${city}`);
  
  // Generate some mock data
  const mockEvents = [
    {
      id: `eventbrite-1-${Date.now()}`,
      title: `${category} Workshop`,
      description: `Learn the art of ${category} from expert instructors in ${city}.`,
      imageUrl: '/placeholder.jpg',
      url: `https://www.eventbrite.com/e/${category.replace(/\s+/g, '-')}-workshop-tickets`,
      price: '$45.00',
      source: 'Eventbrite'
    },
    {
      id: `timeout-1-${Date.now()}`,
      title: `${category} Experience`,
      description: `Enjoy this amazing ${category} experience in downtown ${city}.`,
      imageUrl: '/placeholder.jpg',
      url: `https://www.timeout.com/${city}/things-to-do/${category}`,
      source: 'Timeout'
    },
    {
      id: `meetup-1-${Date.now()}`,
      title: `${category} Enthusiasts Group`,
      description: `Join our friendly community of ${category} lovers in ${city}.`,
      imageUrl: '/placeholder.jpg',
      url: `https://www.meetup.com/find/?keywords=${category}`,
      rating: 4.8,
      reviewCount: 127,
      source: 'Meetup'
    }
  ];
  
  return mockEvents;
}

// Function to test Google Maps scraper
async function testGoogleMapsScraper() {
  console.log('🔍 Testing Google Maps LLM scraper...');
  
  try {
    const city = 'New York';
    const category = 'cocktail bars';
    const limit = 5;
    
    console.log(`Searching for: ${category} in ${city}`);
    const results = await scrapeGoogleMaps(city, category, limit);
    
    console.log('\n-------- Google Maps Results --------');
    console.log(`Found ${results.length} places:`);
    results.forEach((result, index) => {
      console.log(`\n[${index + 1}] ${result.title}`);
      console.log(`Description: ${result.description}`);
      console.log(`Rating: ${result.rating || 'N/A'} (${result.reviewCount || 'No'} reviews)`);
      console.log(`URL: ${result.url}`);
    });
  } catch (error) {
    console.error('Error testing Google Maps scraper:', error);
  }
}

// Function to test multi-source scraping
async function testMultiSourceScraper() {
  console.log('\n🌐 Testing multi-source LLM event scraper...');
  
  try {
    const city = 'San Francisco';
    const category = 'cooking class';
    const limit = 8;
    
    console.log(`Searching for: ${category} in ${city}`);
    const results = await scrapeEventsWithLLM(city, category, limit);
    
    console.log('\n-------- Multi-Source Event Results --------');
    console.log(`Found ${results.length} events:`);
    
    // Group results by source
    const groupedResults = results.reduce((acc, result) => {
      acc[result.source] = acc[result.source] || [];
      acc[result.source].push(result);
      return acc;
    }, {});
    
    // Display results by source
    Object.entries(groupedResults).forEach(([source, sourceResults]) => {
      console.log(`\n== ${source} (${sourceResults.length} results) ==`);
      sourceResults.forEach((result, index) => {
        console.log(`\n[${index + 1}] ${result.title}`);
        console.log(`Description: ${result.description.substring(0, 100)}${result.description.length > 100 ? '...' : ''}`);
        if (result.price) console.log(`Price: ${result.price}`);
        if (result.rating) console.log(`Rating: ${result.rating} (${result.reviewCount || 'No'} reviews)`);
        console.log(`URL: ${result.url}`);
      });
    });
  } catch (error) {
    console.error('Error testing multi-source scraper:', error);
  }
}

// Run the tests
async function runTests() {
  // Check if OpenAI API key is set
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY environment variable is not set');
    console.log('Please set your OpenAI API key in the .env file or environment variables');
    process.exit(1);
  }
  
  console.log('🚀 Starting LLM scraper tests...');
  
  // Run Google Maps test
  await testGoogleMapsScraper();
  
  // Run multi-source test
  await testMultiSourceScraper();
  
  console.log('\n✅ Tests completed!');
}

// Execute tests
runTests().catch(console.error);