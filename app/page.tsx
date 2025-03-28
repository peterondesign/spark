"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeartIcon, MapPinIcon, SearchIcon, StarIcon } from "./components/icons";
import SaveButton from "./components/SaveButton";
import { getImageUrl } from "./utils/imageService";
import { supabase } from "../utils/supabaseClient";
import AdvancedSearchModal from "./components/AdvancedSearchModal"; // Import the new component
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

// Removed metadata export as it's not allowed in client components

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
}

export default function Home() {
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
  
  // Add new state for advanced filters
  const [filterOptions, setFilterOptions] = useState<{
    categories: string[];
    locationTypes: string[];
    locationSettings: string[];
    moodPaces: string[];
    moodVibes: string[];
  }>({
    categories: [],
    locationTypes: [],
    locationSettings: [],
    moodPaces: [],
    moodVibes: []
  });
  
  const [selectedFilters, setSelectedFilters] = useState<{
    categories: string[];
    locationTypes: string[];
    locationSettings: string[];
    moodPaces: string[];
    moodVibes: string[];
  }>({
    categories: [],
    locationTypes: [],
    locationSettings: [],
    moodPaces: [],
    moodVibes: []
  });

  const [activeFilters, setActiveFilters] = useState<{
    city: string | null;
    price: 'all' | 'free' | 'affordable' | 'moderate' | 'high' | 'luxury';
    timeOfDay?: string;
    mood?: string;
    experienceType?: string;
    duration?: string;
    setting?: string;
    locationType?: string;
    pace?: string;
    vibe?: string;
  }>({ city: null, price: 'all', timeOfDay: 'all' });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  const clearAllFilters = () => {
    setActiveFilters({ city: null, price: 'all', timeOfDay: 'all' });
    setSelectedFilters({
      categories: [],
      locationTypes: [],
      locationSettings: [],
      moodPaces: [],
      moodVibes: []
    });
  };

  const appliedFiltersCount = useMemo(() => {
    let count = 0;
    if (activeFilters.city) count++;
    if (activeFilters.price !== 'all') count++;
    if (activeFilters.timeOfDay && activeFilters.timeOfDay !== 'all') count++;
    count += selectedFilters.categories.length;
    count += selectedFilters.locationTypes.length;
    count += selectedFilters.locationSettings.length;
    return count;
  }, [activeFilters, selectedFilters]);

  const priceLevelMap = {
    'all': 'All Prices',
    'free': 'Free',
    'affordable': 'Affordable',
    'moderate': 'Moderate',
    'high': 'High',
    'luxury': 'Luxury'
  };

  const timeOfDayMap = {
    'all': 'Any Time',
    'day': 'Day',
    'afternoon': 'Afternoon',
    'evening': 'Evening',
    'night': 'Night',
    'varies': 'Varies'
  };

  const getSelectedFiltersText = () => {
    const count = Object.values(selectedFilters).reduce((acc, filters) => acc + filters.length, 0);
    if (count === 0) return "Advanced Filters";
    
    const allSelected = [
      ...selectedFilters.categories,
      ...selectedFilters.locationTypes,
      ...selectedFilters.locationSettings,
      ...selectedFilters.moodPaces,
      ...selectedFilters.moodVibes
    ];
    
    if (allSelected.length === 1) return allSelected[0];
    return `${allSelected.length} selected`;
  };

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
          // Extract all unique filter values from data
          const categories = new Set<string>();
          const locationTypes = new Set<string>();
          const locationSettings = new Set<string>();
          const moodPaces = new Set<string>();
          const moodVibes = new Set<string>();

          data.forEach(idea => {
            // Extract category
            if (idea.category) {
              categories.add(idea.category);
            }

            // Extract location type and setting
            if (typeof idea.location === 'object' && idea.location) {
              if (idea.location.type) locationTypes.add(idea.location.type);
              if (idea.location.setting) locationSettings.add(idea.location.setting);
            }

            // Extract mood pace and vibe
            if (typeof idea.mood === 'object' && idea.mood) {
              if (idea.mood.pace) moodPaces.add(idea.mood.pace);
              if (idea.mood.vibe) moodVibes.add(idea.mood.vibe);
            }
          });

          // Set filter options
          setFilterOptions({
            categories: Array.from(categories).sort(),
            locationTypes: Array.from(locationTypes).sort(),
            locationSettings: Array.from(locationSettings).sort(),
            moodPaces: Array.from(moodPaces).sort(),
            moodVibes: Array.from(moodVibes).sort()
          });

          setAllDateIdeas(data);
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
            setRecentFavorites(serviceFavorites);
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
        }
      } catch (error) {
        console.error('Error detecting location:', error);
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
      // Method 5: By price level with daily rotation
      (a: DateIdea, b: DateIdea) => {
        const priceA = a.priceLevel || 3;
        const priceB = b.priceLevel || 3;
        // Rotate whether to show cheaper or more expensive first
        const dayOfWeek = today.getDay();
        return dayOfWeek % 2 === 0 ? priceA - priceB : priceB - priceA;
      }
    ];
    
    // Select sort method based on day of week (0-6) modulo number of methods
    const methodIndex = today.getDay() % sortMethods.length;
    console.log(`Using sort method ${methodIndex + 1} of ${sortMethods.length} for today (${dateString})`);
    
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

  const handleSearch = (filters: any) => {
    setLoading(true);

    const filteredIdeas = allDateIdeas.filter((idea) => {
      let matches = true;

      if (filters.category && filters.category !== "all") {
        matches = matches && idea.category === filters.category;
      }

      if (filters.priceLevel && filters.priceLevel !== "all") {
        const priceLevelNum = parseInt(filters.priceLevel);
        matches = matches && idea.priceLevel === priceLevelNum;
      }

      if (filters.location && filters.location.trim() !== "") {
        if (typeof idea.location === 'string') {
          matches = matches && idea.location.toLowerCase().includes(filters.location.toLowerCase());
        } else if (typeof idea.location === 'object' && idea.location?.city) {
          matches = matches && idea.location.city.toLowerCase().includes(filters.location.toLowerCase());
        } else {
          matches = false;
        }
      }

      if (filters.searchTerm && filters.searchTerm.trim() !== "") {
        const term = filters.searchTerm.toLowerCase();
        const titleMatch = idea.title.toLowerCase().includes(term);
        const descMatch = idea.description.toLowerCase().includes(term);
        matches = matches && (titleMatch || descMatch);
      }

      return matches;
    });

    setAllDateIdeas(filteredIdeas);
    setVisibleIdeas(20);
    setLoading(false);
  };

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

  const handleFilterChange = (filterType: string, value: string, isChecked: boolean) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev };
      const filterArray = newFilters[filterType as keyof typeof newFilters];

      if (isChecked) {
        if (!filterArray.includes(value)) {
          newFilters[filterType as keyof typeof newFilters] = [...filterArray, value];
        }
      } else {
        newFilters[filterType as keyof typeof newFilters] = filterArray.filter((v) => v !== value);
      }

      return newFilters;
    });
  };

  const handleMultiSelectChange = (filterType: string, event: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(event.target.options);
    const selectedValues = options.filter((option) => option.selected).map((option) => option.value);

    setSelectedFilters((prev) => {
      const newFilters = { ...prev };
      newFilters[filterType as keyof typeof newFilters] = selectedValues;
      return newFilters;
    });
  };

  useEffect(() => {
    if (!allDateIdeas.length) return;
    
    const newFilteredIdeas = allDateIdeas.filter((idea) => {
      let matchesFilter = true;

      // City filter is disabled but we still show the user's location
      // No longer filtering by city as requested

      // Simple price filter - direct text matching with alternatives
      if (activeFilters.price !== 'all') {
        const priceText = typeof idea.price === 'string' ? idea.price.toLowerCase() : '';
        const priceLevelText = idea.priceLevel ? String(idea.priceLevel).toLowerCase() : '';
        
        switch (activeFilters.price) {
          case 'free':
            matchesFilter = matchesFilter && (
              priceText.includes('free') || 
              priceLevelText.includes('free') ||
              priceText === '0' || 
              priceText === '$' ||
              priceLevelText === '1'
            );
            break;
          case 'affordable':
            matchesFilter = matchesFilter && (
              priceText.includes('affordable') || 
              priceLevelText.includes('affordable') ||
              priceText.includes('budget') || 
              priceText === '$$' ||
              priceLevelText === '2'
            );
            break;
          case 'moderate':
            matchesFilter = matchesFilter && (
              priceText.includes('moderate') || 
              priceLevelText.includes('moderate') ||
              priceText === '$$$' ||
              priceLevelText === '3' 
            );
            break;
          case 'high':
            matchesFilter = matchesFilter && (
              priceText.includes('high') || 
              priceLevelText.includes('high') ||
              priceText.includes('expensive') || 
              priceText === '$$$$' ||
              priceLevelText === '4'
            );
            break;
          case 'luxury':
            matchesFilter = matchesFilter && (
              priceText.includes('luxury') || 
              priceLevelText.includes('luxury') ||
              priceText.includes('premium') || 
              priceText.includes('$$$$$') ||
              priceLevelText === '5'
            );
            break;
        }
      }

      // Time of day filter - simple text matching
      if (activeFilters.timeOfDay && activeFilters.timeOfDay !== 'all') {
        // Convert to lowercase for case-insensitive matching
        const timeText = idea.timeOfDay ? idea.timeOfDay.toLowerCase() : '';
        const searchTime = activeFilters.timeOfDay.toLowerCase();
        
        // Check if the idea has a timeOfDay property before filtering
        if (timeText) {
          if (searchTime === 'day') {
            matchesFilter = matchesFilter && (
              timeText.includes('day') || 
              timeText.includes('morning') || 
              timeText.includes('afternoon')
            );
          } else if (searchTime === 'night') {
            matchesFilter = matchesFilter && (
              timeText.includes('night') || 
              timeText.includes('evening')
            );
          } else {
            // For exact matches or anything containing the search term
            matchesFilter = matchesFilter && timeText.includes(searchTime);
          }
        } else {
          // If timeOfDay is not specified and we're filtering for 'varies', include it
          matchesFilter = matchesFilter && (searchTime === 'varies');
        }
      }

      // Advanced filters (categories, locationTypes, etc.)
      if (selectedFilters.categories.length > 0) {
        matchesFilter = matchesFilter && selectedFilters.categories.includes(idea.category);
      }

      if (selectedFilters.locationTypes.length > 0) {
        const locationType = typeof idea.location === 'object' && idea.location?.type;
        if (!locationType || !selectedFilters.locationTypes.includes(locationType)) {
          matchesFilter = false;
        }
      }

      if (selectedFilters.locationSettings.length > 0) {
        const locationSetting = typeof idea.location === 'object' && idea.location?.setting;
        if (!locationSetting || !selectedFilters.locationSettings.includes(locationSetting)) {
          matchesFilter = false;
        }
      }

      if (selectedFilters.moodPaces.length > 0) {
        const moodPace = typeof idea.mood === 'object' && idea.mood?.pace;
        if (!moodPace || !selectedFilters.moodPaces.includes(moodPace)) {
          matchesFilter = false;
        }
      }

      if (selectedFilters.moodVibes.length > 0) {
        const moodVibe = typeof idea.mood === 'object' && idea.mood?.vibe;
        if (!moodVibe || !selectedFilters.moodVibes.includes(moodVibe)) {
          matchesFilter = false;
        }
      }

      if (activeFilters.experienceType && activeFilters.experienceType !== 'all') {
        matchesFilter = matchesFilter && idea.category === activeFilters.experienceType;
      }

      if (activeFilters.duration && activeFilters.duration !== 'all') {
        matchesFilter = matchesFilter && idea.duration === activeFilters.duration;
      }

      if (activeFilters.setting && activeFilters.setting !== 'all') {
        const locationSetting = typeof idea.location === 'object' && idea.location?.setting;
        matchesFilter = matchesFilter && locationSetting === activeFilters.setting;
      }

      if (activeFilters.locationType && activeFilters.locationType !== 'all') {
        const locationType = typeof idea.location === 'object' && idea.location?.type;
        matchesFilter = matchesFilter && locationType === activeFilters.locationType;
      }

      if (activeFilters.pace && activeFilters.pace !== 'all') {
        const moodPace = typeof idea.mood === 'object' && idea.mood?.pace;
        matchesFilter = matchesFilter && moodPace === activeFilters.pace;
      }

      if (activeFilters.vibe && activeFilters.vibe !== 'all') {
        const moodVibe = typeof idea.mood === 'object' && idea.mood?.vibe;
        matchesFilter = matchesFilter && moodVibe === activeFilters.vibe;
      }

      return matchesFilter;
    });

    console.log('Filtered date ideas count:', newFilteredIdeas.length, 'out of', allDateIdeas.length);

    setFilteredDateIdeas(newFilteredIdeas);
    setVisibleIdeas(20); 
  }, [allDateIdeas, activeFilters, selectedFilters]);

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
  const AddNoteIcon = (props: { className?: string; [key: string]: any }) => {
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

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <script type="application/ld+json">
          {JSON.stringify(dateIdeasSchema)}
        </script>
      </Head>
      <PageTitle title={PAGE_TITLES.HOME} />
      <Header />

      <section className="relative">
        <div className="bg-gradient-to-r from-rose-800/80 to-purple-800/80 h-[320px] w-full"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-6">Date Ideas Near You
          </h1>
          <p className="text-3xl">Personalised for you and your person</p>
        </div>
      </section>

      <section className="py-12" id="all-date-ideas">
        <div className="container mx-auto px-4">
          <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-2 border-slate-100 py-5 px-6 mb-8 rounded-2xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Location Filter - Modified to show IP location without filtering */}
              <div className="relative group">
                <label className="text-gray-700 font-medium text-sm block mb-2">Your Location</label>
                <div className="relative">
                  <input
                    type="text"
                    value={userCity || ''}
                    placeholder="Location not detected"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 transition-all duration-200"
                    disabled
                    title="Your detected location"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  {/* {userCity && (
                    <div className="text-xs text-gray-500 mt-1 pl-1">
                      This is your current detected location. Filtering is disabled.
                    </div>
                  )} */}
                </div>
              </div>

              {/* Price Range Filter - Updated to show readable values */}
              <div className="relative group">
                <label className="text-gray-700 font-medium text-sm block mb-2">Price Range</label>
                <select
                  value={activeFilters.price}
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none transition-all duration-200"
                  onChange={(e) => setActiveFilters({ ...activeFilters, price: e.target.value as typeof activeFilters.price })}
                >
                  <option value="all">All Prices</option>
                  <option value="free">Free</option>
                  <option value="affordable">Affordable</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>

              {/* Time of Day Filter - Updated to match database values */}
              <div className="relative group">
                <label className="text-gray-700 font-medium text-sm block mb-2">Time of Day</label>
                <select
                  value={activeFilters.timeOfDay || 'all'}
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none transition-all duration-200"
                  onChange={(e) => setActiveFilters({ ...activeFilters, timeOfDay: e.target.value })}
                >
                  <option value="all">Any Time</option>
                  <option value="day">Day</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                  <option value="varies">Varies</option>
                </select>
              </div>

              {/* Advanced Filters Dropdown - Updated to show selected filters */}
              <div className="relative group">
                <label className="text-gray-700 font-medium text-sm block mb-2">Advanced Filters</label>
                <div className="w-full">
                  <button 
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} 
                    className="w-full flex justify-between items-center pl-4 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-700 font-medium transition-all duration-200"
                  >
                    <span className="truncate">{getSelectedFiltersText()}</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 ml-2 flex-shrink-0 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {showAdvancedFilters && (
                    <div className="absolute z-40 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                      <div className="p-3 border-b border-gray-200">
                        <h3 className="font-medium text-gray-700">Categories</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {filterOptions.categories.map((category) => (
                            <button
                              key={category}
                              onClick={() => handleFilterChange('categories', category, !selectedFilters.categories.includes(category))}
                              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                selectedFilters.categories.includes(category)
                                  ? 'bg-rose-100 text-rose-700 font-medium'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-3 border-b border-gray-200">
                        <h3 className="font-medium text-gray-700">Location Types</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {filterOptions.locationTypes.map((type) => (
                            <button
                              key={type}
                              onClick={() => handleFilterChange('locationTypes', type, !selectedFilters.locationTypes.includes(type))}
                              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                selectedFilters.locationTypes.includes(type)
                                  ? 'bg-rose-100 text-rose-700 font-medium'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-3 border-b border-gray-200">
                        <h3 className="font-medium text-gray-700">Location Settings</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {filterOptions.locationSettings.map((setting) => (
                            <button
                              key={setting}
                              onClick={() => handleFilterChange('locationSettings', setting, !selectedFilters.locationSettings.includes(setting))}
                              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                selectedFilters.locationSettings.includes(setting)
                                  ? 'bg-rose-100 text-rose-700 font-medium'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {setting}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-3 border-b border-gray-200">
                        <h3 className="font-medium text-gray-700">Mood Paces</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {filterOptions.moodPaces.map((pace) => (
                            <button
                              key={pace}
                              onClick={() => handleFilterChange('moodPaces', pace, !selectedFilters.moodPaces.includes(pace))}
                              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                selectedFilters.moodPaces.includes(pace)
                                  ? 'bg-rose-100 text-rose-700 font-medium'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {pace}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-3">
                        <h3 className="font-medium text-gray-700">Mood Vibes</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {filterOptions.moodVibes.map((vibe) => (
                            <button
                              key={vibe}
                              onClick={() => handleFilterChange('moodVibes', vibe, !selectedFilters.moodVibes.includes(vibe))}
                              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                selectedFilters.moodVibes.includes(vibe)
                                  ? 'bg-rose-100 text-rose-700 font-medium'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {vibe}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Clear Filters and Filters Applied Indicator */}
              <div className="relative group flex items-center space-x-2">
                <button
                  onClick={clearAllFilters}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-xl font-medium transition-all duration-200"
                >
                  Clear
                </button>
                <div className="text-gray-700 font-medium">
                  {appliedFiltersCount} Filter{appliedFiltersCount !== 1 ? 's' : ''} Applied
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="h-96 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-72"></div>
              ))}
            </div>
          ) : (
            <>
              {/* {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                  <p>Data stats: {filteredDateIdeas.length} filtered ideas, {allDateIdeas.length} total ideas</p>
                  <p>Active filters: {JSON.stringify(selectedFilters)}</p>
                </div>
              )} */}
              
              <GridView
                dateIdeas={(filteredDateIdeas.length > 0 ? filteredDateIdeas : allDateIdeas).map(idea => ({
                  id: idea.id,
                  title: idea.title,
                  category: idea.category || '',
                  location: idea.location || '',
                  description: idea.description || '',
                  slug: idea.slug,
                  image: idea.image || '/placeholder.svg?height=300&width=400',
                  timeOfDay: idea.timeOfDay || '',
                  mood: idea.mood || '',
                  priceLevel: idea.priceLevel,
                  tips: idea.tips || '',
                  longDescription: idea.longDescription || '',
                }))}
                dateIdeaImages={allDateIdeaImages}
                visibleIdeas={visibleIdeas}
                onLoadMore={loadMoreIdeas}
                filterOptions={filterOptions}
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
              />
            </>
          )}
        </div>

        {showScrollButton && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-10 right-10 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 z-50"
            aria-label="Scroll to top"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Fresh Date Ideas Every Week</h2>
            <p className="text-gray-600 mb-6">Subscribe to receive the latest date night ideas and relationship tips delivered to your inbox.</p>
            <iframe
              src="https://embeds.beehiiv.com/724c50db-5cf6-4dc9-a783-2b7c0fd5eaed?slim=true"
              data-test-id="beehiiv-embed"
              height="52"
              frameBorder="0"
              scrolling="no"
              style={{ margin: 0, borderRadius: 0, backgroundColor: 'transparent', width: '100%' }}
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl shadow-xl">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Your Favorite Date Ideas</h2>
          <div className="max-w-6xl mx-auto">
            {favoritesLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
              </div>
            ) : favoritesError ? (
              <div className="text-center py-12 rounded-2xl backdrop-blur-sm">
                <p className="text-red-600 mb-4">Unable to load favorites</p>
                <p className="text-gray-600">Please try again later</p>
              </div>
            ) : recentFavorites.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {recentFavorites.map((favorite) => (
                    <Link href={`/date-idea/${favorite.slug}`} key={favorite.id} className="group">
                      <div key={favorite.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="relative h-48">
                          <Image
                            src={allDateIdeaImages[favorite.slug] || '/placeholder.jpg'}
                            alt={favorite.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2">{favorite.title}</h3>
                          <p className="text-gray-600 text-sm line-clamp-2">{favorite.description}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="text-center">
                  <Link href="/favorites" className="bg-rose-600 text-white px-8 py-4 rounded-full hover:bg-rose-700 transition-colors font-semibold shadow-md">
                    View All Favorites
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-12 rounded-2xl backdrop-blur-sm">
                <p className="text-lg text-gray-700 mb-6 px-8">
                  Start saving your favorite date ideas to create your perfect date night collection.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl shadow-lg overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-8 text-center">
                <h2 className="text-2xl font-extrabold mb-4">Date Night Calendar</h2>
                <p className="text-lg mb-6 px-4">Plan and schedule your upcoming dates. Share your calendar with your partner.</p>
                <Link href="/calendar" className="bg-white text-purple-700 px-6 py-3 rounded-full hover:bg-purple-100 transition-colors font-semibold shadow-md">
                  Open Calendar
                </Link>
              </div>
            </div>

            <div className="rounded-3xl shadow-xl overflow-hidden">
              <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 p-8 text-center">
                <div className="backdrop-blur-sm rounded-2xl py-6">
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Need Date Night Inspiration?</h2>
                  <p className="text-lg text-gray-700 mb-6 px-4">Let our Date Idea Generator surprise you with the perfect date based on your preferences.</p>
                  <Link href="/date-idea-generator" className="bg-rose-600 text-white px-6 py-3 rounded-full hover:bg-rose-700 transition-colors font-semibold shadow-md">
                    Generate Date Idea
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-2xl shadow-lg overflow-hidden">
              <div className="h-full bg-gray-800 text-white p-8 text-center">
                <h2 className="text-2xl font-extrabold mb-4">Date Ideas Near Me</h2>
                <p className="text-lg mb-6 px-4">Discover local date night spots and activities perfect for couples in your area!</p>
                <Link href="/date-ideas-near-me" className="bg-white text-gray-800 px-6 py-3 rounded-full hover:bg-gray-200 transition-colors font-semibold shadow-md">
                  Find Local Dates
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}