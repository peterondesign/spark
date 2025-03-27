"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { HeartIcon, MapPinIcon, SearchIcon, StarIcon } from "@/app/components/icons";
import SaveButton from "@/app/components/SaveButton";
import { getImageUrl } from "@/app/utils/imageService";
import { supabase } from "@/utils/supabaseClient";
import AdvancedSearchModal from "@/app/components/AdvancedSearchModal";
import GridView from "@/app/components/GridView";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import PageTitle from "@/app/components/PageTitle";
import HowItWorksCarousel from "@/app/components/HowItWorksCarousel";
import { PAGE_TITLES } from "@/app/utils/titleUtils";
import { favoritesService, FavoritesError, DateIdea } from '@/app/services/favoritesService';
import FilterButtons from "@/app/components/FilterButtons";

export default function Page() {
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [allDateIdeas, setAllDateIdeas] = useState<DateIdea[]>([]);
  const [allDateIdeaImages, setAllDateIdeaImages] = useState<Record<string, string>>({});
  const [visibleIdeas, setVisibleIdeas] = useState<number>(20);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);
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

  // Schema markup for search engines - German version
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
        "url": `${typeof window !== 'undefined' ? window.location.origin : ''}/de/date-idea/${idea.slug}`,
        "location": {
          "@type": "Place",
          "name": idea.location,
          "address": idea.location
        },
        "offers": idea.priceLevel ? {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "EUR",
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
      <AdvancedSearchModal isOpen={isModalOpen} onClose={closeModal} onSearch={handleSearch} />
      <Header />
      
      {/* German Content */}
      <section className="relative">
        <div className="bg-gradient-to-r from-rose-800/80 to-purple-800/80 h-[320px] w-full"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-6">Willkommen bei Spark</h1>
          <p className="text-xl md:text-2xl text-center mb-8 max-w-2xl">
            Entdecken Sie einzigartige und unvergessliche Date-Ideen, die speziell für Sie erstellt wurden.
          </p>
        </div>
      </section>
      
      {/* Rest of the German content would go here */}
      
      <Footer />
    </div>
  );
}