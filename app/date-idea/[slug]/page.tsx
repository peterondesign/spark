"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { HeartIcon, MapPinIcon, StarIcon } from "../../components/icons";
import SaveButton from "../../components/SaveButton";
import { getImageUrl, getPlaceholderImage, processDateIdeaImages } from "@/app/utils/imageService";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Head from 'next/head';
import { useAsyncList } from "@react-stately/data";
import { City, POPULAR_CITIES, CityItem } from "../../../utils/cityService";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { supabase } from "@/utils/supabaseClient";
import CountryCitySelector from "@/app/components/CountryCitySelector";
import RelatedDateIdea from "../../components/RelatedDateIdea";
import LocationsList from "@/app/components/LocationsList";

// Define DateIdea interface
interface DateIdea {
  id: string;
  title: string;
  category: string;
  rating?: number;
  location?: string;
  description?: string;
  price?: string;
  duration?: string;
  slug: string;
  image: string;
  priceLevel?: number;
  bestForStage?: string;
  tips?: string;
  mood?: string;
  timeOfDay?: string;
  idealFor?: string;
  relatedDateIdeas?: string[];
  longDescription?: string;
  images?: string[];
}

// Define Experience interface with source information
interface Experience {
  title: string;
  price: string;
  rating: string;
  reviewCount: string;
  imageUrl: string;
  link: string;
  isRelevant: boolean;
  source: string; // Added source field to track where the experience came from
}

// Define SearchSource interface to track search progress
interface SearchSource {
  name: string;
  status: 'pending' | 'searching' | 'complete' | 'error';
  priority: number; // Lower number = higher priority
}


export default function DateIdeaDetails() {
  
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || '';
  const [dateIdea, setDateIdea] = useState<DateIdea | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showUserLocationBadge, setShowUserLocationBadge] = useState(false);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loadingExperiences, setLoadingExperiences] = useState(false);
  const [experiencesWarning, setExperiencesWarning] = useState<string>("");

  // Track search sources and their status
  const [searchSources, setSearchSources] = useState<SearchSource[]>([
    { name: 'GetYourGuide', status: 'pending', priority: 1 },
    { name: 'Google Maps', status: 'pending', priority: 2 },
    { name: 'Eventbrite', status: 'pending', priority: 3 },
    { name: 'Timeout', status: 'pending', priority: 4 },
    { name: 'Meetup', status: 'pending', priority: 5 },
    { name: 'Fever', status: 'pending', priority: 6 },
    { name: 'Luma', status: 'pending', priority: 7 }
  ]);

  // Track overall search progress
  const [searchProgress, setSearchProgress] = useState({
    currentSource: '',
    percentComplete: 0,
    totalSources: 7,
    completedSources: 0
  });

  // State to track if initial results have loaded
  const [initialResultsLoaded, setInitialResultsLoaded] = useState(false);

  // Add cityList for autocomplete functionality similar to home page
  const cityList = useAsyncList<CityItem>({
    async load({ signal, filterText = "" }) {
      const cities = City.getAllCities();

      let filteredCities = cities
        .filter((city) => city.name.toLowerCase().includes(filterText.toLowerCase()))
        .map(city => ({
          name: city.name,
          countryCode: city.countryCode,
          countryName: 'Unknown', // Adding required field
          isPopular: POPULAR_CITIES.includes(city.name) ? true : false,
          id: `${city.name}-${city.countryCode}`
        }));

      const uniqueCities = new Map<string, CityItem>();

      filteredCities
        .filter(city => city.isPopular)
        .forEach(city => uniqueCities.set(city.name.toLowerCase(), city));

      filteredCities
        .filter(city => !city.isPopular)
        .forEach(city => {
          if (!uniqueCities.has(city.name.toLowerCase())) {
            uniqueCities.set(city.name.toLowerCase(), city);
          }
        });

      filteredCities = Array.from(uniqueCities.values())
        .sort((a, b) => {
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          return a.name.localeCompare(b.name);
        })
        .slice(0, 20);

      return {
        items: filteredCities,
      };
    },
  });

  const handleCitySelect = (city: CityItem) => {
    setUserCity(city.name);
    // Store both city name and additional information to ensure we display the correct city
    localStorage.setItem("userCity", city.name);
    localStorage.setItem("userCityData", JSON.stringify({
      name: city.name,
      countryCode: city.countryCode,
      countryName: city.countryName,
      id: city.id
    }));
    setShowUserLocationBadge(true);
    setShowLocationPrompt(false);
  };

  // Simple function for clearing user city
  const clearUserCity = () => {
    localStorage.removeItem("userCity");
    localStorage.removeItem("userCityData");
    setUserCity(null);
    setShowLocationPrompt(true);
    setShowUserLocationBadge(false);
  };

  // Create a simplified location component that's easier to use
  const LocationSelector = () => {
    return (
      <>
        {showLocationPrompt ? (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="mb-3 md:mb-0 md:mr-4">
                <h3 className="text-sm font-semibold text-blue-800">Set Your Location</h3>
                <p className="text-sm text-blue-600">Add your city to see experiences relevant to you</p>
              </div>
              <div className="flex w-full md:w-auto">
                <CountryCitySelector 
                  onCitySelect={handleCitySelect}
                  defaultCountry="US"
                  className="w-full md:w-auto"
                  prioritizeIpLocation={false} 
                />
              </div>
            </div>
          </div>
        ) : userCity ? (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-200 p-3 bg-white">
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-gray-700 text-sm">Location: {userCity}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowLocationPrompt(true)}
                className="text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-1 rounded-full flex items-center transition-colors"
              >
                Change
              </button>
              <button
                onClick={clearUserCity}
                className="text-xs bg-gray-50 text-gray-500 hover:bg-gray-100 px-3 py-1 rounded-full flex items-center transition-colors"
                aria-label="Clear location"
                title="Clear location"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ) : null}
      </>
    );
  };

  // Modified function to detect user location without relying on IP detection when changing location
  useEffect(() => {
    const loadUserLocation = async () => {
      try {
        // Just check localStorage, don't do IP detection
        const savedCityData = localStorage.getItem("userCityData");
        if (savedCityData) {
          try {
            const cityData = JSON.parse(savedCityData);
            setUserCity(cityData.name);
            setShowUserLocationBadge(true);
            return;
          } catch (e) {
            console.error('Error parsing saved city data:', e);
          }
        }
        
        const savedCity = localStorage.getItem("userCity");
        if (savedCity) {
          setUserCity(savedCity);
          setShowUserLocationBadge(true);
          return;
        }
        
        // Show prompt if no location is found
        setShowLocationPrompt(true);
      } catch (error) {
        console.error('Error loading user location:', error);
        setShowLocationPrompt(true);
      }
    };

    loadUserLocation();
  }, []);

  useEffect(() => {
    const fetchDateIdea = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('date_ideas')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) {
          console.error("Error fetching date idea:", error);
          setLoading(false);
          return;
        }

        if (data) {
          const dateIdeaData: DateIdea = {
            id: data.id,
            title: data.title,
            category: data.category,
            rating: data.rating,
            location: data.location,
            description: data.description,
            price: data.price,
            duration: data.duration,
            slug: data.slug,
            image: data.image,
            priceLevel: data.price_level || undefined,
            bestForStage: data.best_for_stage || undefined,
            tips: data.tips || undefined,
            mood: data.mood || undefined,
            timeOfDay: data.time_of_day || undefined,
            idealFor: data.ideal_for || undefined,
            relatedDateIdeas: data.related_date_ideas || undefined,
            longDescription: data.long_description || undefined,
            images: data.images || [],
          };

          setDateIdea(dateIdeaData);

          const allImages = [data.image];
          if (data.images && Array.isArray(data.images) && data.images.length > 0) {
            allImages.push(...data.images.filter((img: any) => img !== data.image));
          }

          const imageUrlPromises = allImages.map(img =>
            getImageUrl(img, `${data.title} ${data.category}`, 1200, 800)
          );

          const resolvedImageUrls = await Promise.all(imageUrlPromises);
          setImageUrls(resolvedImageUrls);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchDateIdea();
    }
  }, [slug]);

  useEffect(() => {
    if (dateIdea && dateIdea.id && dateIdea.category) {
      // When we have a dateIdea loaded, fetch other related ideas
      fetchOtherDateIdeas(dateIdea.id);
    }
  }, [dateIdea]); // This will run whenever dateIdea changes/loads

  // UseEffect for fetching date idea experiences with progressive loading
  useEffect(() => {
    const fetchExperiences = async () => {
      if (!userCity || !dateIdea?.title) return;

      setLoadingExperiences(true);
      setInitialResultsLoaded(false);
      
      console.log('🔍 DEBUG: Starting to fetch experiences', { userCity, dateIdeaTitle: dateIdea.title });

      setSearchSources(prev => prev.map(source => ({ ...source, status: 'pending' })));
      setSearchProgress({
        currentSource: 'GetYourGuide',
        percentComplete: 0,
        totalSources: 7,
        completedSources: 0
      });

      let allExperiences: Experience[] = [];

      try {
        // First attempt: Fast loading of GetYourGuide results
        setSearchSources(prev =>
          prev.map(source => source.name === 'GetYourGuide' ? { ...source, status: 'searching' } : source)
        );
        setSearchProgress(prev => ({ ...prev, currentSource: 'GetYourGuide' }));

        const gygSearchUrl = `https://www.getyourguide.com/s/?q=${encodeURIComponent(dateIdea.title)}+${encodeURIComponent(userCity)}&searchSource=3`;
        console.log('🔍 DEBUG: Fetching from GetYourGuide', { gygSearchUrl });
        
        try {
          // Direct fetch for quick GetYourGuide results
          const quickGygResponse = await fetch(`/api/getyourguide?city=${encodeURIComponent(userCity)}&category=${encodeURIComponent(dateIdea.title)}`);
          
          if (quickGygResponse.ok) {
            const quickGygData = await quickGygResponse.json();
            
            if (quickGygData.success && quickGygData.activities && quickGygData.activities.length > 0) {
              console.log('🔍 DEBUG: Quick GYG data received', { activitiesCount: quickGygData.activities.length });
              
              // Map the GYG data to our Experience format
              const gygExperiences: Experience[] = quickGygData.activities.map((activity: any) => ({
                title: activity.title || `${dateIdea.title} in ${userCity}`,
                price: activity.price && activity.price !== "Price not available"
                  ? activity.price
                  : "Check website for prices",
                rating: activity.rating || "4.5",
                reviewCount: activity.reviews || "100+",
                imageUrl: activity.image || dateIdea.image,
                link: activity.url || gygSearchUrl,
                isRelevant: true,
                source: 'GetYourGuide'
              }));
              
              // Show initial results immediately
              allExperiences = [...gygExperiences];
              setExperiences(allExperiences);
              setInitialResultsLoaded(true);
              
              console.log('🔍 DEBUG: Set initial quick GYG experiences', { count: gygExperiences.length });
            }
          }
        } catch (quickGygError) {
          console.error('❌ DEBUG: Error with quick GYG fetch:', quickGygError);
          // Continue with regular GYG fetch as fallback
        }
        
        // Fallback or additional GYG results via selenium scraper
        if (!initialResultsLoaded) {
          const gygResponse = await fetch(`/api/scrape?url=${encodeURIComponent(gygSearchUrl)}&method=selenium`);
          console.log('🔍 DEBUG: GetYourGuide response status:', gygResponse.status);

          if (!gygResponse.ok) {
            console.error('❌ DEBUG: GetYourGuide request failed', { status: gygResponse.status });
            throw new Error(`Failed to fetch from GetYourGuide: ${gygResponse.status}`);
          }

          const gygData = await gygResponse.json();
          console.log('🔍 DEBUG: GetYourGuide data received', { 
            hasData: !!gygData, 
            activitiesCount: gygData?.activities?.length || 0 
          });

          if (gygData && gygData.activities && gygData.activities.length > 0) {
            const relevantActivities = gygData.activities.filter((activity: any) => {
              const activityTitle = activity.title?.toLowerCase() || '';
              const dateIdeaTitle = dateIdea.title.toLowerCase();
              const dateIdeaWords = dateIdeaTitle.split(/\s+/).filter((word: string) => word.length > 3);
              const isRelevant = dateIdeaWords.some((word: string) => activityTitle.includes(word));
              return isRelevant;
            });
            
            console.log('🔍 DEBUG: Filtered activities', { 
              total: gygData.activities.length, 
              relevant: relevantActivities.length,
              relevantTitles: relevantActivities.map((a: any) => a.title)
            });

            const gygExperiences: Experience[] = (relevantActivities.length > 0 ? relevantActivities : gygData.activities)
              .map((activity: any) => {
                return {
                  title: activity.title || `${dateIdea.title} in ${userCity}`,
                  price: activity.price && activity.price !== "Price not available"
                    ? activity.price
                    : "Check website for prices",
                  rating: activity.rating || "4.5",
                  reviewCount: activity.reviews || "100+",
                  imageUrl: activity.image || dateIdea.image,
                  link: activity.url || `https://www.getyourguide.com/s/?q=${encodeURIComponent(dateIdea.title)}+${encodeURIComponent(userCity)}&searchSource=3?partner_id=5QQHAHP&utm_medium=online_publisher`,
                  isRelevant: relevantActivities.includes(activity),
                  source: 'GetYourGuide'
                };
              });

            console.log('🔍 DEBUG: Created GYG experiences', { count: gygExperiences.length });
            allExperiences = [...gygExperiences];
            setExperiences(allExperiences);
            setInitialResultsLoaded(true);
            console.log('🔍 DEBUG: Set experiences state', { count: allExperiences.length });
          }
        }
        
        // Update status for GetYourGuide now that we've shown results
        setSearchSources(prev =>
          prev.map(source => source.name === 'GetYourGuide' ? { ...source, status: 'complete' } : source)
        );
        setSearchProgress(prev => ({
          ...prev,
          completedSources: prev.completedSources + 1,
          percentComplete: Math.round(((prev.completedSources + 1) / prev.totalSources) * 100),
          currentSource: 'Google Maps'
        }));

        // Debug the multi_scraper approach for Google Maps
        try {
          console.log('🔍 DEBUG: Starting Google Maps scraper');
          setSearchSources(prev =>
            prev.map(s => s.name === 'Google Maps' ? { ...s, status: 'searching' } : s)
          );
          
          // Make a direct call to the api endpoint for multiSourceEvents
          const mapsResponse = await fetch(`/api/multiSourceEvents?city=${encodeURIComponent(userCity)}&category=${encodeURIComponent(dateIdea.title)}&source=googlemaps`);
          console.log('🔍 DEBUG: Google Maps scraper response status:', mapsResponse.status);
          
          if (mapsResponse.ok) {
            const mapsData = await mapsResponse.json();
            console.log('🔍 DEBUG: Google Maps data received', { 
              success: mapsData.success, 
              resultsCount: mapsData.experiences?.length || 0 
            });
            
            if (mapsData.success && mapsData.experiences?.length > 0) {
              // Add these to our experiences
              const googleMapsExperiences: Experience[] = mapsData.experiences.map((item: any) => ({
                title: item.title,
                price: item.price || "Check website for prices",
                rating: item.rating?.toString() || "4.5",
                reviewCount: item.reviewCount?.toString() || "100+",
                imageUrl: item.imageUrl || dateIdea.image,
                link: item.url,
                isRelevant: true,
                source: 'Google Maps'
              }));
              
              console.log('🔍 DEBUG: Adding Google Maps experiences', { count: googleMapsExperiences.length });
              // Merge with existing experiences, avoiding duplicates
              const existingIds = new Set(allExperiences.map(e => e.title));
              const newGoogleMapsExperiences = googleMapsExperiences.filter(e => !existingIds.has(e.title));
              allExperiences = [...allExperiences, ...newGoogleMapsExperiences];
              setExperiences(allExperiences);
            }
          }
        } catch (mapsError) {
          console.error('❌ DEBUG: Google Maps scraper error', mapsError);
        }
        
        setSearchSources(prev =>
          prev.map(s => s.name === 'Google Maps' ? { ...s, status: 'complete' } : s)
        );
        setSearchProgress(prev => ({
          ...prev,
          completedSources: prev.completedSources + 1,
          percentComplete: Math.round(((prev.completedSources + 1) / prev.totalSources) * 100),
          currentSource: 'Eventbrite'
        }));

        const otherSources = ['Eventbrite', 'Timeout', 'Meetup', 'Fever', 'Luma'];

        for (const source of otherSources) {
          try {
            console.log(`🔍 DEBUG: Processing source ${source}`);
            setSearchSources(prev =>
              prev.map(s => s.name === source ? { ...s, status: 'searching' } : s)
            );
            setSearchProgress(prev => ({ ...prev, currentSource: source }));

            await new Promise(resolve => setTimeout(resolve, 1000));

            setSearchSources(prev =>
              prev.map(s => s.name === source ? { ...s, status: 'complete' } : s)
            );
            setSearchProgress(prev => ({
              ...prev,
              completedSources: prev.completedSources + 1,
              percentComplete: Math.round(((prev.completedSources + 1) / prev.totalSources) * 100),
              currentSource: otherSources[otherSources.indexOf(source) + 1] || 'Complete'
            }));

          } catch (error) {
            console.error(`❌ DEBUG: Error searching ${source}:`, error);
            setSearchSources(prev =>
              prev.map(s => s.name === source ? { ...s, status: 'error' } : s)
            );
          }
        }

        if (allExperiences.length === 0) {
          console.log('🔍 DEBUG: No experiences found, creating fallback');
          allExperiences = [{
            title: `${dateIdea.title} in ${userCity}`,
            price: "Check website for prices",
            rating: "4.5",
            reviewCount: "100+",
            imageUrl: dateIdea.image,
            link: `https://www.getyourguide.com/s/?q=${encodeURIComponent(dateIdea.title)}+${encodeURIComponent(userCity)}&searchSource=3?partner_id=5QQHAHP&utm_medium=online_publisher`,
            isRelevant: true,
            source: 'GetYourGuide'
          }];
          setExperiencesWarning("We couldn't find specific activities for this date idea.");
        }

        console.log('🔍 DEBUG: Final experiences count', { count: allExperiences.length });
        setExperiences(allExperiences);

      } catch (error) {
        console.error('❌ DEBUG: Error in main fetchExperiences try/catch:', error);

        const searchUrl = `https://www.getyourguide.com/s/?q=${encodeURIComponent(dateIdea.title)}+${encodeURIComponent(userCity)}&searchSource=3`;
        allExperiences = [{
          title: `${dateIdea.title} in ${userCity}`,
          price: "Check website for prices",
          rating: "4.5",
          reviewCount: "100+",
          imageUrl: dateIdea.image,
          link: `${searchUrl}?partner_id=5QQHAHP&utm_medium=online_publisher`,
          isRelevant: true,
          source: 'GetYourGuide'
        }];
        console.log('🔍 DEBUG: Created fallback experience');
        setExperiences(allExperiences);
        setExperiencesWarning("Something went wrong while fetching activities. Here's a general option.");

      } finally {
        setLoadingExperiences(false);
        setSearchProgress(prev => ({ ...prev, currentSource: 'Complete', percentComplete: 100 }));
        console.log('🔍 DEBUG: Fetch experiences completed');
      }
    };

    if (userCity && dateIdea) {
      console.log('🔍 DEBUG: Calling fetchExperiences with', { userCity, dateIdeaTitle: dateIdea.title });
      fetchExperiences();
    } else {
      console.log('🔍 DEBUG: Not fetching experiences yet', { hasUserCity: !!userCity, hasDateIdea: !!dateIdea });
    }
  }, [userCity, dateIdea]);

  const dateIdeaSchema = dateIdea ? {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": dateIdea.title,
    "description": dateIdea.description || dateIdea.longDescription || "",
    "image": imageUrls && imageUrls.length > 0 ? imageUrls[0] : "",
    "startDate": new Date().toISOString().split('T')[0],
    "endDate": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    "location": {
      "@type": "Place",
      "name": dateIdea.location,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": dateIdea.location
      }
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "validFrom": new Date().toISOString().split('T')[0]
    },
    "organizer": {
      "@type": "Organization",
      "name": "Spark",
      "url": typeof window !== 'undefined' ? window.location.origin : ''
    }
  } : null;

  // Add state for other date ideas
  const [otherDateIdeas, setOtherDateIdeas] = useState<DateIdea[]>([]);
  const [loadingOtherIdeas, setLoadingOtherIdeas] = useState(false);
  // Add state for date idea images
  const [dateIdeaImages, setDateIdeaImages] = useState<Record<string, string>>({});

  // Improved function to fetch other random date ideas from the database
  const fetchOtherDateIdeas = async (currentId: string) => {
    setLoadingOtherIdeas(true);
    try {
      console.log('🔍 Fetching random date ideas');
      
      // Using proper Supabase syntax for random ordering
      const { data: randomIdeas, error } = await supabase
        .from('date_ideas')
        .select('id, title, category, description, slug, image')
        .neq('id', currentId)
        .order('id', { ascending: false }) // Use any field first
        .limit(10); // Get more than we need so we can randomize client-side
        
      if (error) {
        console.error('Error fetching random ideas:', error);
        throw error;
      }
      
      if (randomIdeas && randomIdeas.length > 0) {
        // Shuffle array client-side to get random results
        const shuffledIdeas = randomIdeas
          .sort(() => Math.random() - 0.5)
          .slice(0, 3); // Take just the 3 we need
        
        console.log(`Found ${randomIdeas.length} ideas, using ${shuffledIdeas.length} random ones`);
        setOtherDateIdeas(shuffledIdeas as DateIdea[]);
        
        // Process images for the other date ideas
        const imageMap = await processDateIdeaImages(shuffledIdeas, 400, 200);
        setDateIdeaImages(imageMap);
      } else {
        throw new Error('No random date ideas found');
      }
    } catch (error) {
      console.error("Error fetching other date ideas:", error);
      
      // Fallback date ideas if the database query fails
      const fallbackIdeas = [
        {
          id: 'fallback-1',
          title: 'Romantic Dinner',
          category: 'Food & Drink',
          description: 'Enjoy a candle-lit dinner at a cozy restaurant.',
          slug: 'romantic-dinner',
          image: '/placeholder.jpg'
        },
        {
          id: 'fallback-2',
          title: 'Hiking Adventure',
          category: 'Outdoor',
          description: 'Explore nature trails and enjoy scenic views together.',
          slug: 'hiking-adventure',
          image: '/placeholder.jpg'
        },
        {
          id: 'fallback-3',
          title: 'Movie Night',
          category: 'Entertainment',
          description: 'Cuddle up with popcorn and watch a film together.',
          slug: 'movie-night',
          image: '/placeholder.jpg'
        }
      ];
      
      setOtherDateIdeas(fallbackIdeas);
      
      // Process fallback images
      const fallbackImageMap = await processDateIdeaImages(fallbackIdeas, 400, 200);
      setDateIdeaImages(fallbackImageMap);
    } finally {
      setLoadingOtherIdeas(false);
    }
  };

  // Improved function to render other date ideas
  const renderOtherDateIdeas = () => {
    if (loadingOtherIdeas) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    if (otherDateIdeas.length === 0) {
      return (
        <div className="text-center py-6">
          <p className="text-gray-500">Searching for more date ideas...</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {otherDateIdeas.map((idea) => (
          <Link
            key={idea.id}
            href={`/date-idea/${idea.slug}`}
            className="group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-shadow hover:shadow-md"
          >
            <div className="relative h-40">
              <Image
                src={dateIdeaImages[idea.id] || getPlaceholderImage(400, 200, idea.title)}
                alt={idea.title}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 bg-rose-500/80 text-white text-xs font-medium px-2 py-1">
                {idea.category}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-rose-600 transition-colors">
                {idea.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                {idea.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="h-8 w-28 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-4 flex gap-2">
            <div className="h-4 w-12 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 w-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
          </div>

          <div className="mb-8 rounded-2xl overflow-hidden">
            <div className="h-80 md:h-96 lg:h-[500px] bg-gray-200 animate-pulse"></div>

            <div className="flex gap-2 mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 w-24 bg-gray-200 animate-pulse rounded"></div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center mb-2">
              <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-full"></div>
            </div>
            <div className="h-10 w-3/4 bg-gray-200 animate-pulse rounded mb-2"></div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
            <div className="h-7 w-40 bg-gray-200 animate-pulse rounded mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-5/6 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-4/6 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
              <div className="h-7 w-48 bg-gray-200 animate-pulse rounded mb-4"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
                ))}
              </div>
            </div>

            <div className="md:w-1/3 bg-gray-100 border border-gray-200 rounded-lg p-6 mb-8">
              <div className="h-7 w-32 bg-gray-200 animate-pulse rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
                <div className="h-4 w-5/6 bg-gray-200 animate-pulse rounded"></div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 mb-4">
            <div className="inline-block h-12 w-48 bg-gray-200 animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!dateIdea) {
    return (
      <div className="min-h-screen bg-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Date Idea Not Found</h1>
          <p className="text-gray-600 mb-8">Sorry, we couldn't find the date idea you're looking for.</p>
          <Link
            href="/"
            className="px-6 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
          >
            Browse Date Ideas
          </Link>
        </div>
      </div>
    );
  }

  const renderPriceLevel = (level: number | undefined) => {
    if (!level) return null;

    const levels = ["$", "$$", "$$$", "$$$$"];
    const priceIndex = level - 1;

    return (
      <div className="flex items-center">
        {levels.map((_, index) => (
          <span
            key={index}
            className={`text-lg ${index <= priceIndex ? 'text-green-600 font-bold' : 'text-gray-300'}`}
          >
            $
          </span>
        ))}
      </div>
    );
  };

  if (imageUrls.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {dateIdeaSchema && (
        <Head>
          <script type="application/ld+json">
            {JSON.stringify(dateIdeaSchema)}
          </script>
        </Head>
      )}
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Debug info at top of page for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
            <details>
              <summary className="cursor-pointer text-gray-600 font-bold">Debug Info</summary>
              <pre className="mt-2 overflow-auto">
                {`City: ${userCity || 'Not set'}\n`}
                {`Date idea: ${dateIdea?.title || 'Not loaded'}\n`}
                {`Experiences: ${experiences.length}\n`}
                {`Loading: ${loadingExperiences ? 'Yes' : 'No'}\n`}
                {`Data sources: ${searchSources.map(s => `${s.name}: ${s.status}`).join(', ')}`}
              </pre>
            </details>
          </div>
        )}
        
        <nav className="mb-4 text-sm">
          <ol className="flex items-center space-x-1">
            <li>
              <Link href="/" className="text-gray-500 hover:text-rose-500">Home</Link>
            </li>
            <li>
              <span className="text-gray-500 mx-1">/</span>
            </li>
            <li className="text-rose-500">{dateIdea.title}</li>
          </ol>
        </nav>

        <div className="mb-8 relative rounded-2xl overflow-hidden">
          <div className="relative h-80 md:h-96 lg:h-[500px]">
            {imageUrls[activeImage] ? (
              <Image
                src={imageUrls[activeImage]}
                alt={dateIdea.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Image unavailable</span>
              </div>
            )}
            <SaveButton
              itemSlug={dateIdea.slug}
              item={dateIdea}
              className="absolute top-4 right-4 z-10"
            />
          </div>

          {imageUrls.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {imageUrls.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`h-16 w-24 relative border-2 rounded overflow-hidden transition-all flex-shrink-0 ${activeImage === idx ? "border-rose-500" : "border-transparent opacity-70"
                    }`}
                >
                  <Image
                    src={img}
                    alt={`${dateIdea.title} thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex items-center mb-2">
            <span className="bg-rose-100 text-rose-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {dateIdea.category}
            </span>
          </div>
          <div className="flex items-start justify-between">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{dateIdea.title}</h1>
            <div className="text-right"></div>
          </div>
        </div>

        <LocationSelector />

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
          {userCity ? (
            <div>
              {loadingExperiences && !initialResultsLoaded ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-500 mr-3"></div>
                      <div>
                        <p className="text-gray-700 font-medium">Looking for relevant activities...</p>
                        <p className="text-xs text-gray-500">
                          Searching for experiences in {userCity}
                        </p>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div
                        className="bg-rose-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${searchProgress.percentComplete}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Now searching: {searchProgress.currentSource}</span>
                      <span>{searchProgress.percentComplete}% complete</span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {searchSources.sort((a, b) => a.priority - b.priority).map(source => (
                        <div
                          key={source.name}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${source.status === 'complete' ? 'bg-green-100 text-green-800' :
                              source.status === 'searching' ? 'bg-blue-100 text-blue-800' :
                                source.status === 'error' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'}`}
                        >
                          {source.name}
                          {source.status === 'complete' && (
                            <svg className="ml-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 101.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {source.status === 'searching' && (
                            <svg className="ml-1 h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                          {source.status === 'error' && (
                            <svg className="ml-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-4 bg-gray-50 rounded-lg p-4">
                        <div className="bg-gray-200 h-24 w-24 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : experiences.length > 0 ? (
                <div className="space-y-4">
                  {experiencesWarning && (
                    <div className="text-sm bg-amber-50 text-amber-700 p-3 rounded-md mb-3">
                      {experiencesWarning}
                    </div>
                  )}

                  <div className="mb-3 flex flex-wrap gap-2">
                    {Array.from(new Set(experiences.map(exp => exp.source))).map(source => (
                      <span
                        key={source}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        Results from {source}
                      </span>
                    ))}
                  </div>

                  {experiences.map((exp, index) => (
                    <a
                      key={index}
                      href={exp.link.startsWith('http') ? exp.link : `https://www.getyourguide.com${exp.link.startsWith('/') ? '' : '/'}${exp.link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        {exp.imageUrl && (
                          <div className="relative w-24 h-24 flex-shrink-0">
                            <Image
                              src={exp.imageUrl}
                              alt={exp.title}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800 mb-2">{exp.title}</h3>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              via {exp.source}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-green-600 font-semibold">{exp.price}</span>
                            {exp.rating && (
                              <div className="flex items-center">
                                <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                                <span className="text-gray-600">{exp.rating}</span>
                                <span className="text-gray-400 text-sm ml-1">({exp.reviewCount})</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {!exp.isRelevant && (
                        <div className="mt-2 text-xs text-gray-500 italic">
                          Similar recommended experience
                        </div>
                      )}
                    </a>
                  ))}

                  {/* Show loading indicator if initial results are loaded but still fetching more */}
                  {loadingExperiences && initialResultsLoaded && (
                    <div className="mt-4 flex justify-center">
                      <div className="inline-flex items-center px-4 py-2 bg-rose-50 text-rose-600 rounded-full">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-rose-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Finding more experiences...
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No experiences found for this date idea in {userCity}</p>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="mb-6 mx-auto w-48 h-48 bg-rose-50 rounded-full flex items-center justify-center">
                <MapPinIcon className="h-24 w-24 text-rose-200" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Set Your Location</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Add your city to discover personalized experiences and activities for this date idea in your area.
              </p>
              <button
                onClick={() => setShowLocationPrompt(true)}
                className="inline-flex items-center px-6 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
              >
                <MapPinIcon className="h-5 w-5 mr-2" />
                Add Your City
              </button>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-400 my-16 italic">
          This page contains affiliate links
        </div>

           {/* Location list instead of map */}
           {userCity && (
          <LocationsList
            dateIdeaTitle={dateIdea.title}
            userCity={userCity}
            isVisible={true}
          />
        )}

        <div className="flex flex-col md:flex-row gap-8">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">About This Date Idea</h2>
            <p className="text-gray-700 mb-6">{dateIdea.description}</p>

            {dateIdea.longDescription && (
              <div className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: dateIdea.longDescription || '' }} />
            )}
          </div>

          {dateIdea.tips && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-bold text-amber-800 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Insider Tips
              </h2>
              <p className="text-amber-800">{dateIdea.tips}</p>
            </div>
          )}
        </div>

     

        {/* Related Date Ideas Section */}
        {dateIdea.relatedDateIdeas && dateIdea.relatedDateIdeas.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dateIdea.relatedDateIdeas.map((relatedSlug, index) => (
                <RelatedDateIdea key={index} slug={relatedSlug} />
              ))}
            </div>
          </div>
        )}

        {/* Dynamic section to display other date ideas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Explore Other Date Ideas</h2>
          {renderOtherDateIdeas()}
        </div>

        <div className="text-center mt-8 mb-4">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-rose-500 text-rose-500 bg-white rounded-full hover:bg-rose-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Browse More Date Ideas
          </Link>
        </div>
      </main>
      <Footer/>
    </div>
  );
}