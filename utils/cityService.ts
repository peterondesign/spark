import { City as CCity, Country, State } from 'country-state-city';

// Define the CityItem interface for consistent use across components
export interface CityItem {
  name: string;
  countryCode: string;
  countryName: string;
  isPopular: boolean;
  id: string;
  region?: string;
  slug?: string;
}

// List of popular cities for showing initially
export const POPULAR_CITIES = [
  "New York", "London", "Paris", "Tokyo", "Sydney", 
  "Los Angeles", "Berlin", "Rome", "Dubai", "Singapore",
  "Barcelona", "Toronto", "Amsterdam", "Hong Kong", "San Francisco"
];

// Re-export the City class for easy access
export const City = CCity;

// Helper function to create a slug from a city name
const createSlug = (cityName: string): string => {
  return cityName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

// Get a city by its slug
export async function getCityBySlug(slug: string): Promise<CityItem | null> {
  const allCities = CCity.getAllCities();
  const countries = Country.getAllCountries();
  
  // Create a map for quick lookup of country names
  const countryMap = new Map();
  countries.forEach(country => {
    countryMap.set(country.isoCode, country.name);
  });
  
  // Look for a city that matches this slug
  for (const city of allCities) {
    const citySlug = createSlug(city.name);
    if (citySlug === slug) {
      const countryName = countryMap.get(city.countryCode) || city.countryCode;
      // Get state/region for the city if available
      const states = State.getStatesOfCountry(city.countryCode);
      const state = states.find(state => state.isoCode === city.stateCode);
      
      return {
        name: city.name,
        countryCode: city.countryCode,
        countryName,
        isPopular: POPULAR_CITIES.includes(city.name),
        id: `${city.name}-${city.countryCode}`,
        region: state?.name || undefined,
        slug: citySlug
      };
    }
  }
  
  return null;
}

// Service for handling country-related operations
export class CountryService {
  // Get all countries
  static getAllCountries() {
    return Country.getAllCountries();
  }
  
  // Get a country by its ISO code
  static getCountryByCode(code: string) {
    return Country.getCountryByCode(code);
  }
  
  // Get states for a country
  static getStatesOfCountry(countryCode: string) {
    return State.getStatesOfCountry(countryCode);
  }
  
  // Get cities for a country
  static getCitiesOfCountry(countryCode: string) {
    return CCity.getCitiesOfCountry(countryCode);
  }
  
  // Get the full country name from a country code
  static getCountryNameByCode(code: string) {
    const country = this.getCountryByCode(code);
    return country ? country.name : code;
  }
  
  // Find cities by name (case insensitive)
  static findCitiesByName(name: string, limit = 20) {
    const allCities = CCity.getAllCities();
    return allCities
      .filter(city => city.name.toLowerCase().includes(name.toLowerCase()))
      .slice(0, limit);
  }
  
  // Get popular cities with country info
  static getPopularCities(): CityItem[] {
    const allCities = CCity.getAllCities();
    const countries = this.getAllCountries();
    
    // Create a map for quick lookup of country names
    const countryMap = new Map();
    countries.forEach(country => {
      countryMap.set(country.isoCode, country.name);
    });
    
    // Find the popular cities
    const popularCities: CityItem[] = [];
    
    for (const popularCityName of POPULAR_CITIES) {
      const matchingCities = allCities.filter(city => city.name === popularCityName);
      
      matchingCities.forEach(city => {
        const countryName = countryMap.get(city.countryCode) || city.countryCode;
        popularCities.push({
          name: city.name,
          countryCode: city.countryCode,
          countryName,
          isPopular: true,
          id: `${city.name}-${city.countryCode}-${countryName}`,
          slug: createSlug(city.name)
        });
      });
    }
    
    return popularCities.sort((a, b) => a.name.localeCompare(b.name));
  }
}