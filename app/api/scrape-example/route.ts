import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const url = 'https://example.com/';

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Example.com API error: ${response.status}`);
    }

    const html = await response.text();

    // Parse the HTML using JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extract the title and description from the page
    const title = document.querySelector('h1')?.textContent || 'No title found';
    const description = document.querySelector('p')?.textContent || 'No description found';

    const results = [
      {
        title,
        description,
        url,
      },
    ];

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error scraping example.com:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Error scraping example.com', error: errorMessage },
      { status: 500 }
    );
  }
}