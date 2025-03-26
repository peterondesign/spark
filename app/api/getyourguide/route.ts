import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const query = searchParams.get('query');

  if (!city || !query) {
    return NextResponse.json({ error: 'City and query parameters are required' }, { status: 400 });
  }

  try {
    const targetUrl = `https://www.getyourguide.com/s/?q=${encodeURIComponent(query)}+${encodeURIComponent(city)}&searchSource=3`;
    // Use absolute URL for the proxy endpoint
    const proxyUrl = new URL('/api/proxy', request.url);
    proxyUrl.searchParams.set('url', targetUrl);
    
    const proxyResponse = await fetch(proxyUrl);
    
    if (!proxyResponse.ok) {
      console.error('Proxy request failed:', proxyResponse.status, proxyResponse.statusText);
      return NextResponse.json({ error: `Proxy request failed: ${proxyResponse.status}` }, { status: proxyResponse.status });
    }

    const html = await proxyResponse.text();
    
    // Debug: Log a sample of the HTML to see what we're getting
    console.log('HTML Sample:', html.substring(0, 500));
    
    const $ = cheerio.load(html);
    const experiences: any[] = [];

    // Updated selectors based on current GetYourGuide HTML structure
    $('article[class*="activityCard"]').slice(0, 2).each((_, element) => {
      const card = $(element);
      
      const title = card.find('h3, [class*="activityCard__title"]').first().text().trim();
      const price = card.find('[class*="baseline"]').first().text().trim();
      const rating = card.find('[class*="rating"]').first().text().trim();
      const reviewCount = card.find('[class*="reviews"]').first().text().trim();
      const imageUrl = card.find('img[class*="activityCard__image"]').first().attr('src');
      const link = card.find('a[class*="activityCard__link"]').first().attr('href');

      if (title || price || imageUrl) {
        experiences.push({
          title,
          price,
          rating,
          reviewCount,
          imageUrl,
          link: link ? (link.startsWith('http') ? link : `https://www.getyourguide.com${link}`) : null
        });
      }
    });

    if (experiences.length === 0) {
      // Fallback to alternative selectors if the primary ones didn't work
      $('.vertical-activity-card, .activity-card-container').slice(0, 2).each((_, element) => {
        const card = $(element);
        
        const title = card.find('h3, .activity-title, .title').first().text().trim();
        const price = card.find('.price-text, .price, .amount').first().text().trim();
        const rating = card.find('.rating-value, .rating').first().text().trim();
        const reviewCount = card.find('.review-count, .reviews').first().text().trim();
        const imageUrl = card.find('img').first().attr('src');
        const link = card.find('a').first().attr('href');

        if (title || price || imageUrl) {
          experiences.push({
            title,
            price,
            rating,
            reviewCount,
            imageUrl,
            link: link ? (link.startsWith('http') ? link : `https://www.getyourguide.com${link}`) : null
          });
        }
      });
    }

    if (experiences.length === 0) {
      console.log('No experiences found. HTML structure might have changed.');
      // Return the first 500 chars of HTML for debugging
      return NextResponse.json({ 
        error: 'No experiences found',
        debug: {
          url: targetUrl,
          htmlSample: html.substring(0, 500)
        }
      }, { status: 404 });
    }

    return NextResponse.json(experiences);
  } catch (error) {
    console.error('Error fetching experiences:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch experiences',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}