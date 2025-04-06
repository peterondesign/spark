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
        
        // Create a simple activity-based query - directly use the date idea title
        // Remove dashes and use lowercase
        const activityKeywords = dateIdeaTitle
          .toLowerCase()
          .replace(/-/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 3);
        
        // Build simple specific query based on the activity
        let activitySpecificQueries = '';
        
        if (activityKeywords.includes('horse') || activityKeywords.includes('horseback') || activityKeywords.includes('riding')) {
          activitySpecificQueries = `
            node["leisure"="horse_riding"](around:20000,${cityLat},${cityLon});
            node["sport"="horse_riding"](around:20000,${cityLat},${cityLon});
            node["tourism"="riding"](around:20000,${cityLat},${cityLon});
            node["name"~"horse|riding|equestrian|stable",i](around:20000,${cityLat},${cityLon});
          `;
        } else if (activityKeywords.includes('hike') || activityKeywords.includes('hiking') || activityKeywords.includes('trail')) {
          activitySpecificQueries = `
            node["highway"="path"](around:20000,${cityLat},${cityLon});
            node["tourism"="trail"](around:20000,${cityLat},${cityLon});
            node["leisure"="park"](around:20000,${cityLat},${cityLon});
            node["name"~"trail|hiking|mountain|park",i](around:20000,${cityLat},${cityLon});
          `;  
        } else if (activityKeywords.includes('restaurant') || activityKeywords.includes('dinner') || activityKeywords.includes('food')) {
          activitySpecificQueries = `
            node["amenity"="restaurant"](around:10000,${cityLat},${cityLon});
            node["cuisine"](around:10000,${cityLat},${cityLon});
          `;
        } else if (activityKeywords.includes('cafe') || activityKeywords.includes('coffee')) {
          activitySpecificQueries = `
            node["amenity"="cafe"](around:10000,${cityLat},${cityLon});
            node["shop"="coffee"](around:10000,${cityLat},${cityLon});
          `;
        } else if (activityKeywords.includes('museum') || activityKeywords.includes('gallery')) {
          activitySpecificQueries = `
            node["tourism"="museum"](around:15000,${cityLat},${cityLon});
            node["tourism"="gallery"](around:15000,${cityLat},${cityLon});
            node["amenity"="arts_centre"](around:15000,${cityLat},${cityLon});
          `;
        } else if (activityKeywords.includes('cinema') || activityKeywords.includes('movie') || activityKeywords.includes('theatre')) {
          activitySpecificQueries = `
            node["amenity"="cinema"](around:15000,${cityLat},${cityLon});
            node["amenity"="theatre"](around:15000,${cityLat},${cityLon});
          `;
        } else if (activityKeywords.includes('beach') || activityKeywords.includes('swim')) {
          activitySpecificQueries = `
            node["natural"="beach"](around:20000,${cityLat},${cityLon});
            node["leisure"="swimming_area"](around:20000,${cityLat},${cityLon});
          `;
        } else if (activityKeywords.includes('park')) {
          activitySpecificQueries = `
            node["leisure"="park"](around:15000,${cityLat},${cityLon});
            node["leisure"="garden"](around:15000,${cityLat},${cityLon});
          `;
        } else {
          // Construct generic node search using keywords
          const keywordQueries = activityKeywords
            .map(keyword => `node["name"~"${keyword}",i](around:15000,${cityLat},${cityLon});`)
            .join('\n');
            
          activitySpecificQueries = `
            node["leisure"](around:10000,${cityLat},${cityLon});
            ${keywordQueries}
          `;
        }
        
        const overpassQuery = `
          [out:json];
          (
            ${activitySpecificQueries}
          );
          out body 10;
        `;
        
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
          // Simple fallback to generic attractions
          const fallbackQuery = `
            [out:json];
            node["tourism"](around:10000,${cityLat},${cityLon});
            out body 8;
          `;
          
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
                  href={`https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lon}#map=16/${location.lat}/${location.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1 rounded-full"
                >
                  Map
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