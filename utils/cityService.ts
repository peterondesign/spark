import { City as CountryStateCity } from "country-state-city";

export const POPULAR_CITIES = [
  "New York", "London", "Paris", "Tokyo", "Sydney", 
  "Los Angeles", "Berlin", "Rome", "Dubai", "Singapore",
  "Barcelona", "Toronto", "Amsterdam", "Hong Kong", "San Francisco"
];

export class City {
  static getAllCities() {
    return CountryStateCity.getAllCities();
  }
}

export interface CityItem {
  name: string;
  countryCode: string;
  isPopular: boolean;
  id: string;
}