import { OpenAI } from 'openai';

// Define the structure for OSM tag mappings
export interface OSMActivityMapping {
  tags: string[];
  keywords: string[];
  radius: number;
}

// Base mappings for common activities
// These are used as fallbacks when OpenAI is unavailable or for better performance
export const BASE_ACTIVITY_MAPPINGS: Record<string, OSMActivityMapping> = {
  // Outdoor activities
  "hiking": {
    tags: ["hiking", "trail", "path", "national_park", "nature_reserve"],
    keywords: ["hike", "hiking", "trail", "mountain", "trekking", "walk"],
    radius: 20000
  },
  "horseback-riding": {
    tags: ["horse_riding", "horseback_riding", "equestrian", "riding", "stables"],
    keywords: ["horse", "riding", "equestrian", "stable", "ranch"],
    radius: 20000
  },
  "biking": {
    tags: ["bicycle_rental", "cycle_route", "bicycle", "bike_rental"],
    keywords: ["bike", "bicycle", "cycling", "mountain bike"],
    radius: 15000
  },
  "swimming": {
    tags: ["swimming", "swimming_pool", "beach", "water_park"],
    keywords: ["swim", "pool", "aquatic", "water"],
    radius: 15000
  },
  
  // Food & Drink
  "restaurant": {
    tags: ["restaurant", "food", "cuisine"],
    keywords: ["dinner", "food", "restaurant", "bistro", "eatery"],
    radius: 10000
  },
  "cafe": {
    tags: ["cafe", "coffee_shop", "tea", "bakery"],
    keywords: ["coffee", "cafe", "tea", "pastry"],
    radius: 10000
  },
  "wine": {
    tags: ["winery", "vineyard", "wine_bar", "wine"],
    keywords: ["wine", "tasting", "vineyard", "cellar"],
    radius: 15000
  },
  "bar": {
    tags: ["bar", "pub", "nightclub", "biergarten"],
    keywords: ["bar", "pub", "cocktail", "drink"],
    radius: 8000
  },
  
  // Entertainment
  "movie": {
    tags: ["cinema", "theatre", "movie_theater"],
    keywords: ["movie", "cinema", "film", "theater"],
    radius: 12000
  },
  "museum": {
    tags: ["museum", "gallery", "exhibition", "arts_centre"],
    keywords: ["museum", "gallery", "exhibit", "art"],
    radius: 15000
  },
  "bowling": {
    tags: ["bowling_alley", "bowling", "entertainment"],
    keywords: ["bowl", "bowling", "alley", "lanes"],
    radius: 12000
  },
  "arcade": {
    tags: ["arcade", "amusement_arcade", "games"],
    keywords: ["arcade", "game", "pinball", "video games"],
    radius: 12000
  },
  
  // Parks & Nature
  "park": {
    tags: ["park", "garden", "nature_reserve", "picnic_site"],
    keywords: ["park", "garden", "picnic", "nature"],
    radius: 15000
  },
  "beach": {
    tags: ["beach", "coastline", "shore"],
    keywords: ["beach", "coast", "sand", "ocean"],
    radius: 20000
  },
  "zoo": {
    tags: ["zoo", "wildlife_park", "animal"],
    keywords: ["zoo", "animal", "wildlife", "safari"],
    radius: 20000
  },
  
  // Shopping
  "shopping": {
    tags: ["mall", "shopping_center", "shop", "market"],
    keywords: ["shop", "mall", "store", "boutique"],
    radius: 10000
  },
  
  // Fitness & Sports
  "gym": {
    tags: ["sport", "fitness_centre", "gym"],
    keywords: ["gym", "fitness", "workout", "exercise"],
    radius: 10000
  },
  
  // Specialty
  "comedy": {
    tags: ["theatre", "arts_centre", "nightclub", "comedy_club"],
    keywords: ["comedy", "laugh", "standup", "improv"],
    radius: 12000
  },
  "amusement": {
    tags: ["theme_park", "water_park", "amusement"],
    keywords: ["amusement", "theme park", "roller coaster", "rides"],
    radius: 20000
  },
  
  // Water Activities
  "kayaking": {
    tags: ["kayak", "water_sports", "canoe_hire", "boat_rental", "watersports", "waterway"],
    keywords: ["kayak", "kayaking", "canoe", "paddling", "water sports", "boat rental"],
    radius: 20000
  },
  "canoeing": {
    tags: ["canoe", "canoe_hire", "kayak", "boat_rental", "watersports"],
    keywords: ["canoe", "canoeing", "kayak", "paddle", "river", "lake"],
    radius: 20000
  },
  "sailing": {
    tags: ["sailing", "marina", "harbour", "yacht", "boat_rental"],
    keywords: ["sailing", "yacht", "boat", "marina", "harbor", "sea"],
    radius: 20000
  },
  "boat-tour": {
    tags: ["boat_rental", "tour_boat", "ferry_terminal", "marina", "boat"],
    keywords: ["boat tour", "cruise", "boat ride", "river cruise", "sightseeing boat"],
    radius: 15000
  },
  "fishing": {
    tags: ["fishing", "fish", "fishing_spot", "recreation_ground"],
    keywords: ["fishing", "angling", "fish", "tackle", "bait"],
    radius: 20000
  },
  
  // Sunset Activities
  "sunset-viewing": {
    tags: ["viewpoint", "observation", "tourism", "viewpoint_scenic"],
    keywords: ["sunset", "view", "scenic", "panorama", "lookout", "vista"],
    radius: 15000
  },
  
  // Tours and Guided Activities
  "tour": {
    tags: ["tourism", "information", "tour_guide", "office"],
    keywords: ["tour", "guide", "guided", "walking tour", "excursion"],
    radius: 10000
  },
  "adventure-tour": {
    tags: ["outdoor", "adventure", "tourism", "sport"],
    keywords: ["adventure", "tour", "extreme", "activity", "outdoor"],
    radius: 15000
  },
};

// Cache for dynamically generated mappings
const dynamicMappingsCache: Record<string, OSMActivityMapping> = {};

// Initialize OpenAI client
let openaiClient: OpenAI | null = null;

const initOpenAI = () => {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return !!openaiClient;
};

/**
 * Breaks down a complex activity title into component parts for better searching
 * @param activityTitle The full activity title (e.g. "Sunset Kayaking Tour")
 * @returns Array of component activities (e.g. ["sunset-viewing", "kayaking", "tour"])
 */
export function decomposeActivity(activityTitle: string): string[] {
  const title = activityTitle.toLowerCase();
  const components: string[] = [];
  
  // Check for time-of-day modifiers
  if (title.includes('sunset') || title.includes('evening')) {
    components.push('sunset-viewing');
  }
  if (title.includes('sunrise') || title.includes('morning')) {
    components.push('viewpoint');
  }
  if (title.includes('night') || title.includes('evening')) {
    components.push('night');
  }
  
  // Check for water activities
  if (title.includes('kayak')) {
    components.push('kayaking');
  }
  if (title.includes('canoe')) {
    components.push('canoeing');
  }
  if (title.includes('boat') || title.includes('cruise')) {
    components.push('boat-tour');
  }
  if (title.includes('sail')) {
    components.push('sailing');
  }
  if (title.includes('fish')) {
    components.push('fishing');
  }
  if (title.includes('swim')) {
    components.push('swimming');
  }
  
  // Check for tour/guided activity
  if (title.includes('tour') || title.includes('guided')) {
    components.push('tour');
  }
  if (title.includes('adventure') || title.includes('extreme')) {
    components.push('adventure-tour');
  }
  
  // Food and drink
  if (title.includes('wine') || title.includes('tasting')) {
    components.push('wine');
  }
  if (title.includes('dinner') || title.includes('lunch')) {
    components.push('restaurant');
  }
  if (title.includes('coffee') || title.includes('cafe')) {
    components.push('cafe');
  }
  
  // Nature and outdoor
  if (title.includes('hike') || title.includes('trek')) {
    components.push('hiking');
  }
  if (title.includes('bike') || title.includes('cycling')) {
    components.push('biking');
  }
  if (title.includes('park') || title.includes('garden')) {
    components.push('park');
  }
  
  // Entertainment
  if (title.includes('museum') || title.includes('gallery')) {
    components.push('museum');
  }
  if (title.includes('movie') || title.includes('cinema')) {
    components.push('movie');
  }
  if (title.includes('comedy') || title.includes('stand-up')) {
    components.push('comedy');
  }
  
  // If no components were found, return an empty array
  return components;
}

/**
 * Combines multiple OSM mappings into a single comprehensive mapping
 * @param mappings Array of OSM mappings to combine
 * @returns Combined OSM mapping with all tags and keywords
 */
export function combineMappings(mappings: OSMActivityMapping[]): OSMActivityMapping {
  if (mappings.length === 0) {
    return {
      tags: ["tourism", "leisure", "amenity"],
      keywords: [],
      radius: 15000
    };
  }
  
  if (mappings.length === 1) {
    return mappings[0];
  }
  
  // Combine all tags and keywords, remove duplicates
  const allTags = [...new Set(mappings.flatMap(m => m.tags))];
  const allKeywords = [...new Set(mappings.flatMap(m => m.keywords))];
  
  // Use the largest radius from any of the mappings
  const maxRadius = Math.max(...mappings.map(m => m.radius));
  
  return {
    tags: allTags,
    keywords: allKeywords,
    radius: maxRadius
  };
}

/**
 * Gets OSM mapping for a specific activity, using OpenAI to generate one if not found in base mappings
 * @param activityName The name of the activity to get mappings for
 * @returns OSM mapping with tags, keywords, and search radius
 */
export async function getOSMMapping(activityName: string): Promise<OSMActivityMapping> {
  const normalizedName = activityName.toLowerCase().replace(/[-\s]+/g, '-');
  
  // Check if we already have this in our base mappings
  if (BASE_ACTIVITY_MAPPINGS[normalizedName]) {
    return BASE_ACTIVITY_MAPPINGS[normalizedName];
  }
  
  // Check cached dynamic mappings
  if (dynamicMappingsCache[normalizedName]) {
    return dynamicMappingsCache[normalizedName];
  }
  
  // Check if any base mapping keywords match the activity
  for (const [key, mapping] of Object.entries(BASE_ACTIVITY_MAPPINGS)) {
    // Check if the activity includes the mapping key or any of its keywords
    if (normalizedName.includes(key) || 
        mapping.keywords.some(keyword => normalizedName.includes(keyword))) {
      return mapping;
    }
  }
  
  // Try decomposing the activity and combining mappings
  const components = decomposeActivity(activityName);
  if (components.length > 0) {
    const componentMappings = components
      .map(component => BASE_ACTIVITY_MAPPINGS[component])
      .filter(Boolean);
    
    if (componentMappings.length > 0) {
      const combinedMapping = combineMappings(componentMappings);
      dynamicMappingsCache[normalizedName] = combinedMapping;
      return combinedMapping;
    }
  }
  
  // If we got here, we need to create a dynamic mapping using OpenAI
  try {
    if (initOpenAI() && openaiClient) {
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
      if (responseContent) {
        const parsedMapping = JSON.parse(responseContent) as OSMActivityMapping;
        
        // Validate and store in cache
        if (Array.isArray(parsedMapping.tags) && 
            Array.isArray(parsedMapping.keywords) && 
            typeof parsedMapping.radius === 'number') {
          
          dynamicMappingsCache[normalizedName] = parsedMapping;
          return parsedMapping;
        }
      }
    }
  } catch (error) {
    console.error(`Error generating OSM mapping for ${activityName}:`, error);
  }
  
  // Fallback to a generic mapping if OpenAI failed
  return {
    tags: ["tourism", "leisure", "amenity", "water_sports", "viewpoint", "boat_rental", "watersports", "waterway"],
    keywords: activityName.toLowerCase().split(/\s+/).filter(word => word.length > 3),
    radius: 20000
  };
}

/**
 * Finds the most relevant OSM mapping for a date idea title
 * Tries exact matches first, then keyword matches, then generates dynamic mappings
 * @param title The date idea title
 * @returns OSM mapping with tags, keywords, and search radius
 */
export async function getOSMMappingForDateIdea(title: string): Promise<OSMActivityMapping> {
  const normalizedTitle = title.toLowerCase().replace(/-/g, ' ');
  
  // First, look for exact matches in base mappings
  for (const [activityKey, config] of Object.entries(BASE_ACTIVITY_MAPPINGS)) {
    const activityName = activityKey.replace(/-/g, ' ').toLowerCase();
    if (normalizedTitle.includes(activityName)) {
      return config;
    }
  }
  
  // If no exact match, look for keyword matches
  for (const [activityKey, config] of Object.entries(BASE_ACTIVITY_MAPPINGS)) {
    for (const keyword of config.keywords) {
      if (normalizedTitle.includes(keyword.toLowerCase())) {
        return config;
      }
    }
  }
  
  // Try decomposing the activity into component parts
  const components = decomposeActivity(title);
  if (components.length > 0) {
    const componentMappings = components
      .map(component => BASE_ACTIVITY_MAPPINGS[component])
      .filter(Boolean);
    
    if (componentMappings.length > 0) {
      return combineMappings(componentMappings);
    }
  }
  
  // If still no match, try to generate one with OpenAI
  return await getOSMMapping(title);
}