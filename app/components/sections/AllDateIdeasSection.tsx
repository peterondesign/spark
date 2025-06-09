"use client";

import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import CountryCitySelector from '../CountryCitySelector';
import { CityItem } from '../../../utils/cityService';
import { useTheme } from '../../contexts/ThemeContext';

interface DateIdea {
  id: string;
  title: string;
  category: string;
  rating?: number;
  image_url?: string;
  slug: string;
}

const AllDateIdeasSection = () => {
  const { theme } = useTheme();
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [userCity, setUserCity] = useState<string | null>(null);
  const [dateIdeas, setDateIdeas] = useState<DateIdea[]>([]);
  const [loading, setLoading] = useState(true);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation && !userCity) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const response = await fetch(`/api/location?lat=${position.coords.latitude}&lng=${position.coords.longitude}`);
          if (response.ok) {
            const data = await response.json();
            setUserCity(data.city);
          }
        } catch (error) {
          console.error("Error getting location:", error);
        }
      });
    }
  }, [userCity]);

  // Fetch date ideas
  useEffect(() => {
    const fetchDateIdeas = async () => {
      try {
        const response = await fetch('/api/getAllSlugs');
        if (response.ok) {
          const data = await response.json();
          setDateIdeas(data.slice(0, 12)); // Show first 12 ideas
        }
      } catch (error) {
        console.error("Error fetching date ideas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDateIdeas();
  }, []);

  const handleCitySelect = (city: CityItem) => {
    setSelectedCity(city.name);
  };

  const displayCity = selectedCity || userCity || "your city";

  return (
    <section 
      className={`py-16 ${theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-50'}`}
      id="all-date-ideas"
    >
      <div className="container mx-auto px-6">
        {/* Section Header with City Selector */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-12">
          <h2 className={`text-3xl md:text-4xl font-bold font-heading flex items-center gap-3 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            ALL DATE IDEAS IN{" "}
            <span className="text-rose-400 inline-flex items-center gap-2">
              {displayCity.toUpperCase()}
              <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
            </span>
          </h2>
          
          <div className="min-w-[280px]">
            <CountryCitySelector
              onCitySelect={handleCitySelect}
              selectedCity={selectedCity}
              defaultCity={userCity || undefined}
              label=""
              className="w-full"
            />
          </div>
        </div>

        {/* Date Ideas Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className={`animate-pulse rounded-2xl h-64 ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {dateIdeas.map((idea) => (
                <a
                  key={idea.id}
                  href={`/date-idea/${idea.slug}`}
                  className={`group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 ${
                    theme === 'dark' 
                      ? 'bg-[#333333] border border-gray-700' 
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={idea.image_url || '/placeholder.jpg'}
                      alt={idea.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-semibold text-lg leading-tight">
                        {idea.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      theme === 'dark' 
                        ? 'bg-rose-900 text-rose-200' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {idea.category}
                    </span>
                    {idea.rating && (
                      <div className="flex items-center mt-2">
                        <span className="text-yellow-400">★</span>
                        <span className={`ml-1 text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {idea.rating}
                        </span>
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <a
                href="/date-ideas-near-me"
                className="inline-flex items-center gap-2 px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                View All Date Ideas
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default AllDateIdeasSection;
