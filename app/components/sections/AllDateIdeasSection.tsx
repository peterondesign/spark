"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Filter, X, ExternalLink } from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase } from '../../../utils/supabaseClient';
import { getImageUrl } from '../../utils/imageService';
import SaveButton from '../SaveButton';
import Link from 'next/link';
import CityPicker from '../CityPicker';

interface DateIdea {
  id: string;
  title: string;
  category: string;
  image?: string;
  slug?: string;
  timeOfDay?: string; // Match database schema
  mood?: string | object; // Can be JSON object like {"pace": "relaxed", "vibe": "rejuvenating"}
  priceLevel?: string; // Match database schema as text
  description?: string;
  location?: string | object; // Can be JSON object like {"type": "indoor", "setting": "clinic"}
  date?: string;
  time?: string;
  price?: string;
  website?: string;
  venue?: string;
  tips?: string;
  longDescription?: string;
  trending?: boolean;
}

const AllDateIdeasSection = () => {
  const { theme } = useTheme();
  const [selectedCity, setSelectedCity] = useState<string>("LISBON");
  const [dateIdeas, setDateIdeas] = useState<DateIdea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<DateIdea[]>([]);
  const [dateIdeaImages, setDateIdeaImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [visibleIdeas, setVisibleIdeas] = useState(24); // Increased from 12 to show more initially

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string>("");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]); // Changed to array for multiselect
  const [selectedPriceLevel, setSelectedPriceLevel] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  // Fetch date ideas from both Supabase and city events
  useEffect(() => {
    const fetchAllIdeas = async () => {
      try {
        setLoading(true);
        
        // Fetch from Supabase - get all date ideas and randomize
        const { data: supabaseData, error } = await supabase
          .from('date_ideas')
          .select('*')
          .limit(250); // Increased to get all available date ideas

        if (error) {
          console.error("Error fetching date ideas:", error);
        }

        // Fetch city events from Perplexity API
        const cityResponse = await fetch(`/api/perplexity-city-events?city=${encodeURIComponent(selectedCity)}`);
        let cityEvents = [];
        
        if (cityResponse.ok) {
          const cityData = await cityResponse.json();
          cityEvents = cityData.events || [];
        }

        // Fisher-Yates shuffle algorithm for better randomization
        const shuffleArray = (array: any[]) => {
          const shuffled = [...array];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          return shuffled;
        };

        // Combine both sources
        const supabaseIdeas = supabaseData ? shuffleArray(supabaseData).map((item: any) => ({
          ...item,
          timeOfDay: item.timeOfDay || item.time_of_day, // Handle both naming conventions
          priceLevel: item.priceLevel || item.price_level, // Handle both naming conventions
        })) : [];
        
        // Shuffle city events too
        const shuffledCityEvents = shuffleArray(cityEvents).map((event: any) => ({
          id: event.id,
          title: event.title,
          category: event.category,
          image: event.image,
          slug: event.id, // Use ID as slug for city events
          description: event.description,
          location: event.location,
          date: event.date,
          time: event.time,
          price: event.price,
          website: event.website,
          venue: event.venue
        }));
        
        // Combine and shuffle the final array
        const combinedIdeas = shuffleArray([
          ...shuffledCityEvents,
          ...supabaseIdeas
        ]);

        setDateIdeas(combinedIdeas);
        setFilteredIdeas(combinedIdeas);

        // Fetch images for the date ideas
        if (combinedIdeas && combinedIdeas.length > 0) {
          const imagePromises = combinedIdeas.map(async (idea) => {
            const imageUrl = await getImageUrl(
              idea.image,
              `${idea.title} ${idea.category} ${selectedCity}`,
              400,
              300
            );
            return { [idea.slug || idea.id]: imageUrl };
          });

          const imageResults = await Promise.all(imagePromises);
          const imageMap = Object.assign({}, ...imageResults);
          setDateIdeaImages(imageMap);
        }
      } catch (error) {
        console.error("Error fetching date ideas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllIdeas();
  }, [selectedCity]); // Now it responds to city changes!

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setVisibleIdeas(24); // Reset to show more ideas initially
    // Clear existing data when city changes
    setDateIdeas([]);
    setFilteredIdeas([]);
    setDateIdeaImages({});
  };

  const handleLoadMore = () => {
    setVisibleIdeas(prev => Math.min(prev + 24, filteredIdeas.length)); // Load 24 more at a time
  };

  // Filter functionality with accurate field matching based on real database data
  useEffect(() => {
    let filtered = [...dateIdeas];

    if (selectedTimeOfDay) {
      // Map user-friendly options to database values
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
          // Handle JSON location objects like {"type": "indoor", "setting": "varied"}
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
          // Handle JSON mood objects from database like {"pace": "active", "vibe": "thrilling"}
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
    setVisibleIdeas(24); // Reset to show more ideas when filters change
  }, [selectedTimeOfDay, selectedLocation, selectedMoods, selectedPriceLevel, dateIdeas]);

  const clearFilters = () => {
    setSelectedTimeOfDay("");
    setSelectedLocation("");
    setSelectedMoods([]);
    setSelectedPriceLevel("");
  };

  const hasActiveFilters = selectedTimeOfDay || selectedLocation || selectedMoods.length > 0 || selectedPriceLevel;

  return (
    <section
      className={`py-16 ${theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-50'}`}
      id="all-date-ideas"
    >
      <div className="container mx-auto px-6">
        {/* Section Header with City Selector and Filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12">
          <div className='flex flex-col lg:flex-row lg:items-center gap-4'>
            <h2 className={`text-3xl md:text-4xl font-bold font-heading ${theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
              ALL DATE IDEAS IN
            </h2>

            <CityPicker
              selectedCity={selectedCity}
              onCityChange={handleCityChange}
              loading={loading}
            />
          </div>

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

        {/* Date Ideas Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(24)].map((_, i) => (
              <div
                key={i}
                className={`animate-pulse rounded-2xl h-64 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {filteredIdeas.slice(0, visibleIdeas).map((idea) => (
                <div
                  key={idea.id}
                  className={`group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer ${theme === 'dark'
                    ? 'bg-[#333333] border border-gray-700'
                    : 'bg-white border border-gray-200'
                    }`}
                  onClick={() => {
                    // Handle city events vs regular date ideas
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

                    {/* Category Badge
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-rose-500/90 text-white text-xs font-semibold rounded-full">
                        {idea.category}
                      </span>
                    </div> */}

                    {/* Save Button - only for regular date ideas */}
                    {idea.slug && (
                      <div className="absolute top-3 right-3">
                        <SaveButton
                          itemSlug={idea.slug}
                          item={idea}
                          className="opacity-90 hover:opacity-100"
                        />
                      </div>
                    )}

                    {/* External link indicator for city events */}
                    {idea.website && (
                      <div className="absolute top-3 right-3">
                        <div className="p-2 bg-black/50 rounded-full backdrop-blur-sm">
                          <ChevronRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className={`text-lg font-semibold mb-2 group-hover:text-rose-400 transition-colors line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                      {String(idea.title || '')}
                    </h3>
                    
                  </div>
                </div>
              ))}
            </div>

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
      {
        showFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl ${theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-white'
              }`}>
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                  Filter Date Ideas
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'text-gray-500'
                    }`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Time of Day Filter - Simplified options */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                    }`}>
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

                {/* Location Filter - Based on actual database values */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                    }`}>
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

                {/* Mood Filter - Multiselect based on actual database valuess */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                    }`}>
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

                {/* Price Level Filter - Based on actual database values */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                    }`}>
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
        )
      }
    </section >
  );
};

export default AllDateIdeasSection;
