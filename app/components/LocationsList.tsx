"use client";
import { useState, useEffect } from 'react';

interface LocationResult {
  id: number;
  name: string;
  lat: number;
  lon: number;
  address?: string;
  website?: string;
  phone?: string;
  category?: string;
}

interface LocationsListProps {
  dateIdeaTitle: string;
  userCity: string;
  isVisible: boolean;
}

// Activity to OSM tag mapping - centralized data structure for all activities
const ACTIVITY_MAPPINGS: Record<string, {
  tags: string[],
  keywords: string[],
  radius: number
}> = {
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
  }
};

export default function LocationsList({ dateIdeaTitle, userCity, isVisible }: LocationsListProps) {
  const [locations, setLocations] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isVisible || !dateIdeaTitle || !userCity) return;
    
    const fetchLocations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get the city coordinates using Nominatim
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(userCity)}`;
        const cityResponse = await fetch(nominatimUrl);
        const cityData = await cityResponse.json();
        
        if (!cityData || cityData.length === 0) {
          setError("Could not find your city on the map.");
          setLoading(false);
          return;
        }
        
        const cityLat = parseFloat(cityData[0].lat);
        const cityLon = parseFloat(cityData[0].lon);
        
        // Determine the appropriate search parameters based on the date idea title
        const searchConfig = determineSearchParameters(dateIdeaTitle);
        
        // Build the Overpass API query
        const overpassQuery = buildOverpassQuery(cityLat, cityLon, searchConfig);
        
        const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
        const locationsResponse = await fetch(overpassUrl);
        const locationsData = await locationsResponse.json();
        
        if (locationsData && locationsData.elements && locationsData.elements.length > 0) {
          // Format location data
          const formattedLocations = locationsData.elements
            .filter((element: any) => element.type === 'node' && element.tags && element.tags.name)
            .map((element: any, index: number) => ({
              id: element.id || index,
              name: element.tags.name,
              lat: element.lat,
              lon: element.lon,
              address: element.tags['addr:street'] ? 
                `${element.tags['addr:housenumber'] || ''} ${element.tags['addr:street']}` : undefined,
              website: element.tags.website || element.tags.url,
              phone: element.tags.phone,
              category: element.tags.amenity || element.tags.leisure || element.tags.tourism || element.tags.shop || element.tags.sport
            }));
          
          setLocations(formattedLocations);
        } else {
          // If no results found, try a generic search
          const fallbackQuery = buildFallbackQuery(cityLat, cityLon, dateIdeaTitle);
          
          const fallbackUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(fallbackQuery)}`;
          const fallbackResponse = await fetch(fallbackUrl);
          const fallbackData = await fallbackResponse.json();
          
          if (fallbackData && fallbackData.elements && fallbackData.elements.length > 0) {
            const formattedLocations = fallbackData.elements
              .filter((element: any) => element.type === 'node' && element.tags && element.tags.name)
              .map((element: any, index: number) => ({
                id: element.id || index,
                name: element.tags.name,
                lat: element.lat,
                lon: element.lon,
                address: element.tags['addr:street'] ? 
                  `${element.tags['addr:housenumber'] || ''} ${element.tags['addr:street']}` : undefined,
                website: element.tags.website || element.tags.url,
                phone: element.tags.phone,
                category: element.tags.amenity || element.tags.leisure || element.tags.tourism || element.tags.shop
              }));
            
            setLocations(formattedLocations);
          } else {
            setLocations([]);
          }
        }
      } catch (err) {
        console.error("Error fetching location data:", err);
        setError("Error loading location data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchLocations();
  }, [dateIdeaTitle, userCity, isVisible]);
  
  // Function to determine search parameters based on the date idea title
  const determineSearchParameters = (title: string) => {
    const normalizedTitle = title.toLowerCase().replace(/-/g, ' ');
    
    // First, look for exact matches
    for (const [activityKey, config] of Object.entries(ACTIVITY_MAPPINGS)) {
      const activityName = activityKey.replace(/-/g, ' ').toLowerCase();
      if (normalizedTitle.includes(activityName)) {
        return {
          tags: config.tags,
          keywords: config.keywords,
          radius: config.radius
        };
      }
    }
    
    // If no exact match, look for keyword matches
    for (const [activityKey, config] of Object.entries(ACTIVITY_MAPPINGS)) {
      for (const keyword of config.keywords) {
        if (normalizedTitle.includes(keyword)) {
          return {
            tags: config.tags,
            keywords: config.keywords,
            radius: config.radius
          };
        }
      }
    }
    
    // Default search parameters if no match is found
    return {
      tags: ["tourism", "leisure", "amenity"],
      keywords: normalizedTitle.split(/\s+/).filter(word => word.length > 3),
      radius: 12000
    };
  };
  
  // Function to build the Overpass API query
  const buildOverpassQuery = (lat: number, lon: number, searchConfig: any) => {
    const { tags, keywords, radius } = searchConfig;
    
    // Build tag-based queries
    const tagQueries = tags.map((tag: any) => 
      `node["leisure"="${tag}"](around:${radius},${lat},${lon});
       node["amenity"="${tag}"](around:${radius},${lat},${lon});
       node["tourism"="${tag}"](around:${radius},${lat},${lon});
       node["sport"="${tag}"](around:${radius},${lat},${lon});
       node["shop"="${tag}"](around:${radius},${lat},${lon});`
    ).join('\n');
    
    // Build keyword-based name search
    const keywordPattern = keywords.join('|');
    const nameQuery = `
      node["name"~"${keywordPattern}",i](around:${radius},${lat},${lon});
    `;
    
    return `
      [out:json];
      (
        ${tagQueries}
        ${nameQuery}
      );
      out body 15;
    `;
  };
  
  // Function to build a fallback query if specific search returns no results
  const buildFallbackQuery = (lat: number, lon: number, title: string) => {
    const keywords = title
      .toLowerCase()
      .replace(/-/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
      
    if (keywords.length > 0) {
      const keywordPattern = keywords.join('|');
      return `
        [out:json];
        (
          node["name"~"${keywordPattern}",i](around:12000,${lat},${lon});
          node["leisure"](around:10000,${lat},${lon});
          node["amenity"](around:10000,${lat},${lon});
          node["tourism"](around:10000,${lat},${lon});
        );
        out body 10;
      `;
    } else {
      return `
        [out:json];
        (
          node["leisure"](around:10000,${lat},${lon});
          node["tourism"](around:10000,${lat},${lon});
        );
        out body 10;
      `;
    }
  };
  
  // Helper function to create Google Maps URL
  const getGoogleMapsUrl = (name: string, lat: number, lon: number) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${lat},${lon}`;
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="mt-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Places to Visit in {userCity}</h2>
      
      {loading && (
        <div className="flex items-center justify-center bg-gray-100 rounded-lg p-8 mb-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-rose-500"></div>
          <p className="ml-3 text-gray-600">Finding locations...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {!loading && locations.length > 0 && (
        <div className="space-y-3">
          {locations.map((location) => (
            <div key={location.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-800">{location.name}</h3>
              {location.category && (
                <p className="text-sm text-gray-500">Type: {location.category}</p>
              )}
              {location.address && (
                <p className="text-sm text-gray-600">{location.address}</p>
              )}
              <div className="flex items-center gap-4 mt-2">
                {location.website && (
                  <a 
                    href={location.website.startsWith('http') ? location.website : `https://${location.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-1 rounded-full"
                  >
                    Website
                  </a>
                )}
                <a 
                  href={getGoogleMapsUrl(location.name, location.lat, location.lon)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1 rounded-full"
                >
                  Google Maps
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && locations.length === 0 && !error && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No locations found</h3>
          <p className="text-gray-500">
            We couldn't find any {dateIdeaTitle.replace(/-/g, ' ')} places in {userCity}.
          </p>
        </div>
      )}
    </div>
  );
}