"use client";

import { useState, useEffect } from 'react';
import { ChevronRight, Heart, Smile, Zap, Sun, Moon, Home, TreePine, DollarSign, Coins, X, Shuffle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase } from '../../../utils/supabaseClient';
import SaveButton from '../SaveButton';
import CityPicker from '../CityPicker';
import VenueDrawer from '../VenueDrawer';
// import { ImageSkeletonGrid } from '../ui/image-skeleton';

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
  const [loading, setLoading] = useState(true);
  const [visibleIdeas, setVisibleIdeas] = useState(24);

  // Drawer states
  const [selectedIdea, setSelectedIdea] = useState<DateIdea | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filter states
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string>("");
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [selectedPriceLevel, setSelectedPriceLevel] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  // Fetch date ideas from Supabase
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

        // Fisher-Yates shuffle algorithm for better randomization
        const shuffleArray = (array: any[]) => {
          const shuffled = [...array];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          return shuffled;
        };

        // Process Supabase data
        const supabaseIdeas = supabaseData ? shuffleArray(supabaseData).map((item: any) => ({
          ...item,
          timeOfDay: item.timeOfDay || item.time_of_day, // Handle both naming conventions
          priceLevel: item.priceLevel || item.price_level, // Handle both naming conventions
        })) : [];

        setDateIdeas(supabaseIdeas);
        setFilteredIdeas(supabaseIdeas);

        console.log(`🔥 Total date ideas loaded: ${supabaseIdeas.length}`);
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
  };

  const handleLoadMore = () => {
    const currentVisible = visibleIdeas;
    const newVisible = Math.min(currentVisible + 24, filteredIdeas.length);
    const newItems = filteredIdeas.slice(currentVisible, newVisible);
    
    setVisibleIdeas(newVisible);
  };

  // Filter functionality with accurate field matching based on real database data
  useEffect(() => {
    let filtered = [...dateIdeas];

    if (selectedTimeOfDay) {
      const target = selectedTimeOfDay.toLowerCase();
      filtered = filtered.filter(idea => {
        const val = idea.timeOfDay;
        if (Array.isArray(val)) return val.some((t: string) => t.toLowerCase() === target);
        return typeof val === 'string' && val.toLowerCase() === target;
      });
    }

    if (selectedLocation) {
      const target = selectedLocation.toLowerCase();
      filtered = filtered.filter(idea => {
        if (typeof idea.location === 'object' && idea.location !== null) {
          const type = (idea.location as any).type;
          if (Array.isArray(type)) return type.some((t: string) => t.toLowerCase() === target);
          return typeof type === 'string' && type.toLowerCase() === target;
        }
        if (typeof idea.location === 'string') return idea.location.toLowerCase().includes(target);
        return false;
      });
    }

    if (selectedMood) {
      const moodMap: Record<string, string> = {
        'active': 'active',
        'leisurely': 'chill',
        'romantic': 'romantic'
      };
      const dbMood = (moodMap[selectedMood] || selectedMood).toLowerCase();

      filtered = filtered.filter(idea => {
        const val = idea.mood;
        if (Array.isArray(val)) return val.some((m: string) => m.toLowerCase() === dbMood);
        if (typeof val === 'string') return val.toLowerCase() === dbMood;
        return false;
      });
    }

    if (selectedPriceLevel) {
      // Map UI price values to database values (case-insensitive)
      const priceMap: Record<string, string> = {
        'Affordable': 'affordable',
        'High': 'expensive'
      };
      
      const dbPrice = priceMap[selectedPriceLevel] || selectedPriceLevel.toLowerCase();
      
      filtered = filtered.filter(idea =>
        idea.priceLevel?.toLowerCase() === dbPrice.toLowerCase()
      );
    }

    setFilteredIdeas(filtered);
    setVisibleIdeas(24); // Reset to show more ideas when filters change
  }, [selectedTimeOfDay, selectedLocation, selectedMood, selectedPriceLevel, dateIdeas]);

  const clearFilters = () => {
    setSelectedTimeOfDay("");
    setSelectedLocation("");
    setSelectedMood("");
    setSelectedPriceLevel("");
  };

  // Fisher-Yates shuffle algorithm
  const shuffleIdeas = () => {
    const shuffled = [...filteredIdeas];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setFilteredIdeas(shuffled);
  };

  const activeFilterCount = [selectedMood, selectedTimeOfDay, selectedLocation, selectedPriceLevel].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <>
      {/* Main Section */}
      <section
        className={`${theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-50'}`}
        id="all-date-ideas"
      >
        {/* Sticky filter bar — pure CSS, no JS */}
        <div
          className={`sticky top-[73px] z-40 border-b ${
            theme === 'dark' ? 'bg-[#2a2a2a] border-gray-700' : 'bg-white border-gray-200'
          } shadow-sm`}
        >
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Filter Count + Clear Button */}
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-gray-700 text-gray-300 hover:text-gray-100'
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <X className="w-4 h-4" />
                  <span className="text-xs font-semibold">{activeFilterCount}</span>
                </button>
              )}
              
              {/* Shuffle Button */}
              <button
                onClick={shuffleIdeas}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-300 hover:text-gray-100'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                title="Shuffle date ideas"
              >
                <Shuffle className="w-4 h-4" />
              </button>
            </div>

            {/* Inline Filters */}
            <div className="flex flex-nowrap items-center gap-3 w-full lg:flex-wrap lg:overflow-visible overflow-x-auto lg:overflow-x-hidden pb-2 lg:pb-0">
              {/* Mood Filter */}
              <div className="flex gap-2 items-center shrink-0 lg:shrink">
                {[
                  { value: 'active', label: 'Active', icon: Zap },
                  { value: 'leisurely', label: 'Chill', icon: Smile },
                  { value: 'romantic', label: 'Romantic', icon: Heart }
                ].map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(selectedMood === mood.value ? '' : mood.value)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedMood === mood.value
                        ? 'bg-rose-500 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <mood.icon className="w-4 h-4" />
                    <span>{mood.label}</span>
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className={`hidden lg:block w-px h-6 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />

              {/* Time of Day Filter */}
              <div className="flex gap-2 items-center shrink-0 lg:shrink">
                {[
                  { value: 'Daytime', label: 'Daytime', icon: Sun },
                  { value: 'Night', label: 'Night', icon: Moon }
                ].map((time) => (
                  <button
                    key={time.value}
                    onClick={() => setSelectedTimeOfDay(selectedTimeOfDay === time.value ? '' : time.value)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedTimeOfDay === time.value
                        ? 'bg-rose-500 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <time.icon className="w-4 h-4" />
                    <span>{time.label}</span>
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className={`hidden lg:block w-px h-6 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />

              {/* Setting/Location Filter */}
              <div className="flex gap-2 items-center shrink-0 lg:shrink">
                {[
                  { value: 'outdoor', label: 'Outdoor', icon: TreePine },
                  { value: 'indoor', label: 'Indoor', icon: Home }
                ].map((location) => (
                  <button
                    key={location.value}
                    onClick={() => setSelectedLocation(selectedLocation === location.value ? '' : location.value)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedLocation === location.value
                        ? 'bg-rose-500 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <location.icon className="w-4 h-4" />
                    <span>{location.label}</span>
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className={`hidden lg:block w-px h-6 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />

              {/* Price Filter */}
              <div className="flex gap-2 items-center shrink-0 lg:shrink">
                {[
                  { value: 'Affordable', label: 'Affordable', icon: DollarSign },
                  { value: 'High', label: 'Expensive', icon: Coins }
                ].map((price) => (
                  <button
                    key={price.value}
                    onClick={() => setSelectedPriceLevel(selectedPriceLevel === price.value ? '' : price.value)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedPriceLevel === price.value
                        ? 'bg-rose-500 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <price.icon className="w-4 h-4" />
                    <span>{price.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className="container mx-auto px-6 py-10">
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
              {filteredIdeas.slice(0, visibleIdeas).map((idea, index) => (
                <div
                  key={idea.id}
                  className={`group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer ${theme === 'dark'
                    ? 'bg-[#333333] border border-gray-700'
                    : 'bg-white border border-gray-200'
                    }`}
                  onClick={() => {
                    setSelectedIdea(idea);
                    setIsDrawerOpen(true);
                  }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={idea.image}
                      alt={`${idea.title} - diverse couple date idea`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Category Badge
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-rose-500/90 text-white text-xs font-semibold rounded-full">
                        {idea.category}
                      </span>
                    </div> */}

                    {/* Save Button */}
                    {/* {idea.slug && (
                      <div className="absolute top-3 right-3">
                        <SaveButton
                          itemSlug={idea.slug}
                          item={idea}
                          className="opacity-90 hover:opacity-100"
                        />
                      </div>
                    )} */}
                  </div>

                  <div className="p-4">
                    <h3 className={`text-lg font-semibold group-hover:text-rose-400 transition-colors line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
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
      </section>

      {/* Venue Drawer */}
      {selectedIdea && (
        <VenueDrawer
          dateIdea={selectedIdea}
          city={selectedCity}
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
        />
      )}
    </>
  );
};

export default AllDateIdeasSection;
