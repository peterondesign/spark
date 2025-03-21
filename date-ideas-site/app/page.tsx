"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeartIcon, MapPinIcon, SearchIcon, StarIcon } from "./components/icons";
import SaveButton from "./components/SaveButton";
import { getImageUrl } from "./utils/imageService";
import { supabase } from "../utils/supabaseClient";
import AdvancedSearchModal from "./components/AdvancedSearchModal"; // Import the new component
import ViewModeSelector, { ViewMode } from "./components/ViewModeSelector"; // Import the ViewModeSelector
import GridView from "./components/GridView"; // Import the GridView component
import TinderSwipeView from "./components/TinderSwipeView"; // Import the TinderSwipeView component
import TikTokFeedView from "./components/TikTokFeedView"; // Import the TikTokFeedView component
import Header from "./components/Header"; // Import the Header component
import Footer from "./components/Footer";

// Define DateIdea type
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
  idealFor?: string;
  relatedDateIdeas?: string[];
  longDescription?: string;
}


export default function Home() {
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [topDateIdeaImages, setTopDateIdeaImages] = useState<Record<string, string>>({});
  const [allDateIdeas, setAllDateIdeas] = useState<DateIdea[]>([]);
  const [allDateIdeaImages, setAllDateIdeaImages] = useState<Record<string, string>>({});
  const [visibleIdeas, setVisibleIdeas] = useState<number>(20);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // State to control modal visibility
  const [viewMode, setViewMode] = useState<ViewMode>('grid'); // Add state for view mode
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false); // State for scroll to top button

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
          const allIdeaImagesPromises = data.map(async (idea: { slug: string; image: string | { url?: string; } | undefined; title: string; category: string; }) => ({
            [idea.slug]: await getImageUrl(idea.image, `${idea.title} ${idea.category}`, 400, 300),
          }));

          const allIdeaImagesResolved = Object.assign({}, ...(await Promise.all(allIdeaImagesPromises)));
          setAllDateIdeaImages(allIdeaImagesResolved);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching date ideas:', error);
        setLoading(false);
      }
    };

    const loadImages = async () => {
      // Load hero image
      const heroImg = await getImageUrl("/", "romantic couple date", 1920, 500);
      setHeroImageUrl(heroImg);
    };

    loadImages();
    fetchDateIdeas();
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

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    // Reset visible ideas when switching view modes
    if (mode === 'swipe') {
      // For swipe mode, we don't need pagination
      setVisibleIdeas(allDateIdeas.length);
    } else {
      setVisibleIdeas(20);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Render the AdvancedSearchModal component */}
      <AdvancedSearchModal isOpen={isModalOpen} onClose={closeModal} onSearch={handleSearch} />
      <Header />

      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/80 to-purple-600/80 z-10"></div>
        <div className="relative h-[500px]">
          {heroImageUrl && (
            <Image
              src={heroImageUrl}
              alt="Couple on a date"
              width={1920}
              height={500}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-6">Find your perfect date</h1>
          <p className="text-xl md:text-2xl text-center mb-8 max-w-2xl">
            Discover unique and memorable date ideas tailored just for you
          </p>

          {/* Personalize Button */}
          <div className="mt-6">
            <Link
              href="/preferences"
              className="bg-white text-rose-500 hover:bg-gray-100 px-6 py-3 rounded-full font-medium transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Personalize Your Experience
            </Link>
          </div>
        </div>
      </section>

      {/* All Date Ideas Section */}
      <section className="py-12" id="all-date-ideas">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8 bg-white z-50 sticky top-0 z-30 py-4 px-2">
            <h2 className="text-3xl font-bold text-gray-800">Browse All Date Ideas</h2>
            <div className="flex items-center space-x-4">
              <ViewModeSelector activeMode={viewMode} onChange={handleViewModeChange} />
              <button onClick={openModal} className="text-rose-500 hover:text-rose-600 font-medium">
                Advanced Search
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-rose-500 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading date ideas...</p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' && (
                <GridView
                  dateIdeas={allDateIdeas}
                  dateIdeaImages={allDateIdeaImages}
                  visibleIdeas={visibleIdeas}
                  onLoadMore={loadMoreIdeas}
                />
              )}

              {viewMode === 'swipe' && (
                <TinderSwipeView
                  dateIdeas={allDateIdeas}
                  dateIdeaImages={allDateIdeaImages}
                />
              )}

              {viewMode === 'feed' && (
                <TikTokFeedView
                  dateIdeas={allDateIdeas}
                  dateIdeaImages={allDateIdeaImages}
                  visibleIdeas={visibleIdeas}
                  onLoadMore={loadMoreIdeas}
                />
              )}
            </>
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

      {/* Spark Choice Section */}
      <section className="py-12 bg-gradient-to-r from-rose-500 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <div className="inline-block bg-white/20 rounded-lg px-3 py-1 text-sm mb-4">Spark Choice</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Best of the Best Date Ideas</h2>
              <p className="text-lg mb-6 opacity-90">
                Our top picks of romantic, fun, and unique date experiences—curated with love by our community of date
                enthusiasts.
              </p>
              <Link
                href="/Spark-choice"
                className="inline-block bg-white text-rose-500 hover:bg-gray-100 px-6 py-3 rounded-full font-medium transition-colors"
              >
                See the winners
              </Link>
            </div>
            <div className="md:w-1/2">
              <div className="relative h-80 rounded-lg overflow-hidden">
                {heroImageUrl && (
                  <Image
                    src={heroImageUrl}
                    alt="Couple enjoying a date"
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      {/* This AdvancedSearchModal is already rendered above */}
    </div>
  );
}