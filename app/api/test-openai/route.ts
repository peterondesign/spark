import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function GET() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        status: 'error',
        message: 'OpenAI API key not configured',
        hasApiKey: false
      }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Simple test call to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Respond with a simple JSON object containing a greeting message."
        },
        {
          role: "user",
          content: "Say hello and confirm the API is working"
        }
      ],
      max_tokens: 100,
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content;

    return NextResponse.json({
      status: 'success',
      message: 'OpenAI API is working correctly',
      hasApiKey: true,
      model: 'gpt-3.5-turbo',
      response: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('OpenAI Test Error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      hasApiKey: !!process.env.OPENAI_API_KEY,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
