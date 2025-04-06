"use client";
import { useState, useEffect } from 'react';

// Define the location result interface
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

export default function LocationsList({ 
  dateIdeaTitle, 
  userCity, 
  isVisible 
}: LocationsListProps) {
  const [locations, setLocations] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 51.505, lng: -0.09 }); // Default to London

  // Simple function to map date ideas to OSM categories
  const getSearchCategories = (title: string): string[] => {
    const title_lower = title.toLowerCase();
    
    // Map common activities to OSM categories
    if (title_lower.includes('hiking') || title_lower.includes('walking') || title_lower.includes('trail')) {
      return ['hiking', 'trail', 'path', 'national_park', 'nature_reserve'];
    }
    if (title_lower.includes('museum') || title_lower.includes('gallery')) {
      return ['museum', 'gallery', 'exhibition'];
    }
    if (title_lower.includes('dinner') || title_lower.includes('restaurant') || title_lower.includes('food')) {
      return ['restaurant', 'food', 'cafe'];
    }
    if (title_lower.includes('coffee') || title_lower.includes('cafe')) {
      return ['cafe', 'coffee_shop'];
    }
    if (title_lower.includes('movie') || title_lower.includes('cinema') || title_lower.includes('theatre')) {
      return ['cinema', 'theatre', 'movie_theater'];
    }
    if (title_lower.includes('park') || title_lower.includes('picnic')) {
      return ['park', 'garden', 'nature_reserve', 'picnic_site'];
    }
    if (title_lower.includes('wine') || title_lower.includes('tasting')) {
      return ['winery', 'vineyard', 'wine_bar'];
    }
    if (title_lower.includes('bowling')) {
      return ['bowling_alley', 'bowling'];
    }
    if (title_lower.includes('bike') || title_lower.includes('biking') || title_lower.includes('cycling')) {
      return ['bicycle_rental', 'cycle_route', 'bicycle'];
    }
    if (title_lower.includes('sport') || title_lower.includes('gym') || title_lower.includes('fitness')) {
      return ['sport', 'fitness_centre', 'gym'];
    }
    if (title_lower.includes('beach') || title_lower.includes('swimming')) {
      return ['beach', 'swimming_area', 'swimming'];
    }
    if (title_lower.includes('shopping') || title_lower.includes('mall')) {
      return ['mall', 'shopping_center', 'shop', 'market'];
    }
    
    // Default categories if no specific match
    return ['tourism', 'leisure', 'amenity'];
  };

  useEffect(() => {
    if (!isVisible || !dateIdeaTitle || !userCity) return;
    
    const fetchLocations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get the city coordinates
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
        setMapCenter({ lat: cityLat, lng: cityLon });
        
        // Get categories based on date idea
        const categories = getSearchCategories(dateIdeaTitle);
        
        // Build the query for relevant venues
        const amenityQueries = categories.map(cat => 
          `node["amenity"="${cat}"](around:10000,${cityLat},${cityLon});
           node["leisure"="${cat}"](around:10000,${cityLat},${cityLon});
           node["tourism"="${cat}"](around:10000,${cityLat},${cityLon});
           node["shop"="${cat}"](around:10000,${cityLat},${cityLon});`
        ).join('\n');
        
        const overpassQuery = `
          [out:json];
          (
            ${amenityQueries}
          );
          out body 10;
        `;
        
        const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
        const locationsResponse = await fetch(overpassUrl);
        const locationsData = await locationsResponse.json();
        
        if (locationsData && locationsData.elements && locationsData.elements.length > 0) {
          const formattedLocations = locationsData.elements
            .filter((element: any) => element.type === 'node' && element.tags && element.tags.name)
            .map((element: any, index: number) => ({
              id: element.id || index,
              name: element.tags.name,
              lat: element.lat,
              lon: element.lon,
              address: element.tags['addr:street'] ? 
                `${element.tags['addr:housenumber'] || ''} ${element.tags['addr:street']}, ${element.tags['addr:city'] || userCity}` : 
                undefined,
              website: element.tags.website || element.tags.url,
              phone: element.tags.phone,
              category: element.tags.amenity || element.tags.leisure || element.tags.tourism || element.tags.shop
            }));
          
          setLocations(formattedLocations);
        } else {
          // Fallback to generic search if no specific results found
          const fallbackQuery = `
            [out:json];
            node["tourism"](around:5000,${cityLat},${cityLon});
            out body 8;
          `;
          
          const fallbackUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(fallbackQuery)}`;
          const fallbackResponse = await fetch(fallbackUrl);
          const fallbackData = await fallbackResponse.json();
          
          if (fallbackData && fallbackData.elements && fallbackData.elements.length > 0) {
            const fallbackLocations = fallbackData.elements
              .filter((element: any) => element.type === 'node' && element.tags && element.tags.name)
              .map((element: any, index: number) => ({
                id: element.id || index,
                name: element.tags.name,
                lat: element.lat,
                lon: element.lon,
                address: element.tags['addr:street'] ? 
                  `${element.tags['addr:housenumber'] || ''} ${element.tags['addr:street']}, ${element.tags['addr:city'] || userCity}` : 
                  undefined,
                website: element.tags.website || element.tags.url,
                phone: element.tags.phone,
                category: element.tags.amenity || element.tags.leisure || element.tags.tourism || element.tags.shop
              }));
            
            setLocations(fallbackLocations);
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
  
  if (!isVisible) return null;
  
  return (
    <div className="mt-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Places to Visit in {userCity}</h2>
      
      {loading && (
        <div className="flex items-center justify-center bg-gray-100 rounded-lg p-8 mb-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-rose-500 mr-3"></div>
          <p className="text-gray-600">Finding locations in {userCity}...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 mb-4">
          <p>{error}</p>
          <p className="text-sm mt-2">Try adjusting your location or search for a different date idea.</p>
        </div>
      )}
      
      {!loading && locations.length > 0 && (
        <div className="space-y-3">
          {locations.map((location) => (
            <div key={location.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-800">{location.name}</h3>
              <div className="mt-2 space-y-1">
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
                      className="text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-1 rounded-full flex items-center transition-colors"
                    >
                      Visit Website
                    </a>
                  )}
                  {location.phone && (
                    <a 
                      href={`tel:${location.phone}`} 
                      className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-full flex items-center transition-colors"
                    >
                      {location.phone}
                    </a>
                  )}
                  <a 
                    href={`https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lon}#map=16/${location.lat}/${location.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1 rounded-full flex items-center transition-colors"
                  >
                    View on Map
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && locations.length === 0 && !error && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No locations found</h3>
          <p className="text-gray-500 mb-4">
            We couldn't find any relevant places for "{dateIdeaTitle}" in {userCity}.
          </p>
          <p className="text-sm text-gray-400">
            Try adjusting your location or search for a different date idea.
          </p>
        </div>
      )}
    </div>
  );
}