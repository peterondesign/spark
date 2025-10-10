"use client";

import { useState, useEffect } from 'react';
import { StarIcon, ClockIcon, MapPinIcon, TagIcon } from '@heroicons/react/24/solid';
import { getImageUrl, getPexelsFallbackUrl } from '@/app/utils/imageService';

interface GetYourGuideResult {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price?: {
    amount: number;
    currency: string;
    display: string;
  };
  rating?: {
    score: number;
    count: number;
    display: string;
  };
  duration: string;
  category: string;
  booking_url: string;
  deep_link: string;
  recommended: boolean;
  source: string;
}

interface Venue {
  title: string;
  description: string;
  address: {
    street: string;
    city: string;
    postal_code?: string;
    country: string;
  };
  website_url: string;
  estimated_price_range: string;
  duration_suggestion_minutes?: number;
}

interface PriorityVenueListProps {
  city: string;
  activity: string;
  className?: string;
}

export default function PriorityVenueList({ city, activity, className = '' }: PriorityVenueListProps) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [getYourGuideResult, setGetYourGuideResult] = useState<GetYourGuideResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [venueImages, setVenueImages] = useState<Record<string, string>>({});
  const [perplexityResponse, setPerplexityResponse] = useState<any>(null); // Debug state

  // Fetch venues and GetYourGuide recommendation
  useEffect(() => {
    const fetchData = async () => {
      if (!city || !activity) return;

      setLoading(true);
      
      try {
        // Fetch GetYourGuide recommendation (priority)
        const getYourGuidePromise = fetch(
          `/api/getyourguide?city=${encodeURIComponent(city)}&activity=${encodeURIComponent(activity)}&limit=1`
        );

        // Fetch local venues
        const venuesPromise = fetch('/api/city-venues-optimized', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            city: city.trim(),
            activity: activity.trim(),
            max_results: 6,
            language: 'en'
          }),
        });

        const [getYourGuideResponse, venuesResponse] = await Promise.all([
          getYourGuidePromise,
          venuesPromise
        ]);

        // Process GetYourGuide result
        if (getYourGuideResponse.ok) {
          const getYourGuideData = await getYourGuideResponse.json();
          if (getYourGuideData.data && getYourGuideData.data.length > 0) {
            setGetYourGuideResult(getYourGuideData.data[0]);
          }
        }

        // Process venues
        if (venuesResponse.ok) {
          const venuesData = await venuesResponse.json();
          setPerplexityResponse(venuesData); // Store full response for debugging
          setVenues(venuesData.results || []);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [city, activity]);

  // Load images for venues using the image service
  useEffect(() => {
    const loadImages = async () => {
      const imagePromises: Record<string, Promise<string>> = {};
      
      // Load image for GetYourGuide result
      if (getYourGuideResult) {
        imagePromises['getyourguide'] = getImageUrl(
          undefined, // No predefined image
          `${activity} ${city} experience`,
          400,
          300
        );
      }

      // Load images for venues
      venues.forEach((venue, index) => {
        imagePromises[`venue_${index}`] = getImageUrl(
          undefined, // No predefined image
          `${venue.title} ${city}`,
          400,
          300
        );
      });

      // Resolve all image promises
      const imageEntries = await Promise.all(
        Object.entries(imagePromises).map(async ([key, promise]) => [key, await promise])
      );

      const imageMap = Object.fromEntries(imageEntries);
      setVenueImages(imageMap);
    };

    if ((getYourGuideResult || venues.length > 0) && !loading) {
      loadImages();
    }
  }, [getYourGuideResult, venues, activity, city, loading]);

  const handleGetYourGuideClick = (url: string, title: string) => {
    console.log('GetYourGuide booking clicked:', { title, url });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <MapPinIcon className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Where to do this activity</h2>
        </div>
        
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg overflow-hidden shadow-sm border border-border animate-pulse">
              <div className="h-48 bg-muted"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Combine all results for unified display
  const allResults: Array<
    | (GetYourGuideResult & { type: 'getyourguide'; image_key: string })
    | (Venue & { type: 'venue'; image_key: string; id: string })
  > = [];
  
  // Add GetYourGuide result first (priority)
  if (getYourGuideResult) {
    allResults.push({
      ...getYourGuideResult,
      type: 'getyourguide' as const,
      image_key: 'getyourguide'
    });
  }

  // Add local venues
  venues.forEach((venue, index) => {
    allResults.push({
      ...venue,
      type: 'venue' as const,
      image_key: `venue_${index}`,
      id: `venue_${index}`
    });
  });

  if (allResults.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <MapPinIcon className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Where to do this activity</h2>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <MapPinIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No venues found for {activity} in {city}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <MapPinIcon className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Where to do this activity</h2>
      </div>

      {/* Debug: Show Perplexity API Response */}
      {perplexityResponse && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg border">
          <h3 className="font-bold text-sm mb-2">🔍 Perplexity API Response Debug:</h3>
          <pre className="text-xs overflow-auto max-h-40 bg-white p-2 rounded border">
            {JSON.stringify(perplexityResponse, null, 2)}
          </pre>
        </div>
      )}

      {/* Unified grid of activity venues */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allResults.map((result, index) => (
          <div 
            key={result.id || index}
            className="bg-card rounded-lg overflow-hidden shadow-sm border border-border hover:shadow-lg transition-all duration-300 group"
          >
            {/* Image with GetYourGuide badge overlay */}
            <div className="relative h-48 overflow-hidden">
              {venueImages[result.image_key] ? (
                <img
                  src={venueImages[result.image_key]}
                  alt={result.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/70 flex items-center justify-center">
                  <MapPinIcon className="w-12 h-12 text-muted-foreground/50" />
                </div>
              )}
              
              {/* GetYourGuide Partner Badge */}
              {result.type === 'getyourguide' && (
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                    🌟 RECOMMENDED
                  </span>
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                {result.title}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {result.description}
              </p>

              {/* Address for local venues */}
              {result.type === 'venue' && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                  📍 {result.address.street}, {result.address.city}
                </p>
              )}

              {/* Ratings for GetYourGuide */}
              {result.type === 'getyourguide' && result.rating && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium">{result.rating.score}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">({result.rating.count} reviews)</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-2">
                {result.type === 'getyourguide' ? (
                  // GetYourGuide booking button with partner attribution
                  <button
                    onClick={() => handleGetYourGuideClick(result.booking_url, result.title)}
                    className="w-full py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-lg transition-all duration-200"
                  >
                    Book Experience
                  </button>
                ) : (
                  // Local venue action buttons
                  <div className="flex gap-2">
                    {(result as Venue).website_url && (
                      <a
                        href={(result as Venue).website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 text-center text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                      >
                        Website
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${result.title} ${(result as Venue).address?.street} ${(result as Venue).address?.city}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 text-center text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                    >
                      Maps
                    </a>
                  </div>
                )}

                {/* GetYourGuide Partner Attribution - always visible for GetYourGuide results */}
                {result.type === 'getyourguide' && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      Partner ID: 5QQHAHP • GetYourGuide Recommended
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance info */}
      <div className="text-center text-xs text-muted-foreground">
        Showing {allResults.length} venues in {city}
        {getYourGuideResult && <span className="text-orange-600"> • Including GetYourGuide recommendation</span>}
      </div>
    </div>
  );
}