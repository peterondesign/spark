import { NextRequest, NextResponse } from 'next/server';
import ReplicateImageService from '../../utils/newImageService';

export async function POST(request: NextRequest) {
  try {
    const { keyword, width = 1024, height = 768 } = await request.json();
    
    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword is required' },
        { status: 400 }
      );
    }

    console.log(`Generating image for keyword: ${keyword}`);
    
    const imageService = ReplicateImageService.getInstance();
    const imageUrl = await imageService.getImage(keyword, width, height);
    
    if (!imageUrl) {
      console.error('Failed to generate image');
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      );
    }

    console.log(`Successfully generated image: ${imageUrl}`);
    
    return NextResponse.json({
      success: true,
      imageUrl,
      keyword,
      dimensions: { width, height }
    });

  } catch (error) {
    console.error('Generate image API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const imageService = ReplicateImageService.getInstance();
    const stats = imageService.getCacheStats();
    
    return NextResponse.json({
      success: true,
      cacheStats: stats
    });
    
  } catch (error) {
    console.error('Get cache stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}