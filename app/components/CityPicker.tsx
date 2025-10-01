"use client";

import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Globe, MapPin } from 'lucide-react';
import { useTheme } from 'next-themes';
import { WORLD_CITIES, CITIES_BY_CONTINENT, POPULAR_CITIES, searchCities, type City } from '../data/cities';

interface CityPickerProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
  loading?: boolean;
}

const CityPicker: React.FC<CityPickerProps> = ({ selectedCity, onCityChange, loading }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [showAllCities, setShowAllCities] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter cities based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredCities(searchCities(searchQuery));
    } else {
      setFilteredCities([]);
    }
  }, [searchQuery]);

  const handleCitySelect = (city: City) => {
    onCityChange((city.name || '').toUpperCase());
    setIsOpen(false);
    setSearchQuery('');
  };

  const getCurrentCity = () => {
    return WORLD_CITIES.find(city => 
      (city.name || '').toUpperCase() === (selectedCity || '').toUpperCase()
    ) || WORLD_CITIES[0];
  };

  const currentCity = getCurrentCity();

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Selected City Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition-all duration-300 min-w-[320px] ${
          loading
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:shadow-lg'
        } ${
          theme === 'dark'
            ? 'bg-gray-800 border-gray-600 text-white hover:border-rose-400'
            : 'bg-white border-gray-300 text-gray-900 hover:border-rose-400'
        }`}
      >
        <span className="text-2xl">{currentCity.flag}</span>
        <div className="flex-1 text-left">
          <div className="font-bold text-lg">{currentCity.name}</div>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {currentCity.country}
          </div>
        </div>
        <ChevronDown 
          className={`w-5 h-5 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          } ${loading ? 'animate-spin' : ''}`} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && !loading && (
        <div className={`absolute top-full left-0 mt-2 rounded-xl shadow-2xl border z-50 overflow-hidden min-w-[320px] w-full ${
          theme === 'dark'
            ? 'bg-gray-800 border-gray-600'
            : 'bg-white border-gray-200'
        }`}>
          {/* Search Input */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-600">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-rose-500 focus:border-transparent`}
                autoFocus
              />
            </div>
          </div>

          {/* Show All Cities Toggle */}
          {!searchQuery && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setShowAllCities(!showAllCities)}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  {showAllCities ? (
                    <>
                      <MapPin className="w-4 h-4" />
                      All Cities Worldwide
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      Popular Destinations
                    </>
                  )}
                </span>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showAllCities ? 'rotate-180' : ''
                  }`} 
                />
              </button>
            </div>
          )}

          {/* City List */}
          <div className="max-h-80 overflow-y-auto">
            {/* Search Results */}
            {searchQuery && filteredCities.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                  Search Results ({filteredCities.length})
                </div>
                {filteredCities.map((city) => (
                  <CityOption
                    key={`${city.name}-${city.country}`}
                    city={city}
                    isSelected={(city.name || '').toUpperCase() === (selectedCity || '').toUpperCase()}
                    onClick={() => handleCitySelect(city)}
                    theme={theme}
                  />
                ))}
              </div>
            )}

            {/* Popular Cities */}
            {!searchQuery && !showAllCities && (
              <div className="p-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                  Popular Destinations ({POPULAR_CITIES.length})
                </div>
                {POPULAR_CITIES.map((city) => (
                  <CityOption
                    key={`${city.name}-${city.country}`}
                    city={city}
                    isSelected={(city.name || '').toUpperCase() === (selectedCity || '').toUpperCase()}
                    onClick={() => handleCitySelect(city)}
                    theme={theme}
                  />
                ))}
              </div>
            )}

            {/* All Cities by Continent */}
            {!searchQuery && showAllCities && (
              <div className="p-2">
                {Object.entries(CITIES_BY_CONTINENT).map(([continent, cities]) => (
                  <div key={continent} className="mb-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                      {continent} ({cities.length})
                    </div>
                    {cities.map((city) => (
                      <CityOption
                        key={`${city.name}-${city.country}`}
                        city={city}
                        isSelected={(city.name || '').toUpperCase() === (selectedCity || '').toUpperCase()}
                        onClick={() => handleCitySelect(city)}
                        theme={theme}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* No Search Results */}
            {searchQuery && filteredCities.length === 0 && (
              <div className="p-8 text-center">
                <div className={`text-gray-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  No cities found for "{searchQuery}"
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface CityOptionProps {
  city: City;
  isSelected: boolean;
  onClick: () => void;
  theme: string | undefined;
}

const CityOption: React.FC<CityOptionProps> = ({ city, isSelected, onClick, theme }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
      isSelected
        ? 'bg-rose-100 text-rose-900 dark:bg-rose-900 dark:text-rose-100'
        : theme === 'dark'
          ? 'hover:bg-gray-700 text-white'
          : 'hover:bg-gray-50 text-gray-900'
    }`}
  >
    <span className="text-lg">{city.flag}</span>
    <div className="flex-1">
      <div className="font-medium">{city.name}</div>
      <div className={`text-sm ${
        isSelected
          ? 'text-rose-700 dark:text-rose-300'
          : theme === 'dark'
            ? 'text-gray-400'
            : 'text-gray-600'
      }`}>
        {city.country}
      </div>
    </div>
    {city.popular && (
      <div className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded-full">
        Popular
      </div>
    )}
  </button>
);

export default CityPicker;
