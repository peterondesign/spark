import { NextRequest, NextResponse } from 'next/server';
import { scrapeWebsite } from '../../lib/scraper';

export const runtime = 'nodejs'; // Explicitly set runtime to Node.js

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json(
                { message: 'URL is required' },
                { status: 400 }
            );
        }

        console.log(`Starting to scrape URL: ${url}`);
        const data = await scrapeWebsite(url);
        console.log('Scraping completed successfully');
        
        return NextResponse.json(data);
    } catch (error) {
        console.error('Scraping error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { message: 'Error scraping the website', error: errorMessage },
            { status: 500 }
        );
    }
}