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
    price: 'all' | 'free' | 'under-25' | 'under-50' | 'under-100' | '100-plus';
    timeOfDay?: string;
    mood?: string;
    experienceType?: string;
    duration?: string;
    setting?: string;
  }>({ city: null, price: 'all' });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

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

    const today = new Date().toISOString().split('T')[0];
    const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);

    const shuffledIdeas = [...allDateIdeas].sort((a, b) => {
      const randomA = Math.sin(seed + a.id) * 10000 % 1;
      const randomB = Math.sin(seed + b.id) * 10000 % 1;
      return randomA - randomB;
    });

    if (JSON.stringify(shuffledIdeas.map(i => i.id)) !== JSON.stringify(allDateIdeas.map(i => i.id))) {
      setAllDateIdeas(shuffledIdeas);
    }
  }, []);

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
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      const filterArray = newFilters[filterType as keyof typeof newFilters];
      
      if (isChecked) {
        if (!filterArray.includes(value)) {
          newFilters[filterType as keyof typeof newFilters] = [...filterArray, value];
        }
      } else {
        newFilters[filterType as keyof typeof newFilters] = filterArray.filter(v => v !== value);
      }
      
      return newFilters;
    });
  };

  useEffect(() => {
    if (!allDateIdeas.length) return;

    console.log('Applying filters:', selectedFilters);
    
    const newFilteredIdeas = allDateIdeas.filter((idea) => {
      let matchesFilter = true;

      if (activeFilters.city) {
        if (typeof idea.location === 'string' && idea.location) {
          matchesFilter = matchesFilter && 
            idea.location.toLowerCase().includes(activeFilters.city.toLowerCase());
        } else if (typeof idea.location === 'object' && idea.location?.city) {
          matchesFilter = matchesFilter && 
            idea.location.city.toLowerCase().includes(activeFilters.city.toLowerCase());
        } else {
          matchesFilter = matchesFilter && true;
        }
      }

      if (activeFilters.price !== 'all') {
        const priceLevel = idea.priceLevel || 1;

        switch (activeFilters.price) {
          case 'free':
            matchesFilter = matchesFilter && priceLevel === 1;
            break;
          case 'under-25':
            matchesFilter = matchesFilter && priceLevel <= 2;
            break;
          case 'under-50':
            matchesFilter = matchesFilter && priceLevel <= 3;
            break;
          case 'under-100':
            matchesFilter = matchesFilter && priceLevel <= 4;
            break;
          case '100-plus':
            matchesFilter = matchesFilter && priceLevel >= 5;
            break;
        }
      }

      if (activeFilters.timeOfDay && activeFilters.timeOfDay !== 'all') {
        matchesFilter = matchesFilter && idea.timeOfDay === activeFilters.timeOfDay;
      }

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

      return matchesFilter;
    });

    console.log('Filtered date ideas count:', newFilteredIdeas.length);

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
            {/* Basic Filters */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative group">
                  <label className="text-gray-700 font-medium text-sm block mb-2">Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPinIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={activeFilters.city || ''}
                      placeholder="Enter a city or area"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all duration-200"
                      onChange={(e) => setActiveFilters({ ...activeFilters, city: e.target.value })}
                    />
                    {activeFilters.city && (
                      <button
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setActiveFilters({ ...activeFilters, city: null })}
                      >
                        <span className="text-gray-400 hover:text-gray-600">✕</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative group">
                  <label className="text-gray-700 font-medium text-sm block mb-2">Price Range</label>
                  <select
                    value={activeFilters.price}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none transition-all duration-200"
                    onChange={(e) => setActiveFilters({ ...activeFilters, price: e.target.value as typeof activeFilters.price })}
                  >
                    <option value="all">All Prices</option>
                    <option value="free">Free</option>
                    <option value="under-25">Under $25</option>
                    <option value="under-50">Under $50</option>
                    <option value="under-100">Under $100</option>
                    <option value="100-plus">$100+</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 pt-6 text-gray-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="relative group">
                  <label className="text-gray-700 font-medium text-sm block mb-2">Time of Day</label>
                  <select
                    value={activeFilters.timeOfDay || 'all'}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none transition-all duration-200"
                    onChange={(e) => setActiveFilters({ ...activeFilters, timeOfDay: e.target.value })}
                  >
                    <option value="all">Any Time</option>
                    <option value="day">Day Date</option>
                    <option value="night">Night Date</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 pt-6 text-gray-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="relative group">
                  <label className="text-gray-700 font-medium text-sm block mb-2">Mood</label>
                  <select
                    value={activeFilters.mood || 'all'}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none transition-all duration-200"
                    onChange={(e) => setActiveFilters({ ...activeFilters, mood: e.target.value })}
                  >
                    <option value="all">Any Mood</option>
                    <option value="adventurous">Adventurous</option>
                    <option value="cozy">Cozy</option>
                    <option value="low-effort">Low Effort</option>
                    <option value="romantic">Romantic</option>
                    <option value="fun">Fun</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 pt-6 text-gray-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">Advanced Filters</span>
              </div>
            </div>
            
            {/* Advanced Filters Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* New Dropdown for Experience Type */}
              <div className="relative group">
                <label className="text-gray-700 font-medium text-sm block mb-2">Experience Type</label>
                <select
                  value={activeFilters.experienceType || 'all'}
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none transition-all duration-200"
                  onChange={(e) => setActiveFilters({ ...activeFilters, experienceType: e.target.value })}
                >
                  <option value="all">All Experiences</option>
                  <option value="active">Active</option>
                  <option value="cultural">Cultural</option>
                  <option value="culinary">Food & Drink</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="learning">Learning Together</option>
                  <option value="adventure">Adventure</option>
                  <option value="relaxing">Relaxing</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 pt-6 text-gray-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {/* Duration Filter */}
              <div className="relative group">
                <label className="text-gray-700 font-medium text-sm block mb-2">Duration</label>
                <select
                  value={activeFilters.duration || 'all'}
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none transition-all duration-200"
                  onChange={(e) => setActiveFilters({ ...activeFilters, duration: e.target.value })}
                >
                  <option value="all">Any Length</option>
                  <option value="quick">Quick (Under 1 hour)</option>
                  <option value="medium">Medium (1-3 hours)</option>
                  <option value="half-day">Half-day (3-5 hours)</option>
                  <option value="full-day">Full Day</option>
                  <option value="weekend">Weekend</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 pt-6 text-gray-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {/* Setting Filter */}
              <div className="relative group">
                <label className="text-gray-700 font-medium text-sm block mb-2">Setting</label>
                <select
                  value={activeFilters.setting || 'all'}
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none transition-all duration-200"
                  onChange={(e) => setActiveFilters({ ...activeFilters, setting: e.target.value })}
                >
                  <option value="all">Any Setting</option>
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="urban">Urban</option>
                  <option value="nature">Nature</option>
                  <option value="waterfront">Waterfront</option>
                  <option value="scenic">Scenic Views</option>
                  <option value="cozy">Cozy</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 pt-6 text-gray-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Clear Filters Button */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => {
                  // Toggle advanced filter visibility
                  setShowAdvancedFilters(prev => !prev);
                }}
                className="text-rose-600 hover:text-rose-800 font-medium text-sm flex items-center transition-colors duration-200"
              >
                {showAdvancedFilters ? (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Hide Advanced Filters
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Show Advanced Filters
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  setActiveFilters({ 
                    city: null, 
                    price: 'all', 
                    timeOfDay: 'all', 
                    mood: 'all',
                    experienceType: 'all',
                    duration: 'all',
                    setting: 'all'
                  });
                  setSelectedFilters({
                    categories: [],
                    locationTypes: [],
                    locationSettings: [],
                    moodPaces: [],
                    moodVibes: []
                  });
                }}
                className="bg-rose-100 text-rose-700 hover:bg-rose-200 px-4 py-2 rounded-lg font-medium text-sm flex items-center transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear All Filters
              </button>
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
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                  <p>Data stats: {filteredDateIdeas.length} filtered ideas, {allDateIdeas.length} total ideas</p>
                  <p>Active filters: {JSON.stringify(selectedFilters)}</p>
                </div>
              )}
              
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