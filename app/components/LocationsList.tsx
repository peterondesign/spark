"use client";
import { useState, useEffect } from 'react';
import { getOSMMappingForDateIdea } from '../../services/osmMappingService';

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
        
        // Build the Overpass API query
        const overpassQuery = buildOverpassQuery(cityLat, cityLon, searchConfig);
        
        const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
        const locationsResponse = await fetch(overpassUrl);
        const locationsData = await locationsResponse.json();
        
        if (locationsData && locationsData.elements && locationsData.elements.length > 0) {
          // Format location data
          const formattedLocations = filterAndFormatLocations(locationsData.elements, searchConfig);
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
  
  // Function to build the Overpass API query
  const buildOverpassQuery = (lat: number, lon: number, searchConfig: any) => {
    const { tags, radius } = searchConfig;
    
    // Build tag-based queries - focus on tags instead of name keywords
    const tagQueries = tags.map((tag: string) => 
      `node["leisure"="${tag}"](around:${radius},${lat},${lon});
       node["amenity"="${tag}"](around:${radius},${lat},${lon});
       node["tourism"="${tag}"](around:${radius},${lat},${lon});
       node["sport"="${tag}"](around:${radius},${lat},${lon});
       node["shop"="${tag}"](around:${radius},${lat},${lon});`
    ).join('\n');
    
    return `
      [out:json];
      (
        ${tagQueries}
      );
      out body 15;
    `;
  };
  
  // Function to filter and format locations
  const filterAndFormatLocations = (elements: any[], searchConfig: any) => {
    const { keywords } = searchConfig;
    
    return elements
      .filter(element => {
        // Only include nodes with names
        if (element.type !== 'node' || !element.tags || !element.tags.name) {
          return false;
        }
        
        // Check for category match - this ensures the place is the right type
        // not just coincidentally matching a keyword in its name
        const category = element.tags.amenity || element.tags.leisure || 
                         element.tags.tourism || element.tags.shop || 
                         element.tags.sport;
                         
        if (!category) return false;
        
        // Check if any of the activity-specific tags match
        if (searchConfig.tags.includes(category)) {
          return true;
        }
        
        // For name matches, include if keywords match
        const name = element.tags.name.toLowerCase();
        const isKeywordMatch = keywords.some((kw: string) => name.includes(kw.toLowerCase()));
        
        return isKeywordMatch;
      })
      .map((element, index) => ({
        id: element.id || index,
        name: element.tags.name,
        lat: element.lat,
        lon: element.lon,
        address: element.tags['addr:street'] ? 
          `${element.tags['addr:housenumber'] || ''} ${element.tags['addr:street']}` : undefined,
        website: element.tags.website || element.tags.url,
        phone: element.tags.phone,
        category: element.tags.amenity || element.tags.leisure || 
                 element.tags.tourism || element.tags.shop || 
                 element.tags.sport
      }));
  };
  
  // Helper function to create Google Maps URL
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