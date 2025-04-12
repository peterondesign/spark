import { OpenAI } from 'openai';

// Define the structure for OSM tag mappings
export interface OSMActivityMapping {
  tags: string[];
  keywords: string[];
  radius: number;
  activityType: string;  // Core activity type for classification
  mustContain: string[]; // Terms that MUST be in relevant results
  mustExclude: string[]; // Terms that should NOT be in results for this activity
}

// Define common activity types for better semantic mapping
const ACTIVITY_TYPES = {
  DINING: 'dining',
  COOKING: 'cooking',
  CLASSES: 'classes',
  ENTERTAINMENT: 'entertainment',
  OUTDOOR: 'outdoor',
  SPORTS: 'sports',
  CULTURE: 'culture',
  RELAXATION: 'relaxation',
  SHOPPING: 'shopping'
};

// Initialize OpenAI client
let openaiClient: OpenAI | null = null;

/**
 * Initialize the OpenAI client using available environment variables
 */
const initOpenAI = (): boolean => {
  if (openaiClient) return true;
  
  try {
    // Try different possible environment variable names
    const possibleKeys = [
      process.env.OPENAI_API_KEY,
      process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      process.env.NEXT_PUBLIC_OPEN_API_KEY
    ];
    
    const apiKey = possibleKeys.find(key => key && key.trim() !== '');
    
    if (!apiKey) {
      console.error('No OpenAI API key found in environment variables');
      return false;
    }
    
    openaiClient = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Required for client-side usage
    });
    
    return true;
  } catch (error) {
    console.error('Failed to initialize OpenAI client:', error);
    return false;
  }
};

/**
 * Determines the semantic meaning of a date idea to properly categorize it
 * This is independent of API calls - direct string analysis
 */
function analyzeActivityIntent(activity: string): {
  activityType: string,
  mustContain: string[],
  mustExclude: string[]
} {
  const lowerActivity = activity.toLowerCase();
  
  // Class or Workshop based activity
  if (lowerActivity.includes('class') || 
      lowerActivity.includes('workshop') || 
      lowerActivity.includes('lesson') ||
      lowerActivity.includes('course') ||
      lowerActivity.includes('making') ||
      lowerActivity.includes('learning') ||
      lowerActivity.includes('teaching')) {
    
    // Identify the specific type of class
    let classType = '';
    let mustContain = ['class', 'school', 'workshop', 'studio'];
    let mustExclude = ['restaurant', 'dining', 'cafe', 'bar'];
    
    if (lowerActivity.includes('cook') || lowerActivity.includes('bak')) {
      classType = ACTIVITY_TYPES.COOKING;
      mustContain.push('cooking', 'culinary', 'chef');
    }
    
    if (lowerActivity.includes('sushi')) {
      mustContain.push('sushi', 'japanese', 'culinary');
    }
    
    if (lowerActivity.includes('art') || lowerActivity.includes('paint')) {
      classType = ACTIVITY_TYPES.CULTURE;
      mustContain.push('art', 'studio', 'gallery');
    }
    
    if (lowerActivity.includes('danc')) {
      classType = ACTIVITY_TYPES.ENTERTAINMENT;
      mustContain.push('dance', 'studio', 'school');
    }
    
    // Return the class-specific result
    return {
      activityType: classType || ACTIVITY_TYPES.CLASSES,
      mustContain,
      mustExclude
    };
  }
  
  // Restaurant/dining activity
  if (lowerActivity.includes('restaurant') || 
      lowerActivity.includes('dining') ||
      lowerActivity.includes('dinner') ||
      lowerActivity.includes('lunch') ||
      lowerActivity.includes('cafe')) {
    return {
      activityType: ACTIVITY_TYPES.DINING,
      mustContain: ['restaurant', 'dining', 'food', 'cafe'],
      mustExclude: ['class', 'school', 'workshop', 'studio']
    };
  }
  
  // Movie or theater
  if (lowerActivity.includes('movie') || 
      lowerActivity.includes('cinema') ||
      lowerActivity.includes('theatre') ||
      lowerActivity.includes('theater')) {
    return {
      activityType: ACTIVITY_TYPES.ENTERTAINMENT,
      mustContain: ['cinema', 'movie', 'theater', 'theatre'],
      mustExclude: ['restaurant', 'class']
    };
  }
  
  // Outdoor activities
  if (lowerActivity.includes('hike') || 
      lowerActivity.includes('park') ||
      lowerActivity.includes('garden') ||
      lowerActivity.includes('nature') ||
      lowerActivity.includes('walk')) {
    return {
      activityType: ACTIVITY_TYPES.OUTDOOR,
      mustContain: ['park', 'trail', 'garden', 'hike', 'nature'],
      mustExclude: ['restaurant', 'cafe', 'cinema']
    };
  }
  
  // Generic fallback
  return {
    activityType: 'general',
    mustContain: [],
    mustExclude: []
  };
}

/**
 * Gets OSM mapping for a specific activity using OpenAI
 * This function handles both the AI response and ensures semantic integrity
 */
export async function getOSMMapping(activityName: string): Promise<OSMActivityMapping> {
  // First, analyze the activity semantically to get intent
  const activityIntent = analyzeActivityIntent(activityName);
  
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
          }
          
          IMPORTANT: For activities involving classes, workshops, or learning something,
          focus on education-related tags (school, college, community_centre) and NOT on restaurants.
          Be extremely precise with the activity type.`
        },
        {
          role: "user",
          content: `Create an OpenStreetMap tag mapping for the activity: ${activityName}. 
          Tags should be specific OSM tags like "restaurant", "cinema", "park", etc.
          For class/workshop activities like "Sushi Making Class", use tags like "school", "community_centre" NOT "restaurant".
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
    
    const parsedMapping = JSON.parse(responseContent);
    
    // Validate and enhance the mapping with our semantic analysis
    if (!Array.isArray(parsedMapping.tags) || 
        !Array.isArray(parsedMapping.keywords) || 
        typeof parsedMapping.radius !== 'number') {
      throw new Error('Invalid mapping format from OpenAI');
    }
    
    // Merge AI response with our semantic understanding
    return {
      tags: parsedMapping.tags,
      keywords: [...parsedMapping.keywords, ...activityIntent.mustContain],
      radius: parsedMapping.radius,
      activityType: activityIntent.activityType,
      mustContain: activityIntent.mustContain,
      mustExclude: activityIntent.mustExclude
    };
  } catch (error) {
    console.error(`Error generating OSM mapping for ${activityName}:`, error);
    
    // Even if OpenAI fails, return a mapping based on our semantic analysis
    return {
      tags: ['community_centre', 'school', 'college', 'university', 'studio'],
      keywords: ['class', 'workshop', 'learn', 'course', 'studio', 'school'],
      radius: 15000,
      activityType: activityIntent.activityType,
      mustContain: activityIntent.mustContain,
      mustExclude: activityIntent.mustExclude
    };
  }
}

/**
 * Builds an Overpass API query string based on the mapping and coordinates
 */
export function buildOverpassQuery(lat: number, lon: number, mapping: OSMActivityMapping): string {
  const { tags, radius } = mapping;
  const radiusValue = radius || 10000; // Default to 10km
  
  // For class-specific activities, prioritize educational venues
  if (mapping.activityType === ACTIVITY_TYPES.CLASSES || 
      mapping.activityType === ACTIVITY_TYPES.COOKING) {
    return `
      [out:json];
      (
        node["amenity"="school"](around:${radiusValue},${lat},${lon});
        way["amenity"="school"](around:${radiusValue},${lat},${lon});
        node["amenity"="community_centre"](around:${radiusValue},${lat},${lon});
        way["amenity"="community_centre"](around:${radiusValue},${lat},${lon});
        node["leisure"="sports_centre"](around:${radiusValue},${lat},${lon});
        node["amenity"="college"](around:${radiusValue},${lat},${lon});
        node["amenity"="university"](around:${radiusValue},${lat},${lon});
        node["leisure"="studio"](around:${radiusValue},${lat},${lon});
        node["amenity"="studio"](around:${radiusValue},${lat},${lon});
      );
      out body 15;
    `;
  }
  
  // For restaurant-specific queries
  if (mapping.activityType === ACTIVITY_TYPES.DINING) {
    return `
      [out:json];
      (
        node["amenity"="restaurant"](around:${radiusValue},${lat},${lon});
        way["amenity"="restaurant"](around:${radiusValue},${lat},${lon});
        node["amenity"="cafe"](around:${radiusValue},${lat},${lon});
        way["amenity"="cafe"](around:${radiusValue},${lat},${lon});
        node["amenity"="fast_food"](around:${radiusValue},${lat},${lon});
        way["amenity"="fast_food"](around:${radiusValue},${lat},${lon});
      );
      out body 15;
    `;
  }
  
  // For other activities, use the tags from the mapping
  const tagQueries = tags.map(tag => {
    // Determine the most likely OSM tag category
    let category = "amenity";
    if (tag === "park" || tag === "garden" || tag.includes("sport")) {
      category = "leisure";
    } else if (tag === "museum" || tag === "gallery" || tag === "attraction") {
      category = "tourism";
    }
    
    return `
      node["${category}"="${tag}"](around:${radiusValue},${lat},${lon});
      way["${category}"="${tag}"](around:${radiusValue},${lat},${lon});
    `;
  }).join('\n');
  
  return `
    [out:json];
    (
      ${tagQueries}
    );
    out body 15;
  `;
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