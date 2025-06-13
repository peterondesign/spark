"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Filter, X } from 'lucide-react';
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
  slug: string;
  time_of_day?: string;
  mood?: string;
  price_level?: number;
}

const AllDateIdeasSection = () => {
  const { theme } = useTheme();
  const [selectedCity, setSelectedCity] = useState<string>("LISBON");
  const [dateIdeas, setDateIdeas] = useState<DateIdea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<DateIdea[]>([]);
  const [dateIdeaImages, setDateIdeaImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [visibleIdeas, setVisibleIdeas] = useState(12);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string>("");
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [selectedPriceLevel, setSelectedPriceLevel] = useState<string>("");

  // Fetch date ideas from Supabase
  useEffect(() => {
    const fetchDateIdeas = async () => {
      try {
        const { data, error } = await supabase
          .from('date_ideas')
          .select('*')
          .limit(100); // Increase limit to get more ideas

        if (error) {
          console.error("Error fetching date ideas:", error);
        } else {
          // Randomize the ideas
          const randomizedData = data ? [...data].sort(() => Math.random() - 0.5) : [];
          setDateIdeas(randomizedData);
          setFilteredIdeas(randomizedData);

          // Fetch images for the date ideas
          if (randomizedData && randomizedData.length > 0) {
            const imagePromises = randomizedData.map(async (idea) => {
              const imageUrl = await getImageUrl(
                idea.image,
                `${idea.title} ${idea.category}`,
                400,
                300
              );
              return { [idea.slug]: imageUrl };
            });

            const imageResults = await Promise.all(imagePromises);
            const imageMap = Object.assign({}, ...imageResults);
            setDateIdeaImages(imageMap);
          }
        }
      } catch (error) {
        console.error("Error fetching date ideas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDateIdeas();
  }, []);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
  };

  const handleLoadMore = () => {
    setVisibleIdeas(prev => Math.min(prev + 12, filteredIdeas.length));
  };

  // Filter functionality
  useEffect(() => {
    let filtered = [...dateIdeas];

    if (selectedTimeOfDay) {
      filtered = filtered.filter(idea => idea.time_of_day === selectedTimeOfDay);
    }

    if (selectedMood) {
      filtered = filtered.filter(idea => idea.mood === selectedMood);
    }

    if (selectedPriceLevel) {
      const priceLevel = parseInt(selectedPriceLevel);
      filtered = filtered.filter(idea => idea.price_level === priceLevel);
    }

    setFilteredIdeas(filtered);
    setVisibleIdeas(12); // Reset visible ideas when filters change
  }, [selectedTimeOfDay, selectedMood, selectedPriceLevel, dateIdeas]);

  const clearFilters = () => {
    setSelectedTimeOfDay("");
    setSelectedMood("");
    setSelectedPriceLevel("");
  };

  const hasActiveFilters = selectedTimeOfDay || selectedMood || selectedPriceLevel;

  return (
    <section
      className={`py-16 ${theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-50'}`}
      id="all-date-ideas"
    >
      <div className="container mx-auto px-6">
        {/* Section Header with City Selector and Filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12">
          <div className='flex flex-col lg:flex-row'>
            <h2 className={`text-3xl md:text-4xl font-bold font-heading flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
              ALL DATE IDEAS IN{" "}
              <div className={`inline-flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
              </div>

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
                {[selectedTimeOfDay, selectedMood, selectedPriceLevel].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Date Ideas Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
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
                  className={`group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${theme === 'dark'
                    ? 'bg-[#333333] border border-gray-700'
                    : 'bg-white border border-gray-200'
                    }`}
                >
                  <Link href={`/date-idea/${idea.slug}`}>
                    <div className="relative h-48 overflow-hidden cursor-pointer">
                      <img
                        src={dateIdeaImages[idea.slug] || idea.image || '/placeholder.jpg'}
                        alt={idea.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                      {/* Save Button */}
                      <div className="absolute top-3 right-3">
                        <SaveButton
                          itemSlug={idea.slug}
                          item={idea}
                          className="opacity-90 hover:opacity-100"
                        />
                      </div>
                    </div>
                  </Link>

                  <Link href={`/date-idea/${idea.slug}`}>
                    <div className="p-4 cursor-pointer">
                      <h3 className={`text-lg font-semibold mb-2 group-hover:text-rose-400 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                        {idea.title}
                      </h3>
                    </div>
                  </Link>
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
                {/* Time of Day Filter */}
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
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>

                {/* Mood Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-700'
                    }`}>
                    Mood
                  </label>
                  <select
                    value={selectedMood}
                    onChange={(e) => setSelectedMood(e.target.value)}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent ${theme === 'dark'
                      ? 'bg-[#333333] border-gray-600 text-white'
                      : 'bg-white text-gray-900'
                      }`}
                  >
                    <option value="">Any mood</option>
                    <option value="Romantic">Romantic</option>
                    <option value="Adventurous">Adventurous</option>
                    <option value="Relaxing">Relaxing</option>
                    <option value="Fun">Fun</option>
                    <option value="Creative">Creative</option>
                  </select>
                </div>

                {/* Price Level Filter */}
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
                    <option value="1">$ - Budget friendly</option>
                    <option value="2">$$ - Moderate</option>
                    <option value="3">$$$ - Expensive</option>
                    <option value="4">$$$$ - Luxury</option>
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
