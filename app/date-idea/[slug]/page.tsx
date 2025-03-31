"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { HeartIcon, MapPinIcon, StarIcon } from "../../components/icons";
import SaveButton from "../../components/SaveButton";
import { supabase } from "@/utils/supabaseClient";
import { getImageUrl } from "@/app/utils/imageService";
import Header from "@/app/components/Header";
import Head from 'next/head';
import { useAsyncList } from "@react-stately/data";
import { City, POPULAR_CITIES, CityItem } from "../../../utils/cityService";
import { Autocomplete, AutocompleteItem } from "@heroui/react";

interface Experience {
  title: string;
  price: string;
  rating: string;
  reviewCount: string;
  imageUrl: string;
  link: string;
  isRelevant?: boolean;
}

// Simplified DateIdea interface
interface DateIdea {
  id: number;
  title: string;
  category: string;
  rating: number;
  location: string;
  description: string;
  price: string;
  duration: string;
  slug: string;
  image: string;
  priceLevel?: number;
  bestForStage?: string;
  tips?: string | null;
  idealFor?: string[];
  relatedDateIdeas?: string[];
  longDescription?: string;
  images?: string[];
  mood?: string;
  timeOfDay?: string;
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
  const [cityInput, setCityInput] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<Array<{ city: string, country: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showUserLocationBadge, setShowUserLocationBadge] = useState(false);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loadingExperiences, setLoadingExperiences] = useState(false);
  const [experiencesWarning, setExperiencesWarning] = useState<string>("");

  // Add cityList for autocomplete functionality similar to home page
  const cityList = useAsyncList<CityItem>({
    async load({ signal, filterText = "" }) { 
      const cities = City.getAllCities();
      
      // Create a unique identifier for each city by combining name and country code
      let filteredCities = cities
        .filter((city) => city.name.toLowerCase().includes(filterText.toLowerCase()))
        .map(city => ({
          name: city.name,
          countryCode: city.countryCode,
          isPopular: POPULAR_CITIES.includes(city.name) ? true : false,
          id: `${city.name}-${city.countryCode}` // Create unique ID to avoid duplicate keys
        }));
        
      // Remove duplicates by city name (keeping the popular one if exists)
      const uniqueCities = new Map<string, CityItem>();
      
      // First add all popular cities to the map
      filteredCities
        .filter(city => city.isPopular)
        .forEach(city => uniqueCities.set(city.name.toLowerCase(), city));
      
      // Then add non-popular cities if not already in the map
      filteredCities
        .filter(city => !city.isPopular)
        .forEach(city => {
          if (!uniqueCities.has(city.name.toLowerCase())) {
            uniqueCities.set(city.name.toLowerCase(), city);
          }
        });
      
      // Convert back to array and sort: popular cities first, then alphabetically
      filteredCities = Array.from(uniqueCities.values())
        .sort((a, b) => {
          // First sort by popularity
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          // Then alphabetically by name
          return a.name.localeCompare(b.name);
        })
        .slice(0, 20); // Limit to 20 results

      return {
        items: filteredCities,
      };
    },
  });
  
  // Add these handlers for city selection
  const handleCitySelect = (city: CityItem) => {
    setUserCity(city.name);
    localStorage.setItem("userCity", city.name);
    setShowUserLocationBadge(true);
    setShowLocationPrompt(false);
  };

  useEffect(() => {
    const detectLocation = async () => {
      try {
        const response = await fetch('/api/location');
        const data = await response.json();
        if (data.city) {
          setUserCity(data.city);
          localStorage.setItem("userCity", data.city);
          setShowUserLocationBadge(true);
          setShowLocationPrompt(false);
        }
      } catch (error) {
        console.error('Error detecting location:', error);
        // Fall back to manual city input if detection fails
        const savedCity = localStorage.getItem("userCity");
        if (savedCity) {
          setUserCity(savedCity);
          setShowUserLocationBadge(true);
          setShowLocationPrompt(false);
        } else {
          setShowLocationPrompt(true);
        }
      }
    };

    // Only detect location if we don't have a saved city
    if (!localStorage.getItem("userCity")) {
      detectLocation();
    }
  }, []);

  useEffect(() => {
    // Check if user has set a city in localStorage
    const savedCity = localStorage.getItem("userCity");
    setUserCity(savedCity);
    setShowLocationPrompt(!savedCity);
    setShowUserLocationBadge(!!savedCity);

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
          // Process the data
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

          // Load the main image and all other images
          const allImages = [data.image];
          if (data.images && Array.isArray(data.images) && data.images.length > 0) {
            // Add additional images if they exist
            allImages.push(...data.images.filter((img: any) => img !== data.image));
          }

          // Get optimized image URLs for all images
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
    const fetchExperiences = async () => {
      if (!userCity || !dateIdea?.title) return;
      
      setLoadingExperiences(true);
      try {
        // Step 1: Scrape the search results page to get activities
        const searchUrl = `https://www.getyourguide.com/s/?q=${encodeURIComponent(dateIdea.title)}+${encodeURIComponent(userCity)}&searchSource=3`;
        const response = await fetch(`/api/scrape?url=${encodeURIComponent(searchUrl)}&method=selenium`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process the activity data from the scraper
        if (data && data.activities && data.activities.length > 0) {
          // Filter activities to ensure they're relevant to the date idea
          const relevantActivities = data.activities.filter((activity: any) => {
            // Check if the activity title is relevant to the date idea
            const activityTitle = activity.title?.toLowerCase() || '';
            const dateIdeaTitle = dateIdea.title.toLowerCase();
            const dateIdeaWords = dateIdeaTitle.split(/\s+/).filter(word => word.length > 3);
            
            // Check if any significant words from the date idea appear in the activity title
            const isRelevant = dateIdeaWords.some(word => activityTitle.includes(word));
            return isRelevant;
          });
          
          // Map the activities to our Experience format
          const processedExperiences: Experience[] = (relevantActivities.length > 0 ? relevantActivities : data.activities)
            .map((activity: any) => {
              // The URLs should already be properly formatted from the Python scraper
              return {
                title: activity.title || `${dateIdea.title} in ${userCity}`,
                price: activity.price && activity.price !== "Price not available" 
                  ? activity.price 
                  : "Check website for prices",
                rating: activity.rating || "4.5",
                reviewCount: activity.reviews || "100+",
                imageUrl: activity.image || dateIdea.image,
                link: activity.url || `https://www.getyourguide.com/s/?q=${encodeURIComponent(dateIdea.title)}+${encodeURIComponent(userCity)}&searchSource=3?partner_id=5QQHAHP&utm_medium=online_publisher`,
                isRelevant: relevantActivities.includes(activity)
              };
            });
          
          
          // Add a warning message if we couldn't find relevant activities
          if (relevantActivities.length === 0 && data.activities.length > 0) {
            setExperiencesWarning(
              "We couldn't find activities that exactly match this date idea, but here are some alternatives."
            );
          } else {
            setExperiencesWarning("");
          }
          
          setExperiences(processedExperiences);
        } else {
          // Fall back to a default experience if no activities were found
          setExperiences([{
            title: `${dateIdea.title} in ${userCity}`,
            price: "Check website for prices",
            rating: "4.5",
            reviewCount: "100+",
            imageUrl: dateIdea.image,
            link: `https://www.getyourguide.com/s/?q=${encodeURIComponent(dateIdea.title)}+${encodeURIComponent(userCity)}&searchSource=3?partner_id=5QQHAHP&utm_medium=online_publisher`,
            isRelevant: true
          }]);
          setExperiencesWarning("We couldn't find specific activities for this date idea.");
        }
      } catch (error) {
        console.error('Error fetching experiences:', error);
        // Even on error, show a generic experience option
        const searchUrl = `https://www.getyourguide.com/s/?q=${encodeURIComponent(dateIdea.title)}+${encodeURIComponent(userCity)}&searchSource=3`;
        setExperiences([{
          title: `${dateIdea.title} in ${userCity}`,
          price: "Check website for prices",
          rating: "4.5",
          reviewCount: "100+",
          imageUrl: dateIdea.image,
          link: `${searchUrl}?partner_id=5QQHAHP&utm_medium=online_publisher`,
          isRelevant: true
        }]);
        setExperiencesWarning("Something went wrong while fetching activities. Here's a general option.");
      } finally {
        setLoadingExperiences(false);
      }
    };

    if (userCity && dateIdea) {
      fetchExperiences();
    }
  }, [userCity, dateIdea]);

  useEffect(() => {
function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && inputRef.current &&
        !suggestionRef.current.contains(event.target as Node) &&
        !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced city search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (cityInput.trim().length > 2) {
        fetchCitySuggestions(cityInput);
      } else {
        setCitySuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [cityInput]);

  const fetchCitySuggestions = async (query: string) => {
    setIsLoading(true);
    try {
      // Using GeoNames API for city suggestions
      // You may need to register for a free account and replace 'demo' with your username
      const response = await fetch(
        `https://secure.geonames.org/searchJSON?name_startsWith=${encodeURIComponent(query)}&featureClass=P&maxRows=5&username=startboard`
      );
      const data = await response.json();

      if (data.geonames) {
        setCitySuggestions(
          data.geonames.map((item: any) => ({
            city: item.name,
            country: item.countryName
          }))
        );
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error fetching city suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCity = (city: string) => {
    setCityInput(city);
    setShowSuggestions(false);
  };

  const saveUserCity = () => {
    if (cityInput.trim()) {
      localStorage.setItem("userCity", cityInput.trim());
      setUserCity(cityInput.trim());
      setShowLocationPrompt(false);
      setShowUserLocationBadge(true);
    }
  };

  const clearUserCity = () => {
    localStorage.removeItem("userCity");
    setUserCity(null);
    setCityInput("");
    setShowLocationPrompt(true);
    setShowUserLocationBadge(false);
  };

  // Schema markup for search engines
  const dateIdeaSchema = dateIdea ? {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": dateIdea.title,
    "description": dateIdea.description || dateIdea.longDescription || "",
    "image": imageUrls && imageUrls.length > 0 ? imageUrls[0] : "",
    "startDate": new Date().toISOString().split('T')[0], // Today's date as a fallback
    "endDate": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], // One year from now
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Skeleton Header */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="h-8 w-28 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
        
        {/* Skeleton Main Content */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Skeleton Breadcrumb */}
          <div className="mb-4 flex gap-2">
            <div className="h-4 w-12 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 w-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
          </div>
          
          {/* Skeleton Main Image */}
          <div className="mb-8 rounded-2xl overflow-hidden">
            <div className="h-80 md:h-96 lg:h-[500px] bg-gray-200 animate-pulse"></div>
            
            {/* Skeleton Thumbnails */}
            <div className="flex gap-2 mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 w-24 bg-gray-200 animate-pulse rounded"></div>
              ))}
            </div>
          </div>
          
          {/* Skeleton Title and Category */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-full"></div>
            </div>
            <div className="h-10 w-3/4 bg-gray-200 animate-pulse rounded mb-2"></div>
          </div>
          
          {/* Skeleton Details Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
            <div className="h-7 w-40 bg-gray-200 animate-pulse rounded mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-5/6 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-4/6 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Skeleton Description */}
            <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
              <div className="h-7 w-48 bg-gray-200 animate-pulse rounded mb-4"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
                ))}
              </div>
            </div>
            
            {/* Skeleton Tips Section */}
            <div className="md:w-1/3 bg-gray-100 border border-gray-200 rounded-lg p-6 mb-8">
              <div className="h-7 w-32 bg-gray-200 animate-pulse rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
                <div className="h-4 w-5/6 bg-gray-200 animate-pulse rounded"></div>
              </div>
            </div>
          </div>
          
          {/* Skeleton Back Button */}
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

  // If we don't have any images yet, show a placeholder
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
      {/* Navigation - Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
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

        {/* Main Image */}
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

          {/* Thumbnail Navigation - Only show if we have more than one image */}
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

        {/* Title and Category */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <span className="bg-rose-100 text-rose-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {dateIdea.category}
            </span>

          </div>
          <div className="flex items-start justify-between">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{dateIdea.title}</h1>
            <div className="text-right">

            </div>
          </div>
        </div>

        {/* Location Prompt */}
        {showLocationPrompt && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="mb-3 md:mb-0 md:mr-4">
                <h3 className="text-sm font-semibold text-blue-800">Personalize Your Experience</h3>
                <p className="text-sm text-blue-600">Add your city to see date ideas relevant to your location</p>
              </div>
              <div className="flex w-full md:w-auto">
                <div className="relative w-full">
                  <Autocomplete<CityItem>
                    className="w-full"
                    inputValue={cityList.filterText || ""}
                    isLoading={cityList.isLoading}
                    items={cityList.items as CityItem[]}
                    placeholder="Search for a city..."
                    variant="bordered"
                    onInputChange={cityList.setFilterText}
                    onSelectionChange={key => {
                      const selected = cityList.items.find(item => item.id === key);
                      if (selected) {
                        handleCitySelect(selected);
                      }
                    }}
                    startContent={<MapPinIcon className="h-5 w-5 text-gray-500" />}
                    listboxProps={{
                      itemClasses: {
                        base: "data-[hover=true]:bg-rose-100 transition-colors",
                      },
                    }}
                    popoverProps={{
                      classNames: {
                        content: "bg-white rounded-xl shadow-lg p-1 border border-gray-200"
                      }
                    }}
                  >
                    {(item) => (
                      <AutocompleteItem
                        key={item.id}
                        onSelect={() => handleCitySelect(item)}
                        className={`capitalize ${item.isPopular ? 'font-medium' : ''}`}
                        startContent={item.isPopular ? <StarIcon className="h-4 w-4 text-amber-400 mr-1" /> : null}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{item.name}, {item.countryCode}</span>
                          {item.isPopular && (
                            <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">Popular</span>
                          )}
                        </div>
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Location Display */}
        {showUserLocationBadge && userCity && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-200 p-3 bg-white">
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-gray-700 text-sm">Location: {userCity}</span>
            </div>
            <button
              onClick={clearUserCity}
              className="text-xs text-gray-500 hover:text-gray-700 ml-2 flex items-center"
            >
              <span className="mr-1">Change</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        )}

        {/* Affiliate Link Disclosure */}
        <div className="text-xs text-gray-400 mb-4 italic">
          This page contains affiliate links
        </div>

        {/* Date Details Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">

          {/* GetYourGuide Experiences Section */}
          {userCity ? (
            <div>
              {loadingExperiences ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-500 mr-3"></div>
                    <div>
                      <p className="text-gray-700 font-medium">Looking for relevant activities...</p>
                      <p className="text-xs text-gray-500">Searching across Google, Eventbrite, Timeout, Meetup, Get Your Guide</p>
                    </div>
                  </div>
                  <div className="animate-pulse space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-gray-100 rounded-lg p-4 h-24"></div>
                    ))}
                  </div>
                </div>
              ) : experiences.length > 0 ? (
                <div className="space-y-4">
                  {experiencesWarning && (
                    <div className="text-sm bg-amber-50 text-amber-700 p-3 rounded-md mb-3">
                      We couldn't find a direct match at this time, but here are similar events you will love
                    </div>
                  )}
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
                          <h3 className="font-semibold text-gray-800 mb-2">{exp.title}</h3>
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

        <div className="flex flex-col md:flex-row gap-8">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
            {/* Description */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">About This Date Idea</h2>
            <p className="text-gray-700 mb-6">{dateIdea.description}</p>

            {dateIdea.longDescription && (
              <div className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: dateIdea.longDescription || '' }} />
            )}
          </div>

          {/* Tips Section */}
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


        {/* Back to Browse Button */}
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
    </div>
  );
}