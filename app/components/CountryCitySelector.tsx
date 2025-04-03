"use client";

import { useState, useEffect } from 'react';
import Select, { StylesConfig } from 'react-select';
import { MapPinIcon, SearchIcon } from "lucide-react";
import { City, CountryService, POPULAR_CITIES } from "../../utils/cityService";

export interface CityItem {
  name: string;
  countryCode: string;
  countryName: string;
  isPopular: boolean;
  id: string;
}

export interface CountryCitySelectorProps {
  onCitySelect: (city: CityItem) => void;
  selectedCity?: string;
  defaultCity?: string;
  defaultCountry?: string;
  label?: string;
  className?: string;
}

// Option type for react-select
interface OptionType {
  value: string;
  label: React.ReactNode;
  data: CityItem;
}

// Define well-known cities and their country codes
const WELL_KNOWN_CITIES: Record<string, string> = {
  "Paris": "FR",
  "London": "GB",
  "New York": "US",
  "Tokyo": "JP",
  "Rome": "IT",
  "Sydney": "AU",
  "Amsterdam": "NL",
  "Berlin": "DE",
  "Barcelona": "ES",
  "Dubai": "AE",
  "Singapore": "SG",
  "Hong Kong": "HK",
  "Moscow": "RU",
  "Cairo": "EG",
  "Rio de Janeiro": "BR"
};

export default function CountryCitySelector({
  onCitySelect,
  selectedCity,
  defaultCity,
  defaultCountry = "US",
  label = "City",
  className = ""
}: CountryCitySelectorProps) {
  // States for city selection
  const [cities, setCities] = useState<CityItem[]>([]);
  const [options, setOptions] = useState<OptionType[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null);

  // Initialize popular cities on component mount
  useEffect(() => {
    loadPopularCities();
  }, []);

  // Set default city if provided
  useEffect(() => {
    if (defaultCity && !selectedOption) {
      handleCitySearch(defaultCity);
    }
  }, [defaultCity]);

  // Generate a unique ID for each city
  const generateUniqueId = (city: any, countryName: string, index: number) => {
    return `${city.name}-${city.countryCode}-${countryName}-${index}`;
  };

  // Process cities list to prioritize well-known instances
  const processCitiesList = (cityItems: CityItem[]): CityItem[] => {
    const prioritizedCities: CityItem[] = [];
    const otherCities: CityItem[] = [];
    
    // Group cities by name
    const cityGroups = new Map<string, CityItem[]>();
    
    cityItems.forEach(city => {
      if (!cityGroups.has(city.name)) {
        cityGroups.set(city.name, []);
      }
      cityGroups.get(city.name)?.push(city);
    });
    
    // Process each group of cities with the same name
    cityGroups.forEach((cityGroup, cityName) => {
      // Check if this is a well-known city
      const preferredCountryCode = WELL_KNOWN_CITIES[cityName];
      
      if (preferredCountryCode) {
        // Find the well-known instance
        const wellKnownCity = cityGroup.find(city => city.countryCode === preferredCountryCode);
        
        if (wellKnownCity) {
          // Add the well-known city first
          prioritizedCities.push({
            ...wellKnownCity,
            isPopular: true // Ensure it's marked as popular
          });
          
          // Add other instances with the same name (but not marked as popular)
          cityGroup
            .filter(city => city.countryCode !== preferredCountryCode)
            .forEach(city => otherCities.push({
              ...city,
              isPopular: false
            }));
        } else {
          // If well-known instance not found, add all cities in the group
          otherCities.push(...cityGroup);
        }
      } else {
        // For non-well-known cities, just add them all
        otherCities.push(...cityGroup);
      }
    });
    
    // Combine prioritized and other cities, sort each group
    return [
      ...prioritizedCities.sort((a, b) => a.name.localeCompare(b.name)),
      ...otherCities.sort((a, b) => {
        if (a.isPopular && !b.isPopular) return -1;
        if (!a.isPopular && b.isPopular) return 1;
        return a.name.localeCompare(b.name);
      })
    ].slice(0, 20); // Limit results
  };

  // Load popular cities
  const loadPopularCities = async () => {
    setIsLoading(true);
    
    try {
      // Get all cities and find the popular ones
      const popularCityItems: CityItem[] = [];
      const allCountries = CountryService.getAllCountries();
      
      // Create a map for faster country lookup
      const countryMap = new Map();
      allCountries.forEach(country => {
        countryMap.set(country.isoCode, country.name);
      });

      // Process popular cities
      for (const popularCity of POPULAR_CITIES) {
        // Find all instances of this popular city across countries
        const allCities = City.getAllCities();
        const matchingCities = allCities.filter(city => city.name === popularCity);
        
        // Add each instance with its country info
        matchingCities.forEach((city, index) => {
          const countryName = countryMap.get(city.countryCode) || city.countryCode;
          popularCityItems.push({
            name: city.name,
            countryCode: city.countryCode,
            countryName: countryName,
            isPopular: true,
            id: generateUniqueId(city, countryName, index)
          });
        });
      }

      // Process cities list to prioritize well-known instances
      const processedCities = processCitiesList(popularCityItems);
      setCities(processedCities);
      
      // Convert cities to select options
      const selectOptions = processedCities.map(city => ({
        value: city.id,
        label: renderOptionLabel(city),
        data: city
      }));
      setOptions(selectOptions);

    } catch (error) {
      console.error('Error loading popular cities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render option label with city and country name
  const renderOptionLabel = (city: CityItem) => (
    <div className="flex items-start justify-between w-full">
      <div className="flex items-start">
        <MapPinIcon className="h-4 w-4 text-gray-500 mr-1 mt-0.5" />
        <div>
          <div>{city.name}</div>
          <div className="text-xs text-gray-500">{city.countryName}</div>
        </div>
      </div>
      {city.isPopular && (
        <span className="ml-auto px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">Popular</span>
      )}
    </div>
  );

  // Handle city search filtering
  const handleCitySearch = (query: string) => {
    setInputValue(query);
    
    if (!query.trim()) {
      loadPopularCities();
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get all cities and filter by search text
      const allCities = City.getAllCities();
      const allCountries = CountryService.getAllCountries();
      
      // Create a map for faster country lookup
      const countryMap = new Map();
      allCountries.forEach(country => {
        countryMap.set(country.isoCode, country.name);
      });
      
      // Filter cities based on search text
      const filteredCities = allCities
        .filter(city => city.name.toLowerCase().includes(query.toLowerCase()))
        .map((city, index) => {
          const countryName = countryMap.get(city.countryCode) || city.countryCode;
          return {
            name: city.name,
            countryCode: city.countryCode,
            countryName: countryName,
            isPopular: POPULAR_CITIES.includes(city.name),
            id: generateUniqueId(city, countryName, index)
          };
        });
      
      // Process to prioritize well-known cities
      const processedCities = processCitiesList(filteredCities);
      setCities(processedCities);
      
      // Convert cities to select options
      const selectOptions = processedCities.map(city => ({
        value: city.id,
        label: renderOptionLabel(city),
        data: city
      }));
      setOptions(selectOptions);
      
      // If this is a default city search, select the first matching city
      if (defaultCity && query === defaultCity && processedCities.length > 0) {
        const defaultCityItem = processedCities[0];
        const defaultOption = {
          value: defaultCityItem.id,
          label: renderOptionLabel(defaultCityItem),
          data: defaultCityItem
        };
        setSelectedOption(defaultOption);
        onCitySelect(defaultCityItem);
        
        // Save to localStorage
        saveToLocalStorage(defaultCityItem);
      }
    } catch (error) {
      console.error('Error searching cities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save city and country to localStorage
  const saveToLocalStorage = (city: CityItem) => {
    localStorage.setItem("userCity", city.name);
    localStorage.setItem("userCountry", city.countryCode);
    localStorage.setItem("userCityData", JSON.stringify({
      name: city.name,
      countryCode: city.countryCode,
      countryName: city.countryName,
      id: city.id
    }));
  };

  // Handle city selection
  const handleCitySelect = (option: any) => {
    if (!option) return;
    
    setSelectedOption(option);
    onCitySelect(option.data);
    
    // Save to localStorage immediately when a city is selected
    saveToLocalStorage(option.data);
  };

  // Custom styles for react-select
  const customStyles: StylesConfig = {
    control: (base) => ({
      ...base,
      borderRadius: '0.375rem',
      borderColor: '#e2e8f0',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#cbd5e1',
      },
      padding: '0.25rem',
      minHeight: '42px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#fff1f2' : 'white',
      color: '#1f2937',
      padding: '8px 12px',
      ':hover': {
        backgroundColor: '#fff1f2',
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.75rem',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e2e8f0',
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '2px 8px',
    }),
  };

  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-rose-500"></div>
          </div>
        )}
        <Select
          options={options}
          value={selectedOption}
          onChange={handleCitySelect}
          onInputChange={handleCitySearch}
          inputValue={inputValue}
          isLoading={isLoading}
          isSearchable={true}
          placeholder="Search for a city..."
          noOptionsMessage={() => "No cities found"}
          styles={customStyles}
          className="react-select"
          classNamePrefix="react-select"
          components={{
            DropdownIndicator: () => (
              <SearchIcon className="h-5 w-5 text-gray-500 mr-2" />
            ),
          }}
        />
      </div>
    </div>
  );
}