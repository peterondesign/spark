"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Filter, X, ExternalLink, Heart } from 'lucide-react';
import { useTheme } from 'next-themes';
import { getImageUrl } from '../utils/imageService';
import SaveButton from '../components/SaveButton';
import Link from 'next/link';

// Import sections
import Header from '../components/sections/Header';
import Footer from '../components/sections/Footer';

// Import theme provider  
import { ThemeProvider } from '@/components/theme-provider';

interface DateIdea {
  id: string;
  title: string;
  category: string;
  image?: string;
  slug?: string;
  timeOfDay?: string;
  mood?: string | object;
  priceLevel?: string;
  description?: string;
  location?: string | object;
  date?: string;
  time?: string;
  price?: string;
  website?: string;
  venue?: string;
  tips?: string;
  longDescription?: string;
  trending?: boolean;
}

const FavoritesContent = () => {
  const { theme } = useTheme();
  const [dateIdeas, setDateIdeas] = useState<DateIdea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<DateIdea[]>([]);
  const [dateIdeaImages, setDateIdeaImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [visibleIdeas, setVisibleIdeas] = useState(24);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string>("");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedPriceLevel, setSelectedPriceLevel] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  // Fetch saved favorites from localStorage
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        
        // Get saved ideas from localStorage
        const savedIdeas = localStorage.getItem("savedDateIdeas");
        const favoriteIdeas = savedIdeas ? JSON.parse(savedIdeas) : [];
        
        setDateIdeas(favoriteIdeas);
        setFilteredIdeas(favoriteIdeas);

        // Fetch images for the date ideas
        if (favoriteIdeas && favoriteIdeas.length > 0) {
          const imagePromises = favoriteIdeas.map(async (idea: any) => {
            try {
              // Ensure we have valid data before calling getImageUrl
              const title = idea?.title || 'date idea';
              const category = idea?.category || 'general';
              const imageUrl = await getImageUrl(
                idea?.image,
                `${title} ${category}`,
                400,
                300
              );
              return { [idea?.slug || idea?.id || 'default']: imageUrl };
            } catch (error) {
              console.error('Error fetching image for idea:', idea, error);
              return { [idea?.slug || idea?.id || 'default']: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' };
            }
          });

          const imageResults = await Promise.all(imagePromises);
          const imageMap = Object.assign({}, ...imageResults);
          setDateIdeaImages(imageMap);
        }
      } catch (error) {
        console.error("Error fetching favorite date ideas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleLoadMore = () => {
    setVisibleIdeas(prev => Math.min(prev + 24, filteredIdeas.length));
  };

  const clearAllFavorites = () => {
    setDateIdeas([]);
    setFilteredIdeas([]);
    setDateIdeaImages({});
    localStorage.removeItem("savedDateIdeas");
  };

  const removeFromFavorites = (ideaSlug: string) => {
    try {
      if (!ideaSlug) {
        console.warn('No slug provided for removal');
        return;
      }
      
      const updatedIdeas = dateIdeas.filter(idea => (idea?.slug || idea?.id) !== ideaSlug);
      setDateIdeas(updatedIdeas);
      setFilteredIdeas(updatedIdeas);
      localStorage.setItem("savedDateIdeas", JSON.stringify(updatedIdeas));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  // Filter functionality
  useEffect(() => {
    let filtered = [...dateIdeas];

    if (selectedTimeOfDay) {
      if (selectedTimeOfDay === 'Daytime') {
        filtered = filtered.filter(idea => 
          idea.timeOfDay === 'Morning' || 
          idea.timeOfDay === 'Afternoon' || 
          idea.timeOfDay === 'Varies'
        );
      } else if (selectedTimeOfDay === 'Nighttime') {
        filtered = filtered.filter(idea => 
          idea.timeOfDay === 'Evening' || 
          idea.timeOfDay === 'Night'
        );
      }
    }

    if (selectedLocation) {
      filtered = filtered.filter(idea => {
        if (typeof idea.location === 'string') {
          return idea.location.toLowerCase().includes(selectedLocation.toLowerCase());
        } else if (typeof idea.location === 'object' && idea.location !== null) {
          const locationObj = idea.location as any;
          const type = locationObj.type;
          const setting = locationObj.setting;
          
          return selectedLocation.toLowerCase() === type?.toLowerCase() || 
                 setting?.toLowerCase().includes(selectedLocation.toLowerCase());
        }
        return false;
      });
    }

    if (selectedMoods.length > 0) {
      filtered = filtered.filter(idea => {
        if (typeof idea.mood === 'string') {
          return selectedMoods.includes(idea.mood);
        } else if (typeof idea.mood === 'object' && idea.mood !== null) {
          const moodObj = idea.mood as any;
          const pace = moodObj.pace;
          const vibe = moodObj.vibe;
          
          return selectedMoods.some(selectedMood => 
            selectedMood.toLowerCase() === pace?.toLowerCase() || 
            selectedMood.toLowerCase() === vibe?.toLowerCase()
          );
        }
        return false;
      });
    }

    if (selectedPriceLevel) {
      filtered = filtered.filter(idea => idea.priceLevel === selectedPriceLevel);
    }

    setFilteredIdeas(filtered);
    setVisibleIdeas(24);
  }, [selectedTimeOfDay, selectedLocation, selectedMoods, selectedPriceLevel, dateIdeas]);

  const clearFilters = () => {
    setSelectedTimeOfDay("");
    setSelectedLocation("");
    setSelectedMoods([]);
    setSelectedPriceLevel("");
  };

  const hasActiveFilters = selectedTimeOfDay || selectedLocation || selectedMoods.length > 0 || selectedPriceLevel;

  return (
    <main className={`overflow-x-hidden min-h-screen ${theme === 'light' ? 'bg-white' : 'bg-[#212121]'}`}>
      <Header />
      
      <section
        className={`py-16 ${theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-50'}`}
        id="favorite-date-ideas"
      >
        <div className="container mt-16 mx-auto px-6">
          {/* Section Header with Filters and Clear All */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12">
            <div className='flex flex-col lg:flex-row lg:items-center gap-4'>
              <h2 className={`text-3xl md:text-4xl font-bold font-heading ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                YOUR FAVORITE DATE IDEAS
              </h2>
            </div>

            <div className="flex gap-4">
              {/* Clear All Button */}
              {dateIdeas.length > 0 && (
                <button
                  onClick={clearAllFavorites}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all duration-300 ${
                    theme === 'dark'
                      ? 'border-red-600 text-red-400 hover:bg-red-600 hover:text-white'
                      : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  <X className="w-5 h-5" />
                  Clear All
                </button>
              )}

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(true)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all duration-300 ${hasActiveFilters
                  ? 'bg-rose-500 text-white border-rose-500'
                  : theme === 'dark'
                    ? 'border-gray-600 text-white hover:border-rose-500'
                    : 'border-gray-300 text-gray-700 hover:border-rose-500'
                  }`}
              >
                <Filter className="w-5 h-5" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 bg-white text-rose-500 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    {[selectedTimeOfDay, selectedLocation, selectedMoods.length > 0 ? 'mood' : '', selectedPriceLevel].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Empty State */}
          {!loading && dateIdeas.length === 0 && (
            <div className="text-center py-16">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-rose-100'
              }`}>
                <Heart className={`h-10 w-10 ${theme === 'dark' ? 'text-gray-400' : 'text-rose-500'}`} />
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                No Saved Date Ideas Yet
              </h3>
              <p className={`text-lg mb-8 max-w-md mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                When you find date ideas you love, click the heart icon to save them here for easy access later.
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-medium transition-colors"
              >
                Discover Date Ideas
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          )}

          {/* Date Ideas Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className={`animate-pulse rounded-2xl h-64 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
                />
              ))}
            </div>
          ) : (
            <>
              {filteredIdeas.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                  {filteredIdeas.slice(0, visibleIdeas).map((idea) => (
                    <div
                      key={idea.slug || idea.id}
                      className={`group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer ${theme === 'dark'
                        ? 'bg-[#333333] border border-gray-700'
                        : 'bg-white border border-gray-200'
                        }`}
                      onClick={() => {
                        if (idea.website) {
                          window.open(idea.website, '_blank');
                        } else if (idea.slug) {
                          window.location.href = `/date-idea/${idea.slug}`;
                        }
                      }}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={dateIdeaImages[idea.slug || idea.id] || idea.image || 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'}
                          alt={idea.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        {/* Remove from favorites button */}
                        <div className="absolute top-3 right-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromFavorites(idea.slug || idea.id);
                            }}
                            className="p-2 bg-red-500 hover:bg-red-600 rounded-full backdrop-blur-sm transition-colors"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className={`text-lg font-semibold mb-2 group-hover:text-rose-400 transition-colors line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {String(idea.title || '')}
                        </h3>
                        
                        {idea.description && (
                          <p className={`text-sm line-clamp-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {idea.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {filteredIdeas.length > visibleIdeas && (
                <div className="text-center">
                  <button
                    onClick={handleLoadMore}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Load More
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Filter Modal */}
        {showFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl ${theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-white'}`}>
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Filter Favorites
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'text-gray-500'}`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Time of Day Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                    Time of Day
                  </label>
                  <select
                    value={selectedTimeOfDay}
                    onChange={(e) => setSelectedTimeOfDay(e.target.value)}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-[#333333] border-gray-600 text-white'
                      : 'bg-white text-gray-900'
                      }`}
                  >
                    <option value="">Any time</option>
                    <option value="Daytime">Daytime</option>
                    <option value="Nighttime">Nighttime</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                    Location Type
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-[#333333] border-gray-600 text-white'
                      : 'bg-white text-gray-900'
                      }`}
                  >
                    <option value="">Any location</option>
                    <option value="indoor">Indoor</option>
                    <option value="outdoor">Outdoor</option>
                  </select>
                </div>

                {/* Mood Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                    Mood (Select multiple)
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {[
                      { value: 'active', label: 'Active' },
                      { value: 'leisurely', label: 'Leisurely' }, 
                      { value: 'relaxed', label: 'Relaxed' },
                      { value: 'varied', label: 'Varied' },
                      { value: 'thrilling', label: 'Thrilling' },
                      { value: 'cozy', label: 'Cozy' },
                      { value: 'fun', label: 'Fun' },
                      { value: 'romantic', label: 'Romantic' }
                    ].map((mood) => (
                      <label key={mood.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedMoods.includes(mood.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMoods([...selectedMoods, mood.value]);
                            } else {
                              setSelectedMoods(selectedMoods.filter(m => m !== mood.value));
                            }
                          }}
                          className="rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                        />
                        <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                          {mood.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Level Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                    Price Level
                  </label>
                  <select
                    value={selectedPriceLevel}
                    onChange={(e) => setSelectedPriceLevel(e.target.value)}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-[#333333] border-gray-600 text-white'
                      : 'bg-white text-gray-900'
                      }`}
                  >
                    <option value="">Any price</option>
                    <option value="Affordable">Affordable</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 p-6 border-t border-gray-200">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className={`flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors ${theme === 'dark'
                      ? 'border-gray-600 text-white hover:bg-gray-700'
                      : ''
                      }`}
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 py-3 px-4 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
              <Footer />
      </section>  
    </main>
  );
};

export default function Favorites() {
  return (
    <ThemeProvider>
      <FavoritesContent />
    </ThemeProvider>
  );
}