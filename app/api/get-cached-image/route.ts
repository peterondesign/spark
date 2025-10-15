import { NextRequest, NextResponse } from 'next/server';
import ReplicateImageService from '../../utils/newImageService';

export async function POST(request: NextRequest) {
  try {
    const { keyword, width = 400, height = 300 } = await request.json();

    if (!keyword) {
      return NextResponse.json({
        success: false,
        message: 'Keyword is required'
      }, { status: 400 });
    }

    console.log(`🔍 API: Looking up cached image for: "${keyword}"`);

    const replicateService = ReplicateImageService.getInstance();
    
    // Generate cache key using same logic
    const cacheKey = keyword
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '') + `_${width}x${height}`;
    
    // Check if image exists (this will use our improved fuzzy matching)
    const existingImage = await replicateService.checkImageExists(cacheKey);
    
    if (existingImage) {
      console.log(`✅ API: Found existing image: ${existingImage}`);
      return NextResponse.json({
        success: true,
        imageUrl: existingImage,
        cacheKey,
        message: 'Image found in cache'
      });
    } else {
      console.log(`❌ API: No existing image found for: ${keyword}`);
      return NextResponse.json({
        success: false,
        message: 'No cached image found',
        cacheKey
      });
    }

  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}