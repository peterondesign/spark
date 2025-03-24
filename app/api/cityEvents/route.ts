import { NextResponse } from 'next/server';
import { spawn, ChildProcess } from 'child_process';

interface ScraperResult {
  events?: Array<{
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    url: string;
    price?: string;
    rating?: number;
    reviewCount?: number;
  }>;
  error?: string;
  status?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const category = searchParams.get('category');

  if (!city) {
    return NextResponse.json({ error: 'City parameter is required' }, { status: 400 });
  }

  try {
    const result = await new Promise<ScraperResult>((resolve, reject) => {
      // Ensure city and category are strings for spawn
      const process: ChildProcess = spawn('python3', [
        'services/scraper.py',
        '--city', city || '',
        '--category', category || ''
      ]);

      let data = '';
      let error = '';

      process.stdout?.on('data', (chunk: Buffer) => {
        data += chunk.toString();
      });

      process.stderr?.on('data', (chunk: Buffer) => {
        error += chunk.toString();
        console.error('Scraper error:', error);
      });

      process.on('close', (code: number) => {
        if (code !== 0) {
          reject(new Error(error || 'Chrome setup failed. Please ensure Chrome is installed.'));
          return;
        }
        try {
          const parsedData = JSON.parse(data) as ScraperResult;
          resolve(parsedData);
        } catch (e) {
          console.error('Parse error:', e);
          reject(new Error('Invalid data received from scraper'));
        }
      });
    });

    if ('error' in result && result.error) {
      throw new Error(result.error);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Scraping error:', error);
    const errorMessage = error instanceof Error 
      ? error.message.includes('Chrome') 
        ? 'Browser setup failed. Please ensure Chrome is installed.'
        : error.message
      : 'Failed to fetch events';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
