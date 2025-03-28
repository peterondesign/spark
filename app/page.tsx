"use client";

import { useState, useEffect } from "react";
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
import { favoritesService, FavoritesError, DateIdea } from './services/favoritesService';
import FilterButtons from "./components/FilterButtons";
import Head from 'next/head';

// Removed metadata export as it's not allowed in client components

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
  const [activeFilters, setActiveFilters] = useState<{
    city: string | null;
    price: 'all' | 'free' | 'under-25' | 'under-50' | 'under-100' | '100-plus';
  }>({ city: null, price: 'all' });

  useEffect(() => {
    const fetchDateIdeas = async () => {
      try {
        const { data, error } = await supabase
          .from('date_ideas')
          .select('*');

        if (error) {
          console.error("Supabase Error:", error); // Log the full error object
          throw error;
        }

        setAllDateIdeas(data || []);

        // Load images for all date ideas
        if (data) {
          // Split data into initial high-priority batch and remaining items
          const initialBatchSize = 8;
          const initialBatch = data.slice(0, initialBatchSize);
          const remainingBatch = data.slice(initialBatchSize);

          // Load the initial batch with higher priority
          await loadImagesForBatch(initialBatch);

          // Then load the remaining images in the background
          loadImagesForBatch(remainingBatch);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching date ideas:', error);
        setLoading(false);
      }
    };

    const loadImages = async () => {
      // Load hero image with priority
      const heroImg = await getImageUrl("/", "romantic couple date", 1920, 500);
      setHeroImageUrl(heroImg);
    };

    // Start both loading processes in parallel
    loadImages();
    fetchDateIdeas();
  }, []);

  useEffect(() => {
    // Sync favorites on page load
    favoritesService.syncFavorites().catch(error =>
      console.warn('Failed to sync favorites:', error)
    );

    const fetchRecentFavorites = async () => {
      setFavoritesLoading(true);
      setFavoritesError(null);
      try {
        // First check local storage for favorites
        let favorites: DateIdea[] = [];

        if (typeof window !== 'undefined') {
          try {
            const savedIdeas = localStorage.getItem('savedDateIdeas');
            if (savedIdeas) {
              const parsedIdeas = JSON.parse(savedIdeas) as DateIdea[];
              favorites = parsedIdeas.slice(0, 3); // Get only the 3 most recent
            }
          } catch (localStorageError) {
            console.warn('Error accessing localStorage:', localStorageError);
            // Continue execution even if localStorage fails
          }
        }

        // If we have local favorites, use them
        if (favorites.length > 0) {
          setRecentFavorites(favorites);
        } else {
          // Otherwise try to get from service (which now tries localStorage first anyway)
          // Wrap in try/catch to ensure we handle any service errors
          try {
            const serviceFavorites = await favoritesService.getRecentFavorites();
            setRecentFavorites(serviceFavorites);
          } catch (serviceError) {
            console.warn('Error from favorites service:', serviceError);
            // Don't set an error state here - just use empty array
            setRecentFavorites([]);
          }
        }
      } catch (error) {
        console.error('Error in fetchRecentFavorites:', error);
        // Set general error message but don't expose details to UI
        setFavoritesError('Unable to load favorites');
      } finally {
        setFavoritesLoading(false);
      }
    };

    fetchRecentFavorites();
  }, []);

  useEffect(() => {
    // Function to check scroll position and show/hide button
    const handleScroll = () => {
      // Show button when user scrolls down 500px or more
      if (window.scrollY > 500) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Add location detection effect
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

  // Add effect to filter date ideas when filters or data changes
  useEffect(() => {
    if (!allDateIdeas.length) return;
    
    const newFilteredIdeas = allDateIdeas.filter((idea) => {
      let matchesFilter = true;
      
      // Filter by city if a city is selected
      if (activeFilters.city) {
        matchesFilter = matchesFilter && 
          idea.location.toLowerCase().includes(activeFilters.city.toLowerCase());
      }
      
      // Filter by price range
      if (activeFilters.price !== 'all') {
        const priceLevel = idea.priceLevel || 1; // Default to 1 if not specified
        
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
      
      return matchesFilter;
    });
    
    setFilteredDateIdeas(newFilteredIdeas);
    setVisibleIdeas(20); // Reset to first page when filters change
  }, [allDateIdeas, activeFilters]);

  // Function to scroll to the top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const loadMoreIdeas = () => {
    setVisibleIdeas(prev => prev + 20);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSearch = (filters: any) => {
    setLoading(true);

    // Filter date ideas based on the provided filters
    const filteredIdeas = allDateIdeas.filter((idea) => {
      let matches = true;

      // Filter by category if specified
      if (filters.category && filters.category !== "all") {
        matches = matches && idea.category === filters.category;
      }

      // Filter by price level if specified
      if (filters.priceLevel && filters.priceLevel !== "all") {
        // Convert string price level to number for comparison
        const priceLevelNum = parseInt(filters.priceLevel);
        matches = matches && idea.priceLevel === priceLevelNum;
      }

      // Filter by location if specified
      if (filters.location && filters.location.trim() !== "") {
        matches = matches && idea.location.toLowerCase().includes(filters.location.toLowerCase());
      }

      // Filter by search term (in title or description)
      if (filters.searchTerm && filters.searchTerm.trim() !== "") {
        const term = filters.searchTerm.toLowerCase();
        const titleMatch = idea.title.toLowerCase().includes(term);
        const descMatch = idea.description.toLowerCase().includes(term);
        matches = matches && (titleMatch || descMatch);
      }

      // Filter by idealFor if specified
      if (filters.idealFor && filters.idealFor !== "all") {
        matches = matches && idea.idealFor === filters.idealFor;
      }

      // Filter by duration if specified
      if (filters.duration && filters.duration !== "all") {
        matches = matches && idea.duration === filters.duration;
      }

      return matches;
    });

    // Update state with filtered ideas
    setAllDateIdeas(filteredIdeas);
    // Reset the number of visible ideas
    setVisibleIdeas(20);
    setLoading(false);

    // Close the modal after search
    closeModal();
  };

  const loadImagesForBatch = async (ideas: DateIdea[]) => {
    // Process in small batches to avoid overwhelming the browser
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

      // Small delay to let the browser breathe between batches
      if (i + batchSize < ideas.length) {
        await new Promise(r => setTimeout(r, 100));
      }
    }
  };

  const clearUserCity = () => {
    localStorage.removeItem("userCity");
    setUserCity(null);
  };

  const handleFilterChange = (filters: { 
    city: string | null; 
    price: 'all' | 'free' | 'under-25' | 'under-50' | 'under-100' | '100-plus'
  }) => {
    setActiveFilters(filters);
  };

  // Schema markup for search engines
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
      {/* Render the AdvancedSearchModal component */}
      <AdvancedSearchModal isOpen={isModalOpen} onClose={closeModal} onSearch={handleSearch} />
      <Header />

      {/* Hero Section */}
      <section className="relative">
        <div className="bg-gradient-to-r from-rose-800/80 to-purple-800/80 h-[320px] w-full"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-6">Date Ideas Near You
          </h1>
          <p className="text-3xl">Personalised for you and your person</p>
        </div>
      </section>
      
      {/* All Date Ideas Section */}
      <section className="py-12" id="all-date-ideas">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 bg-white z-50 sticky top-0 z-30 py-4 px-2">
            <h2 className="text-3xl font-bold text-gray-800">Browse Date Night Ideas</h2>
            <div className="flex items-center space-x-4">
              <button onClick={openModal} className="text-rose-500 hover:text-rose-600 font-medium">
                Advanced Search
              </button>
            </div>
          </div>

          {/* Filter Buttons */}
          <FilterButtons 
            currentCity={userCity} 
            clearCity={clearUserCity} 
            onFilterChange={handleFilterChange} 
          />

          {loading ? (
            <div className="h-96 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-72"></div>
              ))}
            </div>
          ) : (
            <GridView
              dateIdeas={filteredDateIdeas.length > 0 ? filteredDateIdeas : allDateIdeas}
              dateIdeaImages={allDateIdeaImages}
              visibleIdeas={visibleIdeas}
              onLoadMore={loadMoreIdeas}
            />
          )}
        </div>

        {/* Scroll To Top Button */}
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

      {/* Newsletter Section */}
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
      
      {/* Favorites Section */}
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

      {/* New Sections as Cards in a Row */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Shared Date Calendar Card */}
        <div className="rounded-2xl shadow-lg overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-8 text-center">
            <h2 className="text-2xl font-extrabold mb-4">Date Night Calendar</h2>
            <p className="text-lg mb-6 px-4">Plan and schedule your upcoming dates. Share your calendar with your partner.</p>
            <Link href="/calendar" className="bg-white text-purple-700 px-6 py-3 rounded-full hover:bg-purple-100 transition-colors font-semibold shadow-md">
          Open Calendar
            </Link>
          </div>
        </div>

        {/* Date Idea Generator Card */}
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

        {/* Local Date Ideas Card */}
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