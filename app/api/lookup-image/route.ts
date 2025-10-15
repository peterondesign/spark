import { NextRequest, NextResponse } from 'next/server';
import ReplicateImageService from '../../utils/newImageService';

export async function POST(request: NextRequest) {
  try {
    const { keyword, width = 400, height = 300 } = await request.json();

    if (!keyword) {
      return NextResponse.json({
        success: false,
        error: 'Keyword is required'
      }, { status: 400 });
    }

    console.log(`🔍 Fast lookup for: "${keyword}"`);

    // Use the ReplicateImageService to find existing images
    const imageService = ReplicateImageService.getInstance();
    const existingImageUrl = await imageService.findExistingImage(keyword, width, height);

    if (existingImageUrl) {
      console.log(`✅ Found existing image: ${existingImageUrl}`);
      return NextResponse.json({
        success: true,
        imageUrl: existingImageUrl,
        cached: true
      });
    }

    // If no existing image found, generate one on-demand
    console.log(`🔄 No existing image found, generating for: "${keyword}"`);
    try {
      const generatedImageUrl = await imageService.getImage(keyword, width, height);
      
      if (generatedImageUrl) {
        console.log(`✅ Generated new image: ${generatedImageUrl}`);
        return NextResponse.json({
          success: true,
          imageUrl: generatedImageUrl,
          cached: false,
          generated: true
        });
      }
    } catch (generateError) {
      console.error('Image generation failed:', generateError);
    }

    console.log(`❌ Failed to find or generate image for: "${keyword}"`);
    return NextResponse.json({
      success: false,
      message: 'No existing image found and generation failed'
    });

  } catch (error) {
    console.error('Image lookup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}