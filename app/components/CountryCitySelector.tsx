"use client";

import { useState, useEffect, useCallback } from 'react';
import Select, { StylesConfig } from 'react-select';
import { MapPinIcon, SearchIcon } from "lucide-react";
import { City, CountryService, POPULAR_CITIES } from "../../utils/cityService";

// Maximum time to wait for IP detection before falling back to popular cities
const LOCATION_DETECTION_TIMEOUT = 4000; // 4 seconds

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
  prioritizeIpLocation?: boolean;
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

// How often to check/refresh localStorage (24 hours in milliseconds)
const STORAGE_REFRESH_INTERVAL = 24 * 60 * 60 * 1000;

// Check if we already have location data in localStorage
const hasStoredLocationData = () => {
  try {
    const timestamp = localStorage.getItem("locationDataTimestamp");
    if (!timestamp) return false;
    
    const lastUpdate = parseInt(timestamp, 10);
    if (isNaN(lastUpdate)) return false;
    
    // Check if data is still fresh (less than 24 hours old)
    if (Date.now() - lastUpdate > STORAGE_REFRESH_INTERVAL) return false;
    
    // Verify we have the actual city data
    const cityData = localStorage.getItem("userCityData");
    if (!cityData) return false;
    
    return true;
  } catch (error) {
    return false;
  }
};

export default function CountryCitySelector({
  onCitySelect,
  selectedCity,
  defaultCity,
  defaultCountry = "US",
  label = "City",
  className = "",
  prioritizeIpLocation = true
}: CountryCitySelectorProps) {
  // States for city selection
  const [cities, setCities] = useState<CityItem[]>([]);
  const [options, setOptions] = useState<OptionType[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null);
  const [ipLocationAttempted, setIpLocationAttempted] = useState(false);
  const [ipLocationFailed, setIpLocationFailed] = useState(false);
  const [detectionTimeout, setDetectionTimeout] = useState(false);
  const [placeholderText, setPlaceholderText] = useState("Search for a city...");

  // Memoize the renderOptionLabel to prevent unnecessary re-renders
  const renderOptionLabel = useCallback((city: CityItem) => (
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
  ), []);

  // Initialize component - detect IP location as the highest priority
  useEffect(() => {
    // Check if localStorage needs to be refreshed
    checkAndClearLocalStorage();
    
    // Update placeholder text on client-side only
    if (isLoading && !inputValue) {
      setPlaceholderText("Detecting your location...");
    }
    
    // Only attempt to get the IP location if prioritizeIpLocation is true
    if (hasStoredLocationData()) {
      loadStoredLocation();
    } else if (prioritizeIpLocation) {
      detectIpLocation();
      
      // Set timeout to prevent hanging if IP detection is slow
      const timeoutId = setTimeout(() => {
        setDetectionTimeout(true);
        // If we haven't loaded anything yet, load popular cities
        if (isLoading && !selectedOption) {
          console.log('Location detection timed out after 4s, loading popular cities');
          loadPopularCities();
          setIsLoading(false);
          setPlaceholderText("Search for a city...");
        }
      }, LOCATION_DETECTION_TIMEOUT);
      
      return () => clearTimeout(timeoutId);
    } else {
      // Skip IP detection and just load popular cities
      console.log('Skipping IP detection as prioritizeIpLocation is false');
      loadPopularCities();
      setIsLoading(false);
    }
  }, []);

  // Set default city if provided and no IP-based location is set
  useEffect(() => {
    if (defaultCity && !selectedOption && (ipLocationFailed || detectionTimeout)) {
      handleCitySearch(defaultCity);
    }
  }, [defaultCity, selectedOption, ipLocationFailed, detectionTimeout]);

  // Check if localStorage data is stale and clear if needed
  const checkAndClearLocalStorage = () => {
    try {
      const lastRefreshed = localStorage.getItem("locationDataTimestamp");
      
      if (lastRefreshed) {
        const timestamp = parseInt(lastRefreshed, 10);
        const now = Date.now();
        
        if (isNaN(timestamp) || now - timestamp > STORAGE_REFRESH_INTERVAL) {
          // Clear location data if it's older than the refresh interval
          localStorage.removeItem("userCity");
          localStorage.removeItem("userCountry");
          localStorage.removeItem("userCityData");
          localStorage.removeItem("locationDataTimestamp");
          console.log("Location data cleared due to age");
        }
      } else {
        // Set initial timestamp if it doesn't exist
        localStorage.setItem("locationDataTimestamp", Date.now().toString());
      }
    } catch (error) {
      console.error("Error handling localStorage:", error);
    }
  };

  // Load location from localStorage
  const loadStoredLocation = async () => {
    try {
      const savedCityData = localStorage.getItem("userCityData");
      
      if (savedCityData) {
        const cityData = JSON.parse(savedCityData);
        if (cityData && cityData.name) {
          console.log('Loading location from localStorage:', cityData.name);
          // Load existing location
          const cityOption = {
            value: cityData.id || `${cityData.name}-${cityData.countryCode}`,
            label: renderOptionLabel(cityData),
            data: cityData
          };
          
          setSelectedOption(cityOption);
          onCitySelect(cityData);
          setInputValue(cityData.name);
          
          // Still load popular cities as options
          await loadPopularCities();
          setIsLoading(false);
          return;
        }
      }
      
      // No valid data, continue with detection
      detectIpLocation();
    } catch (error) {
      console.error("Error loading stored location:", error);
      detectIpLocation();
    }
  };

  // Detect location from IP address
  const detectIpLocation = async () => {
    setIsLoading(true);
    setIpLocationAttempted(true);
    setPlaceholderText("Detecting your location...");
    
    try {
      console.log('Attempting to detect location from IP...');
      
      // No valid cached data, fetch from API with cache control
      const response = await fetch('/api/location', { 
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache' }
      });
      
      if (!response.ok) {
        throw new Error(`Location API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Location API response:', data);
      
      if (data.city) {
        console.log('City detected from IP:', data.city);
        // We have a city from IP detection, find it in our data
        const allCities = City.getAllCities();
        const allCountries = CountryService.getAllCountries();
        
        // Create a map for faster country lookup
        const countryMap = new Map();
        allCountries.forEach(country => {
          countryMap.set(country.isoCode, country.name);
        });
        
        // Find matching city - prioritize matching both city and country if available
        const matchingCities = allCities.filter(city => {
          const cityMatches = city.name.toLowerCase() === data.city.toLowerCase();
          if (data.country_code) {
            return cityMatches && city.countryCode === data.country_code;
          }
          return cityMatches;
        });
        
        if (matchingCities.length > 0) {
          // Use the first match (should be most relevant based on IP)
          const detectedCity = matchingCities[0];
          const countryName = countryMap.get(detectedCity.countryCode) || detectedCity.countryCode;
          
          const cityItem: CityItem = {
            name: detectedCity.name,
            countryCode: detectedCity.countryCode,
            countryName: countryName,
            isPopular: POPULAR_CITIES.includes(detectedCity.name),
            id: `${detectedCity.name}-${detectedCity.countryCode}-ip`
          };
          
          // Select this city
          const cityOption = {
            value: cityItem.id,
            label: renderOptionLabel(cityItem),
            data: cityItem
          };
          
          setSelectedOption(cityOption);
          onCitySelect(cityItem);
          setInputValue(cityItem.name);
          
          // Save to localStorage with timestamp
          saveToLocalStorage(cityItem);
          console.log('Location set from IP:', cityItem.name);
        } else {
          console.log('No exact city match found, creating approximate city item');
          // If no exact city match, create a best-effort city item
          const countryName = data.country || data.country_name || 'Unknown';
          const countryCode = data.country_code || 'US';
          
          const cityItem: CityItem = {
            name: data.city,
            countryCode: countryCode,
            countryName: countryName,
            isPopular: false,
            id: `${data.city}-${countryCode}-ip-approx`
          };
          
          // Select this city
          const cityOption = {
            value: cityItem.id,
            label: renderOptionLabel(cityItem),
            data: cityItem
          };
          
          setSelectedOption(cityOption);
          onCitySelect(cityItem);
          setInputValue(cityItem.name);
          
          // Save to localStorage with timestamp
          saveToLocalStorage(cityItem);
          console.log('Approximate location set from IP:', cityItem.name);
        }
      } else {
        // IP detection didn't return a city
        console.log('IP detection failed: No city in response');
        setIpLocationFailed(true);
        throw new Error("IP detection didn't return a city");
      }
      
      // Load popular cities as options (regardless of IP detection success)
      await loadPopularCities();
      
    } catch (error) {
      console.error('Error detecting IP location:', error);
      // Fall back to popular cities if IP detection fails
      setIpLocationFailed(true);
      await loadPopularCities();
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a unique ID for each city
  const generateUniqueId = (city: any, countryName: string, index: number) => {
    return `${city.name}-${city.countryCode}-${countryName}-${index}`;
  };

  // Process cities list to prioritize well-known instances and remove duplicates
  const processCitiesList = (cityItems: CityItem[]): CityItem[] => {
    const prioritizedCities: CityItem[] = [];
    const otherCities: CityItem[] = [];
    
    // Track unique city-country combinations to eliminate duplicates
    const uniqueCitiesMap = new Map<string, CityItem>();
    
    // Group cities by name
    const cityGroups = new Map<string, CityItem[]>();
    
    cityItems.forEach(city => {
      // Create a unique key for this city-country combination
      const uniqueKey = `${city.name.toLowerCase()}-${city.countryCode}`;
      
      // Skip if we already have this exact city-country combination
      if (uniqueCitiesMap.has(uniqueKey)) return;
      
      // Add to unique cities map
      uniqueCitiesMap.set(uniqueKey, city);
      
      // Group by city name for prioritization
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

      // Process cities list to prioritize well-known instances and remove duplicates
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
      
      // Track unique city-country combinations to eliminate duplicates
      const uniqueCitiesMap = new Map<string, CityItem>();
      
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
        })
        .filter(city => {
          // Deduplicate by city name + country code
          const key = `${city.name.toLowerCase()}-${city.countryCode}`;
          if (uniqueCitiesMap.has(key)) {
            return false; // Skip duplicates
          }
          uniqueCitiesMap.set(key, city);
          return true;
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
    try {
      localStorage.setItem("userCity", city.name);
      localStorage.setItem("userCountry", city.countryCode);
      localStorage.setItem("userCityData", JSON.stringify({
        name: city.name,
        countryCode: city.countryCode,
        countryName: city.countryName,
        id: city.id
      }));
      // Update timestamp
      localStorage.setItem("locationDataTimestamp", Date.now().toString());
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  // Handle city selection
  const handleCitySelect = (option: any) => {
    if (!option) return;
    
    setSelectedOption(option);
    onCitySelect(option.data);
    
    // Save to localStorage immediately when a city is selected
    saveToLocalStorage(option.data);
  };

  // Force a reload of IP detection
  const retryIpDetection = () => {
    setIsLoading(true);
    setIpLocationFailed(false);
    setDetectionTimeout(false);
    setIpLocationAttempted(false);
    
    // Clear existing data
    localStorage.removeItem("userCity");
    localStorage.removeItem("userCountry");
    localStorage.removeItem("userCityData");
    localStorage.removeItem("locationDataTimestamp");
    
    // Retry detection
    detectIpLocation();
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
      minWidth: '200px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#fff1f2' : 'white',
      color: '#1f2937',
      minWidth: '200px',
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
      minWidth: '200px',
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '2px 8px',
      minWidth: '200px',
    }),
  };

  // Render component with auto-detection notice and retry button
  return (
    <div className={`${className}`}>
      {label && (
        <label className="text-xs text-gray-500 block mb-1">
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
          placeholder={placeholderText}
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
        
        {isLoading && !selectedOption && !inputValue && (
          <div className="text-xs text-gray-500 mt-1 ml-1">
            Using your current location
          </div>
        )}
        
        {(ipLocationFailed || detectionTimeout) && !selectedOption && (
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>Unable to detect your location</span>
            <button 
              onClick={retryIpDetection}
              className="text-rose-500 hover:text-rose-600 font-medium"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}