"use client";
import { useState, useEffect } from 'react';
import { getOSMMappingForDateIdea, buildOverpassQuery, OSMActivityMapping } from '../../services/osmMappingService';

interface LocationResult {
  id: number;
  name: string;
  lat: number;
  lon: number;
  address?: string;
  website?: string;
  phone?: string;
  category?: string;
  relevanceScore?: number;
}

interface LocationsListProps {
  dateIdeaTitle: string;
  userCity: string;
  isVisible: boolean;
}

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
        let cityData;
        try {
          const cityResponse = await fetch(nominatimUrl);
          if (!cityResponse.ok) {
            throw new Error(`Failed to fetch city data: ${cityResponse.statusText}`);
          }
          cityData = await cityResponse.json();
        } catch (error) {
          console.error("Error fetching city data:", error);
          setError("Unable to fetch city data. Please check your internet connection or try again later.");
          setLoading(false);
          return;
        }
        
        if (!cityData || cityData.length === 0) {
          setError("Could not find your city on the map.");
          setLoading(false);
          return;
        }
        
        const cityLat = parseFloat(cityData[0].lat);
        const cityLon = parseFloat(cityData[0].lon);
        
        // Get OpenAPI-generated search parameters from the OSM mapping service
        const searchConfig = await getOSMMappingForDateIdea(dateIdeaTitle);
        console.log(`OSM mapping for ${dateIdeaTitle}:`, searchConfig);
        
        // Build the Overpass API query using the enhanced function
        const overpassQuery = buildOverpassQuery(cityLat, cityLon, searchConfig);
        
        const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
        const locationsResponse = await fetch(overpassUrl);
        const locationsData = await locationsResponse.json();
        
        if (locationsData && locationsData.elements && locationsData.elements.length > 0) {
          // Format location data with semantic filtering
          const formattedLocations = filterAndFormatLocations(locationsData.elements, searchConfig);
          
          // Sort by relevance score
          formattedLocations.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
          
          setLocations(formattedLocations);
        } else {
          setLocations([]);
          setError("No locations found for this activity in your area.");
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
  
  /**
   * Filter and format OSM elements into LocationResult objects with semantic filtering
   */
  const filterAndFormatLocations = (elements: any[], searchConfig: OSMActivityMapping): LocationResult[] => {
    const { tags, keywords, mustContain, mustExclude } = searchConfig;
    
    // Filter out elements without proper data and apply semantic filtering
    return elements
      .filter(element => {
        // Only include elements with names
        if ((!element.tags || !element.tags.name)) {
          return false;
        }
        
        const name = element.tags.name.toLowerCase();
        const description = element.tags.description ? element.tags.description.toLowerCase() : '';
        
        // Extract category from tags
        const category = element.tags.amenity || 
                         element.tags.leisure || 
                         element.tags.tourism || 
                         element.tags.shop || 
                         element.tags.sport ||
                         element.tags.natural ||
                         element.tags.historic;
        
        if (!category) return false;
        
        // CRITICAL: If this is a restaurant/cafe but we're looking for a class/workshop, filter it out
        if (mustExclude && mustExclude.length > 0) {
          // If any excluded term is in name, category or description, filter it out
          if (mustExclude.some(term => 
              category.includes(term) || 
              name.includes(term) || 
              description.includes(term))) {
            // Special case - if the name explicitly mentions our activity, keep it despite category
            if (keywords.some(kw => name.includes(kw.toLowerCase()))) {
              // Let it pass if it has strong keyword match
            } else {
              return false;  
            }
          }
        }
        
        // If activity type requires specific terms, check for them
        if (mustContain && mustContain.length > 0) {
          // For class-type activities, we need strong proof that this is a class venue
          const hasRequiredTerm = mustContain.some(term => 
            category.includes(term) || 
            name.includes(term) || 
            description.includes(term));
          
          // For specific activities like "Sushi Making Class", look for both "sushi" and "class"
          const specificTerms = dateIdeaTitle.toLowerCase().split(/\s+/);
          const hasSpecificTerms = specificTerms.some(term => 
            term.length > 3 && name.includes(term));
            
          if (!hasRequiredTerm && !hasSpecificTerms) {
            return false;
          }
        }
        
        // For activities with common tag categories, add additional tag checking
        if (searchConfig.activityType && tags.includes(category)) {
          return true;
        }
        
        // Keyword matching
        return keywords.some(kw => name.toLowerCase().includes(kw.toLowerCase()));
      })
      .map((element) => {
        // Calculate relevance score based on how well it matches our criteria
        const name = element.tags.name.toLowerCase();
        const description = element.tags.description ? element.tags.description.toLowerCase() : '';
        const category = element.tags.amenity || 
                         element.tags.leisure || 
                         element.tags.tourism || 
                         element.tags.shop || 
                         element.tags.sport ||
                         element.tags.natural ||
                         element.tags.historic;
        
        // Base score
        let relevanceScore = 1;
        
        // Check for direct category match
        if (tags.includes(category)) {
          relevanceScore += 3;
        }
        
        // Check for keyword matches in name
        keywords.forEach(kw => {
          if (name.includes(kw.toLowerCase())) {
            relevanceScore += 2;
          }
        });
        
        // Check for required terms
        if (mustContain) {
          mustContain.forEach(term => {
            if (name.includes(term.toLowerCase()) || 
                description.includes(term.toLowerCase()) || 
                category.includes(term)) {
              relevanceScore += 2;
            }
          });
        }
        
        // Special case for classes
        if (dateIdeaTitle.toLowerCase().includes('class') && 
           (name.includes('class') || name.includes('school') || 
            name.includes('studio') || name.includes('workshop'))) {
          relevanceScore += 5;
        }
        
        // Special case for specific activities
        if (dateIdeaTitle.toLowerCase().includes('sushi') && name.includes('sushi')) {
          relevanceScore += 5;
        }
        
        return {
          id: element.id || Math.random().toString(36).substring(7),
          name: element.tags.name,
          lat: element.lat,
          lon: element.lon,
          address: formatAddress(element.tags),
          website: element.tags.website || element.tags.url,
          phone: element.tags.phone,
          category: getCategoryLabel(category),
          relevanceScore
        };
      });
  };
  
  /**
   * Format address from OSM tags
   */
  const formatAddress = (tags: any): string | undefined => {
    if (tags['addr:street']) {
      const housenumber = tags['addr:housenumber'] || '';
      const street = tags['addr:street'];
      const city = tags['addr:city'] ? `, ${tags['addr:city']}` : '';
      return `${housenumber} ${street}${city}`.trim();
    }
    return undefined;
  };
  
  /**
   * Get a human-readable category label
   */
  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'restaurant': return 'Restaurant';
      case 'cafe': return 'Café';
      case 'fast_food': return 'Fast Food';
      case 'pub': return 'Pub';
      case 'bar': return 'Bar';
      case 'cinema': return 'Cinema';
      case 'theatre': return 'Theatre';
      case 'arts_centre': return 'Arts Center';
      case 'museum': return 'Museum';
      case 'park': return 'Park';
      case 'garden': return 'Garden';
      case 'mall': return 'Shopping Mall';
      case 'community_centre': return 'Community Center';
      case 'school': return 'School';
      case 'college': return 'College';
      case 'university': return 'University';
      case 'studio': return 'Studio';
      default: return category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');
    }
  };
  
  /**
   * Helper function to create Google Maps URL
   */
  const getGoogleMapsUrl = (name: string, lat: number, lon: number) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${lat},${lon}`;
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="mt-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Other Locations for {dateIdeaTitle} in {userCity}</h2>
      
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-24"></div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {!loading && locations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {locations.map((location) => (
            <div key={location.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow h-full flex flex-col">
              <h3 className="font-semibold text-gray-800">{location.name}</h3>
              {location.category && (
                <p className="text-sm text-gray-500">{location.category}</p>
              )}
              {location.address && (
                <p className="text-sm text-gray-600">{location.address}</p>
              )}
              <div className="flex items-center gap-2 mt-auto pt-2 flex-wrap">
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