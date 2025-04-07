import { OpenAI } from 'openai';

// Define the structure for OSM tag mappings
export interface OSMActivityMapping {
  tags: string[];
  keywords: string[];
  radius: number;
}

// Initialize OpenAI client
let openaiClient: OpenAI | null = null;

const initOpenAI = () => {
  if (!openaiClient) {
    try {
      // Use NEXT_PUBLIC_OPEN_API_KEY for client-side compatibility
      const apiKey = process.env.NEXT_PUBLIC_OPEN_API_KEY || '';
      
      if (!apiKey) {
        console.error('OpenAI API key is missing');
        return false;
      }
      
      openaiClient = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Allow usage in browser environment
      });
    } catch (err) {
      console.error('Failed to initialize OpenAI client:', err);
      return false;
    }
  }
  return true;
};

/**
 * Gets OSM mapping for a specific activity using OpenAI
 * @param activityName The name of the activity to get mappings for
 * @returns OSM mapping with tags, keywords, and search radius
 */
export async function getOSMMapping(activityName: string): Promise<OSMActivityMapping> {
  if (!initOpenAI() || !openaiClient) {
    throw new Error('OpenAI client initialization failed. Make sure your API key is properly configured.');
  }
  
  try {
    console.log(`Generating OSM mapping for: ${activityName}`);
    
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert in OpenStreetMap (OSM) tags and need to map activities to relevant OSM tags. 
          Return JSON data only in this exact format without any explanation:
          {
            "tags": ["list", "of", "osm", "tags"],
            "keywords": ["list", "of", "relevant", "keywords"],
            "radius": number_in_meters
          }`
        },
        {
          role: "user",
          content: `Create an OpenStreetMap tag mapping for the activity: ${activityName}. 
          Tags should be specific OSM tags like "restaurant", "cinema", "park", etc.
          Consider all aspects of the activity - for example "Sunset Kayaking Tour" would include tags for kayaking, water activities, guided tours, and sunset viewpoints.
          Keywords should help identify places relevant to this activity.
          Radius should indicate how far (in meters) someone might travel for this activity (5000-20000).`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });
    
    const responseContent = completion.choices[0].message.content;
    
    if (!responseContent) {
      throw new Error('Empty response from OpenAI');
    }
    
    const parsedMapping = JSON.parse(responseContent) as OSMActivityMapping;
    
    // Validate the mapping
    if (!Array.isArray(parsedMapping.tags) || 
        !Array.isArray(parsedMapping.keywords) || 
        typeof parsedMapping.radius !== 'number') {
      throw new Error('Invalid mapping format from OpenAI');
    }
    
    return parsedMapping;
  } catch (error) {
    console.error(`Error generating OSM mapping for ${activityName}:`, error);
    throw new Error(`Failed to generate OSM mapping for ${activityName}`);
  }
}

/**
 * Finds the relevant OSM mapping for a date idea title using OpenAI
 * @param title The date idea title
 * @returns OSM mapping with tags, keywords, and search radius
 */
export async function getOSMMappingForDateIdea(title: string): Promise<OSMActivityMapping> {
  try {
    return await getOSMMapping(title);
  } catch (error) {
    console.error(`Error in getOSMMappingForDateIdea for ${title}:`, error);
    throw error;
  }
}