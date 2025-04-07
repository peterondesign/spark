import { NextRequest, NextResponse } from 'next/server';
import { serveCachedImage, cacheImage } from '../../../../utils/imageCache';

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');
  const imageKey = searchParams.get('key');
  
  // If key is provided, serve the cached image directly
  if (imageKey) {
    return serveCachedImage(request, imageKey);
  }
  
  // If URL is provided, cache it and redirect to the cached version
  if (imageUrl) {
    try {
      const cachedPath = await cacheImage(imageUrl);
      
      if (cachedPath) {
        // Redirect to the cached image
        return NextResponse.redirect(new URL(cachedPath, request.url));
      } else {
        // If caching failed, redirect to the original URL
        return NextResponse.redirect(new URL(imageUrl));
      }
    } catch (error) {
      console.error('Error caching image:', error);
      return NextResponse.json({ error: 'Failed to cache image' }, { status: 500 });
    }
  }
  
  return NextResponse.json(
    { error: 'Missing required parameter: either url or key must be provided' }, 
    { status: 400 }
  );
}