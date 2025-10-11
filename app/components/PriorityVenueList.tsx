"use client";

import { useState, useEffect } from 'react';
import { MapPinIcon } from '@heroicons/react/24/solid';
import { getImageUrl } from '@/app/utils/imageService';

interface Venue {
  title: string;
  description: string;
  address: {
    street: string;
    city: string;
    postal_code?: string;
  };
  website_url: string | null;
  source_url: string | null;
  source?: string; // 'perplexity' | 'getyourguide'
  rating?: any;
  price?: any;
  duration?: string;
  recommended?: boolean;
  searchUrl?: boolean; // For GetYourGuide search links
}

interface PriorityVenueListProps {
  city: string;
  activity: string;
  className?: string;
}

export default function PriorityVenueList({ city, activity, className = '' }: PriorityVenueListProps) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [venueImages, setVenueImages] = useState<Record<string, string>>({});
  const [loadingStatus, setLoadingStatus] = useState<string>('Searching for venues...');
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [hasMoreVenues, setHasMoreVenues] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const loadingSteps = [
    { text: '🔍 Analyzing your activity preferences...', progress: 20 },
    { text: '🤖 AI is discovering local venues...', progress: 60 },
    { text: '🖼️ Loading venue images and details...', progress: 100 }
  ];

  // Fetch venues from optimized API only
  useEffect(() => {
    const fetchData = async (isLoadMore = false) => {
      if (!city || !activity) return;

      if (!isLoadMore) {
        setLoading(true);
        setCurrentOffset(0);
        setVenues([]);
        setHasMoreVenues(true);
        setLoadingProgress(0);
        setCurrentStep(0);
      } else {
        setLoadingMore(true);
      }
      
      // Progress step 1: Analyzing preferences
      if (!isLoadMore) {
        setCurrentStep(0);
        setLoadingStatus(loadingSteps[0].text);
        setLoadingProgress(loadingSteps[0].progress);
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate analysis time
      }
      
      try {
        // Progress step 2: AI discovery
        if (!isLoadMore) {
          setCurrentStep(1);
          setLoadingStatus(loadingSteps[1].text);
          setLoadingProgress(loadingSteps[1].progress);
        }
        
        // Fetch only city-venues-optimized (includes both GetYourGuide and Perplexity results)
        const venuesResponse = await fetch('/api/city-venues-optimized', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            city: city.trim(),
            activity: activity.trim(),
            max_results: 6,
            language: 'en',
            offset: isLoadMore ? currentOffset : 0
          }),
        });

        // Progress step 3: Loading images
        if (!isLoadMore) {
          setCurrentStep(2);
          setLoadingStatus(loadingSteps[2].text);
          setLoadingProgress(loadingSteps[2].progress);
        }

        // Process venues
        if (venuesResponse.ok) {
          const venuesData = await venuesResponse.json();
          const newVenues = venuesData.results || [];
          
          if (isLoadMore) {
            setVenues(prev => [...prev, ...newVenues]);
            setCurrentOffset(prev => prev + newVenues.length);
          } else {
            setVenues(newVenues);
            setCurrentOffset(newVenues.length);
          }
          
          // Check if there are more venues to load
          setHasMoreVenues(newVenues.length === 6);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchData();
  }, [city, activity]);

  // Load more venues function
  const handleLoadMore = async () => {
    if (!city || !activity || loadingMore || !hasMoreVenues) return;

    setLoadingMore(true);
    
    try {
      const venuesResponse = await fetch('/api/city-venues-optimized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: city.trim(),
          activity: activity.trim(),
          max_results: 6,
          language: 'en',
          offset: currentOffset
        }),
      });

      if (venuesResponse.ok) {
        const venuesData = await venuesResponse.json();
        const newVenues = venuesData.results || [];
        
        if (newVenues.length > 0) {
          setVenues(prev => [...prev, ...newVenues]);
          setCurrentOffset(prev => prev + newVenues.length);
          
          // Check if there are more venues to load
          setHasMoreVenues(newVenues.length === 6);
        } else {
          setHasMoreVenues(false);
        }
      }
    } catch (error) {
      console.error('Error loading more venues:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Load images for venues using the image service
  useEffect(() => {
    const loadImages = async () => {
      const imagePromises: Record<string, Promise<string>> = {};

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

    if (venues.length > 0 && !loading) {
      loadImages();
    }
  }, [venues, activity, city, loading]);

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <MapPinIcon className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Where to do this activity</h2>
        </div>
        
        {/* Enhanced loading status with progress bar */}
        <div className="text-center py-8">
          <div className="max-w-md mx-auto">
            {/* Status message with icon */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-full mb-6">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-primary font-medium">{loadingStatus}</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            
            {/* Progress steps indicator */}
            <div className="flex justify-between items-center mb-6">
              {loadingSteps.map((step, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    index <= currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`text-xs mt-2 transition-colors duration-300 ${
                    index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {index === 0 ? 'Analyze' : index === 1 ? 'Discover' : 'Load'}
                  </span>
                </div>
              ))}
            </div>
            
            <p className="text-sm text-muted-foreground">
              Finding the best {activity.toLowerCase()} spots in {city}
            </p>
          </div>
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
  const allResults: Array<Venue & { type: 'venue'; image_key: string; id: string }> = [];
  
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

      {/* Unified grid of activity venues */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allResults.map((result, index) => (
          <div 
            key={result.id || index}
            className="bg-card rounded-lg overflow-hidden shadow-sm border border-border hover:shadow-lg transition-all duration-300 group"
          >
            {/* Image with source badge overlay */}
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
              
              {/* GetYourGuide Badge */}
              {result.source === 'getyourguide' && (
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                    🌟 RECOMMENDED
                  </span>
                </div>
              )}
              
              {/* Remove GetYourGuide badge since we only have venues now */}
            </div>            <div className="p-4">
              <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                {result.title}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {result.description}
              </p>

              {/* Address */}
              <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                📍 {result.address.street}, {result.address.city}
              </p>

              {/* Action buttons */}
              <div className="flex gap-2">
                {result.source === 'getyourguide' ? (
                  // GetYourGuide search button with enhanced styling
                  <a
                    href={result.website_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 text-center text-sm bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    🔍 Browse All Experiences
                  </a>
                ) : (
                  // Regular venue buttons
                  <>
                    {result.website_url && result.website_url !== 'null' && result.website_url.trim() !== '' ? (
                      <a
                        href={result.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 text-center text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                      >
                        Website
                      </a>
                    ) : (
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(`${result.title} ${result.address?.city}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 text-center text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                      >
                        Search
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${result.title} ${result.address?.street} ${result.address?.city}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 text-center text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                    >
                      Maps
                    </a>
                  </>
                )}
              </div>
              
              {/* Partner attribution for GetYourGuide */}
              {result.source === 'getyourguide' && (
                <div className="text-center mt-2">
                  <p className="text-xs text-muted-foreground">
                    Partner ID: 5QQHAHP • GetYourGuide
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMoreVenues && !loading && allResults.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
          >
            {loadingMore ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                Finding Hidden Gems...
              </>
            ) : (
              <>
                <MapPinIcon className="w-4 h-4" />
                Discover More Local Spots
              </>
            )}
          </button>
          <p className="text-xs text-muted-foreground mt-2">
            Load more unique local recommendations
          </p>
        </div>
      )}

      {/* Performance info */}
      <div className="text-center text-xs text-muted-foreground mt-4">
        Showing {allResults.length} venues in {city}
        {!hasMoreVenues && allResults.length > 6 && " • All venues loaded"}
      </div>
    </div>
  );
}