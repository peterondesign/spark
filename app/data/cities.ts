// Comprehensive list of world cities for date ideas
export interface City {
  name: string;
  country: string;
  continent: string;
  flag: string;
  popular: boolean;
}

export const WORLD_CITIES: City[] = [
  // Europe - Popular
  { name: "London", country: "United Kingdom", continent: "Europe", flag: "🇬🇧", popular: true },
  { name: "Paris", country: "France", continent: "Europe", flag: "🇫🇷", popular: true },
  { name: "Rome", country: "Italy", continent: "Europe", flag: "🇮🇹", popular: true },
  { name: "Barcelona", country: "Spain", continent: "Europe", flag: "🇪🇸", popular: true },
  { name: "Amsterdam", country: "Netherlands", continent: "Europe", flag: "🇳🇱", popular: true },
  { name: "Berlin", country: "Germany", continent: "Europe", flag: "🇩🇪", popular: true },
  { name: "Madrid", country: "Spain", continent: "Europe", flag: "🇪🇸", popular: true },
  { name: "Lisbon", country: "Portugal", continent: "Europe", flag: "🇵🇹", popular: true },
  { name: "Vienna", country: "Austria", continent: "Europe", flag: "🇦🇹", popular: true },
  { name: "Prague", country: "Czech Republic", continent: "Europe", flag: "🇨🇿", popular: true },

  // Europe - Other Major Cities
  { name: "Milan", country: "Italy", continent: "Europe", flag: "🇮🇹", popular: false },
  { name: "Florence", country: "Italy", continent: "Europe", flag: "🇮🇹", popular: false },
  { name: "Venice", country: "Italy", continent: "Europe", flag: "🇮🇹", popular: false },
  { name: "Naples", country: "Italy", continent: "Europe", flag: "🇮🇹", popular: false },
  { name: "Munich", country: "Germany", continent: "Europe", flag: "🇩🇪", popular: false },
  { name: "Hamburg", country: "Germany", continent: "Europe", flag: "🇩🇪", popular: false },
  { name: "Frankfurt", country: "Germany", continent: "Europe", flag: "🇩🇪", popular: false },
  { name: "Cologne", country: "Germany", continent: "Europe", flag: "🇩🇪", popular: false },
  { name: "Brussels", country: "Belgium", continent: "Europe", flag: "🇧🇪", popular: false },
  { name: "Antwerp", country: "Belgium", continent: "Europe", flag: "🇧🇪", popular: false },
  { name: "Zurich", country: "Switzerland", continent: "Europe", flag: "🇨🇭", popular: false },
  { name: "Geneva", country: "Switzerland", continent: "Europe", flag: "🇨🇭", popular: false },
  { name: "Stockholm", country: "Sweden", continent: "Europe", flag: "🇸🇪", popular: false },
  { name: "Copenhagen", country: "Denmark", continent: "Europe", flag: "🇩🇰", popular: false },
  { name: "Oslo", country: "Norway", continent: "Europe", flag: "🇳🇴", popular: false },
  { name: "Helsinki", country: "Finland", continent: "Europe", flag: "🇫🇮", popular: false },
  { name: "Dublin", country: "Ireland", continent: "Europe", flag: "🇮🇪", popular: false },
  { name: "Edinburgh", country: "United Kingdom", continent: "Europe", flag: "🇬🇧", popular: false },
  { name: "Manchester", country: "United Kingdom", continent: "Europe", flag: "🇬🇧", popular: false },
  { name: "Birmingham", country: "United Kingdom", continent: "Europe", flag: "🇬🇧", popular: false },
  { name: "Athens", country: "Greece", continent: "Europe", flag: "🇬🇷", popular: false },
  { name: "Santorini", country: "Greece", continent: "Europe", flag: "🇬🇷", popular: false },
  { name: "Budapest", country: "Hungary", continent: "Europe", flag: "🇭🇺", popular: false },
  { name: "Warsaw", country: "Poland", continent: "Europe", flag: "🇵🇱", popular: false },
  { name: "Krakow", country: "Poland", continent: "Europe", flag: "🇵🇱", popular: false },
  { name: "Lyon", country: "France", continent: "Europe", flag: "🇫🇷", popular: false },
  { name: "Nice", country: "France", continent: "Europe", flag: "🇫🇷", popular: false },
  { name: "Marseille", country: "France", continent: "Europe", flag: "🇫🇷", popular: false },
  { name: "Seville", country: "Spain", continent: "Europe", flag: "🇪🇸", popular: false },
  { name: "Valencia", country: "Spain", continent: "Europe", flag: "🇪🇸", popular: false },
  { name: "Bilbao", country: "Spain", continent: "Europe", flag: "🇪🇸", popular: false },
  { name: "Porto", country: "Portugal", continent: "Europe", flag: "🇵🇹", popular: false },
  { name: "Rotterdam", country: "Netherlands", continent: "Europe", flag: "🇳🇱", popular: false },
  { name: "The Hague", country: "Netherlands", continent: "Europe", flag: "🇳🇱", popular: false },

  // North America - Popular
  { name: "New York", country: "United States", continent: "North America", flag: "🇺🇸", popular: true },
  { name: "Los Angeles", country: "United States", continent: "North America", flag: "🇺🇸", popular: true },
  { name: "Chicago", country: "United States", continent: "North America", flag: "🇺🇸", popular: true },
  { name: "San Francisco", country: "United States", continent: "North America", flag: "🇺🇸", popular: true },
  { name: "Toronto", country: "Canada", continent: "North America", flag: "🇨🇦", popular: true },
  { name: "Vancouver", country: "Canada", continent: "North America", flag: "🇨🇦", popular: true },
  { name: "Montreal", country: "Canada", continent: "North America", flag: "🇨🇦", popular: true },

  // North America - Other Major Cities
  { name: "Miami", country: "United States", continent: "North America", flag: "🇺🇸", popular: false },
  { name: "Las Vegas", country: "United States", continent: "North America", flag: "🇺🇸", popular: false },
  { name: "Seattle", country: "United States", continent: "North America", flag: "🇺🇸", popular: false },
  { name: "Boston", country: "United States", continent: "North America", flag: "🇺🇸", popular: false },
  { name: "Washington DC", country: "United States", continent: "North America", flag: "🇺🇸", popular: false },
  { name: "Philadelphia", country: "United States", continent: "North America", flag: "🇺🇸", popular: false },
  { name: "Atlanta", country: "United States", continent: "North America", flag: "🇺🇸", popular: false },
  { name: "Denver", country: "United States", continent: "North America", flag: "🇺🇸", popular: false },
  { name: "Austin", country: "United States", continent: "North America", flag: "🇺🇸", popular: false },
  { name: "Portland", country: "United States", continent: "North America", flag: "🇺🇸", popular: false },
  { name: "Nashville", country: "United States", continent: "North America", flag: "🇺🇸", popular: false },
  { name: "New Orleans", country: "United States", continent: "North America", flag: "🇺🇸", popular: false },
  { name: "San Diego", country: "United States", continent: "North America", flag: "🇺🇸", popular: false },
  { name: "Phoenix", country: "United States", continent: "North America", flag: "🇺🇸", popular: false },
  { name: "Dallas", country: "United States", continent: "North America", flag: "🇺🇸", popular: false },
  { name: "Houston", country: "United States", continent: "North America", flag: "🇺🇸", popular: false },
  { name: "Tampa", country: "United States", continent: "North America", flag: "🇺🇸", popular: false },
  { name: "Orlando", country: "United States", continent: "North America", flag: "🇺🇸", popular: false },
  { name: "Calgary", country: "Canada", continent: "North America", flag: "🇨🇦", popular: false },
  { name: "Ottawa", country: "Canada", continent: "North America", flag: "🇨🇦", popular: false },
  { name: "Quebec City", country: "Canada", continent: "North America", flag: "🇨🇦", popular: false },
  { name: "Mexico City", country: "Mexico", continent: "North America", flag: "🇲🇽", popular: false },
  { name: "Cancun", country: "Mexico", continent: "North America", flag: "🇲🇽", popular: false },
  { name: "Guadalajara", country: "Mexico", continent: "North America", flag: "🇲🇽", popular: false },
  { name: "Puerto Vallarta", country: "Mexico", continent: "North America", flag: "🇲🇽", popular: false },

  // Asia - Popular
  { name: "Tokyo", country: "Japan", continent: "Asia", flag: "🇯🇵", popular: true },
  { name: "Seoul", country: "South Korea", continent: "Asia", flag: "🇰🇷", popular: true },
  { name: "Singapore", country: "Singapore", continent: "Asia", flag: "🇸🇬", popular: true },
  { name: "Hong Kong", country: "Hong Kong", continent: "Asia", flag: "🇭🇰", popular: true },
  { name: "Bangkok", country: "Thailand", continent: "Asia", flag: "🇹🇭", popular: true },
  { name: "Dubai", country: "UAE", continent: "Asia", flag: "🇦🇪", popular: true },

  // Asia - Other Major Cities
  { name: "Shanghai", country: "China", continent: "Asia", flag: "🇨🇳", popular: false },
  { name: "Beijing", country: "China", continent: "Asia", flag: "🇨🇳", popular: false },
  { name: "Shenzhen", country: "China", continent: "Asia", flag: "🇨🇳", popular: false },
  { name: "Guangzhou", country: "China", continent: "Asia", flag: "🇨🇳", popular: false },
  { name: "Mumbai", country: "India", continent: "Asia", flag: "🇮🇳", popular: false },
  { name: "Delhi", country: "India", continent: "Asia", flag: "🇮🇳", popular: false },
  { name: "Bangalore", country: "India", continent: "Asia", flag: "🇮🇳", popular: false },
  { name: "Chennai", country: "India", continent: "Asia", flag: "🇮🇳", popular: false },
  { name: "Hyderabad", country: "India", continent: "Asia", flag: "🇮🇳", popular: false },
  { name: "Pune", country: "India", continent: "Asia", flag: "🇮🇳", popular: false },
  { name: "Osaka", country: "Japan", continent: "Asia", flag: "🇯🇵", popular: false },
  { name: "Kyoto", country: "Japan", continent: "Asia", flag: "🇯🇵", popular: false },
  { name: "Nagoya", country: "Japan", continent: "Asia", flag: "🇯🇵", popular: false },
  { name: "Fukuoka", country: "Japan", continent: "Asia", flag: "🇯🇵", popular: false },
  { name: "Busan", country: "South Korea", continent: "Asia", flag: "🇰🇷", popular: false },
  { name: "Kuala Lumpur", country: "Malaysia", continent: "Asia", flag: "🇲🇾", popular: false },
  { name: "Jakarta", country: "Indonesia", continent: "Asia", flag: "🇮🇩", popular: false },
  { name: "Bali", country: "Indonesia", continent: "Asia", flag: "🇮🇩", popular: false },
  { name: "Manila", country: "Philippines", continent: "Asia", flag: "🇵🇭", popular: false },
  { name: "Cebu", country: "Philippines", continent: "Asia", flag: "🇵🇭", popular: false },
  { name: "Ho Chi Minh City", country: "Vietnam", continent: "Asia", flag: "🇻🇳", popular: false },
  { name: "Hanoi", country: "Vietnam", continent: "Asia", flag: "🇻🇳", popular: false },
  { name: "Da Nang", country: "Vietnam", continent: "Asia", flag: "🇻🇳", popular: false },
  { name: "Phuket", country: "Thailand", continent: "Asia", flag: "🇹🇭", popular: false },
  { name: "Chiang Mai", country: "Thailand", continent: "Asia", flag: "🇹🇭", popular: false },
  { name: "Pattaya", country: "Thailand", continent: "Asia", flag: "🇹🇭", popular: false },
  { name: "Taipei", country: "Taiwan", continent: "Asia", flag: "🇹🇼", popular: false },
  { name: "Kaohsiung", country: "Taiwan", continent: "Asia", flag: "🇹🇼", popular: false },
  { name: "Tel Aviv", country: "Israel", continent: "Asia", flag: "🇮🇱", popular: false },
  { name: "Jerusalem", country: "Israel", continent: "Asia", flag: "🇮🇱", popular: false },
  { name: "Abu Dhabi", country: "UAE", continent: "Asia", flag: "🇦🇪", popular: false },
  { name: "Doha", country: "Qatar", continent: "Asia", flag: "🇶🇦", popular: false },
  { name: "Riyadh", country: "Saudi Arabia", continent: "Asia", flag: "🇸🇦", popular: false },

  // Oceania
  { name: "Sydney", country: "Australia", continent: "Oceania", flag: "🇦🇺", popular: true },
  { name: "Melbourne", country: "Australia", continent: "Oceania", flag: "🇦🇺", popular: true },
  { name: "Auckland", country: "New Zealand", continent: "Oceania", flag: "🇳🇿", popular: false },
  { name: "Brisbane", country: "Australia", continent: "Oceania", flag: "🇦🇺", popular: false },
  { name: "Perth", country: "Australia", continent: "Oceania", flag: "🇦🇺", popular: false },
  { name: "Adelaide", country: "Australia", continent: "Oceania", flag: "🇦🇺", popular: false },
  { name: "Gold Coast", country: "Australia", continent: "Oceania", flag: "🇦🇺", popular: false },
  { name: "Wellington", country: "New Zealand", continent: "Oceania", flag: "🇳🇿", popular: false },
  { name: "Christchurch", country: "New Zealand", continent: "Oceania", flag: "🇳🇿", popular: false },

  // South America
  { name: "São Paulo", country: "Brazil", continent: "South America", flag: "🇧🇷", popular: true },
  { name: "Rio de Janeiro", country: "Brazil", continent: "South America", flag: "🇧🇷", popular: true },
  { name: "Buenos Aires", country: "Argentina", continent: "South America", flag: "🇦🇷", popular: true },
  { name: "Lima", country: "Peru", continent: "South America", flag: "🇵🇪", popular: false },
  { name: "Santiago", country: "Chile", continent: "South America", flag: "🇨🇱", popular: false },
  { name: "Bogotá", country: "Colombia", continent: "South America", flag: "🇨🇴", popular: false },
  { name: "Medellín", country: "Colombia", continent: "South America", flag: "🇨🇴", popular: false },
  { name: "Cartagena", country: "Colombia", continent: "South America", flag: "🇨🇴", popular: false },
  { name: "Quito", country: "Ecuador", continent: "South America", flag: "🇪🇨", popular: false },
  { name: "Montevideo", country: "Uruguay", continent: "South America", flag: "🇺🇾", popular: false },
  { name: "Asunción", country: "Paraguay", continent: "South America", flag: "🇵🇾", popular: false },
  { name: "La Paz", country: "Bolivia", continent: "South America", flag: "🇧🇴", popular: false },
  { name: "Caracas", country: "Venezuela", continent: "South America", flag: "🇻🇪", popular: false },
  { name: "Salvador", country: "Brazil", continent: "South America", flag: "🇧🇷", popular: false },
  { name: "Brasília", country: "Brazil", continent: "South America", flag: "🇧🇷", popular: false },
  { name: "Recife", country: "Brazil", continent: "South America", flag: "🇧🇷", popular: false },
  { name: "Córdoba", country: "Argentina", continent: "South America", flag: "🇦🇷", popular: false },
  { name: "Rosario", country: "Argentina", continent: "South America", flag: "🇦🇷", popular: false },
  { name: "Mendoza", country: "Argentina", continent: "South America", flag: "🇦🇷", popular: false },
  { name: "Valparaíso", country: "Chile", continent: "South America", flag: "🇨🇱", popular: false },

  // Africa
  { name: "Cape Town", country: "South Africa", continent: "Africa", flag: "🇿🇦", popular: true },
  { name: "Marrakech", country: "Morocco", continent: "Africa", flag: "🇲🇦", popular: true },
  { name: "Cairo", country: "Egypt", continent: "Africa", flag: "🇪🇬", popular: false },
  { name: "Johannesburg", country: "South Africa", continent: "Africa", flag: "🇿🇦", popular: false },
  { name: "Durban", country: "South Africa", continent: "Africa", flag: "🇿🇦", popular: false },
  { name: "Casablanca", country: "Morocco", continent: "Africa", flag: "🇲🇦", popular: false },
  { name: "Rabat", country: "Morocco", continent: "Africa", flag: "🇲🇦", popular: false },
  { name: "Fez", country: "Morocco", continent: "Africa", flag: "🇲🇦", popular: false },
  { name: "Lagos", country: "Nigeria", continent: "Africa", flag: "🇳🇬", popular: false },
  { name: "Abuja", country: "Nigeria", continent: "Africa", flag: "🇳🇬", popular: false },
  { name: "Nairobi", country: "Kenya", continent: "Africa", flag: "🇰🇪", popular: false },
  { name: "Mombasa", country: "Kenya", continent: "Africa", flag: "🇰🇪", popular: false },
  { name: "Accra", country: "Ghana", continent: "Africa", flag: "🇬🇭", popular: false },
  { name: "Addis Ababa", country: "Ethiopia", continent: "Africa", flag: "🇪🇹", popular: false },
  { name: "Dar es Salaam", country: "Tanzania", continent: "Africa", flag: "🇹🇿", popular: false },
  { name: "Kampala", country: "Uganda", continent: "Africa", flag: "🇺🇬", popular: false },
  { name: "Kigali", country: "Rwanda", continent: "Africa", flag: "🇷🇼", popular: false },
  { name: "Lusaka", country: "Zambia", continent: "Africa", flag: "🇿🇲", popular: false },
  { name: "Harare", country: "Zimbabwe", continent: "Africa", flag: "🇿🇼", popular: false },
  { name: "Tunis", country: "Tunisia", continent: "Africa", flag: "🇹🇳", popular: false },
  { name: "Algiers", country: "Algeria", continent: "Africa", flag: "🇩🇿", popular: false },
];

// Group cities by continent for better organization
export const CITIES_BY_CONTINENT = {
  "Europe": WORLD_CITIES.filter(city => city.continent === "Europe"),
  "North America": WORLD_CITIES.filter(city => city.continent === "North America"),
  "Asia": WORLD_CITIES.filter(city => city.continent === "Asia"),
  "Oceania": WORLD_CITIES.filter(city => city.continent === "Oceania"),
  "South America": WORLD_CITIES.filter(city => city.continent === "South America"),
  "Africa": WORLD_CITIES.filter(city => city.continent === "Africa"),
};

// Popular cities for quick access
export const POPULAR_CITIES = WORLD_CITIES.filter(city => city.popular);

// Search cities by name
export function searchCities(query: string): City[] {
  const lowercaseQuery = query.toLowerCase();
  return WORLD_CITIES.filter(city => 
    city.name.toLowerCase().includes(lowercaseQuery) ||
    city.country.toLowerCase().includes(lowercaseQuery)
  );
}
