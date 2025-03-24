import OpenAI from 'openai';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Define TypeScript interfaces for better type safety
interface ScrapeResult {
  name?: string;
  description?: string;
  address?: string;
  priceRange?: string;
  rating?: number;
  website?: string;
  hours?: string;
  [key: string]: any; // Allow for additional properties
}

interface ScrapeResponse {
  results: ScrapeResult[];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function scrapeWithAI(activity: string, location: string): Promise<ScrapeResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that provides information about date activities in different locations."
        },
        {
          role: "user",
          content: `Find information about "${activity}" in ${location}. Include name, description, address, price range, and any other relevant details. Format the results as a JSON array of objects.`
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response from the AI
    const content = response.choices[0].message.content;
    const data = content ? JSON.parse(content) : { results: [] };
    
    return { results: data.results || [] };
  } catch (error) {
    console.error('AI Scraper error:', error);
    throw new Error(`Failed to scrape data: ${error instanceof Error ? error.message : String(error)}`);
  }
}
