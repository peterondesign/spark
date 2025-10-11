"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { getImageUrl } from '../../utils/imageService';
import Header from "@/app/components/sections/Header";
import Footer from '@/app/components/sections/Footer';
import AllDateIdeasSection from '@/app/components/sections/AllDateIdeasSection';
import TikTokSection from '@/app/components/sections/TikTokSection';
import CityPicker from '@/app/components/CityPicker';
import PriorityVenueList from '@/app/components/PriorityVenueList';

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
              data.image,
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

    // Add global error handler for browser extension errors
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Ignore browser extension errors
      if (event.reason?.message?.includes('message channel closed') || 
          event.reason?.message?.includes('listener indicated an asynchronous response')) {
        event.preventDefault();
        console.debug('Ignored browser extension error:', event.reason?.message);
      }
    };

    const handleError = (event: ErrorEvent) => {
      // Ignore permissions policy violations from extensions
      if (event.message?.includes('Permissions policy violation') ||
          event.message?.includes('accelerometer is not allowed')) {
        event.preventDefault();
        console.debug('Ignored permissions policy violation:', event.message);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  const handleCityChange = (city: string) => {
    setUserCity(city);
    localStorage.setItem("userCity", city);
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

          {/* Priority Venues with GetYourGuide Integration */}
          <PriorityVenueList 
            city={userCity || 'Lisbon'} 
            activity={dateIdea.title}
            className="mb-12"
          />
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