import { NextRequest, NextResponse } from 'next/server';
import { generateImageForDateIdea } from '../../utils/dateIdeaImageGenerator';

export async function POST(request: NextRequest) {
  try {
    const { dateIdea, options = {} } = await request.json();

    if (!dateIdea || !dateIdea.id || !dateIdea.title || !dateIdea.category) {
      return NextResponse.json({
        success: false,
        message: 'Invalid date idea data. Required fields: id, title, category'
      }, { status: 400 });
    }

    console.log(`🎨 Generating image for new date idea: ${dateIdea.title}`);

    const result = await generateImageForDateIdea(dateIdea, options);

    if (result.success) {
      console.log(`✅ Successfully generated image for: ${dateIdea.title}`);
      return NextResponse.json({
        success: true,
        message: 'Image generated successfully',
        imageUrl: result.imageUrl,
        dateIdea: dateIdea
      });
    } else {
      console.error(`❌ Failed to generate image for: ${dateIdea.title}`);
      return NextResponse.json({
        success: false,
        message: 'Image generation failed',
        error: result.error,
        dateIdea: dateIdea
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Image generation endpoint error:', error);
    return NextResponse.json({
      success: false,
      message: 'Image generation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}