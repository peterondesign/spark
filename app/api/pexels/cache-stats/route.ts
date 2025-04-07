import { NextRequest, NextResponse } from 'next/server';
import { getCacheStats, cleanupCache } from '../../../../utils/imageCache';

export const GET = async function (request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const cleanup = searchParams.get('cleanup') === 'true';
  
  if (cleanup) {
    // Trigger a cache cleanup if requested
    cleanupCache();
  }
  
  // Get cache statistics
  const stats = getCacheStats();
  
  return NextResponse.json(stats, {
    headers: {
      'Cache-Control': 'no-store'
    }
  });
}