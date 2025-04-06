"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import Image from 'next/image';

// Define marker icon to replace the default one
const customIcon = new Icon({
  iconUrl: '/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: '/marker-shadow.png',
  shadowSize: [41, 41]
});

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
  distance?: number;
}

interface OpenStreetMapLocationsProps {
  dateIdeaTitle: string;
  userCity: string;
  isVisible: boolean;
}

export default function OpenStreetMapLocations({ 
  dateIdeaTitle, 
  userCity, 
  isVisible 
}: OpenStreetMapLocationsProps) {
  const [locations, setLocations] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 51.505, lng: -0.09 }); // Default to London
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    if (!isVisible || !dateIdeaTitle || !userCity) return;
    
    const fetchLocations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Attempt to geocode the city to center the map
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(userCity)}`;
        const cityResponse = await fetch(nominatimUrl);
        const cityData = await cityResponse.json();
        
        if (cityData && cityData.length > 0) {
        const cityLat = parseFloat(cityData[0].lat);
        const cityLon = parseFloat(cityData[0].lon);
        setMapCenter({ lat: cityLat, lng: cityLon });
          
          // Now search for points of interest related to the date idea in this city
          const overpassQuery = `
            [out:json];
            area[name="${userCity}"]->.searchArea;
            (
              node["name"~"${dateIdeaTitle}", i](area.searchArea);
              way["name"~"${dateIdeaTitle}", i](area.searchArea);
              relation["name"~"${dateIdeaTitle}", i](area.searchArea);
            );
            out body;
            >;
            out skel qt;
          `;
          
          const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
          const poiResponse = await fetch(overpassUrl);
          const poiData = await poiResponse.json();
          
          if (poiData && poiData.elements && poiData.elements.length > 0) {
            const formattedLocations = poiData.elements
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
                category: element.tags.amenity || element.tags.leisure || element.tags.tourism,
              }));
            
            setLocations(formattedLocations);
          } else {
            // If no direct matches, try a more generic search based on category
            const categoryMap: Record<string, string[]> = {
              'Dinner': ['restaurant', 'cafe', 'bar', 'pub'],
              'Movie': ['cinema', 'movie_theater'],
              'Hiking': ['trail', 'hiking', 'park', 'nature_reserve'],
              'Coffee': ['cafe', 'coffee_shop'],
              'Museum': ['museum', 'gallery', 'exhibition'],
              'Bowling': ['bowling', 'bowling_alley'],
              'Beach': ['beach', 'coast'],
              'Park': ['park', 'garden'],
              'Theater': ['theatre', 'theater', 'performing_arts'],
              'Concert': ['music_venue', 'concert_hall'],
              'Shopping': ['mall', 'shopping_center', 'shop'],
              'Ice Cream': ['ice_cream'],
              'Wine': ['winery', 'vineyard', 'wine_bar'],
              'Spa': ['spa', 'wellness'],
              'Zoo': ['zoo', 'wildlife_park'],
              'Art': ['gallery', 'museum', 'art_center']
            };
            
            // Find relevant categories based on the date idea title
            let categories: string[] = [];
            for (const [key, values] of Object.entries(categoryMap)) {
              if (dateIdeaTitle.toLowerCase().includes(key.toLowerCase())) {
                categories = [...categories, ...values];
              }
            }
            
            // If no specific categories found, use some default categories
            if (categories.length === 0) {
              categories = ['restaurant', 'cafe', 'park', 'cinema', 'theatre', 'museum'];
            }
            
            // Create a new query with the categories
            const categoryQuery = categories.map(cat => `node["amenity"="${cat}"](around:5000,${mapCenter.lat},${mapCenter.lng});`).join('\n');
            
            const fallbackQuery = `
              [out:json];
              (
                ${categoryQuery}
              );
              out body;
              >;
              out skel qt;
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
                    `${element.tags['addr:housenumber'] || ''} ${element.tags['addr:street']}, ${element.tags['addr:city'] || userCity}` : 
                    undefined,
                  website: element.tags.website || element.tags.url,
                  phone: element.tags.phone,
                  category: element.tags.amenity || element.tags.leisure || element.tags.tourism,
                  distance: 0 // Calculate distance from center if needed
                }))
                .slice(0, 10); // Limit to 10 results
              
              setLocations(formattedLocations);
            } else {
              setError("No locations found for this date idea in your city.");
            }
          }
        } else {
          setError("Could not find your city on the map.");
        }
      } catch (err) {
        console.error("Error fetching map data:", err);
        setError("Error loading map data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [dateIdeaTitle, userCity, isVisible]);

  if (!isVisible) return null;
  
  return (
    <div className="mt-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Places to Visit</h2>
      
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
        <>
          <div className="h-[400px] w-full mb-4 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            <MapContainer 
              center={[mapCenter.lat, mapCenter.lng]} 
              zoom={zoom} 
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {locations.map((location) => (
                <Marker 
                  key={location.id}
                  position={[location.lat, location.lon]}
                  icon={customIcon}
                >
                  <Popup>
                    <div className="p-1">
                      <h3 className="font-medium text-gray-900">{location.name}</h3>
                      {location.category && (
                        <p className="text-xs text-gray-500 mt-1">Type: {location.category}</p>
                      )}
                      {location.address && (
                        <p className="text-sm text-gray-600 mt-1">{location.address}</p>
                      )}
                      {location.website && (
                        <a 
                          href={location.website.startsWith('http') ? location.website : `https://${location.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-rose-600 hover:text-rose-800 mt-1 block"
                        >
                          Website
                        </a>
                      )}
                      {location.phone && (
                        <p className="text-sm text-gray-600 mt-1">Phone: {location.phone}</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}