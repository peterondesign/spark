import { NextRequest, NextResponse } from 'next/server';
import { scrapeWebsite } from '../../lib/scraper';

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

        const data = await scrapeWebsite(url);
        return NextResponse.json(data);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { message: 'Error scraping the website', error: errorMessage },
            { status: 500 }
        );
    }
}