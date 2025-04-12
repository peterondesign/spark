import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { message: 'Query is required' },
        { status: 400 }
      );
    }

    const url = `https://www.bing.com/maps?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`NewSite API error: ${response.status}`);
    }

    const html = await response.text();

    // Log the HTML for debugging purposes
    console.log('Fetched HTML:', html.slice(0, 500)); // Log the first 500 characters of the HTML

    // Parse the HTML using JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extract results (adjust selectors based on the site's structure)
    const results = Array.from(document.querySelectorAll('.b_vPanel')).map((item) => {
      const title = item.querySelector('.maps_tna_list_title')?.textContent || 'No title';
      const description = item.querySelector('.b_address')?.textContent || 'No description';
      const url = item.querySelector('a')?.href || '#';

      return { title, description, url };
    });

    // Log the extracted results for debugging
    console.log('Extracted Results:', results);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error scraping NewSite:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Error scraping NewSite', error: errorMessage },
      { status: 500 }
    );
  }
}