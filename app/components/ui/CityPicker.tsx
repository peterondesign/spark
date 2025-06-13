"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, MapPin, Search, Globe, Star } from 'lucide-react';
import { useTheme } from 'next-themes';

interface City {
  id: string;
  name: string;
  country: string;
  continent: string;
  timezone: string;
  popular: boolean;
  flag: string;
  coordinates: [number, number];
}

interface CityPickerProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
  className?: string;
}

const CITIES: City[] = [
  {
    id: 'lisbon',
    name: 'Lisbon',
    country: 'Portugal',
    continent: 'Europe',
    timezone: 'Europe/Lisbon',
    popular: true,
    flag: '🇵🇹',
    coordinates: [38.7167, -9.1333]
  },
  {
    id: 'newyork',
    name: 'New York',
    country: 'United States',
    continent: 'North America',
    timezone: 'America/New_York',
    popular: true,
    flag: '🇺🇸',
    coordinates: [40.7128, -74.0060]
  },
  {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    continent: 'Europe',
    timezone: 'Europe/London',
    popular: true,
    flag: '🇬🇧',
    coordinates: [51.5074, -0.1278]
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    continent: 'Europe',
    timezone: 'Europe/Paris',
    popular: true,
    flag: '🇫🇷',
    coordinates: [48.8566, 2.3522]
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    continent: 'Asia',
    timezone: 'Asia/Tokyo',
    popular: true,
    flag: '🇯🇵',
    coordinates: [35.6762, 139.6503]
  },
  {
    id: 'barcelona',
    name: 'Barcelona',
    country: 'Spain',
    continent: 'Europe',
    timezone: 'Europe/Madrid',
    popular: true,
    flag: '🇪🇸',
    coordinates: [41.3851, 2.1734]
  },
  {
    id: 'amsterdam',
    name: 'Amsterdam',
    country: 'Netherlands',
    continent: 'Europe',
    timezone: 'Europe/Amsterdam',
    popular: true,
    flag: '🇳🇱',
    coordinates: [52.3676, 4.9041]
  },
  {
    id: 'berlin',
    name: 'Berlin',
    country: 'Germany',
    continent: 'Europe',
    timezone: 'Europe/Berlin',
    popular: true,
    flag: '🇩🇪',
    coordinates: [52.5200, 13.4050]
  },
  {
    id: 'rome',
    name: 'Rome',
    country: 'Italy',
    continent: 'Europe',
    timezone: 'Europe/Rome',
    popular: true,
    flag: '🇮🇹',
    coordinates: [41.9028, 12.4964]
  },
  {
    id: 'madrid',
    name: 'Madrid',
    country: 'Spain',
    continent: 'Europe',
    timezone: 'Europe/Madrid',
    popular: true,
    flag: '🇪🇸',
    coordinates: [40.4168, -3.7038]
  },
  {
    id: 'milan',
    name: 'Milan',
    country: 'Italy',
    continent: 'Europe',
    timezone: 'Europe/Rome',
    popular: false,
    flag: '🇮🇹',
    coordinates: [45.4642, 9.1900]
  },
  {
    id: 'vienna',
    name: 'Vienna',
    country: 'Austria',
    continent: 'Europe',
    timezone: 'Europe/Vienna',
    popular: false,
    flag: '🇦🇹',
    coordinates: [48.2082, 16.3738]
  },
  {
    id: 'prague',
    name: 'Prague',
    country: 'Czech Republic',
    continent: 'Europe',
    timezone: 'Europe/Prague',
    popular: false,
    flag: '🇨🇿',
    coordinates: [50.0755, 14.4378]
  },
  {
    id: 'copenhagen',
    name: 'Copenhagen',
    country: 'Denmark',
    continent: 'Europe',
    timezone: 'Europe/Copenhagen',
    popular: false,
    flag: '🇩🇰',
    coordinates: [55.6761, 12.5683]
  },
  {
    id: 'stockholm',
    name: 'Stockholm',
    country: 'Sweden',
    continent: 'Europe',
    timezone: 'Europe/Stockholm',
    popular: false,
    flag: '🇸🇪',
    coordinates: [59.3293, 18.0686]
  }
];

const CityPicker: React.FC<CityPickerProps> = ({ 
  selectedCity, 
  onCityChange, 
  className = '' 
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCityData = CITIES.find(city => 
    city.name.toLowerCase() === selectedCity.toLowerCase()
  ) || CITIES[0];

  const filteredCities = CITIES.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const popularCities = filteredCities.filter(city => city.popular);
  const otherCities = filteredCities.filter(city => !city.popular);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(prev => 
            prev < filteredCities.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCities.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0) {
            const city = filteredCities[highlightedIndex];
            handleCitySelect(city);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSearchTerm('');
          setHighlightedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, filteredCities]);

  const handleCitySelect = (city: City) => {
    onCityChange(city.name.toUpperCase());
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const getLocalTime = (timezone: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(new Date());
    } catch {
      return '';
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={toggleDropdown}
        className={`group flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
          theme === 'dark'
            ? 'bg-gray-800 border-gray-600 hover:border-rose-400 text-white'
            : 'bg-white border-gray-200 hover:border-rose-400 text-gray-900'
        } ${isOpen ? 'border-rose-400 shadow-lg' : ''}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{selectedCityData.flag}</span>
          <div className="text-left">
            <div className="font-bold text-lg">{selectedCityData.name}</div>
            <div className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {selectedCityData.country} • {getLocalTime(selectedCityData.timezone)}
            </div>
          </div>
        </div>
        <ChevronDown 
          className={`w-5 h-5 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          } ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} group-hover:text-rose-400`} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-2xl z-50 overflow-hidden ${
          theme === 'dark'
            ? 'bg-gray-800 border-gray-600'
            : 'bg-white border-gray-200'
        }`}>
          {/* Search Input */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-600">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search cities..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(-1);
                }}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          {/* Cities List */}
          <div className="max-h-80 overflow-y-auto">
            {/* Popular Cities */}
            {popularCities.length > 0 && (
              <div>
                <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                  theme === 'dark' ? 'text-gray-400 bg-gray-750' : 'text-gray-500 bg-gray-50'
                }`}>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Popular Cities
                  </div>
                </div>
                {popularCities.map((city, index) => (
                  <button
                    key={city.id}
                    onClick={() => handleCitySelect(city)}
                    className={`w-full px-4 py-3 text-left hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex items-center gap-3 ${
                      highlightedIndex === index ? 'bg-rose-50 dark:bg-rose-900/20' : ''
                    } ${selectedCityData.id === city.id ? 'bg-rose-100 dark:bg-rose-900/30' : ''}`}
                  >
                    <span className="text-2xl">{city.flag}</span>
                    <div className="flex-1">
                      <div className={`font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {city.name}
                      </div>
                      <div className={`text-xs flex items-center gap-2 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <Globe className="w-3 h-3" />
                        {city.country} • {getLocalTime(city.timezone)}
                      </div>
                    </div>
                    {selectedCityData.id === city.id && (
                      <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Other Cities */}
            {otherCities.length > 0 && (
              <div>
                <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                  theme === 'dark' ? 'text-gray-400 bg-gray-750' : 'text-gray-500 bg-gray-50'
                }`}>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Other Cities
                  </div>
                </div>
                {otherCities.map((city, index) => {
                  const actualIndex = popularCities.length + index;
                  return (
                    <button
                      key={city.id}
                      onClick={() => handleCitySelect(city)}
                      className={`w-full px-4 py-3 text-left hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex items-center gap-3 ${
                        highlightedIndex === actualIndex ? 'bg-rose-50 dark:bg-rose-900/20' : ''
                      } ${selectedCityData.id === city.id ? 'bg-rose-100 dark:bg-rose-900/30' : ''}`}
                    >
                      <span className="text-2xl">{city.flag}</span>
                      <div className="flex-1">
                        <div className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {city.name}
                        </div>
                        <div className={`text-xs flex items-center gap-2 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <Globe className="w-3 h-3" />
                          {city.country} • {getLocalTime(city.timezone)}
                        </div>
                      </div>
                      {selectedCityData.id === city.id && (
                        <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* No Results */}
            {filteredCities.length === 0 && (
              <div className={`px-4 py-8 text-center ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">No cities found</div>
                <div className="text-xs">Try a different search term</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CityPicker;
