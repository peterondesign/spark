"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { getImageUrl, getImageGallery } from '../../utils/imageService';
import Header from "@/app/components/sections/Header";
import Footer from '@/app/components/sections/Footer';
import AllDateIdeasSection from '@/app/components/sections/AllDateIdeasSection';
import TikTokSection from '@/app/components/sections/TikTokSection';
import CityPicker from '@/app/components/CityPicker';

// Define interfaces
interface VenueResult {
  title: string;
  description: string;
  address: {
    street: string;
    neighborhood?: string;
    city: string;
    postal_code: string;
    country: string;
  };
  coordinates?: {
    lat: number;
    lon: number;
  };
  phone?: string;
  website_url: string;
  booking_url?: string;
  opening_hours?: Array<{
    day: string;
    open: string;
    close: string;
    notes?: string;
  }>;
  best_for?: string[];
  estimated_price_range?: string;
  duration_suggestion_minutes?: number;
  accessibility_notes?: string;
  tags?: string[];
  source_url: string;
  last_verified?: string;
}


// Define DateIdea interface
interface DateIdea {
  id: string;
  title: string;
  category: string;
  location?: string;
  description?: string;
  price?: string;
  duration?: string;
  slug: string;
  image: string;
  priceLevel?: number;
  bestForStage?: string;
  tips?: string;
  mood?: string | { pace?: string; vibe?: string };
  timeOfDay?: string;
  idealFor?: string;
  relatedDateIdeas?: string[];
  longDescription?: string;
  images?: string[];
}

export default function DateIdeaDetails() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || '';
  const [dateIdea, setDateIdea] = useState<DateIdea | null>(null);
  const [loading, setLoading] = useState(true);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [venues, setVenues] = useState<VenueResult[]>([]);
  const [venueImages, setVenueImages] = useState<string[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [venueOffset, setVenueOffset] = useState(0); // Track how many batches we've loaded

  // Fetch date idea data
  useEffect(() => {
    const fetchDateIdea = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('date_ideas')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error || !data) {
          console.error("Error fetching date idea:", error);
          setLoading(false);
          return;
        }

        const dateIdeaData: DateIdea = {
          id: data.id,
          title: data.title || '',
          category: data.category || '',
          location: typeof data.location === 'string' ? data.location : (data.location?.type || 'Various'),
          description: data.description || '',
          price: data.price || '',
          duration: data.duration || '',
          slug: data.slug || '',
          image: data.image || '',
          priceLevel: data.price_level || undefined,
          bestForStage: data.best_for_stage || undefined,
          tips: typeof data.tips === 'string' ? data.tips : (data.tips?.setting || undefined),
          timeOfDay: data.time_of_day || undefined,
          idealFor: data.ideal_for || undefined,
          relatedDateIdeas: Array.isArray(data.related_date_ideas) ? data.related_date_ideas : undefined,
          longDescription: data.long_description || undefined,
          images: Array.isArray(data.images) ? data.images : [],
        };

        setDateIdea(dateIdeaData);

        // Load hero image using image service
        if (data.image || data.title) {
          try {
            const imageUrl = await getImageUrl(
              data.image || `${data.title} ${data.category}`,
              `${data.title || 'Date idea'} ${data.category || 'activity'}`,
              800,
              600
            );
            setHeroImage(imageUrl);
          } catch (error) {
            console.error('Error loading hero image:', error);
          }
        }

        setLoading(false);

        // Fetch venues if we have a city
        const savedCity = localStorage.getItem("userCity");
        if (savedCity && data.title) {
          // Use setTimeout to prevent blocking the main thread
          setTimeout(() => {
            fetchVenues(savedCity, data.title);
          }, 100);
        }
      } catch (error) {
        console.error('Error fetching date idea:', error);
        setLoading(false);
      }
    };

    if (slug) {
      fetchDateIdea();
    }
  }, [slug]);

  // Get user city from localStorage
  useEffect(() => {
    const savedCity = localStorage.getItem("userCity");
    setUserCity(savedCity);
  }, []);

  const handleCityChange = (city: string) => {
    setUserCity(city);
    localStorage.setItem("userCity", city);

    // Reset venues and offset when changing cities
    setVenues([]);
    setVenueImages([]);
    setVenueOffset(0);

    // Fetch venues for the new city
    if (dateIdea) {
      fetchVenues(city, dateIdea.title);
    }
  };

  // Fetch venues using Perplexity API with caching and timeout
  const fetchVenues = async (city: string, activity: string) => {
    if (!city || !activity) {
      console.log('fetchVenues called with missing parameters:', { city, activity });
      return;
    }

    console.log('Fetching venues for:', { city, activity });
    setVenuesLoading(true);

    // Check cache first
    const cacheKey = `venues_${city}_${activity}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const cachedData = JSON.parse(cached);
        const isExpired = Date.now() - cachedData.timestamp > 300000; // 5 minutes
        if (!isExpired && cachedData.results?.length > 0) {
          console.log('Using cached venues');
          setVenues(cachedData.results);
          setVenuesLoading(false);
          return;
        }
      }
    } catch (error) {
      console.log('Cache read error:', error);
    }

    try {
      const requestBody = {
        city: city.trim(),
        activity: activity.trim(),
        max_results: 6, // Reduced from 8 for faster response
        language: 'en'
      };

      console.log('Request body:', requestBody);

      const response = await fetch('/api/city-venues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response received');

      if (response.ok) {
        const data = await response.json();
        console.log('Received data:', data);

        if (data.results && Array.isArray(data.results)) {
          setVenues(data.results);

          // Cache the results
          try {
            const cacheData = {
              results: data.results,
              timestamp: Date.now()
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
          } catch (cacheError) {
            console.log('Cache write error:', cacheError);
          }

          // Generate images for the venues (async, doesn't block UI)
          getImageGallery(
            `${activity} ${city} venue location`,
            data.results.length,
            400,
            300
          ).then(images => {
            setVenueImages(images);
          }).catch(error => {
            console.log('Image generation error:', error);
          });
        }
      } else {
        console.error('Failed to fetch venues');
      }
    } catch (error: any) {
      console.log('Error in fetchVenues, using fallback:', error);
      // Provide fallback venues when everything fails
      const fallbackVenues = Array.from({ length: 6 }, (_, i) => ({
        title: `${activity} Venue ${i + 1}`,
        description: `Great place for ${activity.toLowerCase()} in ${city}`,
        address: {
          street: `${activity} Street ${i + 1}`,
          city: city,
          postal_code: '1000-000',
          country: 'Portugal'
        },
        website_url: `https://www.google.com/search?q=${encodeURIComponent(`${activity} ${city}`)}`,
        estimated_price_range: '€€',
        duration_suggestion_minutes: 120,
        source_url: ''
      }));
      setVenues(fallbackVenues);
    } finally {
      setVenuesLoading(false);
    }
  };

  // Load more venues function - appends new venues to existing ones
  const loadMoreVenues = async (city: string, activity: string) => {
    if (!city || !activity) {
      console.log('loadMoreVenues called with missing parameters:', { city, activity });
      return;
    }

    console.log('Loading more venues for:', { city, activity, offset: venueOffset + 1 });
    setVenuesLoading(true);

    try {
      const requestBody = {
        city: city.trim(),
        activity: activity.trim(),
        max_results: 6,
        language: 'en',
        offset: venueOffset + 1 // Request different batch
      };

      console.log('Load more request body:', requestBody);

      const response = await fetch('/api/city-venues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Load more response received');

      if (response.ok) {
        const data = await response.json();
        console.log('Received additional data:', data);

        if (data.results && Array.isArray(data.results)) {
          // Append new venues to existing ones
          setVenues(prevVenues => [...prevVenues, ...data.results]);
          setVenueOffset(prev => prev + 1);

          // Generate images for the new venues (async, doesn't block UI)
          getImageGallery(
            `${activity} ${city} venue location additional`,
            data.results.length,
            400,
            300
          ).then(newImages => {
            setVenueImages(prevImages => [...prevImages, ...newImages]);
          }).catch(error => {
            console.log('Additional image generation error:', error);
          });
        }
      } else {
        console.error('Failed to fetch additional venues');
      }
    } catch (error: any) {
      console.log('Error in loadMoreVenues:', error);
      // Provide fallback venues when everything fails
      const fallbackVenues = Array.from({ length: 6 }, (_, i) => ({
        title: `${activity} Venue ${venues.length + i + 1}`,
        description: `Additional place for ${activity.toLowerCase()} in ${city}`,
        address: {
          street: `${activity} Street ${venues.length + i + 1}`,
          city: city,
          postal_code: '1000-000',
          country: 'Portugal'
        },
        website_url: `https://www.google.com/search?q=${encodeURIComponent(`${activity} ${city}`)}`,
        estimated_price_range: '€€',
        duration_suggestion_minutes: 120,
        source_url: ''
      }));
      setVenues(prevVenues => [...prevVenues, ...fallbackVenues]);
      setVenueOffset(prev => prev + 1);
    } finally {
      setVenuesLoading(false);
    }
  };

  // Helper function to add UTM tracking to URLs
  const addUTMTracking = (url: string) => {
    if (!url) return '';

    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('utm_source', 'dateideas.cc');
      urlObj.searchParams.set('utm_medium', 'referral');
      urlObj.searchParams.set('utm_campaign', 'venue_discovery');
      return urlObj.toString();
    } catch {
      // If URL is invalid, return as is
      return url;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24">
          <div className="animate-pulse container mx-auto px-4 py-8">
            <div className="h-12 bg-muted rounded w-96 mx-auto mb-8"></div>
            <div className="h-64 bg-muted rounded mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!dateIdea) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24">
          <AllDateIdeasSection />
          <TikTokSection />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24">
        {/* Hero Section - Best Spots Header */}
        <section className="container mx-auto px-4 py-8">
          {/* City Picker */}


          {/* Hero Content with Image */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Left: Text Content */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                  BEST SPOTS FOR A
                </p>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  {dateIdea.title}
                </h1>
                <div className="mb-6">
                  <CityPicker selectedCity={userCity || "LISBON"} onCityChange={handleCityChange} />
                </div>
              </div>

              {/* Activity Description */}
              <div className="bg-card rounded-lg p-6 border border-border">
                <p className="text-muted-foreground leading-relaxed">
                  {typeof dateIdea.description === 'string'
                    ? dateIdea.description
                    : `Discover the best ${dateIdea.title?.toLowerCase()} spots in ${userCity || 'your city'}. Find authentic local venues and create memorable experiences together.`}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded-lg p-4 border border-border">
                  <div className="text-sm text-muted-foreground">Category</div>
                  <div className="font-semibold text-foreground">
                    {typeof dateIdea.category === 'string' ? dateIdea.category : 'Activity'}
                  </div>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border">
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="font-semibold text-foreground">
                    {dateIdea.duration || '2-3 hours'}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Image */}
            <div className="relative">
              {heroImage ? (
                <div className="relative h-64 lg:h-80 rounded-lg overflow-hidden">
                  <img
                    src={heroImage}
                    alt={`${dateIdea.title} in ${userCity || 'your city'}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              ) : (
                <div className="bg-muted rounded-lg h-64 lg:h-80 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-muted-foreground/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-muted-foreground">Loading image...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* API Data Banner - Development/Debug Display */}
          {venues.length > 0 && (
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Perplexity API Response</h3>
                  <p className="text-sm text-blue-700">Data fetched for {userCity} • {dateIdea.title}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-blue-200 overflow-hidden">
                <div className="bg-blue-600 text-white px-4 py-2 text-sm font-medium">
                  JSON Response Structure
                </div>
                <pre className="p-4 text-xs text-gray-800 overflow-x-auto bg-gray-50">
{JSON.stringify({
  query: `${dateIdea.title} in ${userCity}`,
  city: userCity,
  activity: dateIdea.title,
  results_count: venues.length,
  generated_at: new Date().toISOString(),
  currency: "EUR",
  results: venues.slice(0, 2).map(venue => ({
    title: venue.title,
    description: venue.description.substring(0, 50) + "...",
    address: {
      street: venue.address.street,
      city: venue.address.city,
      postal_code: venue.address.postal_code,
      country: venue.address.country
    },
    website_url: venue.website_url,
    estimated_price_range: venue.estimated_price_range,
    duration_suggestion_minutes: venue.duration_suggestion_minutes
  })),
  "...": `${venues.length - 2} more results`
}, null, 2)}
                </pre>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-blue-700">
                  <span>📊 {venues.length} venues found</span>
                  <span>🕒 Generated {new Date().toLocaleTimeString()}</span>
                  <span>🌍 {userCity || 'Unknown City'}</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify({
                      query: `${dateIdea.title} in ${userCity}`,
                      city: userCity,
                      activity: dateIdea.title,
                      results_count: venues.length,
                      generated_at: new Date().toISOString(),
                      currency: "EUR",
                      results: venues
                    }, null, 2));
                  }}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-xs"
                >
                  📋 Copy Full JSON
                </button>
              </div>
            </div>
          )}

          {/* Venue Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {venuesLoading ? (
              // Loading skeleton
              [...Array(6)].map((_, index) => (
                <div key={index} className="bg-card rounded-lg overflow-hidden shadow-sm border border-border animate-pulse">
                  <div className="relative h-48 bg-muted flex items-center justify-center">
                    <div className="w-12 h-12 bg-muted-foreground/20 rounded-full"></div>
                  </div>
                  <div className="p-4">
                    <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-full mb-4"></div>
                    <div className="h-3 bg-muted rounded w-2/3 mb-4"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-muted rounded-full w-16"></div>
                      <div className="h-6 bg-muted rounded-full w-12"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : venues.length > 0 ? (
              // Real venue data
              venues.map((venue, index) => (
                <div key={index} className="bg-card rounded-lg overflow-hidden shadow-sm border border-border hover:shadow-lg transition-all duration-300 group">
                  <div className="relative h-48 overflow-hidden">
                    {venueImages[index] ? (
                      <img
                        src={venueImages[index]}
                        alt={venue.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-muted to-muted/70 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    {venue.website_url ? (
                      <a
                        href={addUTMTracking(venue.website_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-1 hover:text-rose-500 transition-colors cursor-pointer underline-offset-2 hover:underline">
                          {venue.title}
                        </h3>
                      </a>
                    ) : (
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-1">
                        {venue.title}
                      </h3>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {venue.description}
                    </p>
                    {venue.address && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-4">
                        📍 {venue.address.street}, {venue.address.neighborhood || venue.address.city}
                      </p>
                    )}
                    <div className="flex gap-2">
                      {venue.website_url && (
                        <a
                          href={addUTMTracking(venue.website_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Website
                        </a>
                      )}
                      {venue.address && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.title} ${venue.address.street} ${venue.address.city}`)}&utm_source=dateideas.cc&utm_medium=referral&utm_campaign=venue_discovery`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Maps
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Fallback when no venues found
              [...Array(6)].map((_, index) => (
                <div key={index} className="bg-card rounded-lg overflow-hidden shadow-sm border border-border hover:shadow-lg transition-all duration-300">
                  <div className="relative h-48 bg-gradient-to-br from-muted to-muted/70 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-white/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2">
                      {dateIdea.category} Venue {index + 1}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Perfect spot for {dateIdea.title.toLowerCase()}
                    </p>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1 text-xs bg-gray-50 text-gray-500 px-3 py-1.5 rounded-full">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Website
                      </div>
                      <div className="flex items-center gap-1 text-xs bg-gray-50 text-gray-500 px-3 py-1.5 rounded-full">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Maps
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Load More Button */}
          <div className="text-center mb-12">
            <button
              onClick={() => dateIdea && loadMoreVenues(userCity || 'Lisbon', dateIdea.title)}
              disabled={venuesLoading}
              className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
            >
              {venuesLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading more venues...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Load more venues
                </div>
              )}
            </button>
            {venues.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing {venues.length} venues in {userCity}
              </p>
            )}
          </div>
        </section>

        {/* About Section */}
        <section className="container mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            About a {dateIdea.title} Date
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* About Activity */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-xl font-bold text-foreground mb-4">About Activity</h3>
              <p className="text-muted-foreground leading-relaxed">
                {typeof dateIdea.description === 'string'
                  ? dateIdea.description
                  : `${dateIdea.title} is a wonderful way to spend time together and explore your surroundings.`}
              </p>
            </div>

            {/* Tips & Preparation */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-xl font-bold text-foreground mb-4">Tips & Preparation</h3>
              <p className="text-muted-foreground leading-relaxed">
                {typeof dateIdea.tips === 'string' ? dateIdea.tips : "Wear comfortable clothes and bring water."}
              </p>
            </div>

            {/* Location Type */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-xl font-bold text-foreground mb-4">Location Type</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Setting:</span>
                  <span className="text-foreground">
                    {typeof dateIdea.location === 'string' ? dateIdea.location : 'Various'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Environment:</span>
                  <span className="text-foreground">
                    {dateIdea.category?.includes('outdoor') || dateIdea.category?.includes('park') || dateIdea.category?.includes('beach')
                      ? 'Outdoor'
                      : dateIdea.category?.includes('indoor') || dateIdea.category?.includes('museum') || dateIdea.category?.includes('restaurant')
                        ? 'Indoor'
                        : 'Mixed'}
                  </span>
                </div>
              </div>
            </div>

            {/* Activity Details */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-xl font-bold text-foreground mb-4">Activity Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Best Time:</span>
                  <span className="text-foreground">
                    {typeof dateIdea.timeOfDay === 'string' ? dateIdea.timeOfDay : 'Anytime'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget:</span>
                  <span className="text-foreground">
                    {typeof dateIdea.price === 'string' ? dateIdea.price : 'Varies'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="text-foreground">
                    {typeof dateIdea.category === 'string' ? dateIdea.category : 'Activity'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Sections */}
        <AllDateIdeasSection />
        <TikTokSection />
      </main>
      <Footer />
    </div>
  );
}