"use client"

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
// import { HeartIcon, MapPinIcon, SearchIcon, StarIcon, ClockIcon, CurrencyDollarIcon, MoonIcon } from "./components/icons";
import { HeartIcon, MapPinIcon, SearchIcon, StarIcon, ClockIcon, DollarSign, MoonIcon, SlidersHorizontal, X, Sun, Moon, TreePine, Building } from "lucide-react";
import SaveButton from "./components/SaveButton";
import { getImageUrl } from "./utils/imageService";
import { supabase } from "../utils/supabaseClient";
import GridView from "./components/GridView"; // Import the GridView component
import Header from "./components/Header"; // Import the Header component
import Footer from "./components/Footer";
import PageTitle from "./components/PageTitle"; // Import the new PageTitle component
import HowItWorksCarousel from "./components/HowItWorksCarousel"; // Import the carousel component
import { PAGE_TITLES } from "./utils/titleUtils";
import { favoritesService, FavoritesError, DateIdea as ImportedDateIdea } from './services/favoritesService';
import type { DateIdea as GridViewDateIdea } from './components/GridView'; // Import the DateIdea type from GridView
import FilterButtons from "./components/FilterButtons";
import Head from 'next/head';
import { City } from "country-state-city";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { useAsyncList } from "@react-stately/data";
import CountryCitySelector, { CityItem } from "./components/CountryCitySelector";
import { POPULAR_CITIES } from "../utils/cityService";
import Script from 'next/script';
import { TikTokEmbed } from 'react-social-media-embed';
import { shuffleArray } from "../utils/arrayUtils"; // Utility function to shuffle arrays

// DO NOT export metadata from this client component - it's now moved to metadata.ts

interface DateIdea {
  id: number;
  title: string;
  category: string;
  rating: number;
  location: string | { [key: string]: any; } | null;
  description: string;
  price: string;
  duration: string;
  slug: string;
  image: string;
  priceLevel?: number;
  bestForStage?: string;
  tips?: string | null;
  idealFor?: string;
  mood?: string | { pace?: string; vibe?: string }; // Updated property
  timeOfDay?: string; // Added property
  longDescription?: string;
  event_url?: string; // Added property for event URL
}

const Home = () => {
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [allDateIdeas, setAllDateIdeas] = useState<DateIdea[]>([]);
  const [allDateIdeaImages, setAllDateIdeaImages] = useState<Record<string, string>>({});
  const [visibleIdeas, setVisibleIdeas] = useState<number>(20);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // State to control modal visibility
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false); // State for scroll to top button
  const [recentFavorites, setRecentFavorites] = useState<DateIdea[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState<boolean>(true);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [filteredDateIdeas, setFilteredDateIdeas] = useState<DateIdea[]>([]);

  // Add search-related states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<DateIdea[]>([]);

  // Simple toggle filters based on database structure
  const [simpleFilters, setSimpleFilters] = useState<{
    freeCheap: boolean;
    daytimeOnly: boolean;
    nighttimeOnly: boolean;
    outdoor: boolean;
    indoor: boolean;
  }>({
    freeCheap: false,
    daytimeOnly: false,
    nighttimeOnly: false,
    outdoor: false,
    indoor: false
  });

  const [activeFilters, setActiveFilters] = useState<{
    city: string | null;
  }>({ city: null });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  const [cityOptions, setCityOptions] = useState<{ name: string; countryCode: string }[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [citySearchQuery, setCitySearchQuery] = useState(""); // State for city search query
  const [popularCities, setPopularCities] = useState<{ name: string; countryCode: string }[]>([]); // State for popular cities

  // Add a function to set default city to LA if IP detection fails
  const setDefaultCity = () => {
    const laCity = {
      name: "Los Angeles",
      countryCode: "US",
      isPopular: true,
      id: "Los Angeles-US"
    };
    setSelectedCity(laCity.name);
    setActiveFilters(prev => ({ ...prev, city: laCity.name }));
    setUserCity(laCity.name);
  };

  const [trendingIdeas, setTrendingIdeas] = useState<DateIdea[]>([]);
  const [trendingSlide, setTrendingSlide] = useState(0);

  useEffect(() => {
    // Fetch only the 20 most popular cities initially
    const fetchPopularCities = async () => {
      const cities = City.getAllCities();
      // Just use the first 20 cities since population property isn't available
      const popularCities = cities.slice(0, 20);
      setPopularCities(popularCities.map(city => ({ name: city.name, countryCode: city.countryCode })));
    };

    fetchPopularCities();

    // Fetch all cities and set them as options (limit to first 100 to avoid performance issues)
    const cities = City.getAllCities().slice(0, 100);
    setCityOptions(cities.map(city => ({ name: city.name, countryCode: city.countryCode })));

    // Set default city based on user's IP-detected city
    const detectLocation = async () => {
      try {
        const response = await fetch('/api/location');
        const data = await response.json();
        if (data.city) {
          setSelectedCity(data.city);
          setActiveFilters(prev => ({ ...prev, city: data.city }));
          setUserCity(data.city);
        } else {
          setDefaultCity();
        }
      } catch (error) {
        console.error('Error detecting location:', error);
        setDefaultCity();
      }
    };

    detectLocation();
  }, []);

  const handleCitySearch = async (query: string) => {
    setCitySearchQuery(query);

    if (query.trim() === "") {
      // Reset to popular cities if search query is empty
      const cities = City.getAllCities();
      // Just use the first 20 cities instead of sorting by population which isn't available
      const firstCities = cities.slice(0, 20);
      setCityOptions(firstCities.map(city => ({ name: city.name, countryCode: city.countryCode })));
      return;
    }

    // Fetch cities matching the search query
    const cities = City.getAllCities();
    const filteredCities = cities.filter(city => city.name.toLowerCase().includes(query.toLowerCase()));
    setCityOptions(filteredCities.map(city => ({ name: city.name, countryCode: city.countryCode })));
  };

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(event.target.value);
  };

  // Update handleCitySelect function to properly update filters
  const handleCitySelect = (city: CityItem) => {
    setSelectedCity(city.name);
    // Also update the active filters to apply the city filter
    setActiveFilters(prev => ({ ...prev, city: city.name }));
  };

  const clearAllFilters = () => {
    setActiveFilters({ city: null });
    setSimpleFilters({
      freeCheap: false,
      daytimeOnly: false,
      nighttimeOnly: false,
      outdoor: false,
      indoor: false
    });
  };

  const appliedFiltersCount = useMemo(() => {
    let count = 0;
    if (activeFilters.city) count++;
    // Count active simple filters
    Object.values(simpleFilters).forEach(isActive => {
      if (isActive) count++;
    });
    return count;
  }, [activeFilters, simpleFilters]);





  useEffect(() => {
    const fetchDateIdeas = async () => {
      try {
        const { data, error } = await supabase
          .from('date_ideas')
          .select('*');

        if (error) {
          console.error("Supabase Error:", error);
          throw error;
        }

        if (data) {
          // Shuffle the data before setting it to ensure randomization is invisible
          const shuffledData = shuffleArray(data);
          setAllDateIdeas(shuffledData);

          // Filter trending ideas (assuming a boolean 'trending' field)
          setTrendingIdeas(shuffledData.filter((idea: any) => idea.trending === true).slice(0, 4));
        }

        // Load images for all date ideas
        if (data) {
          const initialBatchSize = 8;
          const initialBatch = data.slice(0, initialBatchSize);
          const remainingBatch = data.slice(initialBatchSize);

          await loadImagesForBatch(initialBatch);
          loadImagesForBatch(remainingBatch);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching date ideas:', error);
        setLoading(false);
      }
    };

    const loadImages = async () => {
      const heroImg = await getImageUrl("/", "romantic couple date", 1920, 500);
      setHeroImageUrl(heroImg);
    };

    loadImages();
    fetchDateIdeas();
  }, []);

  useEffect(() => {
    favoritesService.syncFavorites().catch(error =>
      console.warn('Failed to sync favorites:', error)
    );

    const fetchRecentFavorites = async () => {
      setFavoritesLoading(true);
      setFavoritesError(null);
      try {
        let favorites: DateIdea[] = [];

        if (typeof window !== 'undefined') {
          try {
            const savedIdeas = localStorage.getItem('savedDateIdeas');
            if (savedIdeas) {
              const parsedIdeas = JSON.parse(savedIdeas) as DateIdea[];
              favorites = parsedIdeas.slice(0, 3);
            }
          } catch (localStorageError) {
            console.warn('Error accessing localStorage:', localStorageError);
          }
        }

        if (favorites.length > 0) {
          setRecentFavorites(favorites);
        } else {
          try {
            const serviceFavorites = await favoritesService.getRecentFavorites();
            // Convert service favorites to match the main DateIdea interface
            const convertedFavorites: DateIdea[] = serviceFavorites.map(fav => ({
              ...fav,
              location: fav.location as string | { [key: string]: any } | null
            }));
            setRecentFavorites(convertedFavorites);
          } catch (serviceError) {
            console.warn('Error from favorites service:', serviceError);
            setRecentFavorites([]);
          }
        }
      } catch (error) {
        console.error('Error in fetchRecentFavorites:', error);
        setFavoritesError('Unable to load favorites');
      } finally {
        setFavoritesLoading(false);
      }
    };

    fetchRecentFavorites();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const detectLocation = async () => {
      try {
        const savedCity = localStorage.getItem("userCity");
        if (savedCity) {
          setUserCity(savedCity);
          setActiveFilters(prev => ({ ...prev, city: savedCity }));
          return;
        }

        const response = await fetch('/api/location');
        const data = await response.json();
        if (data.city) {
          setUserCity(data.city);
          setActiveFilters(prev => ({ ...prev, city: data.city }));
          localStorage.setItem("userCity", data.city);
        } else {
          setDefaultCity();
        }
      } catch (error) {
        console.error('Error detecting location:', error);
        setDefaultCity();
      }
    };

    detectLocation();
  }, []);

  useEffect(() => {
    if (!allDateIdeas.length) return;

    // Get current date to use as a seed
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    // Create a seed that changes daily by combining the day, month, and year
    const dateSeed = today.getDate() + (today.getMonth() + 1) * 31 + today.getFullYear() * 366;

    // Create different sort methods that will rotate daily
    const sortMethods = [
      // Method 1: Random sort using sin function with date seed
      (a: DateIdea, b: DateIdea) => {
        const randomA = Math.sin(dateSeed + a.id) * 10000 % 1;
        const randomB = Math.sin(dateSeed + b.id) * 10000 % 1;
        return randomA - randomB;
      },
      // Method 2: Alphabetical by title, but with daily offset
      (a: DateIdea, b: DateIdea) => {
        // Rotate starting position based on day of month
        const offset = today.getDate() % 26;
        const titleA = a.title.charAt(0).toLowerCase();
        const titleB = b.title.charAt(0).toLowerCase();
        const posA = (titleA.charCodeAt(0) - 97 + offset) % 26;
        const posB = (titleB.charCodeAt(0) - 97 + offset) % 26;
        return posA - posB || a.title.localeCompare(b.title);
      },
      // Method 3: By ID with daily offset
      (a: DateIdea, b: DateIdea) => {
        const offset = today.getDate();
        return ((a.id + offset) % 100) - ((b.id + offset) % 100);
      },
      // Method 4: By category with daily rotation
      (a: DateIdea, b: DateIdea) => {
        // Start with different category each day
        const catA = a.category || '';
        const catB = b.category || '';
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        return ((catA.charCodeAt(0) || 0) + dayOfYear) % 65536 - ((catB.charCodeAt(0) || 0) + dayOfYear) % 65536
          || a.title.localeCompare(b.title);
      },
    ];

    // Select sort method based on day of week (0-6) modulo number of methods
    const methodIndex = today.getDay() % sortMethods.length;

    // Apply the selected sort method
    const shuffledIdeas = [...allDateIdeas].sort(sortMethods[methodIndex]);

    // Only update if the order has changed
    if (JSON.stringify(shuffledIdeas.map(i => i.id)) !== JSON.stringify(allDateIdeas.map(i => i.id))) {
      setAllDateIdeas(shuffledIdeas);
    }
  }, [allDateIdeas.length]); // Only re-run when the number of ideas changes

  const loadMoreIdeas = () => {
    setVisibleIdeas(prev => prev + 20);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const normalizedQuery = query.toLowerCase().trim();
    const results = allDateIdeas.filter(idea =>
      idea.title.toLowerCase().includes(normalizedQuery) ||
      idea.category.toLowerCase().includes(normalizedQuery) ||
      idea.description.toLowerCase().includes(normalizedQuery)
    ).slice(0, 7); // Limit to 7 suggestions

    setSearchResults(results);
    setShowSearchResults(true);
  };

  const handleSelectSearchResult = (slug: string) => {
    setSearchQuery('');
    setShowSearchResults(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadImagesForBatch = async (ideas: DateIdea[]) => {
    const batchSize = 5;

    for (let i = 0; i < ideas.length; i += batchSize) {
      const batch = ideas.slice(i, i + batchSize);

      const imagesPromises = batch.map(async (idea) => {
        const url = await getImageUrl(
          idea.image,
          `${idea.title} ${idea.category}`,
          400,
          300
        );

        return { [idea.slug]: url };
      });

      const batchResults = await Promise.all(imagesPromises);
      const batchImages = Object.assign({}, ...batchResults);

      setAllDateIdeaImages(prev => ({ ...prev, ...batchImages }));

      if (i + batchSize < ideas.length) {
        await new Promise(r => setTimeout(r, 100));
      }
    }
  };

  const clearUserCity = () => {
    localStorage.removeItem("userCity");
    setUserCity(null);
  };

  // Toggle filter function
  const toggleFilter = (filterName: keyof typeof simpleFilters) => {
    setSimpleFilters(prev => {
      const newFilters = { ...prev };
      
      // Handle mutually exclusive filters
      if (filterName === 'outdoor' && !prev.outdoor) {
        // If turning on outdoor, turn off indoor
        newFilters.indoor = false;
      } else if (filterName === 'indoor' && !prev.indoor) {
        // If turning on indoor, turn off outdoor
        newFilters.outdoor = false;
      } else if (filterName === 'daytimeOnly' && !prev.daytimeOnly) {
        // If turning on daytime, turn off nighttime
        newFilters.nighttimeOnly = false;
      } else if (filterName === 'nighttimeOnly' && !prev.nighttimeOnly) {
        // If turning on nighttime, turn off daytime
        newFilters.daytimeOnly = false;
      }
      
      // Toggle the selected filter
      newFilters[filterName] = !prev[filterName];
      
      return newFilters;
    });
  };



  useEffect(() => {
    if (!allDateIdeas.length) return;

    const newFilteredIdeas = allDateIdeas.filter((idea) => {
      let matchesFilter = true;

      // City filter - only filter if a city is selected
      if (activeFilters.city) {
        const ideaLocation = typeof idea.location === 'string' ? idea.location.toLowerCase() : '';
        const cityName = activeFilters.city.toLowerCase();
        matchesFilter = matchesFilter && ideaLocation.includes(cityName);
      }

      // Simple filters based on database structure
      if (simpleFilters.freeCheap) {
        // Filter for affordable items (handle both string and numeric price levels)
        const isAffordable = idea.priceLevel === 1 || 
                           (typeof idea.priceLevel === 'string' && (idea.priceLevel === "Affordable" || idea.priceLevel === "affordable")) ||
                           !idea.priceLevel; // Include items with no price level (likely free)
        matchesFilter = matchesFilter && isAffordable;
      }

      if (simpleFilters.daytimeOnly) {
        // Filter for daytime activities exclusively (exclude nighttime activities)
        const timeText = idea.timeOfDay ? idea.timeOfDay.toLowerCase() : '';
        
        // Include items with no specific time (empty/null), 'varies', or explicitly daytime
        if (!timeText || timeText === 'varies') {
          matchesFilter = matchesFilter && true; // Include varies and empty/null
        } else {
          // Only include if it contains daytime keywords AND doesn't contain nighttime keywords
          const hasDaytime = timeText.includes('day') || timeText.includes('morning') || timeText.includes('afternoon');
          const hasNighttime = timeText.includes('night') || timeText.includes('evening');
          matchesFilter = matchesFilter && (hasDaytime && !hasNighttime);
        }
      }

      if (simpleFilters.nighttimeOnly) {
        // Filter for nighttime activities exclusively (exclude daytime activities)
        const timeText = idea.timeOfDay ? idea.timeOfDay.toLowerCase() : '';
        
        // Include items with no specific time (empty/null), 'varies', or explicitly nighttime
        if (!timeText || timeText === 'varies') {
          matchesFilter = matchesFilter && true; // Include varies and empty/null
        } else {
          // Only include if it contains nighttime keywords AND doesn't contain daytime keywords
          const hasNighttime = timeText.includes('night') || timeText.includes('evening');
          const hasDaytime = timeText.includes('day') || timeText.includes('morning') || timeText.includes('afternoon');
          matchesFilter = matchesFilter && (hasNighttime && !hasDaytime);
        }
      }

      if (simpleFilters.outdoor) {
        // Filter for outdoor activities
        const locationType = typeof idea.location === 'object' && idea.location?.type;
        matchesFilter = matchesFilter && (
          locationType === 'outdoor' || 
          locationType === 'park' ||
          locationType === 'nature' ||
          locationType === 'beach'
        );
      }

      if (simpleFilters.indoor) {
        // Filter for indoor activities
        const locationType = typeof idea.location === 'object' && idea.location?.type;
        matchesFilter = matchesFilter && (
          locationType === 'indoor' ||
          locationType === 'restaurant' ||
          locationType === 'museum' ||
          locationType === 'theater' ||
          locationType === 'shopping'
        );
      }

      return matchesFilter;
    });

    setFilteredDateIdeas(newFilteredIdeas);
    setVisibleIdeas(20);
  }, [allDateIdeas, activeFilters, simpleFilters]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const dateIdeasSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": filteredDateIdeas.slice(0, visibleIdeas).map((idea, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Event",
        "name": idea.title,
        "description": idea.description,
        "image": allDateIdeaImages[idea.slug] || idea.image,
        "url": `${typeof window !== 'undefined' ? window.location.origin : ''}/date-idea/${idea.slug}`,
        "location": {
          "@type": "Place",
          "name": idea.location,
          "address": idea.location
        },
        "offers": idea.priceLevel ? {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        } : undefined
      }
    }))
  };

  // Define AddNoteIcon inside the Home component
  const AddNoteIcon = (props: { className?: string;[key: string]: any }) => {
    return (
      <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height="1em"
        role="presentation"
        viewBox="0 0 24 24"
        width="1em"
        {...props}
      >
        <path
          d="M7.37 22h9.25a4.87 4.87 0 0 0 4.87-4.87V8.37a4.87 4.87 0 0 0-4.87-4.87H7.37A4.87 4.87 0 0 0 2.5 8.37v8.75c0 2.7 2.18 4.88 4.87 4.88Z"
          fill="currentColor"
          opacity={0.4}
        />
        <path
          d="M8.29 6.29c-.42 0-.75-.34-.75-.75V2.75a.749.749 0 1 1 1.5 0v2.78c0 .42-.33.76-.75.76ZM15.71 6.29c-.42 0-.75-.34-.75-.75V2.75a.749.749 0 1 1 1.5 0v2.78c0 .42-.33.76-.75.76ZM12 14.75h-1.69V13c0-.41-.34-.75-.75-.75s-.75.34-.75.75v1.75H7c-.41 0-.75.34-.75.75s.34.75.75.75h1.81V18c0 .41.34.75.75.75s.75-.34.75-.75v-1.75H12c.41 0 .75-.34.75-.75s-.34-.75-.75-.75Z"
          fill="currentColor"
        />
      </svg>
    );
  };

  // Add new state for mobile filter modal
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <script type="application/ld+json">
          {JSON.stringify(dateIdeasSchema)}
        </script>
      </Head>
      <PageTitle title={PAGE_TITLES.HOME} />
      <Header />
      <section className="z-[30] relative">
        <div className="bg-gradient-to-r from-rose-800/80 to-purple-800/80 h-[540px] w-full"></div>
        <div className="absolute inset-0 flex items-center justify-center z-20 text-white px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
              {/* Left column: Title and search */}
              <div className="flex flex-col items-start justify-center">
                <h1 className="text-4xl md:text-4xl lg:text-4xl font-bold mb-6">Find something different and exciting to do
                </h1>
                <p className="text-2xl mb-8">We email/text you reminders for your favorite events for $8/mo</p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => document.getElementById('all-date-ideas')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-rose-600 text-white px-8 py-4 rounded-full hover:bg-rose-700 transition-colors font-semibold shadow-lg">
                    See Date Ideas
                  </button>
                  <button
                    className="bg-white text-gray-900 px-8 py-4 rounded-full hover:bg-gray-100 transition-colors font-semibold shadow-lg"
                  >
                    Sign Up with Email/Text
                  </button>
                </div>
              </div>

              {/* Right column: Video */}
              <div className="hidden md:block relative h-[350px] rounded-lg overflow-hidden shadow-2xl border-4 border-white/20">
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                </div>
                <div className="relative h-full w-full">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="object-cover h-full w-full"
                  >
                    <source src="/SparkIntro.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New UI Section with City Dropdown Headers */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          {/* Header Section with City Dropdowns */}
          <div className="mb-8 space-y-6">
            {/* First Heading: What to do in {citydropdown} this week */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 whitespace-nowrap">
                What to do this week in
              </h2>
              <div className="min-w-[250px]">
                <CountryCitySelector
                  onCitySelect={(city) => handleCitySelect(city)}
                  selectedCity={selectedCity}
                  defaultCity={userCity || undefined}
                  label=""
                  className="w-full"
                />
              </div>

            </div>

          </div>

          {/* Trending Ideas Grid */}
          <div className="relative">
            <button onClick={() => setTrendingSlide(prev => prev > 0 ? prev - 1 : Math.floor((trendingIdeas.length - 1) / 5))} className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow">‹</button>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 overflow-hidden">
              {(trendingIdeas.slice(trendingSlide * 5, trendingSlide * 5 + 5)).map((idea) => (
                <Link href={`/date-idea/${idea.slug}`} key={idea.id} className="group">
                  <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow flex flex-col h-full relative">
                    <div className="relative h-48 w-full">
                      <Image
                        src={allDateIdeaImages[idea.slug] || idea.image || '/placeholder.svg?height=300&width=400'}
                        alt={idea.title}
                        fill
                        className="object-cover w-full h-full"
                      />
                      <SaveButton itemSlug={idea.slug} item={idea} className="absolute top-3 right-3 z-10" />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-center mb-2 flex-wrap gap-1">
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded mb-2">{idea.category}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-rose-500 transition-colors line-clamp-2">{idea.title}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{idea.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <button onClick={() => setTrendingSlide(prev => prev < Math.floor((trendingIdeas.length - 1) / 5) ? prev + 1 : 0)} className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow">›</button>
          </div>
        </div>
      </section>

      <section className="py-12" id="all-date-ideas">
        <div className="container mx-auto px-4">
          {/* Second Heading: Date Ideas in {citydropdown} */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 whitespace-nowrap">
              Date Ideas in
            </h2>
            <div className="min-w-[250px]">
              <CountryCitySelector
                onCitySelect={(city) => handleCitySelect(city)}
                selectedCity={selectedCity}
                defaultCity={userCity || undefined}
                label=""
                className="w-full"
              />
            </div>
          </div>          {/* Filters */}
          <div className="sticky top-12 z-20 bg-white/95 backdrop-blur-sm border-2 border-slate-100 py-3 px-4 mb-6 rounded-2xl shadow-sm">
            {/* Active filters chips - visible on mobile */}
            <div className="flex justify-between items-center">
              <div className="flex flex-wrap gap-2 mb-3">
              {appliedFiltersCount > 0 && (
                <>
                    {/* {activeFilters.city && (
                      <span className="inline-flex items-center px-2 py-1 bg-rose-100 text-rose-800 text-xs rounded-full">
                        {activeFilters.city}
                        <button
                          onClick={() => setActiveFilters(prev => ({ ...prev, city: null }))}
                          className="ml-1 text-rose-800"
                          aria-label="Remove city filter"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                    )} */}
                </>
              )}
              </div>
              

              {/* Filter button for mobile */}
              <button
                onClick={() => setShowFilterModal(true)}
                className="md:hidden flex items-center px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow-sm"
              >
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                <span>Filters {appliedFiltersCount > 0 && `(${appliedFiltersCount})`}</span>
              </button>

              {/* Clear button on mobile when filters applied */}
              {appliedFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="md:hidden flex items-center px-3 py-2 text-xs text-rose-600"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Main filter controls - desktop only */}
            <div className="hidden md:flex md:flex-wrap gap-2 items-center">
              {/* City filter */}

              {/* Simple filter toggle buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => toggleFilter('freeCheap')}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    simpleFilters.freeCheap
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Free/Cheap
                </button>

                <button
                  onClick={() => toggleFilter('daytimeOnly')}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    simpleFilters.daytimeOnly
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Sun className="h-4 w-4 mr-1" />
                  Daytime only
                </button>

                <button
                  onClick={() => toggleFilter('nighttimeOnly')}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    simpleFilters.nighttimeOnly
                      ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Moon className="h-4 w-4 mr-1" />
                  Nighttime only
                </button>

                <button
                  onClick={() => toggleFilter('outdoor')}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    simpleFilters.outdoor
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <TreePine className="h-4 w-4 mr-1" />
                  Outdoor
                </button>

                <button
                  onClick={() => toggleFilter('indoor')}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    simpleFilters.indoor
                      ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Building className="h-4 w-4 mr-1" />
                  Indoor
                </button>
              </div>

              {/* Clear button with counter */}
              {appliedFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-rose-100 text-rose-800 hover:bg-rose-200 transition-colors"
                >
                  <span>Clear</span>
                  <span className="ml-1.5 flex items-center justify-center bg-rose-200 text-rose-800 rounded-full h-5 w-5 text-xs">
                    {appliedFiltersCount}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile filter modal */}
          {showFilterModal && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-xl font-semibold">Filters</h3>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="p-2 rounded-full hover:bg-gray-100"
                    aria-label="Close filters"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="overflow-y-auto flex-grow p-4 space-y-6">
                  {/* City filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">City</label>
                    <CountryCitySelector
                      onCitySelect={(city) => handleCitySelect(city)}
                      defaultCity={userCity || undefined}
                      label=""
                    />
                  </div>

                  {/* Simple filter toggle buttons */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">Quick Filters</label>
                    
                    <button
                      onClick={() => toggleFilter('freeCheap')}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        simpleFilters.freeCheap
                          ? 'bg-green-100 text-green-800 border-2 border-green-200'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                      }`}
                    >
                      <span className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Free/Cheap
                      </span>
                      {simpleFilters.freeCheap && <span className="text-green-600">✓</span>}
                    </button>

                    <button
                      onClick={() => toggleFilter('daytimeOnly')}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        simpleFilters.daytimeOnly
                          ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-200'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                      }`}
                    >
                      <span className="flex items-center">
                        <Sun className="h-5 w-5 mr-2" />
                        Daytime only
                      </span>
                      {simpleFilters.daytimeOnly && <span className="text-yellow-600">✓</span>}
                    </button>

                    <button
                      onClick={() => toggleFilter('nighttimeOnly')}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        simpleFilters.nighttimeOnly
                          ? 'bg-blue-100 text-blue-800 border-2 border-blue-200'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                      }`}
                    >
                      <span className="flex items-center">
                        <Moon className="h-5 w-5 mr-2" />
                        Nighttime only
                      </span>
                      {simpleFilters.nighttimeOnly && <span className="text-blue-600">✓</span>}
                    </button>

                    <button
                      onClick={() => toggleFilter('outdoor')}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        simpleFilters.outdoor
                          ? 'bg-green-100 text-green-800 border-2 border-green-200'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                      }`}
                    >
                      <span className="flex items-center">
                        <TreePine className="h-5 w-5 mr-2" />
                        Outdoor
                      </span>
                      {simpleFilters.outdoor && <span className="text-green-600">✓</span>}
                    </button>

                    <button
                      onClick={() => toggleFilter('indoor')}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        simpleFilters.indoor
                          ? 'bg-purple-100 text-purple-800 border-2 border-purple-200'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                      }`}
                    >
                      <span className="flex items-center">
                        <Building className="h-5 w-5 mr-2" />
                        Indoor
                      </span>
                      {simpleFilters.indoor && <span className="text-purple-600">✓</span>}
                    </button>
                  </div>
                </div>

                <div className="p-4 border-t flex justify-between">
                  <button
                    onClick={clearAllFilters}
                    className="px-5 py-2.5 text-gray-600 font-medium"
                  >
                    Clear all
                  </button>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="px-5 py-2.5 bg-rose-600 text-white font-medium rounded-lg shadow-sm"
                  >
                    Apply filters {appliedFiltersCount > 0 && `(${appliedFiltersCount})`}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* end of Filters */}
          {loading ? (
            <div className="h-96 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-72"></div>
              ))}
            </div>
          ) : (
            <>
              <GridView
                dateIdeas={(filteredDateIdeas.length > 0 ? filteredDateIdeas : allDateIdeas).map(idea => ({
                  id: idea.id,
                  title: idea.title,
                  category: idea.category || '',
                  location: typeof idea.location === 'object' && idea.location !== null ? (idea.location.name || '') : idea.location || '',
                  description: idea.description || '',
                  slug: idea.slug,
                  image: idea.image || '/placeholder.svg?height=300&width=400',
                  timeOfDay: idea.timeOfDay || '',
                  mood: typeof idea.mood === 'object' ?
                    `${idea.mood?.pace || ''} ${idea.mood?.vibe || ''}`.trim() :
                    (idea.mood || ''),
                  priceLevel: idea.priceLevel,
                  tips: idea.tips || '',
                  longDescription: idea.longDescription || '',
                }))}
                dateIdeaImages={allDateIdeaImages}
                visibleIdeas={visibleIdeas}
                onLoadMore={loadMoreIdeas}
              />
            </>
          )}
        </div>

        {showScrollButton && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-10 right-10 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 z-20"
            aria-label="Scroll to top"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}
      </section>


      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Follow Us on TikTok</h2>
          <div className="max-w-4xl mx-auto">
            <div className="mt-8 text-center">
              <p className="text-gray-700 mb-6">
                Watch real couples share their favorite date ideas and dating experiences on our TikTok!
              </p>
              <Link
                href="https://www.tiktok.com/@dateideascc"
                target="_blank"
                className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors font-semibold shadow-md inline-flex items-center"
              >
                <span>Follow on TikTok</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-4 h-4 ml-2">
                  <path fill="currentColor" d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default Home;