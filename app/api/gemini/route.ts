import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { dateIdeaTitle, dateIdeaCategory, location } = await req.json();
    
    // Validate input
    if (!dateIdeaTitle || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get API key from env
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Initialize the Google Generative AI with your API key
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Create a prompt for Gemini
    const prompt = `
      Given the webpage at the URL "https://www.getyourguide.com/s/?q=${dateIdeaCategory.trim().replace(/\s+/g, '+')},+${location.trim().replace(/\s+/g, '+')}&searchSource=3", extract and return the title and URL for each result on the page.
      
      Please output a JSON array where each element is an object with these keys:
      - "title": the name of the activity or place
      - "url": the direct link to the activity or venue
      
      Use the parameters in the URL to filter and format the results. Return only the JSON array without extra text.
    `;

    try {
      // Using the correct model name according to the latest documentation
      // For a faster, more concise model use gemini-1.5-flash
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Use the pattern from the example
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      // Return the suggestions with basic formatting maintained
      return NextResponse.json({
        suggestions: text
          .replace(/\n/g, '<br/>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      });
    } catch (modelError) {
      console.error('Error from Gemini model:', modelError);
      
      // Try fallback model if the first one fails
      try {
        console.log('Trying fallback model...');
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
        const fallbackResult = await fallbackModel.generateContent(prompt);
        const fallbackText = fallbackResult.response.text();
        
        return NextResponse.json({
          suggestions: fallbackText
            .replace(/\n/g, '<br/>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        });
      } catch (fallbackError) {
        console.error('Fallback model also failed:', fallbackError);
        return NextResponse.json(
          { error: 'Failed to generate content with all available models' },
          { status: 500 }
        );
      }
    }
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
